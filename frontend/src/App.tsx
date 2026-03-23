import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Languages, TrendingUp, Users as UsersIcon, CheckCircle, XCircle, Settings, Bell, ShieldCheck } from 'lucide-react';
import { useLang } from './i18n/LangContext';
import { useAuth } from './auth/AuthContext';
import Dashboard from './pages/Dashboard';
import Revenus from './pages/Revenus';
import Residents from './pages/Residents';
import Expenses from './pages/Expenses';
import ExtraRevenus from './pages/ExtraRevenus';
import AnnualBilan from './pages/AnnualBilan';
import Repairs from './pages/Repairs';
import Maintenance from './pages/Maintenance';
import Voting from './pages/Voting';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Users from './pages/Users';

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

const AppInner = () => {
  const { t, toggleLang, lang, isRTL } = useLang();
  const { session, loading } = useAuth();
  const location = useLocation();

  const isLoginRoute = location.pathname === '/login';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-500">
        {t("Chargement...")}
      </div>
    );
  }

  if (!session && !isLoginRoute) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex ${isRTL ? 'flex-row-reverse' : ''}`}>
      {!isLoginRoute && (
        <aside className={`w-64 bg-slate-800/30 ${isRTL ? 'border-l' : 'border-r'} border-slate-700 p-6 hidden md:flex md:flex-col`}>
          <div className="text-xl font-bold mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">G</div>
            <span>Syndic <span className="text-indigo-500">Gravity</span></span>
          </div>
          <nav className="flex-1">
            <ul className="space-y-2">
      <SidebarLink to="/" label={t("Dashboard")} icon={<TrendingUp size={18} />} />
      <SidebarLink to="/residents" label={t("Residents")} icon={<UsersIcon size={18} />} />
      <SidebarLink to="/revenus" label={t("Cotisations")} icon={<CheckCircle size={18} />} />
      <SidebarLink to="/extra" label={t("Autres Revenus")} icon={<TrendingUp size={18} />} />
      <SidebarLink to="/expenses" label={t("Dépenses")} icon={<XCircle size={18} />} />
      <SidebarLink to="/repairs" label={t("Réparations")} icon={<Settings size={18} />} />
      <SidebarLink to="/maintenance" label={t("Maintenance")} icon={<Bell size={18} />} />
      <SidebarLink to="/voting" label={t("Votes & Décisions")} icon={<ShieldCheck size={18} />} />
      <SidebarLink to="/bilan" label={t("Bilan Annuel")} icon={<TrendingUp size={18} />} />
      <hr className="border-slate-700/50 my-4" />
      <SidebarLink to="/users" label={t("Utilisateurs")} icon={<UsersIcon size={18} />} />
      <SidebarLink to="/admin" label={t("Administration")} icon={<ShieldCheck size={18} />} />
    </ul>
          </nav>

          <div className="pt-4 border-t border-slate-700 mt-4">
            <button
              onClick={toggleLang}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-slate-300 hover:text-white font-semibold transition-all duration-200 group"
            >
              <Languages size={20} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <span className="text-sm tracking-wide">
                {lang === 'fr' ? 'العربية' : 'Français'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-indigo-300 transition-colors">
                {lang === 'fr' ? 'AR' : 'FR'}
              </span>
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/residents" element={<Residents />} />
          <Route path="/revenus" element={<Revenus />} />
          <Route path="/extra" element={<ExtraRevenus />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/bilan" element={<AnnualBilan />} />
          <Route path="/repairs" element={<Repairs />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </main>
    </div>
  );
};

const SidebarLink = ({ to, label, icon }: { to: string, label: string, icon?: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <li>
      <Link 
        to={to} 
        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
          isActive 
            ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        {icon && <span className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}>{icon}</span>}
        <span>{label}</span>
      </Link>
    </li>
  );
};

export default App;
