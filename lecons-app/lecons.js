/* ============================================================
   lecons.js — Moteur principal des leçons
   Charge automatiquement toutes les leçons du manifest.
   ============================================================ */
'use strict';

const $ = id => document.getElementById(id);

/* ── État ── */
const state = {
  lecons       : [],   // toutes les leçons chargées
  filtreNiveau : 'tous',
  filtreTheme  : 'tous',
  courante     : null, // leçon affichée
  ex : { questions:[], index:0, score:0, answered:false },
  fc : { cards:[], index:0, flipped:false },
};

/* ── Écrans ── */
function showScreen(name) {
  ['screen-liste','screen-lecon'].forEach(id => $(id).classList.add('hidden'));
  $(name).classList.remove('hidden');
}

/* ══════════════════════════════════════════
   CHARGEMENT DES LEÇONS
══════════════════════════════════════════ */
async function loadLecons() {
  try {
    const r = await fetch('lecons-manifest.json');
    if (!r.ok) { renderGrid(); return; }
    const manifest = await r.json();
    for (const entry of manifest) {
      try {
        window._pendingLeconRef = entry.fichier.replace(/\.js$/, '');
        await loadScript('lecons/' + entry.fichier);
      } catch(e) { console.warn('Leçon non chargée :', entry.fichier, e); }
    }
  } catch(e) { console.warn('Manifest introuvable', e); }
  buildThemeFilter();
  renderGrid();
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* Appelé par chaque fichier de leçon */
window.registerLecon = function(lecon) {
  if (window._pendingLeconRef) lecon.ref = window._pendingLeconRef;
  state.lecons.push(lecon);
};

/* ══════════════════════════════════════════
   FILTRES
══════════════════════════════════════════ */
function buildThemeFilter() {
  const themes = [...new Set(state.lecons.map(l => l.theme))];
  const container = $('filtre-theme');
  // Garder le bouton "Tous"
  themes.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'filtre-pill';
    btn.dataset.val = t;
    btn.textContent = t;
    container.appendChild(btn);
  });
  bindFilters();
}

function bindFilters() {
  document.querySelectorAll('#filtre-niveau .filtre-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#filtre-niveau .filtre-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filtreNiveau = btn.dataset.val;
      renderGrid();
    });
  });
  document.querySelectorAll('#filtre-theme .filtre-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#filtre-theme .filtre-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filtreTheme = btn.dataset.val;
      renderGrid();
    });
  });
}

/* ══════════════════════════════════════════
   GRILLE DES LEÇONS
══════════════════════════════════════════ */
const NIVEAU_COLORS = {
  A0: { bg:'rgba(34,197,94,0.15)',  border:'#22c55e', text:'#86efac' },
  A1: { bg:'rgba(16,185,129,0.15)', border:'#10b981', text:'#6ee7b7' },
  A2: { bg:'rgba(59,130,246,0.15)', border:'#3b82f6', text:'#93c5fd' },
  B1: { bg:'rgba(245,158,11,0.15)', border:'#f59e0b', text:'#fcd34d' },
  B2: { bg:'rgba(239,68,68,0.15)',  border:'#ef4444', text:'#fca5a5' },
};
const THEME_COLORS = [
  '#7c3aed','#0d7865','#1e40af','#b45309','#be123c','#0369a1','#7e22ce',
];
let themeColorMap = {};

function getThemeColor(theme) {
  if (!themeColorMap[theme]) {
    const idx = Object.keys(themeColorMap).length % THEME_COLORS.length;
    themeColorMap[theme] = THEME_COLORS[idx];
  }
  return themeColorMap[theme];
}

function renderGrid() {
  const grid = $('lecons-grid');
  grid.innerHTML = '';

  const filtered = state.lecons.filter(l => {
    const okN = state.filtreNiveau === 'tous' || l.niveau === state.filtreNiveau;
    const okT = state.filtreTheme  === 'tous' || l.theme  === state.filtreTheme;
    return okN && okT;
  });

  $('lecons-empty').classList.toggle('hidden', filtered.length > 0);

  filtered.forEach(lecon => {
    const nc = NIVEAU_COLORS[lecon.niveau] || NIVEAU_COLORS['A0'];
    const tc = getThemeColor(lecon.theme);
    const card = document.createElement('div');
    card.className = 'lecon-card';
    card.style.cssText = `background:linear-gradient(145deg,${tc}22,rgba(255,255,255,0.03));border-color:${tc}55;`;
    card.innerHTML = `
      <div class="lecon-card-top">
        <span class="lecon-card-icon">${lecon.icon || '📖'}</span>
        <div class="lecon-card-badges">
          <span class="lecon-badge" style="background:${nc.bg};border-color:${nc.border};color:${nc.text}">${lecon.niveau}</span>
          <span class="lecon-badge" style="background:${tc}25;border-color:${tc};color:${tc}">${lecon.theme}</span>
        </div>
      </div>
      <div class="lecon-card-title">${lecon.titre}</div>
      <div class="lecon-card-desc">${lecon.description}</div>
      <div class="lecon-card-footer">
        <span class="lecon-card-duree">⏱ ${lecon.duree || '10 min'}</span>
        <span class="lecon-card-cta">Commencer →</span>
      </div>
    `;
    card.addEventListener('click', () => openLecon(lecon));
    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════
   OUVRIR UNE LEÇON
══════════════════════════════════════════ */
function openLecon(lecon) {
  state.courante = lecon;

  // Badges topbar
  const nc = NIVEAU_COLORS[lecon.niveau] || NIVEAU_COLORS['A0'];
  const tc = getThemeColor(lecon.theme);
  const nb = $('lecon-niveau-badge');
  nb.textContent = lecon.niveau;
  nb.style.cssText = `background:${nc.bg};border-color:${nc.border};color:${nc.text};border:1px solid;`;
  const tb = $('lecon-theme-badge');
  tb.textContent = lecon.theme;
  tb.style.cssText = `background:${tc}25;border-color:${tc};color:${tc};border:1px solid;`;

  // Onglet actif → théorie
  switchLeconTab('theorie');

  // Remplir théorie
  renderTheorie(lecon);

  // Init exercice
  initExercice(lecon);

  // Init flashcards
  initFlashcards(lecon);

  showScreen('screen-lecon');

  if (window.Progress) {
    Progress.save({
      type: 'lesson_view',
      ref: lecon.ref || lecon.titre,
      label: lecon.titre
    });
  }
}

$('btn-back-liste').addEventListener('click', () => showScreen('screen-liste'));

/* ── Onglets leçon ── */
document.querySelectorAll('.lecon-tab').forEach(tab => {
  tab.addEventListener('click', () => switchLeconTab(tab.dataset.tab));
});

function switchLeconTab(tab) {
  document.querySelectorAll('.lecon-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  ['theorie','exercice','flashcards'].forEach(t => $('tab-' + t).classList.toggle('hidden', t !== tab));
  $('lecon-section-label').textContent = tab === 'theorie' ? '📚 Théorie' : tab === 'exercice' ? '✏️ Exercice' : '🃏 Flashcards';
}

/* ══════════════════════════════════════════
   THÉORIE
══════════════════════════════════════════ */
function renderTheorie(lecon) {
  $('lecon-titre').textContent = lecon.titre;
  $('lecon-intro').innerHTML   = lecon.intro || '';

  const container = $('lecon-sections');
  container.innerHTML = '';

  (lecon.sections || []).forEach(sec => {
    const div = document.createElement('div');
    div.className = 'lecon-section';

    let html = `<div class="lecon-section-title">${sec.titre}</div>`;

    if (sec.texte) html += `<div class="lecon-section-text">${sec.texte}</div>`;

    if (sec.tableau) {
      html += `<div class="lecon-table-wrap"><table class="lecon-table">
        <thead><tr>${sec.tableau.entetes.map(e => `<th>${e}</th>`).join('')}</tr></thead>
        <tbody>${sec.tableau.lignes.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    }

    if (sec.exemples && sec.exemples.length) {
      html += `<div class="lecon-exemples">`;
      sec.exemples.forEach(ex => {
        html += `<div class="lecon-exemple">
          <span class="lecon-exemple-fr">${ex.fr}</span>
          <span class="lecon-exemple-trad">${ex.trad || ''}</span>
          ${ex.note ? `<span class="lecon-exemple-note">💡 ${ex.note}</span>` : ''}
        </div>`;
      });
      html += `</div>`;
    }

    if (sec.astuce) {
      html += `<div class="lecon-astuce">
        <div class="lecon-astuce-title">💡 Astuce</div>
        ${sec.astuce}
      </div>`;
    }

    div.innerHTML = html;
    container.appendChild(div);
  });
}

/* ══════════════════════════════════════════
   EXERCICE QCM
══════════════════════════════════════════ */
function initExercice(lecon) {
  state.ex.questions = shuffle([...(lecon.exercices || [])]);
  state.ex.index     = 0;
  state.ex.score     = 0;
  state.ex.answered  = false;

  $('ex-result').classList.add('hidden');
  $('ex-card').style.display = '';

  renderExQuestion();
}

function renderExQuestion() {
  const ex = state.ex;
  if (!ex.questions.length) {
    $('ex-card').innerHTML = '<p style="text-align:center;color:var(--text-soft);padding:2rem">Aucun exercice pour cette leçon.</p>';
    return;
  }

  const total = ex.questions.length;
  const q     = ex.questions[ex.index];

  $('ex-counter').textContent      = `Question ${ex.index + 1} / ${total}`;
  $('ex-score').textContent        = `⭐ ${ex.score}`;
  $('ex-progress-bar').style.width = `${(ex.index / total) * 100}%`;
  $('ex-question').textContent     = q.question;
  $('ex-feedback').textContent     = '';
  $('ex-feedback').className       = 'ex-feedback';
  $('ex-next-wrap').classList.add('hidden');
  ex.answered = false;

  // Réponses mélangées
  const choices = shuffle(q.choix.map((text, i) => ({ text, correct: i === 0 })));
  const letters = ['A','B','C','D'];
  const container = $('ex-choices');
  container.innerHTML = '';

  choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'ex-choice';
    btn.dataset.correct = c.correct;
    btn.innerHTML = `<span class="ex-choice-letter">${letters[i]}</span><span>${c.text}</span>`;
    btn.addEventListener('click', () => handleExAnswer(btn, c.correct, choices));
    container.appendChild(btn);
  });
}

function handleExAnswer(clicked, isCorrect, choices) {
  if (state.ex.answered) return;
  state.ex.answered = true;

  document.querySelectorAll('.ex-choice').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.correct === 'true') btn.classList.add('correct');
    else if (btn === clicked && !isCorrect) btn.classList.add('wrong');
    else btn.classList.add('dim');
  });

  if (isCorrect) state.ex.score++;
  $('ex-score').textContent = `⭐ ${state.ex.score}`;

  const fb = $('ex-feedback');
  if (isCorrect) {
    const msgs = ['✅ Excellent !','✅ Bravo !','✅ Parfait !','✅ Très bien !'];
    fb.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    fb.className = 'ex-feedback correct';
  } else {
    const bonne = choices.find(c => c.correct);
    fb.innerHTML = `❌ La bonne réponse était : <strong>${bonne ? bonne.text : ''}</strong>`;
    fb.className = 'ex-feedback incorrect';
  }

  const isLast = state.ex.index >= state.ex.questions.length - 1;
  const nextBtn = $('ex-next-btn');
  nextBtn.textContent = isLast ? '🏁 Résultats' : 'Suivant →';
  nextBtn.onclick = isLast ? showExResult : () => { state.ex.index++; renderExQuestion(); };
  $('ex-next-wrap').classList.remove('hidden');
}

function showExResult() {
  const total = state.ex.questions.length;
  const score = state.ex.score;
  const pct   = Math.round(score / total * 100);

  $('ex-card').style.display = 'none';
  $('ex-result').classList.remove('hidden');

  $('ex-result-emoji').textContent = pct === 100 ? '🏆' : pct >= 80 ? '⭐' : pct >= 60 ? '💪' : '📚';
  $('ex-result-score').textContent = `${score} / ${total}`;
  $('ex-result-msg').textContent   = pct === 100 ? 'Parfait ! Maîtrisé !'
    : pct >= 80 ? 'Excellent travail !'
    : pct >= 60 ? 'Bien joué, continue !'
    : 'Revois la théorie et réessaie !';
  $('ex-result-stars').textContent = '⭐'.repeat(pct >= 90 ? 3 : pct >= 60 ? 2 : 1) + '☆'.repeat(pct >= 90 ? 0 : pct >= 60 ? 1 : 2);

  if (window.Progress && state.courante) {
    Progress.save({
      type: 'lesson_exercise',
      ref: state.courante.ref || state.courante.titre,
      label: state.courante.titre,
      score,
      total
    });
  }
}

$('ex-retry-btn').addEventListener('click', () => {
  $('ex-result').classList.add('hidden');
  $('ex-card').style.display = '';
  initExercice(state.courante);
});

/* ══════════════════════════════════════════
   FLASHCARDS
══════════════════════════════════════════ */
function initFlashcards(lecon) {
  state.fc.cards   = [...(lecon.flashcards || [])];
  state.fc.index   = 0;
  state.fc.flipped = false;
  renderFlashcard();
  renderFcDots();
}

function renderFlashcard() {
  const fc    = state.fc;
  const card  = fc.cards[fc.index];
  const total = fc.cards.length;

  $('fc-counter').textContent = `${fc.index + 1} / ${total}`;
  $('fc-inner').style.transition = 'none';
  $('fc-card').classList.remove('flipped');
  fc.flipped = false;

  if (!card) return;
  $('fc-front').innerHTML = `
    <div class="fc-front-word">${card.recto}</div>
    <div class="fc-front-sub">${card.sous_recto || ''}</div>
  `;
  $('fc-back').innerHTML = `
    <div class="fc-back-word">${card.verso}</div>
    <div class="fc-back-detail">${card.detail || ''}</div>
    ${card.exemple ? `<div class="fc-back-ex">« ${card.exemple} »</div>` : ''}
  `;
  setTimeout(() => $('fc-inner').style.transition = '', 10);
  renderFcDots();
}

window.flipCard = function() {
  state.fc.flipped = !state.fc.flipped;
  $('fc-card').classList.toggle('flipped', state.fc.flipped);
};

function renderFcDots() {
  const dots = $('fc-dots');
  dots.innerHTML = '';
  state.fc.cards.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'fc-dot' + (i === state.fc.index ? ' active' : '');
    d.addEventListener('click', () => { state.fc.index = i; renderFlashcard(); });
    dots.appendChild(d);
  });
}

$('fc-prev').addEventListener('click', () => {
  if (state.fc.index > 0) { state.fc.index--; renderFlashcard(); }
});
$('fc-next').addEventListener('click', () => {
  if (state.fc.index < state.fc.cards.length - 1) { state.fc.index++; renderFlashcard(); }
});
$('fc-shuffle-btn').addEventListener('click', () => {
  state.fc.cards = shuffle(state.fc.cards);
  state.fc.index = 0;
  renderFlashcard();
});
$('fc-restart-btn').addEventListener('click', () => {
  state.fc.cards = [...(state.courante.flashcards || [])];
  state.fc.index = 0;
  renderFlashcard();
});

/* ── Swipe clavier ── */
document.addEventListener('keydown', e => {
  if ($('screen-lecon').classList.contains('hidden')) return;
  if (e.key === 'ArrowRight') $('fc-next').click();
  if (e.key === 'ArrowLeft')  $('fc-prev').click();
  if (e.key === ' ')          { e.preventDefault(); flipCard(); }
});

/* ── Utilitaire shuffle ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Démarrage ── */
loadLecons();
