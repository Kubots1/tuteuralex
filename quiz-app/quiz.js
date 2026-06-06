/* ============================================================
   quiz.js — Logique principale du quiz
   ============================================================ */
'use strict';

const $ = id => document.getElementById(id);

/* ── État ── */
const state = {
  theme   : null,   // objet thème courant
  niveau  : null,   // 'A0', 'A1'…
  questions: [],    // questions mélangées
  index   : 0,
  score   : 0,
  lives   : 3,
  answered: false,
};

/* ── Écrans ── */
const screens = {
  themes  : $('screen-themes'),
  niveaux : $('screen-niveaux'),
  quiz    : $('screen-quiz'),
  result  : $('screen-result'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
}

/* ══════════════════════════════════════════
   INIT — Construire la grille des thèmes
══════════════════════════════════════════ */
(function buildThemeGrid() {
  const grid = $('theme-grid');
  QUIZ_DATA.forEach(theme => {
    const card = document.createElement('div');
    card.className = 'theme-card';
    card.style.background = `linear-gradient(145deg, ${theme.colorLight}, rgba(255,255,255,0.03))`;
    card.style.borderColor = theme.color + '55';
    card.innerHTML = `
      <div class="theme-card-icon">${theme.icon}</div>
      <div class="theme-card-title">${theme.theme}</div>
      <div class="theme-card-levels">
        ${NIVEAUX_ORDER.map(n => `<span class="level-pill">${NIVEAUX_LABELS[n].label}</span>`).join('')}
      </div>
      <div class="theme-card-cta">20 questions par niveau →</div>
    `;
    card.addEventListener('click', () => selectTheme(theme));
    grid.appendChild(card);
  });
})();

/* ══════════════════════════════════════════
   SÉLECTION THÈME
══════════════════════════════════════════ */
function selectTheme(theme) {
  state.theme = theme;
  $('niveau-theme-title').textContent = theme.icon + ' ' + theme.theme;
  buildNiveauGrid(theme);
  showScreen('niveaux');
}

$('back-to-themes').addEventListener('click', () => showScreen('themes'));

const NIVEAU_DESCS = {
  A0: 'Questions très simples, vocabulaire du quotidien',
  A1: 'Phrases courtes, situations familières',
  A2: 'Phrases plus complexes, description et narration',
  B1: 'Argumentation simple, sujets courants',
  B2: 'Analyse, débat et nuance sur des sujets variés',
};

function buildNiveauGrid(theme) {
  const grid = $('niveau-grid');
  grid.innerHTML = '';
  NIVEAUX_ORDER.forEach(n => {
    const questions = theme.niveaux[n];
    if (!questions || !questions.length) return;
    const meta = NIVEAUX_LABELS[n];
    const card = document.createElement('div');
    card.className = 'niveau-card';
    card.innerHTML = `
      <div class="niveau-dot" style="background:${meta.color};color:${meta.color}"></div>
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
   DÉMARRER LE QUIZ
══════════════════════════════════════════ */
function startQuiz(niveau) {
  state.niveau    = niveau;
  state.index     = 0;
  state.score     = 0;
  state.lives     = 3;
  state.answered  = false;

  // Mélanger les questions et prendre 20
  const pool = shuffle(state.theme.niveaux[niveau]);
  state.questions = pool.slice(0, 20);

  // Mettre à jour le meta
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

/* ══════════════════════════════════════════
   AFFICHER UNE QUESTION
══════════════════════════════════════════ */
function renderQuestion() {
  state.answered = false;
  const q     = state.questions[state.index];
  const total = state.questions.length;

  // Progression
  $('quiz-progress-fill').style.width = `${(state.index / total) * 100}%`;
  $('quiz-q-counter').textContent = `Question ${state.index + 1} / ${total}`;

  // Question
  $('quiz-question-text').textContent = q.q;

  // Mélanger les réponses (la bonne est toujours index 0 dans les données)
  const shuffled = shuffle(q.a.map((text, i) => ({ text, correct: i === 0 })));

  // Reinjecter la carte avec animation
  const card = $('quiz-card');
  card.style.animation = 'none';
  card.offsetHeight; // reflow
  card.style.animation = '';

  // Choices
  const choicesEl = $('quiz-choices');
  choicesEl.innerHTML = '';

  // Supprimer feedback précédent
  const oldFb = card.querySelector('.quiz-feedback-row');
  if (oldFb) oldFb.remove();
  const oldNext = card.querySelector('.quiz-next-row');
  if (oldNext) oldNext.remove();

  const letters = ['A', 'B', 'C', 'D'];
  shuffled.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.correct = opt.correct;
    btn.innerHTML = `<span class="choice-letter">${letters[i]}</span><span>${opt.text}</span>`;
    btn.addEventListener('click', () => handleAnswer(btn, opt.correct, shuffled));
    choicesEl.appendChild(btn);
  });

  updateHUD();
}

/* ══════════════════════════════════════════
   TRAITER LA RÉPONSE
══════════════════════════════════════════ */
function handleAnswer(clickedBtn, isCorrect, shuffled) {
  if (state.answered) return;
  state.answered = true;

  // Colorer tous les boutons
  const allBtns = $('quiz-choices').querySelectorAll('.choice-btn');
  allBtns.forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.correct === 'true') {
      btn.classList.add('correct');
    } else if (btn === clickedBtn && !isCorrect) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('disabled-neutral');
    }
  });

  // Score / vies
  if (isCorrect) {
    state.score++;
  } else {
    state.lives = Math.max(0, state.lives - 1);
  }
  updateHUD();

  // Feedback texte
  const fb = document.createElement('div');
  fb.className = 'quiz-feedback-row ' + (isCorrect ? 'correct' : 'incorrect');
  fb.textContent = isCorrect
    ? ['✅ Excellent !', '✅ Bravo !', '✅ Parfait !', '✅ Très bien !'][Math.floor(Math.random() * 4)]
    : '❌ Pas tout à fait…';
  $('quiz-card').appendChild(fb);

  // Bouton suivant / fin
  const nextRow = document.createElement('div');
  nextRow.className = 'quiz-next-row';
  const isLast = state.index >= state.questions.length - 1;
  const isDead = state.lives <= 0 && !isCorrect;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'q-btn ' + (isLast || isDead ? 'gold' : 'primary');
  nextBtn.textContent = isLast || isDead ? '🏁 Voir les résultats' : 'Suivant →';
  nextBtn.addEventListener('click', () => {
    if (isLast || isDead) {
      showResult();
    } else {
      state.index++;
      renderQuestion();
    }
  });
  nextRow.appendChild(nextBtn);
  $('quiz-card').appendChild(nextRow);

  // Auto-avance si correcte après 1.5s (optionnel, commenté pour laisser le choix)
  // if (isCorrect) setTimeout(() => nextBtn.click(), 1500);
}

/* ══════════════════════════════════════════
   HUD
══════════════════════════════════════════ */
function updateHUD() {
  $('hud-score').textContent = `⭐ ${state.score}`;
  $('hud-lives').textContent = '❤️'.repeat(state.lives) + '🖤'.repeat(Math.max(0, 3 - state.lives));
}

/* ══════════════════════════════════════════
   RÉSULTAT FINAL
══════════════════════════════════════════ */
function showResult() {
  const total = state.questions.length;
  const pct   = Math.round(state.score / total * 100);

  let emoji, title, msg;
  if (pct === 100) {
    emoji = '🏆'; title = 'Parfait !';
    msg = 'Tu as répondu correctement à toutes les questions. Tu maîtrises ce niveau !';
  } else if (pct >= 80) {
    emoji = '⭐'; title = 'Excellent !';
    msg = 'Très belle performance ! Encore un peu de pratique et tu seras parfait.';
  } else if (pct >= 60) {
    emoji = '💪'; title = 'Bien joué !';
    msg = 'Tu es sur la bonne voie. Continue à t\'entraîner pour progresser.';
  } else if (pct >= 40) {
    emoji = '📚'; title = 'Pas mal !';
    msg = 'Tu as les bases. Révise et réessaie pour améliorer ton score.';
  } else {
    emoji = '🌱'; title = 'Continue !';
    msg = 'Ce niveau est encore difficile. Reprends depuis le début pour consolider tes acquis.';
  }

  // Étoiles
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;

  $('result-emoji').textContent   = emoji;
  $('result-title').textContent   = title;
  $('result-score').textContent   = `${state.score} / ${total}`;
  $('result-msg').textContent     = msg;
  $('result-stars').textContent   = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

  // Style résultat selon niveau
  const meta = NIVEAUX_LABELS[state.niveau];
  document.querySelector('.result-card').style.borderColor = meta.color + '88';

  showScreen('result');

  if (window.Progress && state.theme) {
    Progress.save({
      type: 'quiz',
      ref: `${state.theme.theme}/${state.niveau}`,
      label: `${state.theme.icon} ${state.theme.theme} — ${state.niveau}`,
      score: state.score,
      total
    });
  }
}

/* ── Boutons résultat ── */
$('result-retry').addEventListener('click', () => startQuiz(state.niveau));
$('result-change').addEventListener('click', () => {
  buildNiveauGrid(state.theme);
  showScreen('niveaux');
});
$('result-themes').addEventListener('click', () => showScreen('themes'));
$('quit-quiz').addEventListener('click', () => showScreen('themes'));

