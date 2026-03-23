import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useLang } from '../i18n/LangContext';
import { Shield, Lock, Mail, ArrowRight, Loader } from 'lucide-react';

const Login = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const { signIn, session, loading, loginAsDemo } = useAuth();

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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] text-slate-500">
        <Loader className="animate-spin text-indigo-500 mr-3" size={24} />
        {t("Chargement...")}
      </div>
    );
  }

  if (session) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-md relative z-10 px-6">
        {/* Logo Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/20 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Syndic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Gravity</span>
          </h1>
          <p className="text-slate-400 font-medium">
            {t("Gestion de copropriété simplifiée")}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="px-8 pt-10 pb-2">
            <h2 className="text-xl font-bold text-white text-center">{t("Content de vous revoir")}</h2>
            <p className="text-slate-500 text-sm text-center mt-1">{t("Entrez vos identifiants pour accéder au dashboard")}</p>
          </div>

          <form className="p-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-5 h-5 bg-rose-500/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="font-bold">!</span>
                </div>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                  value={email}
                  placeholder={t("Email")}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                  value={password}
                  placeholder={t("Mot de passe")}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end p-1">
              <a href="#" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                {t("Mot de passe oublié ?")}
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full group relative flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>{t("Connexion en cours...")}</span>
                </>
              ) : (
                <>
                  <span>{t("Se connecter")}</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </button>
          </form>

          <div className="px-8 pb-10 pt-4 text-center space-y-6">
             <div className="pt-4 border-t border-slate-800/50">
               <p className="text-slate-500 text-xs mb-4">{t("Ou essayez avec un compte démo :")}</p>
               <div className="flex gap-4">
                 <button 
                   onClick={() => loginAsDemo('admin')}
                   className="flex-1 py-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-bold rounded-xl transition-all"
                 >
                   {t("Syndic (Admin)")}
                 </button>
                 <button 
                   onClick={() => loginAsDemo('resident')}
                   className="flex-1 py-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-bold rounded-xl transition-all"
                 >
                   {t("Habitant (Lecture)")}
                 </button>
               </div>
             </div>
             <p className="text-slate-500 text-xs">
               Propulsé par <span className="text-slate-400 font-bold">Syndic Gravity AI</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
