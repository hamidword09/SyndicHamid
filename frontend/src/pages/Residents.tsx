import { useState, useEffect } from 'react';
import { getResidents, createResident, deleteResident } from '../services/api';
import { UserPlus, Search, RefreshCcw, Phone, Mail, Trash2, Edit3 } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const Residents = () => {
    const { t } = useLang();
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [newResident, setNewResident] = useState({
        name: '',
        apt: '',
        phone: '',
        email: '',
        type: 'Propriétaire Résident',
        contribution: '100'
    });

    const fetchResidents = async () => {
        setLoading(true);
        try {
            const data = await getResidents();
            setResidents(data || []);
        } catch (error) {
            console.error("Error fetching residents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createResident(newResident);
            setShowAddForm(false);
            setNewResident({ name: '', apt: '', phone: '', email: '', type: 'Propriétaire Résident', contribution: '100' });
            fetchResidents();
        } catch (error) {
            alert(t("Erreur lors de l'ajout"));
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t("Supprimer ce résident ?"))) {
            try {
                await deleteResident(id);
                fetchResidents();
            } catch (error) {
                alert(t("Erreur lors de la suppression"));
            }
        }
    };

    const filteredResidents = residents.filter(res => 
        (res.name && res.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (res.apt && res.apt.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t("Gestion des Propriétaires")}</h1>
                    <p className="text-slate-400 mt-1">{t("Consultez et gérez la liste des résidents")}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => fetchResidents()}
                        className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <UserPlus size={20} />
                        <span>{t("Nouveau Propriétaire")}</span>
                    </button>
                </div>
            </header>

            <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder={t("Rechercher par nom ou appartement...")}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic">{t("Chargement des résidents...")}</div>
                ) : filteredResidents.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic">{t("Aucun résident trouvé.")}</div>
                ) : (
                    filteredResidents.map((res) => (
                        <div key={res.id} className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                                    {res.apt || "Apt ??"}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDelete(res.id)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-400"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-1">{res.name}</h3>
                            <p className="text-slate-500 text-sm mb-4">{t(res.type || "Résident")}</p>
                            
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Phone size={16} className="text-slate-600" />
                                    <span>{res.phone || t("Non renseigné")}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Mail size={16} className="text-slate-600" />
                                    <span className="truncate">{res.email || t("Non renseigné")}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-700/50 mt-4 flex justify-between items-center">
                                    <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">{t("Cotisation")}</span>
                                    <span className="text-white font-bold">{res.contribution || "100"} MAD</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{t("Nouveau Propriétaire")}</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white"><Trash2 size={24} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Nom Complet")}</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    value={newResident.name}
                                    onChange={e => setNewResident({...newResident, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Appartement")}</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                        value={newResident.apt}
                                        onChange={e => setNewResident({...newResident, apt: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Cotisation (MAD)")}</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                        value={newResident.contribution}
                                        onChange={e => setNewResident({...newResident, contribution: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Téléphone")}</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                    value={newResident.phone}
                                    onChange={e => setNewResident({...newResident, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{t("Type Résident")}</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none"
                                    value={newResident.type}
                                    onChange={e => setNewResident({...newResident, type: e.target.value})}
                                >
                                    <option value="Propriétaire Résident">{t("Propriétaire Résident")}</option>
                                    <option value="Propriétaire Non-Résident">{t("Propriétaire Non-Résident")}</option>
                                    <option value="Locataire">{t("Locataire")}</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">{t("Annuler")}</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors">{t("Enregistrer")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Residents;
