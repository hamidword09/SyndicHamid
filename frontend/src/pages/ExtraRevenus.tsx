import { useState, useEffect } from 'react';
import { getExtraRevenues, createExtraRevenue, deleteExtraRevenue } from '../services/api';
import { Plus, Search, RefreshCcw, Home, Heart, TrendingUp, Package, Trash2, Edit3, User } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const ExtraRevenus = () => {
    const { t } = useLang();
    const [revenues, setRevenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const [newRevenue, setNewRevenue] = useState({
        title: '',
        payer: '',
        category: 'rent',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categoryIcons: any = {
        rent: <Home size={20} />,
        donation: <Heart size={20} />,
        interest: <TrendingUp size={20} />,
        other: <Package size={20} />
    };

    const fetchRevenues = async () => {
        setLoading(true);
        try {
            const data = await getExtraRevenues();
            setRevenues(data || []);
        } catch (error) {
            console.error("Error fetching extra revenues:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenues();
    }, []);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createExtraRevenue({
                ...newRevenue,
                amount: parseFloat(newRevenue.amount)
            });
            setShowAddForm(false);
            setNewRevenue({
                title: '',
                payer: '',
                category: 'rent',
                amount: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchRevenues();
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message;
            alert(t("Erreur lors de l'ajout") + " : " + msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t("Supprimer ce résident ?"))) {
            try {
                await deleteExtraRevenue(id);
                fetchRevenues();
            } catch (error: any) {
                const msg = error.response?.data?.error || error.message;
                alert(t("Erreur lors de la suppression") + " : " + msg);
            }
        }
    };

    const filteredRevenues = revenues.filter(rev => 
        rev.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        rev.payer?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t("Autres Sources de Revenus")}</h1>
                    <p className="text-slate-400 mt-1">{t("Gérez les revenus hors cotisations")}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => fetchRevenues()}
                        className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={20} />
                        <span>{t("Nouveau Revenu")}</span>
                    </button>
                </div>
            </header>

            <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder={t("Rechercher par nom ou appartement...")}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center text-slate-500 italic">{t("Chargement...")}</div>
                ) : filteredRevenues.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 italic bg-slate-800/20 border border-slate-700/50 rounded-3xl">{t("Aucun résident trouvé.")}</div>
                ) : (
                    filteredRevenues.map((rev) => (
                        <div key={rev.id} className="bg-slate-800/30 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-all group flex items-center gap-6">
                            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400">
                                {categoryIcons[rev.category] || <Package size={20} />}
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">{rev.title}</h3>
                                <div className="flex gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><TrendingUp size={14} className="rotate-45" /> {rev.date}</span>
                                    <span className="flex items-center gap-1.5"><User size={14} /> {rev.payer || '-'}</span>
                                </div>
                            </div>

                            <div className="text-xl font-black text-emerald-400 px-6">
                                + {rev.amount} MAD
                            </div>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2 border-l border-slate-700/50 pl-4">
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Edit3 size={18} /></button>
                                <button onClick={() => handleDelete(rev.id)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-400"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{t("Nouveau Revenu")}</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white"><Plus size={24} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Titre / Source")}</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={newRevenue.title}
                                    onChange={e => setNewRevenue({...newRevenue, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Payeur / Client")}</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                    value={newRevenue.payer}
                                    onChange={e => setNewRevenue({...newRevenue, payer: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Catégorie")}</label>
                                    <select 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                        value={newRevenue.category}
                                        onChange={e => setNewRevenue({...newRevenue, category: e.target.value})}
                                    >
                                        <option value="rent">{t("Location")}</option>
                                        <option value="donation">{t("Don")}</option>
                                        <option value="interest">{t("Intérêts")}</option>
                                        <option value="other">{t("Autre")}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Date")}</label>
                                    <input 
                                        type="date" required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                        value={newRevenue.date}
                                        onChange={e => setNewRevenue({...newRevenue, date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Montant (MAD)")}</label>
                                <input 
                                    type="number" required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                    value={newRevenue.amount}
                                    onChange={e => setNewRevenue({...newRevenue, amount: e.target.value})}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">{t("Annuler")}</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">{t("Enregistrer")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExtraRevenus;
