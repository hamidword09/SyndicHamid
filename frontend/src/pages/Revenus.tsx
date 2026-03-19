import { useState, useEffect } from 'react';
import api, { getRevenus } from '../services/api';
import { Plus, Search, RefreshCcw, CheckCircle2, XCircle, Edit3, Trash2, History } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const Revenus = () => {
    const { t } = useLang();
    const [revenus, setRevenus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEntry, setNewEntry] = useState({
        apt: '',
        owner: '',
        amount: '',
        month: new Date().getMonth().toString(),
        year: new Date().getFullYear().toString(),
        status: 'unpaid'
    });

    const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    const fetchRevenus = async () => {
        setLoading(true);
        try {
            const data = await getRevenus();
            setRevenus(data);
        } catch (error) {
            console.error("Error fetching revenus:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenus();
    }, []);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                apt: newEntry.apt,
                amount: parseFloat(newEntry.amount),
                month_year: `${newEntry.month.padStart(2, '0')}-${newEntry.year}`,
                status: newEntry.status === 'paid' ? 'Paid' : 'Unpaid',
                // For now we map logic, real DB might need resident_id
            };
            await api.post('/revenus', payload);
            setShowAddForm(false);
            fetchRevenus();
            setNewEntry({ ...newEntry, apt: '', amount: '' });
        } catch (error) {
            alert("Erreur lors de l'ajout");
        }
    };

    const filteredRevenus = revenus.filter(r => 
        (r.apt && r.apt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.resident_id && r.resident_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t("Suivi des Cotisations")}</h1>
                    <p className="text-slate-400 mt-1">{t("Gestion des paiements mensuels")}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => fetchRevenus()}
                        className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={20} />
                        <span>{t("Ajouter")}</span>
                    </button>
                </div>
            </header>

            {/* Search and Filters */}
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

            {/* Table */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">{t("Appartement")}</th>
                            <th className="px-6 py-4 font-semibold">{t("Montant")}</th>
                            <th className="px-6 py-4 font-semibold">{t("Mois")}</th>
                            <th className="px-6 py-4 font-semibold">{t("Statut")}</th>
                            <th className="px-6 py-4 font-semibold text-right">{t("Actions")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 text-slate-300">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">{t("Chargement...")}</td></tr>
                        ) : filteredRevenus.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">{t("Aucun résident trouvé.")}</td></tr>
                        ) : (
                            filteredRevenus.map((rev) => (
                                <tr key={rev.id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-700/50 text-slate-200 px-3 py-1 rounded-lg text-sm font-medium border border-slate-600">
                                            {rev.apt || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-white">
                                        {rev.amount} MAD
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {rev.month_year}
                                    </td>
                                    <td className="px-6 py-4">
                                        {rev.status === 'Paid' ? (
                                            <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium bg-emerald-400/10 px-3 py-1 rounded-full w-fit">
                                                <CheckCircle2 size={14} />
                                                {t("Payé")}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-amber-400 text-sm font-medium bg-amber-400/10 px-3 py-1 rounded-full w-fit">
                                                <XCircle size={14} />
                                                {t("Non Payé")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Historique">
                                                <History size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors" title="Modifier">
                                                <Edit3 size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-400 transition-colors" title="Supprimer">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Modal Placeholder */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{t("Ajouter")}</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white"><Plus size={24} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Appartement")}</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={newEntry.apt}
                                    onChange={e => setNewEntry({...newEntry, apt: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Montant (MAD)")}</label>
                                <input 
                                    type="number" required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={newEntry.amount}
                                    onChange={e => setNewEntry({...newEntry, amount: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Mois")}</label>
                                    <select 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                        value={newEntry.month}
                                        onChange={e => setNewEntry({...newEntry, month: e.target.value})}
                                    >
                                        {months.map((m, i) => <option key={i} value={i+1}>{t(m)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Année")}</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                        value={newEntry.year}
                                        onChange={e => setNewEntry({...newEntry, year: e.target.value})}
                                    />
                                </div>
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

export default Revenus;
