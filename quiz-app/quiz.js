/* ============================================================
   quiz.js — Logique principale du quiz
   Version Supabase — données chargées depuis la base
   ============================================================ */
'use strict';

const $ = id => document.getElementById(id);

const NIVEAUX_ORDER = ['A0', 'A1', 'A2', 'B1', 'B2'];
const NIVEAUX_LABELS = {
  A0: { label: 'Débutant A0',      color: '#22c55e' },
  A1: { label: 'Débutant A1',      color: '#16a34a' },
  A2: { label: 'Débutant A2',      color: '#3b82f6' },
  B1: { label: 'Intermédiaire B1', color: '#f59e0b' },
  B2: { label: 'Intermédiaire B2', color: '#ef4444' },
};
const NIVEAU_DESCS = {
  A0: 'Questions très simples, vocabulaire du quotidien',
  A1: 'Phrases courtes, situations familières',
  A2: 'Phrases plus complexes, description et narration',
  B1: 'Argumentation simple, sujets courants',
  B2: 'Analyse, débat et nuance sur des sujets variés',
};

/* ── État ── */
const state = {
  allRows  : [],
  themes   : [],
  theme    : null,
  niveau   : null,
  questions: [],
  index    : 0,
  score    : 0,
  lives    : 3,
  answered : false,
};

/* ── Écrans ── */
const screens = {
  loading : $('screen-loading'),
  themes  : $('screen-themes'),
  niveaux : $('screen-niveaux'),
  quiz    : $('screen-quiz'),
  result  : $('screen-result'),
  editor  : $('screen-editor'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s && s.classList.add('hidden'));
  if (screens[name]) screens[name].classList.remove('hidden');
}

function getClient() { return window.Auth?.getClient?.() || null; }

/* ══════════════════════════════════════════
   CHARGEMENT DEPUIS SUPABASE
══════════════════════════════════════════ */
async function loadQuizzes() {
  showScreen('loading');
  const sb = getClient();
  if (!sb) { buildThemeGrid(); showScreen('themes'); return; }

  const { data, error } = await sb
    .from('quizzes')
    .select('*')
    .order('theme_id')
    .order('niveau');

  if (error) console.warn('Erreur chargement quizzes:', error.message);

  state.allRows = data || [];
  aggregateThemes();
  buildThemeGrid();
  showScreen('themes');
}

function aggregateThemes() {
  const map = {};
  state.allRows.forEach(row => {
    if (!map[row.theme_id]) {
      map[row.theme_id] = {
        theme_id  : row.theme_id,
        theme     : row.theme,
        icon      : row.icon,
        color     : row.color,
        colorLight: row.color_light,
        niveaux   : {}
      };
    }
    map[row.theme_id].niveaux[row.niveau] = row.questions;
  });
  state.themes = Object.values(map);
}

/* ══════════════════════════════════════════
   GRILLE DES THÈMES
══════════════════════════════════════════ */
function buildThemeGrid() {
  const grid = $('theme-grid');
  grid.innerHTML = '';

  if (window.Auth?.isAdmin?.()) {
    const addBtn = document.createElement('div');
    addBtn.className = 'theme-card theme-card--add';
    addBtn.innerHTML = `
      <div class="theme-card-icon">➕</div>
      <div class="theme-card-title">Nouveau quiz</div>
      <div class="theme-card-cta">Créer un thème ou ajouter un niveau →</div>
    `;
    grid.appendChild(addBtn);
  }

  if (!state.themes.length) {
    const msg = document.createElement('p');
    msg.style.cssText = 'color:var(--text-soft);text-align:center;padding:2rem;grid-column:1/-1';
    msg.textContent = 'Aucun quiz disponible pour l\'instant.';
    grid.appendChild(msg);
    return;
  }

  state.themes.forEach(theme => {
    const niveauxDispo = NIVEAUX_ORDER.filter(n => theme.niveaux[n]?.length);
    const card = document.createElement('div');
    card.className = 'theme-card';
    card.dataset.themeId = theme.theme_id;
    card.style.background  = `linear-gradient(145deg, ${theme.colorLight}, rgba(255,255,255,0.03))`;
    card.style.borderColor = theme.color + '55';
    card.innerHTML = `
      <div class="theme-card-icon">${theme.icon}</div>
      <div class="theme-card-title">${theme.theme}</div>
      <div class="theme-card-levels">
        ${niveauxDispo.map(n => `<span class="level-pill">${NIVEAUX_LABELS[n].label}</span>`).join('')}
      </div>
      <div class="theme-card-cta">20 questions par niveau →</div>
      ${window.Auth?.isAdmin?.() ? `<button class="theme-edit-btn" data-id="${theme.theme_id}">✏️</button>` : ''}
    `;
    grid.appendChild(card);
  });
}

/* ── Délégation d'événements sur la grille (une seule fois) ── */
$('theme-grid').addEventListener('click', e => {
  // Bouton ➕ nouveau quiz
  if (e.target.closest('.theme-card--add')) {
    openEditor(null);
    return;
  }
  // Bouton ✏️ éditer un thème
  const editBtn = e.target.closest('.theme-edit-btn');
  if (editBtn) {
    e.stopPropagation();
    openEditor(editBtn.dataset.id);
    return;
  }
  // Clic sur une carte thème
  const card = e.target.closest('.theme-card:not(.theme-card--add)');
  if (card?.dataset.themeId) {
    const theme = state.themes.find(t => t.theme_id === card.dataset.themeId);
    if (theme) selectTheme(theme);
  }
});

/* ══════════════════════════════════════════
   SÉLECTION THÈME / NIVEAU
══════════════════════════════════════════ */
function selectTheme(theme) {
  state.theme = theme;
  $('niveau-theme-title').textContent = theme.icon + ' ' + theme.theme;
  buildNiveauGrid(theme);
  showScreen('niveaux');
}

$('back-to-themes').addEventListener('click', () => showScreen('themes'));

function buildNiveauGrid(theme) {
  const grid = $('niveau-grid');
  grid.innerHTML = '';
  NIVEAUX_ORDER.forEach(n => {
    const questions = theme.niveaux[n];
    if (!questions?.length) return;
    const meta = NIVEAUX_LABELS[n];
    const card = document.createElement('div');
    card.className = 'niveau-card';
    card.innerHTML = `
      <div class="niveau-dot" style="background:${meta.color}"></div>
      <div class="niveau-info">
        <div class="niveau-label">${meta.label}</div>
        <div class="niveau-desc">${NIVEAU_DESCS[n]}</div>
      </div>
      <div class="niveau-count">${questions.length} questions</div>
      <div class="niveau-arrow">→</div>
    `;
    card.style.borderColor = meta.color + '44';
    card.addEventListener('mouseenter', () => card.style.borderColor = meta.color);
    card.addEventListener('mouseleave', () => card.style.borderColor = meta.color + '44');
    card.addEventListener('click', () => startQuiz(n));
    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════
   QUIZ EN COURS
══════════════════════════════════════════ */
function startQuiz(niveau) {
  state.niveau   = niveau;
  state.index    = 0;
  state.score    = 0;
  state.lives    = 3;
  state.answered = false;

  const pool = shuffle(state.theme.niveaux[niveau]);
  state.questions = pool.slice(0, 20);

  $('quiz-theme-label').textContent = state.theme.icon + ' ' + state.theme.theme;
  const levelMeta = NIVEAUX_LABELS[niveau];
  const lbl = $('quiz-level-label');
  lbl.textContent = levelMeta.label;
  lbl.style.background = levelMeta.color + '33';
  lbl.style.color = levelMeta.color;

  updateHUD();
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  state.answered = false;
  const q     = state.questions[state.index];
  const total = state.questions.length;

  $('quiz-progress-fill').style.width = `${(state.index / total) * 100}%`;
  $('quiz-q-counter').textContent = `Question ${state.index + 1} / ${total}`;
  $('quiz-question-text').textContent = q.q;

  const shuffled = shuffle(q.a.map((text, i) => ({ text, correct: i === 0 })));
  const card = $('quiz-card');
  card.style.animation = 'none'; card.offsetHeight; card.style.animation = '';

  const choicesEl = $('quiz-choices');
  choicesEl.innerHTML = '';
  card.querySelector('.quiz-feedback-row')?.remove();
  card.querySelector('.quiz-next-row')?.remove();

  const letters = ['A', 'B', 'C', 'D'];
  shuffled.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.correct = opt.correct;
    btn.innerHTML = `<span class="choice-letter">${letters[i]}</span><span>${opt.text}</span>`;
    btn.addEventListener('click', () => handleAnswer(btn, opt.correct));
    choicesEl.appendChild(btn);
  });

  updateHUD();
}

function handleAnswer(clickedBtn, isCorrect) {
  if (state.answered) return;
  state.answered = true;

  $('quiz-choices').querySelectorAll('.choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.correct === 'true') btn.classList.add('correct');
    else if (btn === clickedBtn && !isCorrect) btn.classList.add('wrong');
    else btn.classList.add('disabled-neutral');
  });

  if (isCorrect) state.score++;
  else state.lives = Math.max(0, state.lives - 1);
  updateHUD();

  const fb = document.createElement('div');
  fb.className = 'quiz-feedback-row ' + (isCorrect ? 'correct' : 'incorrect');
  fb.textContent = isCorrect
    ? ['✅ Excellent !', '✅ Bravo !', '✅ Parfait !', '✅ Très bien !'][Math.floor(Math.random() * 4)]
    : '❌ Pas tout à fait…';
  $('quiz-card').appendChild(fb);

  const nextRow = document.createElement('div');
  nextRow.className = 'quiz-next-row';
  const isLast = state.index >= state.questions.length - 1;
  const isDead = state.lives <= 0 && !isCorrect;
  const nextBtn = document.createElement('button');
  nextBtn.className = 'q-btn ' + (isLast || isDead ? 'gold' : 'primary');
  nextBtn.textContent = isLast || isDead ? '🏁 Voir les résultats' : 'Suivant →';
  nextBtn.addEventListener('click', () => {
    if (isLast || isDead) showResult();
    else { state.index++; renderQuestion(); }
  });
  nextRow.appendChild(nextBtn);
  $('quiz-card').appendChild(nextRow);
}

function updateHUD() {
  $('hud-score').textContent = `⭐ ${state.score}`;
  $('hud-lives').textContent = '❤️'.repeat(state.lives) + '🖤'.repeat(Math.max(0, 3 - state.lives));
}

function showResult() {
  const total = state.questions.length;
  const pct   = Math.round(state.score / total * 100);
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;

  let emoji, title, msg;
  if (pct === 100)    { emoji='🏆'; title='Parfait !';   msg='Tu as répondu correctement à toutes les questions !'; }
  else if (pct >= 80) { emoji='⭐'; title='Excellent !';  msg='Très belle performance ! Continue comme ça.'; }
  else if (pct >= 60) { emoji='💪'; title='Bien joué !';  msg="Tu es sur la bonne voie. Continue à t'entraîner."; }
  else if (pct >= 40) { emoji='📚'; title='Pas mal !';    msg='Tu as les bases. Révise et réessaie !'; }
  else                { emoji='🌱'; title='Continue !';   msg='Ce niveau est encore difficile. Reprends depuis le début.'; }

  $('result-emoji').textContent = emoji;
  $('result-title').textContent = title;
  $('result-score').textContent = `${state.score} / ${total}`;
  $('result-msg').textContent   = msg;
  $('result-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  document.querySelector('.result-card').style.borderColor = NIVEAUX_LABELS[state.niveau].color + '88';

  showScreen('result');

  if (window.Progress && state.theme) {
    Progress.save({
      type : 'quiz',
      ref  : `${state.theme.theme_id}/${state.niveau}`,
      label: `${state.theme.icon} ${state.theme.theme} — ${state.niveau}`,
      score: state.score,
      total
    });
  }
}

$('result-retry').addEventListener('click',  () => startQuiz(state.niveau));
$('result-change').addEventListener('click', () => { buildNiveauGrid(state.theme); showScreen('niveaux'); });
$('result-themes').addEventListener('click', () => showScreen('themes'));
$('quit-quiz').addEventListener('click',     () => showScreen('themes'));

/* ══════════════════════════════════════════
   ÉDITEUR ADMIN
══════════════════════════════════════════ */
let editorThemeId  = null;
let editorQuestions = [];

function openEditor(themeId) {
  editorThemeId = themeId;

  if (themeId) {
    const theme = state.themes.find(t => t.theme_id === themeId);
    $('ed-theme-id').value    = theme.theme_id;
    $('ed-theme-name').value  = theme.theme;
    $('ed-theme-icon').value  = theme.icon;
    $('ed-theme-color').value = theme.color;
    $('ed-niveau').value      = 'A0';
    loadEditorQuestions(theme);
  } else {
    $('ed-theme-id').value    = '';
    $('ed-theme-name').value  = '';
    $('ed-theme-icon').value  = '❓';
    $('ed-theme-color').value = '#7c3aed';
    $('ed-niveau').value      = 'A0';
    editorQuestions = [];
    renderEditorQuestions();
  }

  showScreen('editor');
}

function loadEditorQuestions(theme) {
  const niveau = $('ed-niveau').value;
  editorQuestions = (theme?.niveaux[niveau] || []).map(q => ({
    q: q.q,
    a: [...q.a]
  }));
  renderEditorQuestions();
}

$('ed-niveau').addEventListener('change', () => {
  if (!editorThemeId) { editorQuestions = []; renderEditorQuestions(); return; }
  const theme = state.themes.find(t => t.theme_id === editorThemeId);
  loadEditorQuestions(theme);
});

function renderEditorQuestions() {
  const container = $('ed-questions-list');
  container.innerHTML = '';

  editorQuestions.forEach((q, qi) => {
    const div = document.createElement('div');
    div.className = 'ed-question-block';
    div.innerHTML = `
      <div class="ed-q-header">
        <span class="ed-q-num">Q${qi + 1}</span>
        <button class="ed-q-del q-btn secondary" data-qi="${qi}">🗑️</button>
      </div>
      <input class="ed-input" type="text" placeholder="Question…" value="${escHtml(q.q)}" data-field="q" />
      <div class="ed-answers">
        <label class="ed-answer-label">✅ Bonne réponse</label>
        <input class="ed-input ed-answer correct-answer" type="text" placeholder="Réponse correcte…" value="${escHtml(q.a[0] || '')}" data-ai="0" />
        <label class="ed-answer-label">❌ Mauvaises réponses</label>
        ${[1,2,3].map(ai => `
          <input class="ed-input ed-answer" type="text" placeholder="Mauvaise réponse ${ai}…" value="${escHtml(q.a[ai] || '')}" data-ai="${ai}" />
        `).join('')}
      </div>
    `;
    div.querySelector('[data-field="q"]').addEventListener('input', e => {
      editorQuestions[qi].q = e.target.value;
    });
    div.querySelectorAll('.ed-answer').forEach(inp => {
      inp.addEventListener('input', e => {
        editorQuestions[qi].a[+e.target.dataset.ai] = e.target.value;
      });
    });
    div.querySelector('.ed-q-del').addEventListener('click', () => {
      editorQuestions.splice(qi, 1);
      renderEditorQuestions();
    });
    container.appendChild(div);
  });
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

$('ed-add-question').addEventListener('click', () => {
  editorQuestions.push({ q: '', a: ['', '', ''] });
  renderEditorQuestions();
  $('ed-questions-list').lastElementChild?.scrollIntoView({ behavior: 'smooth' });
});

$('ed-cancel').addEventListener('click', () => showScreen('themes'));

$('ed-save').addEventListener('click', async () => {
  const themeId   = $('ed-theme-id').value.trim().replace(/\s+/g, '-').toLowerCase();
  const themeName = $('ed-theme-name').value.trim();
  const icon      = $('ed-theme-icon').value.trim() || '❓';
  const color     = $('ed-theme-color').value || '#7c3aed';
  const niveau    = $('ed-niveau').value;

  if (!themeId || !themeName) { alert("Remplis l'ID et le nom du thème."); return; }

  const questions = editorQuestions.filter(q => q.q.trim() && q.a[0].trim());
  if (!questions.length) { alert('Ajoute au moins une question avec une bonne réponse.'); return; }

  const sb = getClient();
  if (!sb) return;

  const btn = $('ed-save');
  btn.textContent = '⏳ Sauvegarde…';
  btn.disabled = true;

  const existing = state.allRows.find(r => r.theme_id === themeId && r.niveau === niveau);
  const colorLight = hexToRgba(color, 0.15);

  const payload = { theme_id: themeId, theme: themeName, icon, color, color_light: colorLight, niveau, questions };

  let error;
  if (existing) {
    ({ error } = await sb.from('quizzes').update(payload).eq('id', existing.id));
  } else {
    ({ error } = await sb.from('quizzes').insert(payload));
  }

  if (error) {
    alert('Erreur : ' + error.message);
    btn.textContent = '💾 Sauvegarder';
    btn.disabled = false;
    return;
  }

  btn.textContent = '✅ Sauvegardé !';
  setTimeout(async () => {
    btn.textContent = '💾 Sauvegarder';
    btn.disabled = false;
    await loadQuizzes();
    showScreen('themes');
  }, 1000);
});

$('ed-delete').addEventListener('click', async () => {
  if (!editorThemeId) return;
  const niveau = $('ed-niveau').value;
  const row = state.allRows.find(r => r.theme_id === editorThemeId && r.niveau === niveau);
  if (!row) { alert("Ce niveau n'existe pas encore."); return; }
  if (!confirm(`Supprimer le quiz "${editorThemeId}" niveau ${niveau} ?`)) return;

  const sb = getClient();
  const { error } = await sb.from('quizzes').delete().eq('id', row.id);
  if (error) { alert('Erreur : ' + error.message); return; }
  await loadQuizzes();
  showScreen('themes');
});

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ══════════════════════════════════════════
   UTILITAIRES
══════════════════════════════════════════ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('auth-ready', () => loadQuizzes());
if (window.Auth?.ready) loadQuizzes();
