/* ============================================================
   lecons.js — Leçons depuis Supabase
   Éditeur admin avec blocs mixtes (texte, image, exercice)
   ============================================================ */
'use strict';

const $l = id => document.getElementById(id);

const NIVEAUX_ORDER  = ['A0','A1','A2','B1','B2'];
const NIVEAUX_COLORS = {
  A0:'#22c55e', A1:'#16a34a', A2:'#3b82f6', B1:'#f59e0b', B2:'#ef4444'
};

let allLecons   = [];
let filtreNiveau = 'tous';
let filtreTheme  = 'tous';

/* ── État éditeur ── */
let edLecon  = null;   // leçon en cours d'édition
let edBlocs  = [];     // blocs en cours

function getClient() { return window.Auth?.getClient?.() || null; }

/* ══════════════════════════════════════════
   CHARGEMENT
══════════════════════════════════════════ */
async function loadLecons() {
  const sb = getClient();
  if (!sb) { renderGrid(); return; }

  const isAdmin = window.Auth?.isAdmin?.();
  let query = sb.from('lecons').select('*').order('created_at', { ascending: false });
  if (!isAdmin) query = query.eq('publie', true);

  const { data, error } = await query;
  if (error) console.warn('Erreur lecons:', error.message);

  allLecons = data || [];
  buildThemeFiltres();
  renderGrid();
  updateAdminBar();
}

/* ══════════════════════════════════════════
   FILTRES
══════════════════════════════════════════ */
function buildThemeFiltres() {
  const themes = [...new Set(allLecons.map(l => l.theme))];
  const pills  = $l('filtre-theme');
  pills.innerHTML = '<button class="filtre-pill active" data-val="tous">Tous</button>';
  themes.forEach(t => {
    const btn = document.createElement('button');
    btn.className  = 'filtre-pill';
    btn.dataset.val = t;
    btn.textContent = t;
    pills.appendChild(btn);
  });
}

$l('filtre-niveau').addEventListener('click', e => {
  const pill = e.target.closest('.filtre-pill');
  if (!pill) return;
  $l('filtre-niveau').querySelectorAll('.filtre-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  filtreNiveau = pill.dataset.val;
  renderGrid();
});

$l('filtre-theme').addEventListener('click', e => {
  const pill = e.target.closest('.filtre-pill');
  if (!pill) return;
  $l('filtre-theme').querySelectorAll('.filtre-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  filtreTheme = pill.dataset.val;
  renderGrid();
});

/* ══════════════════════════════════════════
   GRILLE DES LEÇONS
══════════════════════════════════════════ */
function renderGrid() {
  const grid  = $l('lecons-grid');
  const empty = $l('lecons-empty');
  grid.innerHTML = '';

  const filtered = allLecons.filter(l => {
    const okNiveau = filtreNiveau === 'tous' || l.niveau === filtreNiveau;
    const okTheme  = filtreTheme  === 'tous' || l.theme  === filtreTheme;
    return okNiveau && okTheme;
  });

  if (!filtered.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const isAdmin = window.Auth?.isAdmin?.();

  filtered.forEach(lecon => {
    const color = NIVEAUX_COLORS[lecon.niveau] || '#7c3aed';
    const card  = document.createElement('div');
    card.className = 'lecon-card';
    card.style.borderColor = color + '44';
    card.innerHTML = `
      <div class="lecon-card-top" style="background:${color}18">
        <span class="lecon-card-icon">${lecon.icone}</span>
        <div class="lecon-card-badges">
          <span class="lecon-badge" style="background:${color}22;color:${color};border-color:${color}44">${lecon.niveau}</span>
          <span class="lecon-badge lecon-badge-theme">${lecon.theme}</span>
          ${!lecon.publie ? '<span class="lecon-badge lecon-badge-draft">✏️ Brouillon</span>' : ''}
        </div>
      </div>
      <div class="lecon-card-body">
        <h3 class="lecon-card-titre">${lecon.titre}</h3>
        ${lecon.description ? `<p class="lecon-card-desc">${lecon.description}</p>` : ''}
        <div class="lecon-card-meta">${lecon.blocs?.length || 0} bloc(s)</div>
        <div class="lecon-card-actions">
          <button class="lecon-btn-lire" data-id="${lecon.id}" style="background:${color}">📖 Lire</button>
          ${isAdmin ? `<button class="lecon-btn-edit" data-id="${lecon.id}">✏️</button>` : ''}
        </div>
      </div>
    `;
    card.querySelector('.lecon-btn-lire').addEventListener('click', () => openLecon(lecon.id));
    card.querySelector('.lecon-btn-edit')?.addEventListener('click', () => openEditor(lecon.id));
    grid.appendChild(card);
  });
}

function updateAdminBar() {
  if (window.Auth?.isAdmin?.()) {
    $l('lecon-admin-bar')?.classList.remove('hidden');
  }
}


/* ══════════════════════════════════════════
   IMPORT JSON
══════════════════════════════════════════ */
document.addEventListener('change', async e => {
  if (e.target.id !== 'lecon-import-input') return;
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = '';

  let json;
  try {
    json = JSON.parse(await file.text());
  } catch {
    alert('❌ Fichier JSON invalide.'); return;
  }

  if (!json.titre || !json.niveau || !json.blocs) {
    alert('❌ Format incorrect. Le fichier doit contenir : titre, niveau, theme, icone, description, publie, blocs.'); return;
  }

  const sb = getClient();
  if (!sb) return;

  const btn  = $l('lecon-import-btn');
  const orig = btn?.textContent;
  if (btn) { btn.textContent = '⏳ Import…'; btn.disabled = true; }

  const { error } = await sb.from('lecons').insert({
    titre      : json.titre,
    niveau     : json.niveau,
    theme      : json.theme      || 'Général',
    icone      : json.icone      || '📖',
    description: json.description || null,
    publie     : json.publie     ?? false,
    blocs      : json.blocs      || [],
  });

  if (error) {
    alert('❌ Erreur : ' + error.message);
  } else {
    alert(`✅ Leçon "${json.titre}" importée avec succès !`);
    await loadLecons();
  }

  if (btn) { btn.textContent = orig; btn.disabled = false; }
});

$l('lecon-import-btn')?.addEventListener('click', () => {
  $l('lecon-import-input')?.click();
});

/* ══════════════════════════════════════════
   LECTURE D'UNE LEÇON
══════════════════════════════════════════ */
function openLecon(id) {
  const lecon = allLecons.find(l => l.id === id);
  if (!lecon) return;

  const color = NIVEAUX_COLORS[lecon.niveau] || '#7c3aed';

  $l('lecon-niveau-badge').textContent  = lecon.niveau;
  $l('lecon-niveau-badge').style.background = color + '33';
  $l('lecon-niveau-badge').style.color  = color;
  $l('lecon-theme-badge').textContent   = lecon.theme;
  $l('lecon-titre').textContent         = lecon.icone + ' ' + lecon.titre;
  $l('lecon-intro').textContent         = lecon.description || '';

  // Rendre les blocs
  const container = $l('lecon-blocs');
  container.innerHTML = '';

  (lecon.blocs || []).forEach(bloc => {
    const el = document.createElement('div');
    el.className = 'lecon-bloc';

    if (bloc.type === 'texte') {
      el.classList.add('bloc-texte');
      el.innerHTML = bloc.contenu.replace(/\n/g, '<br>');

    } else if (bloc.type === 'image') {
      el.classList.add('bloc-image');
      el.innerHTML = `
        <img src="${bloc.url}" alt="${bloc.legende || ''}" loading="lazy" />
        ${bloc.legende ? `<p class="bloc-image-legende">${bloc.legende}</p>` : ''}
      `;

    } else if (bloc.type === 'exercice') {
      el.classList.add('bloc-exercice');
      el.innerHTML = renderExercice(bloc, lecon.id);
      bindExerciceEvents(el, bloc, lecon.id);
    }

    container.appendChild(el);
  });

  showLeconScreen('screen-lecon');

  if (window.Progress && window.Auth?.isLoggedIn?.()) {
    window.Progress.save({
      type : 'lesson_view',
      ref  : lecon.id,
      label: lecon.titre
    });
  }
}

function renderExercice(bloc, leconId) {
  if (!bloc.questions?.length) return '<p class="ex-empty">Aucune question.</p>';
  return `
    <div class="exercice-header">
      <h3 class="exercice-titre">✏️ Exercice</h3>
      <div class="exercice-hud">
        <span class="ex-counter">1 / ${bloc.questions.length}</span>
        <span class="ex-score">⭐ 0</span>
      </div>
    </div>
    <div class="ex-progress-wrap">
      <div class="ex-progress-bar" style="width:0%"></div>
    </div>
    <div class="ex-card">
      <p class="ex-question">${bloc.questions[0].q}</p>
      <div class="ex-choices"></div>
      <div class="ex-feedback"></div>
      <div class="ex-next-wrap hidden">
        <button class="lc-btn primary ex-next-btn">Suivant →</button>
      </div>
    </div>
    <div class="ex-result hidden">
      <div class="ex-result-emoji"></div>
      <div class="ex-result-score"></div>
      <div class="ex-result-msg"></div>
      <button class="lc-btn primary ex-retry-btn" style="margin-top:1rem">🔄 Recommencer</button>
    </div>
  `;
}

function bindExerciceEvents(el, bloc, leconId) {
  if (!bloc.questions?.length) return;

  let index = 0, score = 0, answered = false;

  function renderQ() {
    answered = false;
    const q      = bloc.questions[index];
    const total  = bloc.questions.length;
    const pct    = (index / total) * 100;

    el.querySelector('.ex-counter').textContent    = `${index + 1} / ${total}`;
    el.querySelector('.ex-progress-bar').style.width = pct + '%';
    el.querySelector('.ex-question').textContent   = q.q;
    el.querySelector('.ex-feedback').textContent   = '';
    el.querySelector('.ex-next-wrap').classList.add('hidden');

    const choices = el.querySelector('.ex-choices');
    choices.innerHTML = '';
    const letters = ['A','B','C','D'];
    shuffle(q.a.map((t,i) => ({ t, correct: i === 0 }))).forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.correct = opt.correct;
      btn.innerHTML = `<span class="choice-letter">${letters[i]}</span><span>${opt.t}</span>`;
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        choices.querySelectorAll('.choice-btn').forEach(b => {
          b.disabled = true;
          if (b.dataset.correct === 'true') b.classList.add('correct');
          else if (b === btn && !opt.correct) b.classList.add('wrong');
          else b.classList.add('disabled-neutral');
        });
        if (opt.correct) score++;
        el.querySelector('.ex-score').textContent = `⭐ ${score}`;
        el.querySelector('.ex-feedback').textContent = opt.correct ? '✅ Bravo !' : '❌ Pas tout à fait…';
        el.querySelector('.ex-next-wrap').classList.remove('hidden');
      });
      choices.appendChild(btn);
    });
  }

  el.querySelector('.ex-next-btn').addEventListener('click', () => {
    index++;
    if (index >= bloc.questions.length) showResult();
    else renderQ();
  });

  el.querySelector('.ex-retry-btn').addEventListener('click', () => {
    index = 0; score = 0;
    el.querySelector('.ex-result').classList.add('hidden');
    el.querySelector('.ex-card').classList.remove('hidden');
    renderQ();
  });

  function showResult() {
    const total = bloc.questions.length;
    const pct   = Math.round(score / total * 100);
    el.querySelector('.ex-card').classList.add('hidden');
    const res = el.querySelector('.ex-result');
    res.classList.remove('hidden');
    res.querySelector('.ex-result-emoji').textContent = pct === 100 ? '🏆' : pct >= 60 ? '⭐' : '📚';
    res.querySelector('.ex-result-score').textContent = `${score} / ${total}`;
    res.querySelector('.ex-result-msg').textContent   = pct === 100 ? 'Parfait !' : pct >= 60 ? 'Bien joué !' : 'Continue à t\'entraîner !';
    if (window.Progress && window.Auth?.isLoggedIn?.()) {
      window.Progress.save({ type: 'lesson_exercise', ref: leconId, label: 'Exercice', score, total });
    }
  }

  renderQ();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

/* ══════════════════════════════════════════
   NAVIGATION ÉCRANS
══════════════════════════════════════════ */
function showLeconScreen(screen) {
  ['screen-liste','screen-lecon','screen-editor'].forEach(s => {
    $l(s)?.classList.add('hidden');
  });
  $l(screen)?.classList.remove('hidden');
}

$l('btn-back-liste')?.addEventListener('click', () => showLeconScreen('screen-liste'));

/* ══════════════════════════════════════════
   ÉDITEUR ADMIN
══════════════════════════════════════════ */
$l('lecon-new-btn')?.addEventListener('click', () => openEditor(null));

function openEditor(id) {
  if (id) {
    edLecon = allLecons.find(l => l.id === id);
    edBlocs = JSON.parse(JSON.stringify(edLecon.blocs || []));
    $l('ed-titre').value       = edLecon.titre;
    $l('ed-niveau').value      = edLecon.niveau;
    $l('ed-theme').value       = edLecon.theme;
    $l('ed-icone').value       = edLecon.icone;
    $l('ed-description').value = edLecon.description || '';
    $l('ed-publie').checked    = edLecon.publie;
  } else {
    edLecon = null;
    edBlocs = [];
    $l('ed-titre').value       = '';
    $l('ed-niveau').value      = 'A1';
    $l('ed-theme').value       = '';
    $l('ed-icone').value       = '📖';
    $l('ed-description').value = '';
    $l('ed-publie').checked    = false;
  }
  renderEdBlocs();
  showLeconScreen('screen-editor');
}

/* ── Rendu des blocs éditeur ── */
function renderEdBlocs() {
  const container = $l('ed-blocs');
  container.innerHTML = '';

  edBlocs.forEach((bloc, i) => {
    const div = document.createElement('div');
    div.className = 'ed-bloc';
    div.dataset.index = i;

    let inner = '';
    if (bloc.type === 'texte') {
      inner = `
        <div class="ed-bloc-header">
          <span class="ed-bloc-type">📝 Texte</span>
          <div class="ed-bloc-btns">
            <button class="ed-move-up"   data-i="${i}">↑</button>
            <button class="ed-move-down" data-i="${i}">↓</button>
            <button class="ed-del-bloc"  data-i="${i}">🗑️</button>
          </div>
        </div>
        <textarea class="ed-textarea" data-i="${i}" rows="5" placeholder="Écris ton texte ici…">${escHtml(bloc.contenu || '')}</textarea>
      `;
    } else if (bloc.type === 'image') {
      inner = `
        <div class="ed-bloc-header">
          <span class="ed-bloc-type">🖼️ Image</span>
          <div class="ed-bloc-btns">
            <button class="ed-move-up"   data-i="${i}">↑</button>
            <button class="ed-move-down" data-i="${i}">↓</button>
            <button class="ed-del-bloc"  data-i="${i}">🗑️</button>
          </div>
        </div>
        ${bloc.url ? `<img src="${bloc.url}" class="ed-img-preview" />` : ''}
        <label class="ed-upload-label">
          📁 Choisir une image
          <input type="file" class="ed-img-input" data-i="${i}" accept="image/*" hidden />
        </label>
        <input class="ed-input" type="text" data-i="${i}" data-field="legende" placeholder="Légende (optionnel)" value="${escHtml(bloc.legende || '')}" />
      `;
    } else if (bloc.type === 'exercice') {
      inner = `
        <div class="ed-bloc-header">
          <span class="ed-bloc-type">✏️ Exercice QCM</span>
          <div class="ed-bloc-btns">
            <button class="ed-move-up"   data-i="${i}">↑</button>
            <button class="ed-move-down" data-i="${i}">↓</button>
            <button class="ed-del-bloc"  data-i="${i}">🗑️</button>
          </div>
        </div>
        <div class="ed-questions" data-bloc="${i}">
          ${(bloc.questions || []).map((q, qi) => renderEdQuestion(i, qi, q)).join('')}
        </div>
        <button class="ed-add-q lc-btn secondary" data-i="${i}">➕ Ajouter une question</button>
      `;
    }

    div.innerHTML = inner;
    container.appendChild(div);
  });

  bindEdBlocEvents();
}

function renderEdQuestion(bi, qi, q) {
  return `
    <div class="ed-question" data-bi="${bi}" data-qi="${qi}">
      <div class="ed-q-header">
        <span class="ed-q-num">Q${qi+1}</span>
        <button class="ed-del-q" data-bi="${bi}" data-qi="${qi}">🗑️</button>
      </div>
      <input class="ed-input" type="text" placeholder="Question…" value="${escHtml(q.q||'')}" data-bi="${bi}" data-qi="${qi}" data-field="q" />
      <label class="ed-answer-label">✅ Bonne réponse</label>
      <input class="ed-input correct-answer" type="text" placeholder="Réponse correcte…" value="${escHtml(q.a?.[0]||'')}" data-bi="${bi}" data-qi="${qi}" data-ai="0" />
      <label class="ed-answer-label">❌ Mauvaises réponses</label>
      ${[1,2,3].map(ai => `<input class="ed-input" type="text" placeholder="Mauvaise réponse ${ai}…" value="${escHtml(q.a?.[ai]||'')}" data-bi="${bi}" data-qi="${qi}" data-ai="${ai}" />`).join('')}
    </div>
  `;
}

function bindEdBlocEvents() {
  const c = $l('ed-blocs');

  // Texte
  c.querySelectorAll('.ed-textarea').forEach(ta => {
    ta.addEventListener('input', e => {
      edBlocs[+e.target.dataset.i].contenu = e.target.value;
    });
  });

  // Image légende
  c.querySelectorAll('[data-field="legende"]').forEach(inp => {
    inp.addEventListener('input', e => {
      edBlocs[+e.target.dataset.i].legende = e.target.value;
    });
  });

  // Upload image
  c.querySelectorAll('.ed-img-input').forEach(inp => {
    inp.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      const i    = +e.target.dataset.i;
      const btn  = e.target.previousElementSibling;
      if (btn) btn.textContent = '⏳ Upload…';
      try {
        const url = await uploadLeconImage(file);
        edBlocs[i].url = url;
        renderEdBlocs();
      } catch (err) {
        alert('Erreur upload : ' + err.message);
        if (btn) btn.textContent = '📁 Choisir une image';
      }
    });
  });

  // Déplacer blocs
  c.querySelectorAll('.ed-move-up').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.i;
      if (i === 0) return;
      [edBlocs[i-1], edBlocs[i]] = [edBlocs[i], edBlocs[i-1]];
      renderEdBlocs();
    });
  });
  c.querySelectorAll('.ed-move-down').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.i;
      if (i >= edBlocs.length-1) return;
      [edBlocs[i], edBlocs[i+1]] = [edBlocs[i+1], edBlocs[i]];
      renderEdBlocs();
    });
  });

  // Supprimer bloc
  c.querySelectorAll('.ed-del-bloc').forEach(btn => {
    btn.addEventListener('click', () => {
      edBlocs.splice(+btn.dataset.i, 1);
      renderEdBlocs();
    });
  });

  // Questions QCM
  c.querySelectorAll('[data-field="q"]').forEach(inp => {
    inp.addEventListener('input', e => {
      const bi = +e.target.dataset.bi, qi = +e.target.dataset.qi;
      if (!edBlocs[bi].questions[qi]) return;
      edBlocs[bi].questions[qi].q = e.target.value;
    });
  });
  c.querySelectorAll('[data-ai]').forEach(inp => {
    inp.addEventListener('input', e => {
      const bi = +e.target.dataset.bi, qi = +e.target.dataset.qi, ai = +e.target.dataset.ai;
      if (!edBlocs[bi].questions[qi]) return;
      edBlocs[bi].questions[qi].a[ai] = e.target.value;
    });
  });

  // Ajouter question
  c.querySelectorAll('.ed-add-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.i;
      if (!edBlocs[i].questions) edBlocs[i].questions = [];
      edBlocs[i].questions.push({ q: '', a: ['','',''] });
      renderEdBlocs();
    });
  });

  // Supprimer question
  c.querySelectorAll('.ed-del-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const bi = +btn.dataset.bi, qi = +btn.dataset.qi;
      edBlocs[bi].questions.splice(qi, 1);
      renderEdBlocs();
    });
  });

  // Label upload
  c.querySelectorAll('.ed-upload-label').forEach(lbl => {
    lbl.addEventListener('click', () => {
      lbl.nextElementSibling?.click() || lbl.querySelector('input')?.click();
    });
  });
}

/* ── Upload image leçon ── */
async function uploadLeconImage(file) {
  const sb   = getClient();
  if (!sb) throw new Error('Supabase non disponible');
  const ext  = file.name.split('.').pop();
  const path = `${Date.now()}.${ext}`;
  const { error } = await sb.storage.from('lecons-images').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = sb.storage.from('lecons-images').getPublicUrl(path);
  return data.publicUrl;
}

/* ── Boutons ajouter bloc ── */
$l('ed-add-texte')?.addEventListener('click', () => {
  edBlocs.push({ type: 'texte', contenu: '' });
  renderEdBlocs();
  $l('ed-blocs').lastElementChild?.scrollIntoView({ behavior: 'smooth' });
});
$l('ed-add-image')?.addEventListener('click', () => {
  edBlocs.push({ type: 'image', url: '', legende: '' });
  renderEdBlocs();
  $l('ed-blocs').lastElementChild?.scrollIntoView({ behavior: 'smooth' });
});
$l('ed-add-exercice')?.addEventListener('click', () => {
  edBlocs.push({ type: 'exercice', questions: [] });
  renderEdBlocs();
  $l('ed-blocs').lastElementChild?.scrollIntoView({ behavior: 'smooth' });
});

/* ── Sauvegarde ── */
$l('ed-save')?.addEventListener('click', async () => {
  const titre = $l('ed-titre').value.trim();
  const theme = $l('ed-theme').value.trim();
  if (!titre || !theme) { alert('Titre et thème obligatoires.'); return; }

  const sb  = getClient();
  if (!sb) return;

  const btn = $l('ed-save');
  btn.textContent = '⏳ Sauvegarde…';
  btn.disabled    = true;

  const payload = {
    titre,
    niveau     : $l('ed-niveau').value,
    theme,
    icone      : $l('ed-icone').value.trim() || '📖',
    description: $l('ed-description').value.trim() || null,
    publie     : $l('ed-publie').checked,
    blocs      : edBlocs,
  };

  let error;
  if (edLecon) {
    ({ error } = await sb.from('lecons').update(payload).eq('id', edLecon.id));
  } else {
    ({ error } = await sb.from('lecons').insert(payload));
  }

  if (error) {
    alert('Erreur : ' + error.message);
    btn.textContent = '💾 Sauvegarder';
    btn.disabled    = false;
    return;
  }

  btn.textContent = '✅ Sauvegardé !';
  setTimeout(async () => {
    btn.textContent = '💾 Sauvegarder';
    btn.disabled    = false;
    await loadLecons();
    showLeconScreen('screen-liste');
  }, 1000);
});

/* ── Supprimer leçon ── */
$l('ed-delete')?.addEventListener('click', async () => {
  if (!edLecon) return;
  if (!confirm(`Supprimer la leçon "${edLecon.titre}" ?`)) return;
  const sb = getClient();
  const { error } = await sb.from('lecons').delete().eq('id', edLecon.id);
  if (error) { alert('Erreur : ' + error.message); return; }
  await loadLecons();
  showLeconScreen('screen-liste');
});

$l('ed-cancel')?.addEventListener('click', () => showLeconScreen('screen-liste'));

function escHtml(str) {
  return (str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('auth-ready', () => loadLecons());
if (window.Auth?.ready) loadLecons();
