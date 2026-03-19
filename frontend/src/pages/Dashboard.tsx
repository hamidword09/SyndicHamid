import { useEffect, useState } from 'react';
import { getBilanStats } from '../services/api';
import { useLang } from '../i18n/LangContext';
import { 
    Users, 
    Wallet, 
    TrendingUp, 
    TrendingDown, 
    PlusCircle, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    AlertCircle,
    ChevronRight,
    Zap,
    Sparkles,
    Wrench,
    Package,
    Coins
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { t } = useLang();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getBilanStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] text-slate-500 italic animate-pulse font-medium">
            {t("Initialisation du dashboard...")}
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Hero Section with Glassmorphism */}
            <header className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{t("Bonjour, Admin !")}</h1>
                        <p className="text-indigo-100/80 text-lg font-medium">{t("Votre copropriété se porte bien aujourd'hui.")}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-center min-w-[200px]">
                        <p className="text-xs uppercase font-black text-indigo-200 tracking-widest mb-1">{t("Balance Globale")}</p>
                        <p className="text-3xl font-black text-white">{stats?.balance?.toLocaleString()} MAD</p>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard 
                    title={t("Résidents")} 
                    value={stats?.residents_count} 
                    icon={<Users size={24} />} 
                    color="indigo" 
                    trend={t("+2 ce mois")}
                />
                <ModernStatCard 
                    title={t("Revenus")} 
                    value={`${stats?.total_revenue?.toLocaleString()} MAD`} 
                    icon={<TrendingUp size={24} />} 
                    color="emerald" 
                    trend={t("En hausse")}
                />
                <ModernStatCard 
                    title={t("Dépenses")} 
                    value={`${stats?.total_expenses?.toLocaleString()} MAD`} 
                    icon={<TrendingDown size={24} />} 
                    color="rose" 
                    trend={t("À surveiller")}
                />
                <ModernStatCard 
                    title={t("Cotisations")} 
                    value={`${stats?.total_cotisations?.toLocaleString()} MAD`} 
                    icon={<Coins size={24} />} 
                    color="amber" 
                    trend={t("85% payés")}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Clock className="text-indigo-500" size={24} />
                            {t("Activités Récentes")}
                        </h2>
                        <Link to="/expenses" className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1 transition-colors">
                            {t("Voir tout")} <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {stats?.recent_expenses?.slice(0, 3).map((exp: any) => (
                            <ActivityItem 
                                key={exp.id}
                                title={exp.title}
                                category={exp.category}
                                amount={exp.amount}
                                date={exp.date}
                                isExpense={true}
                            />
                        ))}
                        {stats?.recent_extras?.slice(0, 2).map((rev: any) => (
                            <ActivityItem 
                                key={rev.id}
                                title={rev.title}
                                category={rev.category}
                                amount={rev.amount}
                                date={rev.date}
                                isExpense={false}
                            />
                        ))}
                        {(!stats?.recent_expenses?.length && !stats?.recent_extras?.length) && (
                            <div className="p-10 text-center text-slate-500 italic bg-slate-800/20 rounded-3xl border border-slate-700/30">
                                {t("Aucune activité récente à afficher.")}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions and Tips */}
                <div className="space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2rem] p-8">
                        <h2 className="text-xl font-bold text-white mb-6">{t("Actions Rapides")}</h2>
                        <div className="space-y-3">
                            <QuickActionBtn to="/revenus" label={t("Encaisser une cotisation")} icon={<ArrowUpRight size={18} />} color="bg-emerald-500" />
                            <QuickActionBtn to="/expenses" label={t("Enregistrer une dépense")} icon={<ArrowDownRight size={18} />} color="bg-rose-500" />
                            <QuickActionBtn to="/residents" label={t("Ajouter un résident")} icon={<PlusCircle size={18} />} color="bg-indigo-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-[2rem] p-8">
                        <div className="flex items-center gap-3 mb-4 text-amber-500">
                            <AlertCircle size={24} />
                            <h3 className="font-bold">{t("Astuce Syndic")}</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Pensez à régulariser les cotisations en attente pour le mois de Mars. 
                            <strong> 3 résidents </strong> n'ont pas encore payé.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ModernStatCard = ({ title, value, icon, color, trend }: any) => {
    const { t } = useLang();
    const colorMap: any = {
        indigo: "text-indigo-400 bg-indigo-400/10 border-indigo-500/20",
        emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20",
        rose: "text-rose-400 bg-rose-400/10 border-rose-500/20",
        amber: "text-amber-400 bg-amber-400/10 border-amber-500/20",
    };

    return (
        <div className="group bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2rem] hover:bg-slate-800/50 hover:border-slate-600 transition-all cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
                    {icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
                    {t("Détails")}
                </span>
            </div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">{title}</h3>
            <p className="text-2xl font-black text-white mt-1">{value}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                <span className={`px-2 py-0.5 rounded-full ${colorMap[color]}`}>{trend}</span>
            </div>
        </div>
    );
};

const ActivityItem = ({ title, category, amount, date, isExpense }: any) => {
    const icons: any = {
        electricity: <Zap size={18} />,
        cleaning: <Sparkles size={18} />,
        maintenance: <Wrench size={18} />,
        rent: <Package size={18} />,
        default: <Wallet size={18} />
    };

    return (
        <div className="flex items-center gap-4 p-5 bg-slate-800/20 border border-slate-700/30 rounded-[1.5rem] hover:border-slate-600/50 transition-colors">
            <div className={`p-3 rounded-xl ${isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {icons[category] || icons.default}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-100">{title}</h4>
                <p className="text-xs text-slate-500 font-medium">{date}</p>
            </div>
            <div className={`text-lg font-black ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isExpense ? '-' : '+'} {amount?.toLocaleString()} MAD
            </div>
        </div>
    );
};

const QuickActionBtn = ({ to, label, icon, color }: any) => (
    <Link to={to} className="group flex items-center gap-3 w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all">
        <div className={`p-2 rounded-lg text-white shadow-lg ${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </Link>
);

export default Dashboard;
