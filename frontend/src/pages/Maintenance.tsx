import { useState, useEffect } from 'react';
import { getMaintenance, createMaintenance, updateMaintenanceStatus, getResidents } from '../services/api';
import { 
    Wrench, 
    Plus, 
    Search, 
    RefreshCcw, 
    Clock, 
    User, 
    Calendar, 
    MoreVertical,
    CheckCircle2,
    PlayCircle,
    AlertCircle
} from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const Maintenance = () => {
    const { t } = useLang();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [residents, setResidents] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newTicket, setNewTicket] = useState({
        title: '',
        category: 'Plomberie',
        description: '',
        resident_id: ''
    });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await getMaintenance();
            setTickets(data || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchResidents = async () => {
        try {
            const data = await getResidents();
            setResidents(data || []);
        } catch (error) {
            console.error("Error fetching residents:", error);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchResidents();
    }, []);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMaintenance(newTicket);
            setShowAddForm(false);
            setNewTicket({ title: '', category: 'Plomberie', description: '', resident_id: '' });
            fetchTickets();
        } catch (error) {
            alert(t("Erreur lors de l'ajout"));
        }
    };

    const handleStatusChange = async (id: string, currentStatus: string) => {
        const statusFlow: any = {
            'pending': 'in-progress',
            'in-progress': 'resolved',
            'resolved': 'pending'
        };
        const nextStatus = statusFlow[currentStatus];
        try {
            await updateMaintenanceStatus(id, nextStatus);
            fetchTickets();
        } catch (error) {
            alert(t("Erreur lors de la suppression"));
        }
    };

    const filteredTickets = tickets.filter(t => 
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'in-progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-700 text-slate-400 border-slate-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return t('En attente');
            case 'in-progress': return t('En cours');
            case 'resolved': return t('Résolu');
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={14} />;
            case 'in-progress': return <PlayCircle size={14} />;
            case 'resolved': return <CheckCircle2 size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Wrench className="text-indigo-500" size={36} />
                        {t("Maintenance")}
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Signalez et suivez les interventions de l'immeuble.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => fetchTickets()}
                        className="p-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:bg-slate-700 transition-all shadow-xl"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-500/20"
                    >
                        <Plus size={20} />
                        <span>{t("Signaler un problème")}</span>
                    </button>
                </div>
            </header>

            <div className="bg-slate-800/20 border border-slate-700/30 p-4 rounded-3xl flex items-center gap-4 lg:max-w-md">
                <Search size={20} className="text-slate-500 ml-2" />
                <input 
                    type="text" 
                    placeholder="Rechercher un ticket ou ID..." 
                    className="bg-transparent border-none text-white focus:ring-0 w-full placeholder:text-slate-600 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic animate-pulse">{t("Chargement...")}</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic bg-slate-800/10 border border-slate-700/30 rounded-[3rem]">
                        Aucun ticket trouvé.
                    </div>
                ) : (
                    filteredTickets.map((t) => (
                        <div key={t.id} className="group bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8 flex flex-col h-full hover:bg-slate-800/60 transition-all border-b-4 border-b-transparent hover:border-b-indigo-500">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t.ticket_id}</span>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(t.status)}`}>
                                    {getStatusIcon(t.status)}
                                    {getStatusLabel(t.status)}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-white mb-4 leading-tight group-hover:text-indigo-400 transition-colors">
                                <span className="text-slate-500 font-bold mr-2">[{t.category}]</span>
                                {t.title}
                            </h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="p-2 bg-slate-900 rounded-lg"><User size={14} /></div>
                                    <span className="font-medium">{t.residents?.name || "Anonyme"} ({t.residents?.apt || "N/A"})</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="p-2 bg-slate-900 rounded-lg"><Calendar size={14} /></div>
                                    <span className="font-medium">{new Date(t.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 p-5 rounded-2xl mb-8 flex-1">
                                <p className="text-slate-300 text-sm leading-relaxed italic line-clamp-4">
                                    "{t.description}"
                                </p>
                            </div>

                            <div className="mt-auto pt-6 border-top border-slate-700/50 flex justify-between items-center">
                                <button 
                                    onClick={() => handleStatusChange(t.id, t.status)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-indigo-600/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700 hover:border-indigo-500/50"
                                >
                                    <RefreshCcw size={14} className="text-indigo-400" />
                                    {t("Mettre à jour")}
                                </button>
                                <button className="p-2 text-slate-600 hover:text-white transition-colors">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden scale-in">
                        <div className="px-10 py-8 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t("Signaler un problème")}</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white transition-colors"><Plus size={32} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-10 space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Titre de l'urgence")}</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="Ex: Panne de lumière couloir"
                                        value={newTicket.title}
                                        onChange={e => setNewTicket({...newTicket, title: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Catégorie")}</label>
                                        <select 
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                                            value={newTicket.category}
                                            onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                                        >
                                            <option value="Plomberie">Plomberie</option>
                                            <option value="Électricité">Électricité</option>
                                            <option value="Ascenseur">Ascenseur</option>
                                            <option value="Parties Communes">Parties Communes</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Signaler par (Optionnel)")}</label>
                                        <select 
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                                            value={newTicket.resident_id}
                                            onChange={e => setNewTicket({...newTicket, resident_id: e.target.value})}
                                        >
                                            <option value="">{t("Sélectionner résident")}</option>
                                            {residents.map(r => <option key={r.id} value={r.id}>{r.name} ({r.apt})</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Description détaillée")}</label>
                                    <textarea 
                                        required rows={4}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
                                        placeholder="Décrivez précisément le problème et sa localisation..."
                                        value={newTicket.description}
                                        onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors">{t("Annuler")}</button>
                                <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-indigo-500/20">{t("Envoyer le ticket")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
