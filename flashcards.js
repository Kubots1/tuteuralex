/* ============================================================
   flashcards.js — Flashcards sur l'accueil
   Chargement Supabase, admin peut ajouter/supprimer en direct
   ============================================================ */
'use strict';

const $fc = id => document.getElementById(id);

let fcCards   = [];
let fcCurrent = 0;

function getClient() { return window.Auth?.getClient?.() || null; }

/* ══════════════════════════════════════════
   CHARGEMENT
══════════════════════════════════════════ */
async function loadFlashcards() {
  const sb = getClient();
  if (!sb) return;

  const { data, error } = await sb
    .from('flashcards')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) { console.warn('Erreur flashcards:', error.message); return; }

  fcCards = data || [];
  renderCards();
  updateAdminBar();
}

/* ══════════════════════════════════════════
   RENDU DES CARTES
══════════════════════════════════════════ */
function renderCards() {
  const grid    = $fc('fc-grid');
  const empty   = $fc('fc-empty');
  const nav     = $fc('fc-nav');

  // Supprime les cartes existantes (pas le message vide)
  grid.querySelectorAll('.fc-card-wrap').forEach(c => c.remove());

  if (!fcCards.length) {
    empty.classList.remove('hidden');
    nav.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  nav.classList.remove('hidden');

  fcCards.forEach((card, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'fc-card-wrap' + (i === fcCurrent ? ' active' : '');
    wrap.dataset.index = i;

    const isAdmin = window.Auth?.isAdmin?.();
    wrap.innerHTML = `
      <div class="fc-card" onclick="flipCard(${i})">
        <div class="fc-inner" id="fc-inner-${i}">
          <div class="fc-front">
            <div class="fc-front-label">🇫🇷 Mot</div>
            <div class="fc-mot">${card.mot}</div>
            <div class="fc-hint">Clique pour voir la traduction</div>
          </div>
          <div class="fc-back">
            <div class="fc-back-label">📖 Traduction & Définition</div>
            <div class="fc-trad">${card.traduction}</div>
            ${card.definition ? `<div class="fc-def">${card.definition}</div>` : ''}
            ${card.exemple    ? `<div class="fc-ex">« ${card.exemple} »</div>` : ''}
          </div>
        </div>
      </div>
      ${isAdmin ? `<button class="fc-delete-btn" onclick="deleteCard('${card.id}')">🗑️</button>` : ''}
    `;
    grid.appendChild(wrap);
  });

  updateCounter();
  showCard(fcCurrent);
}

function showCard(index) {
  fcCurrent = Math.max(0, Math.min(index, fcCards.length - 1));
  document.querySelectorAll('.fc-card-wrap').forEach((w, i) => {
    w.classList.toggle('active', i === fcCurrent);
  });
  updateCounter();
}

function updateCounter() {
  $fc('fc-counter').textContent = fcCards.length
    ? `${fcCurrent + 1} / ${fcCards.length}`
    : '';
}

/* ══════════════════════════════════════════
   FLIP
══════════════════════════════════════════ */
function flipCard(index) {
  const inner = $fc(`fc-inner-${index}`);
  if (inner) inner.classList.toggle('flipped');
}
window.flipCard = flipCard;

/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
$fc('fc-prev').addEventListener('click', () => {
  const inner = $fc(`fc-inner-${fcCurrent}`);
  if (inner) inner.classList.remove('flipped');
  showCard(fcCurrent - 1);
});
$fc('fc-next').addEventListener('click', () => {
  const inner = $fc(`fc-inner-${fcCurrent}`);
  if (inner) inner.classList.remove('flipped');
  showCard(fcCurrent + 1);
});

// Navigation clavier
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowLeft')  $fc('fc-prev').click();
  if (e.key === 'ArrowRight') $fc('fc-next').click();
  if (e.key === ' ')          flipCard(fcCurrent);
});

/* ══════════════════════════════════════════
   ADMIN
══════════════════════════════════════════ */
function updateAdminBar() {
  if (window.Auth?.isAdmin?.()) {
    $fc('fc-admin-bar').classList.remove('hidden');
  }
}

$fc('fc-add-btn').addEventListener('click', () => {
  $fc('fc-form').classList.remove('hidden');
  $fc('fc-input-mot').focus();
});

$fc('fc-form-cancel').addEventListener('click', () => {
  $fc('fc-form').classList.add('hidden');
  clearForm();
});

$fc('fc-form-save').addEventListener('click', async () => {
  const mot  = $fc('fc-input-mot').value.trim();
  const trad = $fc('fc-input-trad').value.trim();
  if (!mot || !trad) { alert('Le mot et la traduction sont obligatoires.'); return; }

  const sb  = getClient();
  if (!sb) return;

  const btn = $fc('fc-form-save');
  btn.textContent = '⏳';
  btn.disabled    = true;

  const { error } = await sb.from('flashcards').insert({
    mot,
    traduction : trad,
    definition : $fc('fc-input-def').value.trim() || null,
    exemple    : $fc('fc-input-ex').value.trim()  || null,
  });

  if (error) {
    alert('Erreur : ' + error.message);
  } else {
    $fc('fc-form').classList.add('hidden');
    clearForm();
    await loadFlashcards();
    showCard(fcCards.length - 1);
  }

  btn.textContent = '✅ Ajouter';
  btn.disabled    = false;
});

async function deleteCard(id) {
  if (!confirm('Supprimer cette flashcard ?')) return;
  const sb = getClient();
  if (!sb) return;
  await sb.from('flashcards').delete().eq('id', id);
  await loadFlashcards();
}
window.deleteCard = deleteCard;

async function clearAllCards() {
  if (!confirm('Supprimer TOUTES les flashcards ?')) return;
  const sb = getClient();
  if (!sb) return;
  // Supprime toutes les cartes créées par l'admin
  await sb.from('flashcards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await loadFlashcards();
}

$fc('fc-clear-btn').addEventListener('click', clearAllCards);

function clearForm() {
  $fc('fc-input-mot').value = '';
  $fc('fc-input-trad').value = '';
  $fc('fc-input-def').value = '';
  $fc('fc-input-ex').value = '';
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('auth-ready', () => loadFlashcards());
if (window.Auth?.ready) loadFlashcards();
