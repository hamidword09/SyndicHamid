import { createClient } from '@supabase/supabase-js';

const supabaseUrlRaw = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabaseUrl = supabaseUrlRaw?.trim().replace(/\/+$/, '');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d environnement manquantes : définis VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans frontend/.env'
  );
}

// Évite l'erreur "requested path is invalid" quand VITE_SUPABASE_URL contient un chemin.
// Doit être de la forme: https://xxxx.supabase.co (pas /auth/v1, pas /rest/v1, etc.)
try {
  const parsed = new URL(supabaseUrl);
  if (parsed.pathname && parsed.pathname !== '/' && parsed.pathname !== '') {
    throw new Error(
      `VITE_SUPABASE_URL invalide (contient un chemin): "${supabaseUrl}". Utilise seulement l'URL du domaine (sans /rest/v1, /auth/v1, etc.).`
    );
  }
} catch {
  // L'exception finale sera levée par createClient s'il y a un vrai problème de format.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

