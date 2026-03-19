import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Languages } from 'lucide-react';
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
              <SidebarLink to="/" label={t("Dashboard")} />
              <SidebarLink to="/residents" label={t("Residents")} />
              <SidebarLink to="/revenus" label={t("Cotisations")} />
              <SidebarLink to="/extra" label={t("Autres Revenus")} />
              <SidebarLink to="/expenses" label={t("Dépenses")} />
              <SidebarLink to="/repairs" label={t("Réparations")} />
              <SidebarLink to="/maintenance" label={t("Maintenance")} />
              <SidebarLink to="/voting" label={t("Votes & Décisions")} />
              <SidebarLink to="/bilan" label={t("Bilan Annuel")} />
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
        </Routes>
      </main>
    </div>
  );
};

const SidebarLink = ({ to, label }: { to: string, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <li>
      <Link 
        to={to} 
        className={`block p-3 rounded-xl transition-all ${
          isActive 
            ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        {label}
      </Link>
    </li>
  );
};

export default App;
