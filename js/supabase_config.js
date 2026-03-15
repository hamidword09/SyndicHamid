// Fichier de configuration Supabase (à compléter avec vos identifiants)
// 1. Allez sur https://supabase.com/
// 2. Project Settings > API
// 3. Copiez l'URL et la clé 'anon' public

const SUPABASE_URL = 'VOTRE_URL_SUPABASE';
const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_SUPABASE';

// Initialisation du client (Assurez-vous d'avoir ajouté le SDK dans le HTML)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabaseClient = null;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Fonction utilitaire pour vérifier la connexion
async function checkSupabaseConnection() {
    if (!supabaseClient) return false;
    const { data, error } = await supabaseClient.from('residents').select('count', { count: 'exact', head: true });
    return !error;
}
