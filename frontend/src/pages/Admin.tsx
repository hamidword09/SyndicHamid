import { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Bell, 
  QrCode, 
  BrainCircuit, 
  TrendingUp, 
  AlertCircle,
  RefreshCcw,
  Smartphone,
  Apple,
  Play
} from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const Admin = () => {
    const { t } = useLang();
    const [autoReminders, setAutoReminders] = useState(true);
    const [qrEnabled, setQrEnabled] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const [approvals, setApprovals] = useState([
        { id: 1, name: 'M. Yassine Mansouri', apt: 'Apt 42', email: 'yassine.m@email.com', phone: '+212 661 XX XX XX', type: 'Nouveau Résident' },
        { id: 2, name: 'Mme. Fatima Zahra', apt: 'Apt 15', email: 'f.zahra@email.com', phone: '+212 662 XX XX XX', type: 'Locataire' },
        { id: 3, name: 'M. Omar Kadiri', apt: 'Apt 03', email: 'o.kadiri@gmail.com', phone: '+212 663 XX XX XX', type: 'Propriétaire' },
    ]);

    const handleApprove = (id: number) => {
        setApprovals(prev => prev.filter(a => a.id !== id));
        // In a real app, this would call an API
    };

    const handleReject = (id: number) => {
        if (window.confirm(t("Voulez-vous vraiment refuser cette inscription ?"))) {
            setApprovals(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleSync = () => {
        setSyncing(true);
        setTimeout(() => setSyncing(false), 1500);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="text-indigo-500" size={32} />
                        {t("Contrôle Administrateur")}
                    </h1>
                    <p className="text-slate-400 mt-1">{t("Sécurité & Gestion des accès")}</p>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
                    <p className="text-slate-400 text-sm mb-2">{t("Inscriptions en attente")}</p>
                    <div className="text-3xl font-bold text-white">{approvals.length}</div>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
                    <p className="text-slate-400 text-sm mb-2">{t("Utilisateurs Actifs")}</p>
                    <div className="text-3xl font-bold text-white">24</div>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
                    <p className="text-slate-400 text-sm mb-2">{t("Sécurité")}</p>
                    <div className="text-xl font-bold text-emerald-400">{t("Optimale")}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Approval Queue */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {t("Inscriptions à approuver")}
                            {approvals.length > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {approvals.length} {t("nouveau")}
                                </span>
                            )}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {approvals.length === 0 ? (
                            <div className="col-span-full py-12 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl text-slate-500 italic">
                                {t("Aucune demande en attente")}
                            </div>
                        ) : (
                            approvals.map(req => (
                                <div key={req.id} className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl space-y-4 hover:border-slate-600 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
                                            {t(req.type)}
                                        </span>
                                        <span className="text-slate-500 text-sm font-medium">{req.apt}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{req.name}</h3>
                                        <p className="text-slate-400 text-xs mt-1">{req.email}</p>
                                        <p className="text-slate-500 text-xs">{req.phone}</p>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            onClick={() => handleApprove(req.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl text-sm font-bold transition-all"
                                        >
                                            <CheckCircle size={16} />
                                            {t("Accepter")}
                                        </button>
                                        <button 
                                            onClick={() => handleReject(req.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/10 rounded-xl text-sm font-bold transition-all"
                                        >
                                            <XCircle size={16} />
                                            {t("Refuser")}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Settings & Sidebar Stats */}
                <aside className="space-y-8">
                    {/* Advanced Settings */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/20">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Settings size={18} className="text-indigo-400" />
                                {t("Paramètres Avancés")}
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Bell size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm text-white font-medium">{t("Rappels Automatiques")}</p>
                                            <p className="text-[10px] text-slate-500">WhatsApp / Email</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setAutoReminders(!autoReminders)}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${autoReminders ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoReminders ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-500 italic">
                                    {t("Envoie un rappel chaque 5 du mois aux retardataires.")}
                                </p>
                            </div>

                            <hr className="border-slate-700/50" />

                            <div className="space-y-4 text-center">
                                <div className="flex items-center justify-between text-left">
                                    <div className="flex items-center gap-3">
                                        <QrCode size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm text-white font-medium">{t("Paiement par QR Code")}</p>
                                            <p className="text-[10px] text-slate-500">{t("RIB Résidence")}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setQrEnabled(!qrEnabled)}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${qrEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${qrEnabled ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                                
                                {qrEnabled && (
                                    <div className="bg-white p-3 rounded-xl inline-block mx-auto border-4 border-slate-800/50">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=RIB-MA64-0012-0000-0000-1234-5678-9012`} alt="QR Code" className="w-24 h-24" />
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleSync}
                                disabled={syncing}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                <RefreshCcw size={18} className={syncing ? 'animate-spin' : ''} />
                                {syncing ? t("Mise à jour...") : t("Synchroniser les services")}
                            </button>
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="bg-indigo-600 border border-indigo-500 rounded-[2rem] p-6 text-white relative overflow-hidden group shadow-xl shadow-indigo-500/20">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="relative z-10 space-y-4">
                            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                <BrainCircuit size={14} />
                                {t("Assistant Intelligent IA")}
                            </div>
                            <h3 className="text-xl font-black leading-tight">{t("Analyses & Insights")}</h3>
                            
                            <div className="space-y-3">
                                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl flex gap-3">
                                    <TrendingUp size={18} className="text-emerald-300 shrink-0" />
                                    <p className="text-xs leading-relaxed opacity-90">
                                        Les cotisations sont en hausse de <strong className="text-white">12%</strong> par rapport au mois dernier.
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl flex gap-3">
                                    <AlertCircle size={18} className="text-amber-300 shrink-0" />
                                    <p className="text-xs leading-relaxed opacity-90">
                                        La consommation d'électricité a augmenté. Vérifiez les minuteries.
                                    </p>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:shadow-white/20 transition-all active:scale-95">
                                {t("Générer un rapport IA")}
                            </button>
                        </div>
                    </div>

                    {/* Mobile App Promo */}
                    <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                <Smartphone className="text-indigo-400" size={20} />
                            </div>
                            <h4 className="text-white font-bold">{t("Application Mobile")}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            {t("Votre application est prête pour le mobile. Installez-la comme une 'Web App' sur iPhone & Android.")}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black hover:bg-slate-900 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] text-white font-bold cursor-pointer transition-colors">
                                <Apple size={14} />
                                App Store
                            </div>
                            <div className="bg-black hover:bg-slate-900 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] text-white font-bold cursor-pointer transition-colors">
                                <Play size={14} />
                                Play Store
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Admin;
