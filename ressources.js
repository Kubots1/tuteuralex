/* ============================================================
   ressources.js — Page recommandations
   ============================================================ */
'use strict';

const $r = id => document.getElementById(id);

let allRessources = [];
let filtreType    = 'tous';
let filtreNiveau  = 'tous';

const TYPE_META = {
  youtube : { label: 'YouTube',  icon: '▶️', color: '#ef4444' },
  film    : { label: 'Film',     icon: '🎬', color: '#f59e0b' },
  serie   : { label: 'Série',    icon: '📺', color: '#8b5cf6' },
  chanson : { label: 'Chanson',  icon: '🎵', color: '#ec4899' },
  podcast : { label: 'Podcast',  icon: '🎙️', color: '#10b981' },
  site    : { label: 'Site web', icon: '🌐', color: '#3b82f6' },
};

const NIVEAU_COLORS = {
  A0: '#22c55e', A1: '#16a34a', A2: '#3b82f6',
  B1: '#f59e0b', B2: '#ef4444', tous: '#7c3aed'
};

function getClient() { return window.Auth?.getClient?.() || null; }

/* ══════════════════════════════════════════
   CHARGEMENT
══════════════════════════════════════════ */
async function loadRessources() {
  const sb = getClient();
  if (!sb) { renderGrid(); return; }

  const { data, error } = await sb
    .from('ressources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.warn('Erreur ressources:', error.message); }
  allRessources = data || [];
  renderGrid();
  updateAdminBar();
}

/* ══════════════════════════════════════════
   RENDU
══════════════════════════════════════════ */
function renderGrid() {
  const grid  = $r('res-grid');
  const empty = $r('res-empty');

  const filtered = allRessources.filter(r => {
    const okType   = filtreType   === 'tous' || r.type   === filtreType;
    const okNiveau = filtreNiveau === 'tous' || r.niveau === filtreNiveau || r.niveau === 'tous';
    return okType && okNiveau;
  });

  grid.querySelectorAll('.res-card').forEach(c => c.remove());

  if (!filtered.length) {
    empty.textContent = allRessources.length
      ? '😕 Aucune ressource pour ces filtres.'
      : '📭 Aucune ressource pour l\'instant.';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  const isAdmin = window.Auth?.isAdmin?.();

  filtered.forEach(res => {
    const meta     = TYPE_META[res.type] || { label: res.type, icon: '🔗', color: '#7c3aed' };
    const youtubeId = res.type === 'youtube' ? extractYouTubeId(res.url) : null;
    const niveauColor = NIVEAU_COLORS[res.niveau] || '#7c3aed';
    const niveauLabel = res.niveau === 'tous' ? 'Tous niveaux' : res.niveau;

    const card = document.createElement('div');
    card.className = 'res-card';
    card.style.borderColor = meta.color + '44';

    card.innerHTML = `
      <div class="res-card-top" style="border-bottom: 1px solid ${meta.color}33">
        ${youtubeId
          ? `<div class="res-youtube-wrap">
               <iframe src="https://www.youtube.com/embed/${youtubeId}"
                 frameborder="0" allowfullscreen loading="lazy"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
               </iframe>
             </div>`
          : `<div class="res-card-icon-wrap" style="background:${meta.color}22">
               <span class="res-card-icon">${meta.icon}</span>
             </div>`
        }
      </div>
      <div class="res-card-body">
        <div class="res-card-badges">
          <span class="res-badge" style="background:${meta.color}22;color:${meta.color};border-color:${meta.color}44">
            ${meta.icon} ${meta.label}
          </span>
          <span class="res-badge res-badge-niveau" style="background:${niveauColor}22;color:${niveauColor};border-color:${niveauColor}44">
            ${niveauLabel}
          </span>
        </div>
        <h3 class="res-card-titre">${res.titre}</h3>
        ${res.auteur     ? `<p class="res-card-auteur">par ${res.auteur}</p>` : ''}
        ${res.description ? `<p class="res-card-desc">${res.description}</p>` : ''}
        <div class="res-card-actions">
          <a href="${res.url}" target="_blank" rel="noopener" class="res-link-btn" style="background:${meta.color}">
            ${meta.icon} Ouvrir →
          </a>
          ${isAdmin ? `<button class="res-delete-btn" data-id="${res.id}">🗑️</button>` : ''}
        </div>
      </div>
    `;

    card.querySelector('.res-delete-btn')?.addEventListener('click', () => deleteRessource(res.id));
    grid.appendChild(card);
  });
}

function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/* ══════════════════════════════════════════
   FILTRES
══════════════════════════════════════════ */
$r('filtre-type').addEventListener('click', e => {
  const pill = e.target.closest('.res-pill');
  if (!pill) return;
  $r('filtre-type').querySelectorAll('.res-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  filtreType = pill.dataset.val;
  renderGrid();
});

$r('filtre-niveau').addEventListener('click', e => {
  const pill = e.target.closest('.res-pill');
  if (!pill) return;
  $r('filtre-niveau').querySelectorAll('.res-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  filtreNiveau = pill.dataset.val;
  renderGrid();
});

/* ══════════════════════════════════════════
   ADMIN
══════════════════════════════════════════ */
function updateAdminBar() {
  if (window.Auth?.isAdmin?.()) {
    $r('res-admin-bar').classList.remove('hidden');
  }
}

$r('res-add-btn').addEventListener('click', () => {
  $r('res-form').classList.remove('hidden');
  $r('res-input-titre').focus();
});

$r('res-form-cancel').addEventListener('click', () => {
  $r('res-form').classList.add('hidden');
  clearForm();
});

$r('res-form-save').addEventListener('click', async () => {
  const titre = $r('res-input-titre').value.trim();
  const url   = $r('res-input-url').value.trim();
  if (!titre || !url) { alert('Le titre et l\'URL sont obligatoires.'); return; }

  const sb  = getClient();
  if (!sb) return;

  const btn = $r('res-form-save');
  btn.textContent = '⏳';
  btn.disabled    = true;

  const { error } = await sb.from('ressources').insert({
    type       : $r('res-input-type').value,
    niveau     : $r('res-input-niveau').value,
    titre,
    auteur     : $r('res-input-auteur').value.trim() || null,
    url,
    description: $r('res-input-desc').value.trim() || null,
  });

  if (error) {
    alert('Erreur : ' + error.message);
  } else {
    $r('res-form').classList.add('hidden');
    clearForm();
    await loadRessources();
  }

  btn.textContent = '✅ Ajouter';
  btn.disabled    = false;
});

async function deleteRessource(id) {
  if (!confirm('Supprimer cette ressource ?')) return;
  const sb = getClient();
  if (!sb) return;
  const { error } = await sb.from('ressources').delete().eq('id', id);
  if (error) { alert('Erreur : ' + error.message); return; }
  await loadRessources();
}

function clearForm() {
  $r('res-input-titre').value  = '';
  $r('res-input-auteur').value = '';
  $r('res-input-url').value    = '';
  $r('res-input-desc').value   = '';
  $r('res-input-type').value   = 'youtube';
  $r('res-input-niveau').value = 'tous';
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('auth-ready', () => loadRessources());
if (window.Auth?.ready) loadRessources();
