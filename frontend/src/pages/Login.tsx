import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useLang } from '../i18n/LangContext';

const Login = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const { signIn, session, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la connexion");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-500">
        {t("Chargement...")}
      </div>
    );
  }

  if (session) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="px-8 py-8 border-b border-slate-700/50">
          <h1 className="text-2xl font-black text-white">{t("Connexion")}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t("Connectez-vous avec votre compte Supabase")}</p>
        </div>

        <form className="px-8 py-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t("Email")}</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t("Mot de passe")}</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors"
          >
            {submitting ? t("Connexion...") : t("Se connecter")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

