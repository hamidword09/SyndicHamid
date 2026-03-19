import { useState, useEffect } from 'react';
import { getExpenses, createExpense, deleteExpense } from '../services/api';
import { Plus, Search, RefreshCcw, Zap, Sparkles, Wrench, Package, Trash2, Edit3, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const Expenses = () => {
    const { t } = useLang();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);

    const [newExpense, setNewExpense] = useState({
        title: '',
        provider: '',
        category: 'electricity',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categoryInfo: any = {
        electricity: { icon: <Zap size={20} />, color: 'text-amber-400', bg: 'bg-amber-400/10', label: t('Électricité') },
        cleaning: { icon: <Sparkles size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: t('Nettoyage') },
        maintenance: { icon: <Wrench size={20} />, color: 'text-blue-400', bg: 'bg-blue-400/10', label: t('Maintenance') },
        diverse: { icon: <Package size={20} />, color: 'text-slate-400', bg: 'bg-slate-400/10', label: t('Divers') }
    };

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await getExpenses();
            setExpenses(data || []);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createExpense({
                ...newExpense,
                amount: parseFloat(newExpense.amount)
            });
            setShowAddForm(false);
            setNewExpense({
                title: '',
                provider: '',
                category: 'electricity',
                amount: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchExpenses();
        } catch (error) {
            alert(t("Erreur lors de l'ajout"));
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t("Supprimer ce résident ?"))) {
            try {
                await deleteExpense(id);
                fetchExpenses();
            } catch (error) {
                alert(t("Erreur lors de la suppression"));
            }
        }
    };

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             exp.provider?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || exp.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t("Gestion des Dépenses")}</h1>
                    <p className="text-slate-400 mt-1">{t("Suivez et catégorisez vos dépenses")}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => fetchExpenses()}
                        className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-rose-500/20"
                    >
                        <Plus size={20} />
                        <span>{t("Nouvelle Dépense")}</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder={t("Rechercher par nom ou appartement...")}
                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'electricity', 'cleaning', 'maintenance', 'diverse'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                activeFilter === cat 
                                ? 'bg-rose-600/10 border-rose-500 text-rose-400' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            {cat === 'all' ? t('Toutes') : categoryInfo[cat].label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center text-slate-500 italic">{t("Chargement...")}</div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 italic bg-slate-800/20 border border-slate-700/50 rounded-3xl">{t("Aucun résident trouvé.")}</div>
                ) : (
                    filteredExpenses.map((exp) => (
                        <div key={exp.id} className="bg-slate-800/30 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-all group flex items-center gap-6">
                            <div className={`p-4 rounded-xl ${categoryInfo[exp.category]?.bg || 'bg-slate-700/50'} ${categoryInfo[exp.category]?.color || 'text-slate-400'}`}>
                                {categoryInfo[exp.category]?.icon || <Package size={20} />}
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">{exp.title}</h3>
                                <div className="flex gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><RefreshCcw size={14} className="rotate-45" /> {exp.date}</span>
                                    <span className="flex items-center gap-1.5"><ImageIcon size={14} /> {exp.provider || 'Fournisseur inconnu'}</span>
                                </div>
                            </div>

                            {exp.receipt_url && (
                                <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs text-slate-400 group-hover:text-white transition-colors">
                                    <ImageIcon size={14} />
                                    <span>Justificatif</span>
                                    <ExternalLink size={12} />
                                </div>
                            )}

                            <div className="text-xl font-black text-rose-400 px-6">
                                - {exp.amount} MAD
                            </div>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2 border-l border-slate-700/50 pl-4">
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Edit3 size={18} /></button>
                                <button onClick={() => handleDelete(exp.id)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-400"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{t("Nouvelle Dépense")}</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white"><Plus size={24} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Titre")}</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-rose-500/50 outline-none"
                                    value={newExpense.title}
                                    onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Fournisseur")}</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                    value={newExpense.provider}
                                    onChange={e => setNewExpense({...newExpense, provider: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Catégorie")}</label>
                                    <select 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                        value={newExpense.category}
                                        onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                                    >
                                        <option value="electricity">{t("Électricité")}</option>
                                        <option value="cleaning">{t("Nettoyage")}</option>
                                        <option value="maintenance">{t("Maintenance")}</option>
                                        <option value="diverse">{t("Divers")}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Date")}</label>
                                    <input 
                                        type="date" required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                        value={newExpense.date}
                                        onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Montant (MAD)")}</label>
                                <input 
                                    type="number" required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                    value={newExpense.amount}
                                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">{t("Annuler")}</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-colors">{t("Enregistrer")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
