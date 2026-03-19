// Fichier de configuration Supabase (à compléter avec vos identifiants)
// 1. Allez sur https://supabase.com/
// 2. Project Settings > API
// 3. Copiez l'URL et la clé 'anon' public

const SUPABASE_URL = 'https://umgmnzvoezxdcjbecwbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ21uenZvZXp4ZGNqYmVjd2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NzEzOTksImV4cCI6MjA4OTE0NzM5OX0.b9TyhE4CvQd1lLQNSzCShWeQw3Sctw4FXeypvWDnDeI';

const API_URL = 'http://localhost:5000/api';

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
