/* ============================================================
   vocabulaire.js — Flashcards de vocabulaire
   Filtre par niveau, mode révision avec score, admin CRUD
   ============================================================ */
'use strict';

const $v = id => document.getElementById(id);

const NIVEAUX_ORDER  = ['A0','A1','A2','B1','B2'];
const NIVEAUX_COLORS = { A0:'#22c55e', A1:'#16a34a', A2:'#3b82f6', B1:'#f59e0b', B2:'#ef4444' };

let allWords     = [];
let filtreNiveau = 'tous';

let reviewQueue = [];
let reviewIndex = 0;
let reviewGood  = 0;
let reviewBad   = 0;
let cardFlipped = false;

function getClient() { return window.Auth?.getClient?.() || null; }

/* ══════════════════════════════════════════
   CHARGEMENT
══════════════════════════════════════════ */
async function loadVocab() {
  const sb = getClient();
  if (!sb) { renderStats(); return; }

  const { data, error } = await sb
    .from('vocabulaire')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.warn('Erreur vocabulaire:', error.message);
  allWords = data || [];
  renderStats();
  updateAdminBar();
  if (!$v('vocab-admin-list').classList.contains('hidden')) renderAdminList();
}

/* ══════════════════════════════════════════
   FILTRE NIVEAU
══════════════════════════════════════════ */
$v('filtre-niveau').addEventListener('click', e => {
  const pill = e.target.closest('.vocab-pill');
  if (!pill) return;
  $v('filtre-niveau').querySelectorAll('.vocab-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  filtreNiveau = pill.dataset.val;
  renderStats();
});

function getFilteredWords() {
  return filtreNiveau === 'tous'
    ? allWords
    : allWords.filter(w => w.niveau === filtreNiveau);
}

function renderStats() {
  const words = getFilteredWords();
  const stats = $v('vocab-stats');
  if (!words.length) {
    stats.innerHTML = `<p class="vocab-empty">📭 Aucun mot disponible${filtreNiveau!=='tous' ? ' pour ce niveau' : ''}.</p>`;
    $v('vocab-start-btn').disabled = true;
  } else {
    stats.innerHTML = `<div class="vocab-stat-card"><span class="vocab-stat-num">${words.length}</span><span class="vocab-stat-lbl">mot${words.length>1?'s':''} disponible${words.length>1?'s':''}</span></div>`;
    $v('vocab-start-btn').disabled = false;
  }
}

/* ══════════════════════════════════════════
   ADMIN
══════════════════════════════════════════ */
function updateAdminBar() {
  if (window.Auth?.isAdmin?.()) $v('vocab-admin-bar')?.classList.remove('hidden');
}

$v('vocab-add-btn').addEventListener('click', () => {
  $v('vocab-form').classList.remove('hidden');
  $v('vf-mot').focus();
});
$v('vf-cancel').addEventListener('click', () => {
  $v('vocab-form').classList.add('hidden');
  clearForm();
});
$v('vf-save').addEventListener('click', async () => {
  const mot   = $v('vf-mot').value.trim();
  const trad  = $v('vf-trad').value.trim();
  const niveau= $v('vf-niveau').value;
  if (!mot || !trad) { alert('Le mot et la traduction sont obligatoires.'); return; }

  const sb = getClient(); if (!sb) return;
  const btn = $v('vf-save');
  btn.textContent = '⏳'; btn.disabled = true;

  const { error } = await sb.from('vocabulaire').insert({ mot, traduction: trad, niveau });
  if (error) alert('Erreur : ' + error.message);
  else { $v('vocab-form').classList.add('hidden'); clearForm(); await loadVocab(); }

  btn.textContent = '✅ Ajouter'; btn.disabled = false;
});
function clearForm() {
  $v('vf-mot').value = ''; $v('vf-trad').value = ''; $v('vf-niveau').value = 'A1';
}

$v('vocab-import-btn').addEventListener('click', () => $v('vocab-import-input').click());
$v('vocab-import-input').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  e.target.value = '';
  let json;
  try { json = JSON.parse(await file.text()); }
  catch { alert('❌ Fichier JSON invalide.'); return; }

  // Accepte soit un tableau direct [{mot,traduction,niveau}], soit {mots:[...]}
  const list = Array.isArray(json) ? json : (json.mots || []);
  if (!list.length) { alert('❌ Format incorrect. Attendu : tableau de {mot, traduction, niveau}'); return; }

  const valid = list.filter(w => w.mot?.trim() && w.traduction?.trim() && NIVEAUX_ORDER.includes(w.niveau));
  if (!valid.length) { alert('❌ Aucun mot valide trouvé dans le fichier.'); return; }

  const sb = getClient(); if (!sb) return;
  const btn = $v('vocab-import-btn');
  const orig = btn.textContent;
  btn.textContent = '⏳ Import…'; btn.disabled = true;

  const { error } = await sb.from('vocabulaire').insert(
    valid.map(w => ({ mot: w.mot.trim(), traduction: w.traduction.trim(), niveau: w.niveau }))
  );

  if (error) alert('❌ Erreur : ' + error.message);
  else { alert(`✅ ${valid.length} mot(s) importé(s) avec succès !`); await loadVocab(); }

  btn.textContent = orig; btn.disabled = false;
});

/* ── Liste admin (afficher/masquer) ── */
function renderAdminList() {
  const isAdmin = window.Auth?.isAdmin?.();
  if (!isAdmin) return;
  const container = $v('vocab-admin-list');
  if (!allWords.length) { container.innerHTML = ''; return; }

  container.innerHTML = `
    <div class="vocab-admin-list-header">
      <h3>📋 Gérer les mots (${allWords.length})</h3>
      <button id="vocab-toggle-list" class="vocab-toggle-btn">Masquer</button>
    </div>
    <div class="vocab-admin-list-body">
      ${allWords.map(w => `
        <div class="vocab-admin-item">
          <span class="vocab-admin-niveau" style="background:${NIVEAUX_COLORS[w.niveau]}22;color:${NIVEAUX_COLORS[w.niveau]}">${w.niveau}</span>
          <span class="vocab-admin-mot">${w.mot}</span>
          <span class="vocab-admin-trad">${w.traduction}</span>
          <button class="vocab-admin-del" data-id="${w.id}">🗑️</button>
        </div>`).join('')}
    </div>`;

  container.classList.remove('hidden');
  $v('vocab-toggle-list').addEventListener('click', () => {
    container.classList.add('hidden');
  });
  container.querySelectorAll('.vocab-admin-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Supprimer ce mot ?')) return;
      const sb = getClient();
      await sb.from('vocabulaire').delete().eq('id', btn.dataset.id);
      await loadVocab();
    });
  });
}

// Bouton pour afficher la liste admin (ajouté dynamiquement après stats si admin)
document.addEventListener('auth-ready', () => {
  if (window.Auth?.isAdmin?.()) {
    const link = document.createElement('button');
    link.id = 'vocab-show-list-link';
    link.className = 'vocab-show-list-link';
    link.textContent = '📋 Voir / gérer tous les mots';
    link.addEventListener('click', () => { renderAdminList(); link.classList.add('hidden'); });
    $v('vocab-stats')?.insertAdjacentElement('afterend', link);
  }
});

/* ══════════════════════════════════════════
   DÉMARRER LA RÉVISION
══════════════════════════════════════════ */
$v('vocab-start-btn').addEventListener('click', startReview);

function startReview() {
  const words = getFilteredWords();
  if (!words.length) return;
  reviewQueue = shuffle(words);
  reviewIndex = 0; reviewGood = 0; reviewBad = 0;
  showScreen('screen-review');
  renderReviewCard();
}

function showScreen(name) {
  ['screen-select','screen-review','screen-result'].forEach(s => $v(s).classList.add('hidden'));
  $v(name).classList.remove('hidden');
}

/* ══════════════════════════════════════════
   CARTE DE RÉVISION
══════════════════════════════════════════ */
function renderReviewCard() {
  if (reviewIndex >= reviewQueue.length) { showResult(); return; }

  const word  = reviewQueue[reviewIndex];
  const color = NIVEAUX_COLORS[word.niveau] || '#7c3aed';

  cardFlipped = false;
  $v('review-inner').classList.remove('flipped');
  $v('review-actions').classList.add('hidden');
  $v('review-flip-hint').classList.remove('hidden');

  $v('review-niveau-badge').textContent = word.niveau;
  $v('review-niveau-badge').style.cssText = `background:${color}33;color:${color};border:1px solid ${color}55;`;
  $v('review-mot').textContent  = word.mot;
  $v('review-trad').textContent = word.traduction;

  $v('review-counter').textContent = `${reviewIndex + 1} / ${reviewQueue.length}`;
  $v('review-progress-bar').style.width = `${(reviewIndex / reviewQueue.length) * 100}%`;
  $v('review-score-good').textContent = `✅ ${reviewGood}`;
  $v('review-score-bad').textContent  = `❌ ${reviewBad}`;
}

$v('review-card').addEventListener('click', () => {
  if (cardFlipped) return;
  cardFlipped = true;
  $v('review-inner').classList.add('flipped');
  $v('review-actions').classList.remove('hidden');
  $v('review-flip-hint').classList.add('hidden');
});

$v('review-good').addEventListener('click', () => { reviewGood++; nextCard(); });
$v('review-bad').addEventListener('click',  () => { reviewBad++;  nextCard(); });

function nextCard() {
  reviewIndex++;
  renderReviewCard();
}

$v('review-quit').addEventListener('click', () => showScreen('screen-select'));

/* ══════════════════════════════════════════
   RÉSULTAT
══════════════════════════════════════════ */
function showResult() {
  const total = reviewQueue.length;
  const pct   = Math.round(reviewGood / total * 100);

  let emoji, title, msg;
  if (pct === 100)    { emoji='🏆'; title='Parfait !';   msg='Tu connais tous ces mots !'; }
  else if (pct >= 80) { emoji='⭐'; title='Excellent !';  msg='Très belle révision !'; }
  else if (pct >= 50) { emoji='💪'; title='Bien joué !';  msg='Continue à réviser pour progresser.'; }
  else                { emoji='📚'; title='Continue !';   msg='Ce vocabulaire demande encore un peu de pratique.'; }

  $v('result-emoji').textContent = emoji;
  $v('result-title').textContent = title;
  $v('result-score').textContent = `${reviewGood} / ${total}`;
  $v('result-msg').textContent   = msg;

  showScreen('screen-result');

  if (window.Progress && window.Auth?.isLoggedIn?.()) {
    window.Progress.save({
      type : 'vocab_review',
      ref  : filtreNiveau,
      label: `🃏 Vocabulaire (${filtreNiveau === 'tous' ? 'mélangé' : filtreNiveau})`,
      score: reviewGood,
      total
    });
  }
}

$v('result-retry').addEventListener('click', startReview);
$v('result-home').addEventListener('click',  () => showScreen('screen-select'));

/* ══════════════════════════════════════════
   UTILITAIRES
══════════════════════════════════════════ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('auth-ready', () => loadVocab());
if (window.Auth?.ready) loadVocab();
