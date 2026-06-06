/* ============================================================
   progress.js — Sauvegarde de la progression (Supabase)
   ============================================================ */
'use strict';

const Progress = {
  async save({ type, ref, label, score, total }) {
    if (!window.Auth?.isLoggedIn() || !window.Auth.getClient()) return;

    const percent = (score != null && total > 0)
      ? Math.round(score / total * 100)
      : null;

    const { error } = await window.Auth.getClient().from('progress').insert({
      user_id: window.Auth.getUser().id,
      type,
      ref,
      label: label || ref,
      score: score ?? null,
      total: total ?? null,
      percent
    });

    if (error) console.warn('Progression non enregistrée:', error.message);
  },

  onReady(fn) {
    if (window.Auth?.ready) { fn(); return; }
    document.addEventListener('auth-ready', fn, { once: true });
  }
};

window.Progress = Progress;
