/* ============================================================
   auth.js — Connexion Supabase, rôles admin / étudiant
   Version GitHub Pages (sans fonction Netlify)
   ============================================================ */
'use strict';

const Auth = {
  client:  null,
  profile: null,
  ready:   false,

  isConfigured() {
    const c = window.SUPABASE_CONFIG;
    return c?.url && c?.anonKey &&
      c.url !== 'https://VOTRE_PROJET.supabase.co' &&
      c.anonKey !== 'VOTRE_CLE_ANON_PUBLIQUE';
  },

  basePath() {
    const p = location.pathname;
    return (p.includes('/lecons-app/') || p.includes('/quiz-app/') || p.includes('/images-app/'))
      ? '..' : '.';
  },

  async init() {
    if (!this.isConfigured()) {
      console.warn('Supabase non configuré — éditez js/config.js');
      this.ready = true;
      this.updateNav();
      document.dispatchEvent(new Event('auth-ready'));
      return;
    }

    this.client = supabase.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey
    );

    // 1. Charge la session existante EN PREMIER et attend la fin
    const { data: { session } } = await this.client.auth.getSession();
    if (session) await this.syncProfile(session);

    // 2. Seulement après, on marque ready et on dispatch
    this.ready = true;
    this.updateNav();
    document.dispatchEvent(new Event('auth-ready'));

    // 3. Écoute les changements futurs (connexion / déconnexion)
    this.client.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await this.syncProfile(session);
      } else {
        this.profile = null;
        this.updateNav();
      }
    });
  },

  async syncProfile(session) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!error && data) {
      this.profile = data;
    } else {
      // Upsert de secours si le trigger SQL n'a pas encore créé le profil
      const displayName =
        session.user.user_metadata?.display_name ||
        session.user.email?.split('@')[0] ||
        'Étudiant';

      const { data: upserted } = await this.client
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          display_name: displayName,
          role: 'student'
        }, { onConflict: 'id' })
        .select()
        .single();

      if (upserted) this.profile = upserted;
    }
  },

  isLoggedIn() { return !!this.profile; },
  isAdmin()    { return this.profile?.role === 'admin'; },
  getUser()    { return this.profile; },
  getClient()  { return this.client; },

  updateNav() {
    const el = document.getElementById('nav-auth');
    if (!el) return;

    const b = this.basePath();

    if (!this.isLoggedIn()) {
      el.innerHTML = `<a href="${b}/login.html">🔑 Connexion</a>`;
      return;
    }

    const name = this.profile.display_name || this.profile.email || 'Profil';
    if (this.isAdmin()) {
      el.innerHTML = `
        <a href="${b}/compte.html">👤 ${name}</a>
        <a href="${b}/admin.html">🛠️ Admin</a>
        <a href="#" id="nav-logout">Déconnexion</a>`;
    } else {
      el.innerHTML = `
        <a href="${b}/compte.html">👤 Mon profil</a>
        <a href="#" id="nav-logout">Déconnexion</a>`;
    }

    document.getElementById('nav-logout')?.addEventListener('click', e => {
      e.preventDefault();
      this.signOut();
    });
  },

  async signUp(email, password, displayName) {
    if (!this.client) throw new Error('Supabase non configuré');
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || email.split('@')[0] } }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    if (!this.client) throw new Error('Supabase non configuré');
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (this.client) await this.client.auth.signOut();
    this.profile = null;
    location.href = this.basePath() + '/index.html';
  },

  requireLogin(redirectTo) {
    const wait = () => {
      if (!this.ready) { document.addEventListener('auth-ready', wait, { once: true }); return; }
      if (!this.isLoggedIn()) {
        const dest = redirectTo || location.pathname + location.search;
        location.href = this.basePath() + '/login.html?redirect=' + encodeURIComponent(dest);
      }
    };
    wait();
  },

  requireAdmin() {
    const wait = () => {
      if (!this.ready) { document.addEventListener('auth-ready', wait, { once: true }); return; }
      if (!this.isAdmin()) location.href = this.basePath() + '/index.html';
    };
    wait();
  }
};

window.Auth = Auth;
document.addEventListener('DOMContentLoaded', () => Auth.init());
