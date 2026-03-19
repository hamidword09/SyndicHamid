import { useState, useEffect } from 'react';
import { getBilanStats } from '../services/api';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, RefreshCcw, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const AnnualBilan = () => {
    const { t } = useLang();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await getBilanStats();
            setStats(data);
        } catch (error) {
            console.error("Error fetching bilan stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] text-slate-500 italic">
            <RefreshCcw className="animate-spin mr-2" size={20} />
            {t("Chargement...")}
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">{t("Récapitulatif Annuel")}</h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Calendar size={16} /> Statistiques globales de l'exercice 2026
                    </p>
                </div>
                <button 
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-200 hover:bg-slate-700 transition-all font-medium shadow-xl"
                >
                    <RefreshCcw size={18} />
                    <span>{t("Actualiser les chiffres")}</span>
                </button>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title={t("Total Revenus")} 
                    amount={stats?.total_revenue} 
                    icon={<TrendingUp className="text-emerald-400" />} 
                    color="emerald"
                    subtitle={t("Cotisations + Autres")}
                />
                <StatCard 
                    title={t("Total Dépenses")} 
                    amount={stats?.total_expenses} 
                    icon={<TrendingDown className="text-rose-400" />} 
                    color="rose"
                    subtitle={t("Maintenance, Factures, etc.")}
                />
                <StatCard 
                    title={t("Solde Actuel")} 
                    amount={stats?.balance} 
                    icon={<DollarSign className="text-indigo-400" />} 
                    color="indigo"
                    subtitle={t("Fonds disponibles")}
                />
                <StatCard 
                    title={t("Rentabilité")} 
                    amount={stats?.total_revenue > 0 ? Math.round((stats?.balance / stats?.total_revenue) * 100) : 0} 
                    isPercent={true}
                    icon={<PieChart className="text-amber-400" />} 
                    color="amber"
                    subtitle={t("Marge brute")}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl p-8 shadow-inner">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Layers size={20} className="text-indigo-500" />
                            {t("Répartition des Sources")}
                        </h2>
                        
                        <div className="space-y-8">
                            <ProgressBar 
                                label={t("Cotisations Résidents")} 
                                value={stats?.total_cotisations} 
                                total={stats?.total_revenue} 
                                color="bg-indigo-500" 
                                icon={<ArrowUpRight size={14} />}
                            />
                            <ProgressBar 
                                label={t("Autres Revenus (Extras)")} 
                                value={stats?.total_extra} 
                                total={stats?.total_revenue} 
                                color="bg-emerald-500" 
                                icon={<ArrowUpRight size={14} />}
                            />
                            <div className="pt-4 border-t border-slate-700/50">
                                <ProgressBar 
                                    label={t("Dépenses cumulées")} 
                                    value={stats?.total_expenses} 
                                    total={stats?.total_revenue} 
                                    color="bg-rose-500" 
                                    icon={<ArrowDownRight size={14} />}
                                    isExpense={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Advice Card */}
                <div className="bg-gradient-to-br from-slate-800 to-indigo-900/40 border border-indigo-500/20 rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
                            <RefreshCcw size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">{t("Analyse de Santé")}</h3>
                        <p className="text-slate-300 leading-relaxed mb-6">
                            {stats?.balance > 0 
                                ? "La situation financière de la copropriété est saine. Vous disposez d'un excédent qui peut être alloué aux fonds de réparation ou à l'embellissement."
                                : "Attention : les dépenses sont supérieures ou égales aux revenus. Il est conseillé de revoir les cotisations ou de réduire les charges non essentielles."
                            }
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{t("Ratio d'épargne")}</div>
                        <div className="text-3xl font-black text-white">
                            {stats?.total_revenue > 0 ? Math.round((stats?.balance / stats?.total_revenue) * 100) : 0}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, amount, icon, color, subtitle, isPercent = false }: any) => {
    const colorClasses: any = {
        emerald: "border-emerald-500/20 bg-emerald-500/5",
        rose: "border-rose-500/20 bg-rose-500/5",
        indigo: "border-indigo-500/20 bg-indigo-500/5",
        amber: "border-amber-500/20 bg-amber-500/5"
    };

    return (
        <div className={`p-6 border rounded-3xl transition-all hover:scale-[1.02] shadow-xl ${colorClasses[color]}`}>
            <div className="flex justify-between items-start mb-4">
                <span className="p-2.5 bg-slate-900/50 rounded-xl">{icon}</span>
                <span className="text-[10px] uppercase font-black tracking-tighter text-slate-500">2026</span>
            </div>
            <div className="text-2xl font-black text-white truncate">
                {isPercent ? `${amount}%` : `${amount?.toLocaleString()} MAD`}
            </div>
            <div className="text-sm font-bold text-slate-200 mt-1">{title}</div>
            <div className="text-xs text-slate-500 mt-3">{subtitle}</div>
        </div>
    );
};

const ProgressBar = ({ label, value, total, color, icon, isExpense = false }: any) => {
    const { t } = useLang();
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-2.5">
                <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    {icon} {label}
                </span>
                <span className={`text-sm font-black ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {value?.toLocaleString()} MAD
                </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                    className={`h-full ${color} transition-all duration-1000 ease-out rounded-full shadow-[0_0_12px_rgba(0,0,0,0.5)]`} 
                    style={{ width: `${Math.min(100, percentage)}%` }}
                ></div>
            </div>
            <div className="mt-1.5 text-right text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                {Math.round(percentage)}% {t("du total")}
            </div>
        </div>
    );
};

export default AnnualBilan;
