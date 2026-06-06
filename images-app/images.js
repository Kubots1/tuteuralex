/* ============================================================
   images.js — Galerie + Éditeur + Explorer + Glisser + Quiz
   ============================================================ */
'use strict';

const state = {
  images: [], current: null,
  tool: 'rect', drawing: false, drawStart: null, tempRect: null,
  pendingZone: null, editingZoneId: null,
  quiz: { order: [], index: 0, score: 0, answered: [] },
};

const dragState = {
  placed: {}, score: 0, dragging: null,
};

const $ = id => document.getElementById(id);
const gallerySection = $('gallery-section');
const editorSection  = $('editor-section');
const quizSection    = $('quiz-section');
const galleryGrid    = $('gallery-grid');
const uploadInput    = $('upload-input');
const editorImg      = $('editor-img');
const quizImg        = $('quiz-img');
const svg            = $('annotation-svg');
const quizSvg        = $('quiz-svg');
const zoneList       = $('zone-list');
const tooltip        = $('hover-tooltip');
const modal          = $('annotation-modal');
const explorePanel   = $('explore-panel');
const quizPanel      = $('quiz-panel');
const dragPanel      = $('drag-panel');

/* ── Init ── */
(async function init() {
  await loadPermanentImages();
  renderGallery();
  bindEvents();
  applyStudentMode();
})();

function applyStudentMode() {
  const hide = () => {
    if (!window.Auth?.ready) {
      document.addEventListener('auth-ready', hide, { once: true });
      return;
    }
    if (window.Auth.isConfigured() && !window.Auth.isAdmin()) {
      document.querySelector('.gallery-add-card')?.remove();
      document.getElementById('editor-section')?.remove();
      document.getElementById('annotation-modal')?.remove();
    }
  };
  hide();
}

/* ══════════════════════════════════════════
   CHARGEMENT MANIFEST
══════════════════════════════════════════ */
async function loadPermanentImages() {
  try {
    const r = await fetch('images-manifest.json');
    if (!r.ok) return;
    const manifest = await r.json();
    for (const e of manifest) {
      let zones = [];
      if (e.jsonFile) {
        try { const jr = await fetch(e.jsonFile); if (jr.ok) { const jd = await jr.json(); zones = jd.zones || []; } } catch {}
      }
      state.images.push({ id: 'perm-' + e.name, name: e.name, src: e.src, zones, permanent: true });
    }
  } catch {}
}

/* ══════════════════════════════════════════
   GALERIE
══════════════════════════════════════════ */
function renderGallery() {
  document.querySelectorAll('.gallery-card').forEach(c => c.remove());
  const addCard = document.querySelector('.gallery-add-card');
  state.images.forEach(img => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    const modeBadge = img.permanent
      ? '<div class="gallery-card-mode quiz-mode-badge">🎯 Quiz</div>'
      : '<div class="gallery-card-mode edit-mode-badge">✏️ Éditeur</div>';
    card.innerHTML = `
      <img src="${img.src}" alt="${img.name}" loading="lazy" />
      <div class="gallery-card-label">${img.name}</div>
      ${img.zones.length ? `<div class="gallery-card-zones">${img.zones.length} zone${img.zones.length > 1 ? 's' : ''}</div>` : ''}
      ${modeBadge}
    `;
    card.addEventListener('click', () => img.permanent ? openQuizSection(img.id) : openEditor(img.id));
    galleryGrid.insertBefore(card, addCard);
  });
}

uploadInput.addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = { id: 'img-' + Date.now(), name: file.name.replace(/\.[^.]+$/, ''), src: ev.target.result, zones: [] };
    state.images.unshift(img); renderGallery(); openEditor(img.id);
  };
  reader.readAsDataURL(file); e.target.value = '';
});

/* ══════════════════════════════════════════
   ONGLETS Explorer / Glisser / Quiz
══════════════════════════════════════════ */
function switchTab(tab) {
  // Cacher tous les panneaux
  explorePanel.classList.add('hidden');
  dragPanel.classList.add('hidden');
  quizPanel.classList.add('hidden');
  $('quiz-score').classList.add('hidden');
  $('quiz-restart-btn').classList.add('hidden');

  // Activer le bon onglet
  $('tab-explore').classList.toggle('active', tab === 'explore');
  $('tab-drag').classList.toggle('active',    tab === 'drag');
  $('tab-quiz').classList.toggle('active',    tab === 'quiz');

  if (tab === 'explore') {
    explorePanel.classList.remove('hidden');
    renderExploreSvg();
    renderExploreZoneList();

  } else if (tab === 'drag') {
    dragPanel.classList.remove('hidden');
    initDragMode();
    setTimeout(renderDragOverlay, 80);

  } else {
    quizPanel.classList.remove('hidden');
    $('quiz-score').classList.remove('hidden');
    $('quiz-restart-btn').classList.remove('hidden');
    if (state.quiz.index === 0 && state.quiz.answered.length === 0) renderQuizStep();
    else renderQuizSvg(state.quiz.order[state.quiz.index]);
  }
}

/* ══════════════════════════════════════════
   OUVERTURE SECTION QUIZ/EXPLORE/DRAG
══════════════════════════════════════════ */
function openQuizSection(id) {
  state.current = state.images.find(i => i.id === id);
  if (!state.current || !state.current.zones.length) return;
  state.quiz = { order: state.current.zones.map((_, i) => i), index: 0, score: 0, answered: [] };
  $('quiz-image-name').textContent = state.current.name;
  quizImg.src = state.current.src;
  gallerySection.classList.add('hidden');
  quizSection.classList.remove('hidden');
  $('quiz-result').classList.add('hidden');
  $('quiz-question-block').classList.remove('hidden');
  quizImg.onload = () => switchTab('explore');
  if (quizImg.complete) switchTab('explore');
}

function closeQuizSection() {
  quizSection.classList.add('hidden');
  gallerySection.classList.remove('hidden');
  tooltip.classList.add('hidden');
  const ol = document.getElementById('drag-overlay');
  if (ol) ol.remove();
}

/* ══════════════════════════════════════════
   MODE EXPLORER
══════════════════════════════════════════ */
function renderExploreSvg() {
  quizSvg.innerHTML = '';
  const ol = document.getElementById('drag-overlay');
  if (ol) ol.remove();
  if (!state.current) return;

  const imgRect  = quizImg.getBoundingClientRect();
  const svgRect  = quizSvg.getBoundingClientRect();
  const iw = quizImg.naturalWidth  || imgRect.width;
  const ih = quizImg.naturalHeight || imgRect.height;
  const sx = imgRect.width / iw, sy = imgRect.height / ih;
  const ox = imgRect.left - svgRect.left, oy = imgRect.top - svgRect.top;
  const px = p => ox + p / 100 * iw * sx;
  const py = p => oy + p / 100 * ih * sy;
  const pw = p => p / 100 * iw * sx;
  const ph = p => p / 100 * ih * sy;

  state.current.zones.forEach((z, i) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.cursor = 'pointer';

    const mkEl = (tag, attrs) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    };
    const mkTxt = (x, y, txt, size) => {
      const t = mkEl('text', { x, y, 'text-anchor': 'middle', fill: 'white', 'font-size': size, 'font-weight': 'bold', 'font-family': 'Nunito,sans-serif', 'pointer-events': 'none' });
      t.textContent = txt; return t;
    };

    if (z.type === 'rect') {
      const rx = px(z.x), ry = py(z.y), rw = pw(z.w), rh = ph(z.h);
      const rect = mkEl('rect', { x: rx, y: ry, width: rw, height: rh, rx: 4, fill: 'rgba(168,85,247,0.08)', stroke: 'rgba(168,85,247,0.5)', 'stroke-width': 1.5 });
      rect.classList.add('explore-zone-rect'); g.appendChild(rect);
      const nb = mkEl('rect', { x: rx, y: ry, width: 22, height: 20, rx: 3, fill: 'rgba(124,58,237,0.7)' }); g.appendChild(nb);
      g.appendChild(mkTxt(rx + 11, ry + 14, i + 1, 11));
    } else {
      const cx = px(z.x), cy = py(z.y);
      const ring = mkEl('circle', { cx, cy, r: 16, fill: 'rgba(168,85,247,0.12)', stroke: 'rgba(168,85,247,0.5)', 'stroke-width': 1.5 });
      ring.classList.add('explore-zone-rect'); g.appendChild(ring);
      g.appendChild(mkTxt(cx, cy + 5, i + 1, 11));
    }

    // Hover
    g.addEventListener('mouseenter', () => {
      g.querySelectorAll('.explore-zone-rect').forEach(el => {
        el.setAttribute('fill', 'rgba(168,85,247,0.28)');
        el.setAttribute('stroke', '#a855f7');
        el.setAttribute('stroke-width', 2.5);
      });
      showExploreInfo(z, i);
    });
    g.addEventListener('mouseleave', () => {
      g.querySelectorAll('.explore-zone-rect').forEach(el => {
        el.setAttribute('fill', z.type === 'rect' ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.12)');
        el.setAttribute('stroke', 'rgba(168,85,247,0.5)');
        el.setAttribute('stroke-width', 1.5);
      });
      hideExploreInfo();
    });

    quizSvg.appendChild(g);
  });
}

function showExploreInfo(z, i) {
  const info = $('explore-info');
  const gc = z.genre === 'masculin' ? 'badge-masc' : z.genre === 'féminin' ? 'badge-fem' : 'badge-neutre';
  const nc = z.nombre === 'invariable' ? 'badge-invariable' : 'badge-variable';
  info.querySelector('.explore-word').textContent = `${i + 1}. ${z.word}`;
  info.querySelector('.explore-badges').innerHTML =
    `<span class="tooltip-badge ${gc}">${z.genre}</span>
     <span class="tooltip-badge ${nc}">${z.nombre}</span>
     <span class="tooltip-badge badge-${z.cat}">${z.cat}</span>`;
  info.querySelector('.explore-desc').textContent    = z.desc    || '';
  info.querySelector('.explore-example').textContent = z.example ? `« ${z.example} »` : '';
  info.classList.remove('hidden');
  document.querySelectorAll('.explore-zone-item').forEach((li, idx) => li.classList.toggle('active', idx === i));
}

function hideExploreInfo() {
  document.querySelectorAll('.explore-zone-item').forEach(li => li.classList.remove('active'));
}

function renderExploreZoneList() {
  const list = $('explore-zone-list');
  list.innerHTML = '';
  if (!state.current) return;
  state.current.zones.forEach((z, i) => {
    const li = document.createElement('li');
    li.className = 'explore-zone-item';
    li.innerHTML = `<span class="explore-zone-num">${i + 1}</span><span class="explore-zone-word">???</span>`;
    li.addEventListener('click', () => {
      li.querySelector('.explore-zone-word').textContent = z.word;
      li.classList.add('revealed');
      showExploreInfo(z, i);
    });
    list.appendChild(li);
  });
}

/* ══════════════════════════════════════════
   MODE GLISSER (DRAG & DROP)
══════════════════════════════════════════ */
function initDragMode() {
  dragState.placed = {};
  dragState.score  = 0;
  quizSvg.innerHTML = '';
  $('drag-result-msg').classList.add('hidden');
  $('drag-result-msg').className = 'drag-result-msg hidden';
  updateDragScore();
  buildWordBank();
}

function buildWordBank() {
  const bank = $('drag-word-bank');
  bank.innerHTML = '';
  if (!state.current) return;

  shuffle(state.current.zones.map(z => ({ id: z.id, word: z.word }))).forEach(({ id, word }) => {
    const chip = document.createElement('div');
    chip.className = 'drag-chip';
    chip.textContent = word;
    chip.dataset.zoneId = id;
    chip.draggable = true;

    chip.addEventListener('dragstart', e => {
      dragState.dragging = chip;
      chip.classList.add('dragging');
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    });
    chip.addEventListener('dragend', () => {
      chip.classList.remove('dragging');
      dragState.dragging = null;
    });
    chip.addEventListener('touchstart', onChipTouchStart, { passive: false });
    bank.appendChild(chip);
  });
}

function renderDragOverlay() {
  const old = document.getElementById('drag-overlay');
  if (old) old.remove();
  quizSvg.innerHTML = '';
  if (!state.current) return;

  const wrapper  = $('quiz-canvas-wrapper');
  const imgRect  = quizImg.getBoundingClientRect();
  const wrapRect = wrapper.getBoundingClientRect();
  const iw = quizImg.naturalWidth  || imgRect.width;
  const ih = quizImg.naturalHeight || imgRect.height;
  const sx = imgRect.width  / iw, sy = imgRect.height / ih;
  const ox = imgRect.left - wrapRect.left;
  const oy = imgRect.top  - wrapRect.top;

  const overlay = document.createElement('div');
  overlay.id = 'drag-overlay';
  overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
  wrapper.appendChild(overlay);

  state.current.zones.forEach((z, i) => {
    const placed = dragState.placed[z.id];
    const div    = document.createElement('div');
    div.dataset.zoneId = z.id;

    let style = '';
    if (z.type === 'rect') {
      const rx = ox + z.x / 100 * iw * sx;
      const ry = oy + z.y / 100 * ih * sy;
      const rw = z.w / 100 * iw * sx;
      const rh = z.h / 100 * ih * sy;
      style = `left:${rx}px;top:${ry}px;width:${rw}px;height:${rh}px;border-radius:6px;`;
    } else {
      const cx = ox + z.x / 100 * iw * sx;
      const cy = oy + z.y / 100 * ih * sy;
      style = `left:${cx - 32}px;top:${cy - 32}px;width:64px;height:64px;border-radius:50%;`;
    }

    div.className = 'drop-target' + (placed === true ? ' correct' : placed === false ? ' wrong' : '');
    div.style.cssText = style + 'position:absolute;pointer-events:all;display:flex;align-items:center;justify-content:center;border:2px dashed rgba(168,85,247,0.5);background:rgba(168,85,247,0.06);transition:background 0.15s,border-color 0.15s;';

    const lbl = document.createElement('div');
    lbl.className = 'drop-label';
    lbl.style.cssText = 'font-family:Nunito,sans-serif;font-size:0.82rem;font-weight:800;color:white;text-shadow:0 1px 4px rgba(0,0,0,0.8);pointer-events:none;text-align:center;padding:0 4px;';
    lbl.textContent = placed === true ? z.word : (i + 1);
    div.appendChild(lbl);

    if (placed === true) {
      div.style.background = 'rgba(16,185,129,0.2)';
      div.style.borderColor = '#10b981';
      div.style.borderStyle = 'solid';
    }

    // Drop events
    div.addEventListener('dragover', e => {
      e.preventDefault();
      if (!dragState.placed[z.id]) {
        div.style.background = 'rgba(168,85,247,0.25)';
        div.style.borderColor = '#a855f7';
        div.style.borderStyle = 'solid';
      }
    });
    div.addEventListener('dragleave', () => {
      if (!dragState.placed[z.id]) {
        div.style.background = 'rgba(168,85,247,0.06)';
        div.style.borderColor = 'rgba(168,85,247,0.5)';
        div.style.borderStyle = 'dashed';
      }
    });
    div.addEventListener('drop', e => {
      e.preventDefault();
      if (dragState.placed[z.id]) return;
      handleDrop(z.id, e.dataTransfer.getData('text/plain'));
    });

    overlay.appendChild(div);
  });

  syncChipStates();
}

function handleDrop(targetId, chipId) {
  const correct = targetId === chipId;
  if (correct) {
    dragState.placed[targetId] = true;
    dragState.score++;
    const chip = $('drag-word-bank').querySelector(`[data-zone-id="${chipId}"]`);
    if (chip) { chip.classList.add('placed-ok'); chip.draggable = false; }
    updateDragScore();
    renderDragOverlay();
    if (dragState.score >= state.current.zones.length) showDragWin();
  } else {
    // Flash rouge sur la zone
    const dropDiv = document.querySelector(`#drag-overlay [data-zone-id="${targetId}"]`);
    if (dropDiv) {
      dropDiv.style.background   = 'rgba(239,68,68,0.25)';
      dropDiv.style.borderColor  = '#ef4444';
      dropDiv.style.borderStyle  = 'solid';
      setTimeout(() => {
        dropDiv.style.background  = 'rgba(168,85,247,0.06)';
        dropDiv.style.borderColor = 'rgba(168,85,247,0.5)';
        dropDiv.style.borderStyle = 'dashed';
      }, 500);
    }
    // Faire trembler le chip
    const chip = $('drag-word-bank').querySelector(`[data-zone-id="${chipId}"]`);
    if (chip) {
      chip.classList.add('placed-wrong');
      setTimeout(() => chip.classList.remove('placed-wrong'), 500);
    }
  }
}

function syncChipStates() {
  $('drag-word-bank').querySelectorAll('.drag-chip').forEach(chip => {
    if (dragState.placed[chip.dataset.zoneId] === true) {
      chip.classList.add('placed-ok');
      chip.draggable = false;
    }
  });
}

function updateDragScore() {
  $('drag-score-txt').textContent = `${dragState.score} / ${state.current ? state.current.zones.length : 0}`;
}

function showDragWin() {
  const msg = $('drag-result-msg');
  msg.textContent = '🏆 Bravo ! Tu as placé tous les mots correctement !';
  msg.className = 'drag-result-msg success';

  if (window.Progress && state.current) {
    Progress.save({
      type: 'image_drag',
      ref: state.current.name,
      label: `🧩 ${state.current.name}`,
      score: state.current.zones.length,
      total: state.current.zones.length
    });
  }
}

$('drag-reset-btn').addEventListener('click', () => { initDragMode(); setTimeout(renderDragOverlay, 80); });

/* ── Touch mobile ── */
let touchChip = null, touchClone = null;

function onChipTouchStart(e) {
  e.preventDefault();
  touchChip = e.currentTarget;
  const t = e.touches[0];
  touchClone = touchChip.cloneNode(true);
  touchClone.style.cssText = `position:fixed;z-index:9999;pointer-events:none;opacity:0.85;left:${t.clientX - 30}px;top:${t.clientY - 16}px;`;
  document.body.appendChild(touchClone);
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend',  onTouchEnd,  { passive: false });
}

function onTouchMove(e) {
  e.preventDefault();
  const t = e.touches[0];
  if (touchClone) { touchClone.style.left = (t.clientX - 30) + 'px'; touchClone.style.top = (t.clientY - 16) + 'px'; }
}

function onTouchEnd(e) {
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend',  onTouchEnd);
  if (touchClone) { touchClone.remove(); touchClone = null; }
  const t = e.changedTouches[0];
  const el = document.elementFromPoint(t.clientX, t.clientY);
  const dt = el && el.closest('.drop-target');
  if (dt && touchChip && !dragState.placed[dt.dataset.zoneId]) {
    handleDrop(dt.dataset.zoneId, touchChip.dataset.zoneId);
  }
  touchChip = null;
}

/* ══════════════════════════════════════════
   MODE QUIZ
══════════════════════════════════════════ */
function renderQuizStep() {
  const q = state.quiz, total = q.order.length;
  $('quiz-progress-text').textContent = `Question ${Math.min(q.index + 1, total)} / ${total}`;
  $('quiz-progress-bar').style.width  = `${(q.index / total) * 100}%`;
  $('quiz-score').textContent = `⭐ ${q.score} / ${total}`;
  if (q.index >= total) { showQuizResult(); return; }

  const zone  = state.current.zones[q.order[q.index]];
  $('quiz-question').textContent = `Quel est l'objet n°${q.index + 1} ?`;

  const input = $('quiz-input');
  input.value = ''; input.className = 'quiz-input'; input.disabled = false;
  $('quiz-feedback').textContent = ''; $('quiz-feedback').className = 'quiz-feedback';
  $('quiz-zone-info').classList.add('hidden');
  $('quiz-next-btn').classList.add('hidden');
  $('quiz-hint-btn').classList.remove('hidden');
  $('quiz-hint').classList.add('hidden');

  $('quiz-hint').innerHTML = `
    <div class="tooltip-badges">
      <span class="tooltip-badge ${zone.genre === 'masculin' ? 'badge-masc' : zone.genre === 'féminin' ? 'badge-fem' : 'badge-neutre'}">${zone.genre}</span>
      <span class="tooltip-badge badge-${zone.cat}">${zone.cat}</span>
    </div>
    ${zone.desc ? `<p class="quiz-hint-desc">${zone.desc}</p>` : ''}
  `;
  renderQuizSvg(q.order[q.index]);
  setTimeout(() => input.focus(), 100);
}

function renderQuizSvg(activeIdx) {
  quizSvg.innerHTML = '';
  const ol = document.getElementById('drag-overlay');
  if (ol) ol.remove();
  if (!state.current) return;

  const imgRect = quizImg.getBoundingClientRect();
  const svgRect = quizSvg.getBoundingClientRect();
  const iw = quizImg.naturalWidth  || imgRect.width;
  const ih = quizImg.naturalHeight || imgRect.height;
  const sx = imgRect.width / iw, sy = imgRect.height / ih;
  const ox = imgRect.left - svgRect.left, oy = imgRect.top - svgRect.top;
  const px = p => ox + p / 100 * iw * sx;
  const py = p => oy + p / 100 * ih * sy;
  const pw = p => p / 100 * iw * sx;
  const ph = p => p / 100 * ih * sy;

  state.current.zones.forEach((z, i) => {
    const answered = state.quiz.answered.find(a => a.zoneId === z.id);
    const isActive = i === activeIdx;
    let fill, stroke;
    if (answered)      { fill = answered.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'; stroke = answered.correct ? '#10b981' : '#ef4444'; }
    else if (isActive) { fill = 'rgba(245,158,11,0.25)'; stroke = '#f59e0b'; }
    else               { fill = 'rgba(168,85,247,0.1)';  stroke = 'rgba(168,85,247,0.4)'; }
    const numColor = isActive ? '#f59e0b' : answered ? (answered.correct ? '#10b981' : '#ef4444') : '#7c3aed';

    const mk = (tag, attrs) => { const el = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v)); return el; };
    const mkTxt = (x, y, txt, size, anchor) => { const t = mk('text', { x, y, 'text-anchor': anchor||'middle', fill:'white', 'font-size':size, 'font-weight':'bold', 'font-family':'Nunito,sans-serif', 'pointer-events':'none' }); t.textContent = txt; return t; };

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    if (z.type === 'rect') {
      const rx = px(z.x), ry = py(z.y), rw = pw(z.w), rh = ph(z.h);
      const rect = mk('rect', { x: rx, y: ry, width: rw, height: rh, rx: 4, fill, stroke, 'stroke-width': isActive ? 3 : 1.5 });
      if (isActive) rect.setAttribute('stroke-dasharray', '6,3');
      g.appendChild(rect);
      const nb = mk('rect', { x: rx, y: ry, width: 24, height: 22, rx: 4, fill: numColor }); g.appendChild(nb);
      g.appendChild(mkTxt(rx + 12, ry + 15, i + 1, 12));
      if (answered) g.appendChild(mkTxt(rx + rw / 2, ry + rh / 2 + 5, z.word, 13));
    } else {
      const cx = px(z.x), cy = py(z.y);
      g.appendChild(mk('circle', { cx, cy, r: 20, fill, stroke, 'stroke-width': isActive ? 3 : 1.5 }));
      g.appendChild(mkTxt(cx, cy + 5, i + 1, 12));
      if (answered) g.appendChild(mkTxt(cx + 28, cy + 5, z.word, 12, 'start'));
    }
    quizSvg.appendChild(g);
  });
}

function normalise(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(un|une|le|la|les|l)\b/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function checkAnswer() {
  const q = state.quiz, zone = state.current.zones[q.order[q.index]];
  const input = $('quiz-input');
  if (!input.value.trim() || input.disabled) return;
  const correct = normalise(input.value) === normalise(zone.word);
  input.disabled = true;
  input.classList.add(correct ? 'correct' : 'incorrect');
  const fb = $('quiz-feedback');
  if (correct) { fb.textContent = "✅ Bravo, c'est correct !"; fb.className = 'quiz-feedback correct'; q.score++; }
  else { fb.innerHTML = `❌ La réponse était : <strong>${zone.word}</strong>`; fb.className = 'quiz-feedback incorrect'; }
  q.answered.push({ zoneId: zone.id, correct });
  $('quiz-score').textContent = `⭐ ${q.score} / ${q.order.length}`;
  $('quiz-zone-info').innerHTML = `
    <div class="tooltip-badges">
      <span class="tooltip-badge ${zone.genre === 'masculin' ? 'badge-masc' : zone.genre === 'féminin' ? 'badge-fem' : 'badge-neutre'}">${zone.genre}</span>
      <span class="tooltip-badge ${zone.nombre === 'invariable' ? 'badge-invariable' : 'badge-variable'}">${zone.nombre}</span>
      <span class="tooltip-badge badge-${zone.cat}">${zone.cat}</span>
    </div>
    ${zone.desc    ? `<div class="quiz-zone-desc">${zone.desc}</div>` : ''}
    ${zone.example ? `<div class="quiz-zone-example">« ${zone.example} »</div>` : ''}
  `;
  $('quiz-zone-info').classList.remove('hidden');
  $('quiz-hint').classList.add('hidden');
  $('quiz-hint-btn').classList.add('hidden');
  $('quiz-next-btn').classList.remove('hidden');
  renderQuizSvg(q.order[q.index]);
}

function nextQuestion() { state.quiz.index++; $('quiz-zone-info').classList.add('hidden'); renderQuizStep(); }

function showQuizResult() {
  const q = state.quiz, total = q.order.length;
  const pct = Math.round(q.score / total * 100);
  $('quiz-result-emoji').textContent = pct === 100 ? '🏆' : pct >= 70 ? '⭐' : pct >= 40 ? '💪' : '📚';
  $('quiz-result-score').textContent = `${q.score} / ${total} (${pct}%)`;
  $('quiz-result-msg').textContent   = pct === 100 ? 'Parfait ! Tu connais tout !' : pct >= 70 ? 'Très bien ! Continue comme ça !' : pct >= 40 ? "Pas mal ! Un peu de pratique et tu y es !" : "Continue à t'entraîner !";
  $('quiz-result').classList.remove('hidden');
  $('quiz-question-block').classList.add('hidden');
  renderQuizSvg(-1);

  if (window.Progress && state.current) {
    Progress.save({
      type: 'image_quiz',
      ref: state.current.name,
      label: `🎯 ${state.current.name}`,
      score: q.score,
      total
    });
  }
}

function restartQuiz() {
  state.quiz = { order: state.current.zones.map((_, i) => i), index: 0, score: 0, answered: [] };
  $('quiz-result').classList.add('hidden');
  $('quiz-question-block').classList.remove('hidden');
  renderQuizStep();
}

/* ══════════════════════════════════════════
   MODE ÉDITEUR
══════════════════════════════════════════ */
function openEditor(id) {
  state.current = state.images.find(i => i.id === id); if (!state.current) return;
  $('editor-image-name').textContent = state.current.name;
  editorImg.src = state.current.src;
  gallerySection.classList.add('hidden'); editorSection.classList.remove('hidden');
  editorImg.onload = renderAllZones;
  if (editorImg.complete) renderAllZones();
}

function closeEditor() { editorSection.classList.add('hidden'); gallerySection.classList.remove('hidden'); renderGallery(); }

function renderAllZones() {
  svg.innerHTML = ''; if (!state.current) return;
  state.current.zones.forEach(z => renderZone(z));
  renderZoneList();
}

function renderZone(z) {
  const imgRect = editorImg.getBoundingClientRect(), svgRect = svg.getBoundingClientRect();
  const iw = editorImg.naturalWidth || imgRect.width, ih = editorImg.naturalHeight || imgRect.height;
  const sx = imgRect.width / iw, sy = imgRect.height / ih;
  const ox = imgRect.left - svgRect.left, oy = imgRect.top - svgRect.top;
  const px = p => ox + p / 100 * iw * sx, py = p => oy + p / 100 * ih * sy;
  const pw = p => p / 100 * iw * sx, ph = p => p / 100 * ih * sy;
  const mk = (tag, attrs) => { const el = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v)); return el; };

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.dataset.zoneId = z.id;

  if (z.type === 'rect') {
    const rx = px(z.x), ry = py(z.y), rw = pw(z.w), rh = ph(z.h);
    const rect = mk('rect', { x: rx, y: ry, width: rw, height: rh, rx: 4 }); rect.classList.add('ann-rect'); g.appendChild(rect);
    const bg = mk('rect', { x: rx, y: ry - 20, width: Math.min(z.word.length * 8 + 12, rw), height: 18, rx: 3 }); bg.classList.add('ann-label-bg'); g.appendChild(bg);
    const lt = mk('text', { x: rx + 5, y: ry - 6 }); lt.classList.add('ann-label-text'); lt.textContent = z.word; g.appendChild(lt);
  } else {
    const cx = px(z.x), cy = py(z.y);
    const ring = mk('circle', { cx, cy, r: 18 }); ring.classList.add('ann-pin-ring'); g.appendChild(ring);
    const pin  = mk('circle', { cx, cy, r: 7  }); pin.classList.add('ann-pin');      g.appendChild(pin);
    const lt   = mk('text',   { x: cx + 12, y: cy + 4 }); lt.classList.add('ann-label-text'); lt.textContent = z.word; g.appendChild(lt);
  }

  g.addEventListener('mouseenter', ev => showTooltip(z, ev));
  g.addEventListener('mousemove',  ev => moveTooltip(ev));
  g.addEventListener('mouseleave', ()  => hideTooltip());
  g.addEventListener('dblclick',   ev  => { ev.stopPropagation(); openModalEdit(z.id); });
  svg.appendChild(g);
}

function svgCoordsToPercent(svgX, svgY) {
  const imgRect = editorImg.getBoundingClientRect(), svgRect = svg.getBoundingClientRect();
  const ox = imgRect.left - svgRect.left, oy = imgRect.top - svgRect.top;
  const scX = editorImg.naturalWidth / imgRect.width, scY = editorImg.naturalHeight / imgRect.height;
  return { x: (svgX - ox) * scX / editorImg.naturalWidth * 100, y: (svgY - oy) * scY / editorImg.naturalHeight * 100 };
}
function getSvgPoint(e) { const r = svg.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

svg.addEventListener('mousedown', e => {
  if (state.tool !== 'rect' || (e.target !== svg && e.target.tagName !== 'svg')) return;
  state.drawing = true; state.drawStart = getSvgPoint(e);
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  r.classList.add('ann-rect', 'drawing'); r.setAttribute('rx', 4); svg.appendChild(r); state.tempRect = r;
});
svg.addEventListener('mousemove', e => {
  if (!state.drawing || !state.tempRect) return;
  const p = getSvgPoint(e);
  state.tempRect.setAttribute('x', Math.min(p.x, state.drawStart.x));
  state.tempRect.setAttribute('y', Math.min(p.y, state.drawStart.y));
  state.tempRect.setAttribute('width',  Math.abs(p.x - state.drawStart.x));
  state.tempRect.setAttribute('height', Math.abs(p.y - state.drawStart.y));
});
svg.addEventListener('mouseup', e => {
  if (!state.drawing) return; state.drawing = false;
  const p = getSvgPoint(e);
  const x = Math.min(p.x, state.drawStart.x), y = Math.min(p.y, state.drawStart.y);
  const w = Math.abs(p.x - state.drawStart.x), h = Math.abs(p.y - state.drawStart.y);
  if (state.tempRect) { state.tempRect.remove(); state.tempRect = null; }
  if (w < 10 || h < 10) return;
  const c1 = svgCoordsToPercent(x, y), c2 = svgCoordsToPercent(x + w, y + h);
  state.pendingZone = { type: 'rect', x: c1.x, y: c1.y, w: c2.x - c1.x, h: c2.y - c1.y };
  openModalNew();
});
svg.addEventListener('click', e => {
  if (state.tool !== 'click' || e.target !== svg) return;
  const p = getSvgPoint(e), c = svgCoordsToPercent(p.x, p.y);
  state.pendingZone = { type: 'click', x: c.x, y: c.y, w: 0, h: 0 }; openModalNew();
});

/* ── Modal ── */
function resetBadges() {
  [['badge-genre','masculin'],['badge-nombre','variable'],['badge-cat','nom']].forEach(([id,def]) =>
    document.querySelectorAll(`#${id} .badge-opt`).forEach(b => b.classList.toggle('active', b.dataset.val === def)));
}
function getBadge(id) { const a = document.querySelector(`#${id} .badge-opt.active`); return a ? a.dataset.val : ''; }
document.querySelectorAll('.badge-toggle-group').forEach(g =>
  g.addEventListener('click', e => {
    const b = e.target.closest('.badge-opt'); if (!b) return;
    g.querySelectorAll('.badge-opt').forEach(x => x.classList.remove('active')); b.classList.add('active');
  })
);
function openModalNew() {
  state.editingZoneId = null; $('ann-word').value = ''; $('ann-desc').value = ''; $('ann-example').value = '';
  resetBadges(); modal.classList.remove('hidden'); $('ann-word').focus();
}
function openModalEdit(id) {
  const z = state.current.zones.find(z => z.id === id); if (!z) return;
  state.editingZoneId = id; state.pendingZone = null;
  $('ann-word').value = z.word || ''; $('ann-desc').value = z.desc || ''; $('ann-example').value = z.example || '';
  [['badge-genre',z.genre],['badge-nombre',z.nombre],['badge-cat',z.cat]].forEach(([gid,val]) =>
    document.querySelectorAll(`#${gid} .badge-opt`).forEach(b => b.classList.toggle('active', b.dataset.val === val)));
  modal.classList.remove('hidden'); $('ann-word').focus();
}
$('modal-cancel').addEventListener('click', () => { modal.classList.add('hidden'); state.pendingZone = null; state.editingZoneId = null; });
$('modal-save').addEventListener('click', () => {
  const word = $('ann-word').value.trim(); if (!word) { $('ann-word').focus(); return; }
  const data = { word, desc: $('ann-desc').value.trim(), example: $('ann-example').value.trim(), genre: getBadge('badge-genre'), nombre: getBadge('badge-nombre'), cat: getBadge('badge-cat') };
  if (state.editingZoneId) { const z = state.current.zones.find(z => z.id === state.editingZoneId); if (z) Object.assign(z, data); }
  else if (state.pendingZone) { state.current.zones.push({ id: 'z-' + Date.now(), ...state.pendingZone, ...data }); }
  modal.classList.add('hidden'); state.pendingZone = null; state.editingZoneId = null; renderAllZones();
});

function renderZoneList() {
  zoneList.innerHTML = ''; if (!state.current) return;
  state.current.zones.forEach(z => {
    const li = document.createElement('li'); li.className = 'zone-item';
    li.innerHTML = `<span class="zone-item-word">${z.word}</span><button class="zone-item-edit" data-id="${z.id}">✏️</button><button class="zone-item-del" data-id="${z.id}">🗑️</button>`;
    li.querySelector('.zone-item-edit').addEventListener('click', () => openModalEdit(z.id));
    li.querySelector('.zone-item-del').addEventListener('click',  () => { state.current.zones = state.current.zones.filter(zz => zz.id !== z.id); renderAllZones(); });
    zoneList.appendChild(li);
  });
}

/* ── Tooltip éditeur ── */
function showTooltip(z, e) {
  tooltip.querySelector('.tooltip-word').textContent = z.word || '';
  tooltip.querySelector('.tooltip-desc').textContent = z.desc || '';
  tooltip.querySelector('.tooltip-example').textContent = z.example ? `« ${z.example} »` : '';
  const gc = z.genre === 'masculin' ? 'badge-masc' : z.genre === 'féminin' ? 'badge-fem' : 'badge-neutre';
  const nc = z.nombre === 'invariable' ? 'badge-invariable' : 'badge-variable';
  tooltip.querySelector('.tooltip-badges').innerHTML =
    `<span class="tooltip-badge ${gc}">${z.genre}</span><span class="tooltip-badge ${nc}">${z.nombre}</span><span class="tooltip-badge badge-${z.cat}">${z.cat}</span>`;
  tooltip.classList.remove('hidden'); moveTooltip(e);
}
function moveTooltip(e) {
  const tw = tooltip.offsetWidth || 240, th = tooltip.offsetHeight || 100;
  let l = e.clientX + 16, t = e.clientY + 16;
  if (l + tw > window.innerWidth  - 10) l = e.clientX - tw - 16;
  if (t + th > window.innerHeight - 10) t = e.clientY - th - 16;
  tooltip.style.left = l + 'px'; tooltip.style.top = t + 'px';
}
function hideTooltip() { tooltip.classList.add('hidden'); }

$('save-json-btn').addEventListener('click', () => {
  if (!state.current) return;
  const blob = new Blob([JSON.stringify({ name: state.current.name, zones: state.current.zones }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = state.current.name + '.json'; a.click(); URL.revokeObjectURL(url);
});

/* ══════════════════════════════════════════
   BIND EVENTS
══════════════════════════════════════════ */
function bindEvents() {
  $('back-to-gallery').addEventListener('click', closeEditor);
  $('quiz-back-btn').addEventListener('click', closeQuizSection);
  $('quiz-restart-btn').addEventListener('click', restartQuiz);
  $('quiz-restart-btn2').addEventListener('click', restartQuiz);

  $('tab-explore').addEventListener('click', () => switchTab('explore'));
  $('tab-drag').addEventListener('click',    () => switchTab('drag'));
  $('tab-quiz').addEventListener('click',    () => {
    state.quiz = { order: state.current.zones.map((_,i)=>i), index:0, score:0, answered:[] };
    switchTab('quiz');
  });

  $('tool-rect').addEventListener('click',  () => setTool('rect'));
  $('tool-click').addEventListener('click', () => setTool('click'));
  $('quiz-input').addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });
  $('quiz-check-btn').addEventListener('click', checkAnswer);
  $('quiz-next-btn').addEventListener('click', nextQuestion);
  $('quiz-hint-btn').addEventListener('click', () => $('quiz-hint').classList.toggle('hidden'));

  window.addEventListener('resize', () => {
    if (!editorSection.classList.contains('hidden')) renderAllZones();
    if (!quizSection.classList.contains('hidden')) {
      if (!explorePanel.classList.contains('hidden')) renderExploreSvg();
      else if (!dragPanel.classList.contains('hidden')) setTimeout(renderDragOverlay, 50);
      else renderQuizSvg(state.quiz.order[state.quiz.index]);
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { modal.classList.add('hidden'); state.pendingZone = null; } });
}

function setTool(t) {
  state.tool = t;
  $('tool-rect').classList.toggle('active', t === 'rect');
  $('tool-click').classList.toggle('active', t === 'click');
  svg.style.cursor = t === 'rect' ? 'crosshair' : 'cell';
}

/* ── Shuffle ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
