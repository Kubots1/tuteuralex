/* ============================================================
   exercices.js — Module exercices complet
   TCF / DELF / Exercices de français
   Blocs : texte, video, question, trous, qcm, expression
   ============================================================ */
'use strict';

const $e = id => document.getElementById(id);

const md = text => window.marked ? window.marked.parse(text || '') : (text || '').replace(/\n/g, '<br>');

const CAT_META = {
  tcf      : { label: 'TCF',          icon: '🎓', color: '#8b5cf6' },
  delf     : { label: 'DELF / DALF',  icon: '📜', color: '#3b82f6' },
  exercice : { label: 'Exercice',     icon: '✏️', color: '#10b981' },
};
const NIVEAUX_COLORS = { A1:'#16a34a', A2:'#3b82f6', B1:'#f59e0b', B2:'#ef4444', C1:'#8b5cf6', C2:'#ec4899' };

let allExercices  = [];
let currentCat    = null;
let filtreNiveau  = 'tous';
let currentEx     = null;
let edExercice    = null;
let edBlocs       = [];

function getClient() { return window.Auth?.getClient?.() || null; }

/* ══════════════════════════════════════════
   CHARGEMENT
══════════════════════════════════════════ */
async function loadExercices() {
  const sb = getClient(); if (!sb) return;
  const isAdmin = window.Auth?.isAdmin?.();
  let q = sb.from('exercices').select('*').order('created_at', { ascending: false });
  if (!isAdmin) q = q.eq('publie', true);
  const { data, error } = await q;
  if (error) console.warn('Erreur exercices:', error.message);
  allExercices = data || [];
  updateAdminBar();
}

function updateAdminBar() {
  if (window.Auth?.isAdmin?.()) $e('ex-admin-bar')?.classList.remove('hidden');
}

/* ══════════════════════════════════════════
   NAVIGATION ÉCRANS
══════════════════════════════════════════ */
function showScreen(name) {
  ['screen-categories','screen-liste','screen-exercice','screen-editor']
    .forEach(s => $e(s)?.classList.add('hidden'));
  $e(name)?.classList.remove('hidden');
}

/* ══════════════════════════════════════════
   CATÉGORIES
══════════════════════════════════════════ */
document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', () => {
    currentCat = card.dataset.cat;
    filtreNiveau = 'tous';
    $e('filtre-niveau').querySelectorAll('.ex-pill').forEach(p => p.classList.toggle('active', p.dataset.val === 'tous'));
    const meta = CAT_META[currentCat];
    $e('liste-title').textContent = meta.icon + ' ' + meta.label;
    renderListe();
    showScreen('screen-liste');
  });
});

$e('back-to-cats').addEventListener('click', () => showScreen('screen-categories'));

/* ══════════════════════════════════════════
   LISTE
══════════════════════════════════════════ */
$e('filtre-niveau').addEventListener('click', e => {
  const pill = e.target.closest('.ex-pill'); if (!pill) return;
  $e('filtre-niveau').querySelectorAll('.ex-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  filtreNiveau = pill.dataset.val;
  renderListe();
});

function renderListe() {
  const grid  = $e('exercices-grid');
  const empty = $e('exercices-empty');
  grid.innerHTML = '';

  const filtered = allExercices.filter(ex => {
    return ex.categorie === currentCat &&
      (filtreNiveau === 'tous' || ex.niveau === filtreNiveau);
  });

  if (!filtered.length) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  const isAdmin = window.Auth?.isAdmin?.();
  const color   = CAT_META[currentCat]?.color || '#7c3aed';

  filtered.forEach(ex => {
    const nColor = NIVEAUX_COLORS[ex.niveau] || '#7c3aed';
    const card   = document.createElement('div');
    card.className = 'ex-card';
    card.style.borderColor = color + '44';
    card.innerHTML = `
      <div class="ex-card-top" style="background:${color}15">
        <span class="ex-card-icon">${ex.icone}</span>
        <div class="ex-card-badges">
          <span class="ex-badge" style="background:${nColor}22;color:${nColor};border-color:${nColor}44">${ex.niveau}</span>
          ${!ex.publie ? '<span class="ex-badge ex-badge-draft">✏️ Brouillon</span>' : ''}
        </div>
      </div>
      <div class="ex-card-body">
        <h3 class="ex-card-titre">${ex.titre}</h3>
        ${ex.description ? `<p class="ex-card-desc">${ex.description}</p>` : ''}
        <div class="ex-card-meta">${ex.blocs?.length || 0} bloc(s)</div>
        <div class="ex-card-actions">
          <button class="ex-card-btn-open" style="background:${color}">▶ Commencer</button>
          ${isAdmin ? `<button class="ex-card-btn-edit">✏️</button>` : ''}
        </div>
      </div>`;
    card.querySelector('.ex-card-btn-open').addEventListener('click', () => openExercice(ex.id));
    card.querySelector('.ex-card-btn-edit')?.addEventListener('click', () => openEditor(ex.id));
    grid.appendChild(card);
  });
}

$e('back-to-liste').addEventListener('click', () => {
  renderListe();
  showScreen('screen-liste');
});

/* ══════════════════════════════════════════
   AFFICHAGE D'UN EXERCICE
══════════════════════════════════════════ */
function openExercice(id) {
  currentEx = allExercices.find(ex => ex.id === id); if (!currentEx) return;
  const nColor = NIVEAUX_COLORS[currentEx.niveau] || '#7c3aed';
  const cMeta  = CAT_META[currentEx.categorie] || {};

  $e('ex-niveau-badge').textContent  = currentEx.niveau;
  $e('ex-niveau-badge').style.cssText = `background:${nColor}33;color:${nColor};border:1px solid ${nColor}55;padding:0.2rem 0.8rem;border-radius:2rem;font-size:0.8rem;font-weight:800;`;
  $e('ex-cat-badge').textContent     = cMeta.icon + ' ' + cMeta.label;
  $e('ex-titre').textContent         = currentEx.icone + ' ' + currentEx.titre;
  $e('ex-desc').textContent          = currentEx.description || '';
  $e('ex-end-card').classList.add('hidden');

  const container = $e('ex-blocs');
  container.innerHTML = '';

  const blocs = currentEx.blocs || [];
  blocs.forEach((bloc, i) => {
    const el = document.createElement('div');
    el.className = 'ex-bloc';
    el.dataset.index = i;

    switch (bloc.type) {
      case 'texte':
        el.classList.add('bloc-texte');
        el.innerHTML = md(bloc.contenu || '');
        break;

      case 'video':
        el.classList.add('bloc-video');
        const ytId = extractYouTubeId(bloc.url || '');
        if (ytId) {
          el.innerHTML = `
            <div class="bloc-video-wrap">
              <iframe src="https://www.youtube.com/embed/${ytId}"
                frameborder="0" allowfullscreen loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
              </iframe>
            </div>
            ${bloc.legende ? `<p class="bloc-video-legende">${bloc.legende}</p>` : ''}`;
        } else {
          el.innerHTML = `<p class="bloc-error">⚠️ URL YouTube invalide</p>`;
        }
        break;

      case 'question':
        el.classList.add('bloc-question');
        el.innerHTML = `
          <div class="bloc-question-consigne">${md(bloc.consigne || '')}</div>
          <div class="bloc-response-zone">
            <textarea class="bloc-textarea" placeholder="Écris ta réponse ici…" rows="4"></textarea>
          </div>
          <div class="bloc-answer-wrap">
            <button class="ex-btn-answer">💡 Voir la réponse</button>
            <div class="bloc-answer hidden">
              <div class="bloc-answer-content">${md(bloc.reponse || '')}</div>
              ${bloc.explication ? `<div class="bloc-explication"><strong>💬 Explication :</strong><br>${md(bloc.explication)}</div>` : ''}
            </div>
          </div>`;
        el.querySelector('.ex-btn-answer').addEventListener('click', function() {
          const ans = el.querySelector('.bloc-answer');
          ans.classList.toggle('hidden');
          this.textContent = ans.classList.contains('hidden') ? '💡 Voir la réponse' : '🙈 Masquer la réponse';
        });
        break;

      case 'trous':
        el.classList.add('bloc-trous');
        const phrases = bloc.phrases || [];
        el.innerHTML = `
          <div class="bloc-trous-consigne">${md(bloc.consigne || '')}</div>
          <div class="bloc-trous-list">
            ${phrases.map((ph, pi) => {
              const parts = ph.texte.split('___');
              return `<div class="trou-item" data-pi="${pi}">
                <span class="trou-num">${pi+1}.</span>
                <span class="trou-before">${parts[0] || ''}</span>
                <input class="trou-input" type="text" placeholder="…" data-pi="${pi}" />
                <span class="trou-after">${parts[1] || ''}</span>
                <span class="trou-feedback"></span>
              </div>`;
            }).join('')}
          </div>
          <div class="bloc-trous-actions">
            <button class="ex-btn-check">✔ Vérifier</button>
            <button class="ex-btn-answer">💡 Voir les réponses</button>
          </div>
          <div class="bloc-answer hidden">
            ${phrases.map((ph, pi) => `
              <div class="trou-correction">
                <strong>${pi+1}.</strong> ${ph.texte.replace('___', `<em class="trou-reponse">${ph.reponse}</em>`)}
                ${ph.explication ? `<span class="trou-expl">— ${ph.explication}</span>` : ''}
              </div>`).join('')}
          </div>`;

        el.querySelector('.ex-btn-check').addEventListener('click', () => {
          phrases.forEach((ph, pi) => {
            const inp = el.querySelector(`.trou-input[data-pi="${pi}"]`);
            const fb  = el.querySelector(`.trou-item[data-pi="${pi}"] .trou-feedback`);
            const ok  = inp.value.trim().toLowerCase() === ph.reponse.trim().toLowerCase();
            inp.classList.toggle('correct', ok);
            inp.classList.toggle('wrong', !ok);
            fb.textContent = ok ? '✅' : `❌ → ${ph.reponse}`;
          });
        });
        el.querySelector('.ex-btn-answer').addEventListener('click', function() {
          const ans = el.querySelector('.bloc-answer');
          ans.classList.toggle('hidden');
          this.textContent = ans.classList.contains('hidden') ? '💡 Voir les réponses' : '🙈 Masquer';
        });
        break;

      case 'qcm':
        el.classList.add('bloc-qcm');
        const choix = bloc.choix || [];
        const letters = ['A','B','C','D','E'];
        el.innerHTML = `
          <div class="bloc-qcm-question">${md(bloc.question || '')}</div>
          <div class="bloc-qcm-choix">
            ${choix.map((c, ci) => `
              <button class="qcm-choix-btn" data-ci="${ci}">
                <span class="qcm-letter">${letters[ci]}</span>
                <span>${c}</span>
              </button>`).join('')}
          </div>
          <div class="bloc-qcm-feedback hidden"></div>
          ${bloc.explication ? `<div class="bloc-explication hidden qcm-expl">${md(bloc.explication)}</div>` : ''}`;

        el.querySelectorAll('.qcm-choix-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            if (el.querySelector('.qcm-choix-btn.correct')) return;
            const ci  = +btn.dataset.ci;
            const ok  = ci === +bloc.reponse;
            el.querySelectorAll('.qcm-choix-btn').forEach((b, i) => {
              b.disabled = true;
              if (i === +bloc.reponse) b.classList.add('correct');
              else if (b === btn && !ok) b.classList.add('wrong');
              else b.classList.add('disabled-neutral');
            });
            const fb = el.querySelector('.bloc-qcm-feedback');
            fb.textContent = ok ? '✅ Bonne réponse !' : `❌ La bonne réponse était : ${letters[+bloc.reponse]}`;
            fb.className   = 'bloc-qcm-feedback ' + (ok ? 'correct' : 'incorrect');
            fb.classList.remove('hidden');
            el.querySelector('.qcm-expl')?.classList.remove('hidden');
          });
        });
        break;

      case 'expression':
        el.classList.add('bloc-expression');
        el.innerHTML = `
          <div class="bloc-expression-header">📝 Expression écrite</div>
          <div class="bloc-expression-consigne">${md(bloc.consigne || '')}</div>
          <textarea class="bloc-textarea large" placeholder="Rédigez votre réponse ici…" rows="8"></textarea>
          <div class="bloc-answer-wrap">
            <button class="ex-btn-answer">💡 Voir le modèle de réponse</button>
            <div class="bloc-answer hidden">
              <div class="bloc-answer-label">📄 Modèle de réponse</div>
              <div class="bloc-answer-content">${md(bloc.modele || '')}</div>
              ${bloc.explication ? `<div class="bloc-explication"><strong>💬 Conseils :</strong><br>${md(bloc.explication)}</div>` : ''}
            </div>
          </div>`;
        el.querySelector('.ex-btn-answer').addEventListener('click', function() {
          const ans = el.querySelector('.bloc-answer');
          ans.classList.toggle('hidden');
          this.textContent = ans.classList.contains('hidden') ? '💡 Voir le modèle de réponse' : '🙈 Masquer le modèle';
        });
        break;
    }

    container.appendChild(el);
  });

  // Bouton fin d'exercice
  if (blocs.length) {
    const finBtn = document.createElement('div');
    finBtn.className = 'ex-fin-wrap';
    finBtn.innerHTML = `<button class="ex-btn-fin ex-btn primary">🏁 Terminer l'exercice</button>`;
    finBtn.querySelector('button').addEventListener('click', () => {
      $e('ex-end-card').classList.remove('hidden');
      $e('ex-end-card').scrollIntoView({ behavior: 'smooth' });
    });
    container.appendChild(finBtn);
  }

  $e('ex-retry-btn').onclick = () => openExercice(currentEx.id);
  $e('ex-back-btn').onclick  = () => { renderListe(); showScreen('screen-liste'); };

  showScreen('screen-exercice');
  if (window.Progress && window.Auth?.isLoggedIn?.()) {
    window.Progress.save({ type: 'exercice', ref: currentEx.id, label: currentEx.titre });
  }
}

function extractYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ══════════════════════════════════════════
   IMPORT JSON
══════════════════════════════════════════ */
$e('ex-import-btn').addEventListener('click', () => $e('ex-import-input').click());
$e('ex-import-input').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  e.target.value = '';
  let json;
  try { json = JSON.parse(await file.text()); }
  catch { alert('❌ Fichier JSON invalide.'); return; }
  if (!json.titre || !json.categorie || !json.blocs) {
    alert('❌ Format incorrect. Le fichier doit contenir : titre, categorie, niveau, icone, description, publie, blocs.'); return;
  }
  const sb = getClient(); if (!sb) return;
  const btn = $e('ex-import-btn');
  const orig = btn.textContent;
  btn.textContent = '⏳ Import…'; btn.disabled = true;
  const { error } = await sb.from('exercices').insert({
    titre: json.titre, categorie: json.categorie, niveau: json.niveau || 'A2',
    icone: json.icone || '✏️', description: json.description || null,
    publie: json.publie ?? false, blocs: json.blocs || [],
  });
  if (error) alert('❌ Erreur : ' + error.message);
  else { alert(`✅ Exercice "${json.titre}" importé !`); await loadExercices(); }
  btn.textContent = orig; btn.disabled = false;
});

/* ══════════════════════════════════════════
   ÉDITEUR ADMIN
══════════════════════════════════════════ */
$e('ex-new-btn').addEventListener('click', () => openEditor(null));

function openEditor(id) {
  if (id) {
    edExercice = allExercices.find(ex => ex.id === id);
    edBlocs    = JSON.parse(JSON.stringify(edExercice.blocs || []));
    $e('ed-titre').value       = edExercice.titre;
    $e('ed-categorie').value   = edExercice.categorie;
    $e('ed-niveau').value      = edExercice.niveau;
    $e('ed-icone').value       = edExercice.icone;
    $e('ed-description').value = edExercice.description || '';
    $e('ed-publie').checked    = edExercice.publie;
  } else {
    edExercice = null; edBlocs = [];
    $e('ed-titre').value=''; $e('ed-categorie').value='exercice';
    $e('ed-niveau').value='A2'; $e('ed-icone').value='✏️';
    $e('ed-description').value=''; $e('ed-publie').checked=false;
  }
  renderEdBlocs();
  showScreen('screen-editor');
}

/* ── Rendu blocs éditeur ── */
function renderEdBlocs() {
  const c = $e('ed-blocs');
  c.innerHTML = '';
  $e('ed-blocs-empty')?.classList.toggle('hidden', edBlocs.length > 0);

  edBlocs.forEach((bloc, i) => {
    const div = document.createElement('div');
    div.className = 'ed-bloc';
    const header = `
      <div class="ed-bloc-header">
        <div class="ed-bloc-type-badge">${getBlocLabel(bloc.type)}</div>
        <div class="ed-bloc-controls">
          <button class="ed-ctrl-btn ed-move-up"   data-i="${i}">↑</button>
          <button class="ed-ctrl-btn ed-move-down" data-i="${i}">↓</button>
          <button class="ed-ctrl-btn ed-del-bloc danger" data-i="${i}">🗑️</button>
        </div>
      </div>`;

    let body = '';
    switch (bloc.type) {
      case 'texte':
        body = `<textarea class="ed-textarea" data-i="${i}" rows="5" placeholder="Texte en Markdown…">${escHtml(bloc.contenu||'')}</textarea>`;
        break;
      case 'video':
        body = `
          <input class="ed-input" type="url" data-i="${i}" data-field="url" placeholder="URL YouTube…" value="${escHtml(bloc.url||'')}" />
          <input class="ed-input" type="text" data-i="${i}" data-field="legende" placeholder="Légende (optionnel)" value="${escHtml(bloc.legende||'')}" style="margin-top:0.5rem" />`;
        break;
      case 'question':
        body = `
          <label class="ed-inner-label">Consigne / Question</label>
          <textarea class="ed-textarea" data-i="${i}" data-field="consigne" rows="3" placeholder="Énoncé de la question…">${escHtml(bloc.consigne||'')}</textarea>
          <label class="ed-inner-label">Réponse attendue</label>
          <textarea class="ed-textarea" data-i="${i}" data-field="reponse" rows="3" placeholder="Modèle de réponse…">${escHtml(bloc.reponse||'')}</textarea>
          <label class="ed-inner-label">Explication (optionnel)</label>
          <textarea class="ed-textarea" data-i="${i}" data-field="explication" rows="2" placeholder="Explications supplémentaires…">${escHtml(bloc.explication||'')}</textarea>`;
        break;
      case 'trous':
        const phrases = bloc.phrases || [];
        body = `
          <label class="ed-inner-label">Consigne</label>
          <textarea class="ed-textarea" data-i="${i}" data-field="consigne" rows="2" placeholder="Consigne…">${escHtml(bloc.consigne||'')}</textarea>
          <label class="ed-inner-label">Phrases (utilise ___ pour le trou)</label>
          <div class="ed-trous-list" data-bi="${i}">
            ${phrases.map((ph, pi) => `
              <div class="ed-trou-item">
                <span class="ed-trou-num">${pi+1}</span>
                <input class="ed-input" type="text" placeholder="Phrase avec ___ à la place du mot…" value="${escHtml(ph.texte||'')}" data-bi="${i}" data-pi="${pi}" data-field="texte" />
                <input class="ed-input" type="text" placeholder="Réponse correcte" value="${escHtml(ph.reponse||'')}" data-bi="${i}" data-pi="${pi}" data-field="reponse" style="margin-top:0.3rem" />
                <input class="ed-input" type="text" placeholder="Explication (optionnel)" value="${escHtml(ph.explication||'')}" data-bi="${i}" data-pi="${pi}" data-field="explication" style="margin-top:0.3rem" />
                <button class="ed-ctrl-btn ed-del-trou danger" data-bi="${i}" data-pi="${pi}" style="margin-top:0.3rem">🗑️</button>
              </div>`).join('')}
          </div>
          <button class="ed-add-trou ex-btn secondary" data-i="${i}" style="margin-top:0.5rem">➕ Ajouter une phrase</button>`;
        break;
      case 'qcm':
        const choix = bloc.choix || ['','','',''];
        const letters = ['A','B','C','D'];
        body = `
          <label class="ed-inner-label">Question</label>
          <textarea class="ed-textarea" data-i="${i}" data-field="question" rows="2" placeholder="La question…">${escHtml(bloc.question||'')}</textarea>
          <label class="ed-inner-label">Choix de réponses</label>
          ${choix.map((c, ci) => `
            <div class="ed-qcm-choix">
              <span class="ed-qcm-letter">${letters[ci]}</span>
              <input class="ed-input" type="text" placeholder="Choix ${letters[ci]}…" value="${escHtml(c)}" data-i="${i}" data-ci="${ci}" />
              <label class="ed-qcm-radio-label">
                <input type="radio" name="qcm-correct-${i}" value="${ci}" ${+bloc.reponse===ci?'checked':''} data-i="${i}" data-field="reponse" />
                ✅ Correcte
              </label>
            </div>`).join('')}
          <label class="ed-inner-label">Explication (optionnel)</label>
          <textarea class="ed-textarea" data-i="${i}" data-field="explication" rows="2" placeholder="Pourquoi cette réponse est correcte…">${escHtml(bloc.explication||'')}</textarea>`;
        break;
      case 'expression':
        body = `
          <label class="ed-inner-label">Consigne / Sujet</label>
          <textarea class="ed-textarea" data-i="${i}" data-field="consigne" rows="4" placeholder="Sujet d'expression…">${escHtml(bloc.consigne||'')}</textarea>
          <label class="ed-inner-label">Modèle de réponse</label>
          <textarea class="ed-textarea" data-i="${i}" data-field="modele" rows="6" placeholder="Exemple de réponse idéale…">${escHtml(bloc.modele||'')}</textarea>
          <label class="ed-inner-label">Conseils / Explication (optionnel)</label>
          <textarea class="ed-textarea" data-i="${i}" data-field="explication" rows="3" placeholder="Critères d'évaluation, conseils…">${escHtml(bloc.explication||'')}</textarea>`;
        break;
    }

    div.innerHTML = header + `<div class="ed-bloc-body">${body}</div>`;
    c.appendChild(div);
  });

  bindEdEvents();
}

function getBlocLabel(type) {
  const labels = { texte:'📝 Texte', video:'▶️ Vidéo', question:'❓ Question ouverte', trous:'🔤 Texte à trous', qcm:'🔘 QCM', expression:'📝 Expression écrite' };
  return labels[type] || type;
}

function bindEdEvents() {
  const c = $e('ed-blocs');

  // Textareas simples
  c.querySelectorAll('.ed-textarea').forEach(ta => {
    ta.addEventListener('input', e => {
      const i = +ta.dataset.i, field = ta.dataset.field;
      if (field) edBlocs[i][field] = ta.value;
      else       edBlocs[i].contenu = ta.value;
    });
  });

  // Inputs simples
  c.querySelectorAll('[data-field]').forEach(inp => {
    if (inp.tagName !== 'INPUT') return;
    inp.addEventListener('input', e => {
      const i = +inp.dataset.i, field = inp.dataset.field;
      if (field === 'reponse' && inp.type === 'radio') edBlocs[i].reponse = +inp.value;
      else if (inp.dataset.ci !== undefined) edBlocs[i].choix[+inp.dataset.ci] = inp.value;
      else edBlocs[i][field] = inp.value;
    });
  });
  c.querySelectorAll('input[type="radio"]').forEach(r => {
    r.addEventListener('change', e => { edBlocs[+r.dataset.i].reponse = +r.value; });
  });

  // Trous
  c.querySelectorAll('[data-pi]').forEach(inp => {
    if (!inp.dataset.bi) return;
    inp.addEventListener('input', () => {
      const bi = +inp.dataset.bi, pi = +inp.dataset.pi, f = inp.dataset.field;
      if (!edBlocs[bi].phrases) edBlocs[bi].phrases = [];
      if (!edBlocs[bi].phrases[pi]) edBlocs[bi].phrases[pi] = { texte:'', reponse:'', explication:'' };
      edBlocs[bi].phrases[pi][f] = inp.value;
    });
  });
  c.querySelectorAll('.ed-add-trou').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.i;
      if (!edBlocs[i].phrases) edBlocs[i].phrases = [];
      edBlocs[i].phrases.push({ texte:'', reponse:'', explication:'' });
      renderEdBlocs();
    });
  });
  c.querySelectorAll('.ed-del-trou').forEach(btn => {
    btn.addEventListener('click', () => {
      edBlocs[+btn.dataset.bi].phrases.splice(+btn.dataset.pi, 1);
      renderEdBlocs();
    });
  });

  // Déplacer / supprimer blocs
  c.querySelectorAll('.ed-move-up').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.i; if (i===0) return;
      [edBlocs[i-1],edBlocs[i]] = [edBlocs[i],edBlocs[i-1]]; renderEdBlocs();
    });
  });
  c.querySelectorAll('.ed-move-down').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.i; if (i>=edBlocs.length-1) return;
      [edBlocs[i],edBlocs[i+1]] = [edBlocs[i+1],edBlocs[i]]; renderEdBlocs();
    });
  });
  c.querySelectorAll('.ed-del-bloc').forEach(btn => {
    btn.addEventListener('click', () => { edBlocs.splice(+btn.dataset.i,1); renderEdBlocs(); });
  });
}

// Boutons ajouter bloc
const BLOC_DEFAULTS = {
  texte      : { type:'texte', contenu:'' },
  video      : { type:'video', url:'', legende:'' },
  question   : { type:'question', consigne:'', reponse:'', explication:'' },
  trous      : { type:'trous', consigne:'', phrases:[] },
  qcm        : { type:'qcm', question:'', choix:['','','',''], reponse:0, explication:'' },
  expression : { type:'expression', consigne:'', modele:'', explication:'' },
};
['texte','video','question','trous','qcm','expression'].forEach(t => {
  $e(`ed-add-${t}`)?.addEventListener('click', () => {
    edBlocs.push({ ...BLOC_DEFAULTS[t] });
    renderEdBlocs();
    $e('ed-blocs').lastElementChild?.scrollIntoView({ behavior:'smooth' });
  });
});

// Sauvegarde
$e('ed-save').addEventListener('click', async () => {
  const titre = $e('ed-titre').value.trim();
  if (!titre) { alert('Le titre est obligatoire.'); return; }
  const sb = getClient(); if (!sb) return;
  const btn = $e('ed-save');
  btn.textContent = '⏳ Sauvegarde…'; btn.disabled = true;
  const payload = {
    titre, categorie: $e('ed-categorie').value, niveau: $e('ed-niveau').value,
    icone: $e('ed-icone').value.trim() || '✏️',
    description: $e('ed-description').value.trim() || null,
    publie: $e('ed-publie').checked, blocs: edBlocs,
  };
  let error;
  if (edExercice) ({ error } = await sb.from('exercices').update(payload).eq('id', edExercice.id));
  else            ({ error } = await sb.from('exercices').insert(payload));
  if (error) { alert('Erreur : '+error.message); btn.textContent='💾 Sauvegarder'; btn.disabled=false; return; }
  btn.textContent = '✅ Sauvegardé !';
  setTimeout(async () => {
    btn.textContent='💾 Sauvegarder'; btn.disabled=false;
    await loadExercices(); showScreen('screen-categories');
  }, 1000);
});

$e('ed-delete').addEventListener('click', async () => {
  if (!edExercice) return;
  if (!confirm(`Supprimer "${edExercice.titre}" ?`)) return;
  const sb = getClient();
  const { error } = await sb.from('exercices').delete().eq('id', edExercice.id);
  if (error) { alert('Erreur : '+error.message); return; }
  await loadExercices(); showScreen('screen-categories');
});
$e('ed-cancel').addEventListener('click', () => showScreen('screen-categories'));

function escHtml(str) {
  return (str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('auth-ready', () => loadExercices());
if (window.Auth?.ready) loadExercices();
