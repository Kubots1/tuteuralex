import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !serviceKey || !anonKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Supabase non configuré sur Netlify' }) };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Token manquant' }) };
  }

  const token = authHeader.slice(7);

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Token invalide' }) };
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const role = adminEmails.includes(user.email?.toLowerCase()) ? 'admin' : 'student';
  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Étudiant';

  const service = createClient(url, serviceKey);
  const { error: upsertError } = await service.from('profiles').upsert({
    id: user.id,
    email: user.email,
    display_name: displayName,
    role
  }, { onConflict: 'id' });

  if (upsertError) {
    return { statusCode: 500, body: JSON.stringify({ error: upsertError.message }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, role })
  };
};
