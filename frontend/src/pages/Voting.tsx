import { useState, useEffect } from 'react';
import { getPolls, createPoll, castVote, getResidents } from '../services/api';
import { 
    Vote, 
    Plus, 
    Search, 
    RefreshCcw, 
    Clock, 
    XCircle, 
    Users,
    ChevronRight
} from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const Voting = () => {
    const { t } = useLang();
    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [residents, setResidents] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock for demo: we allow choosing which resident is voting
    const [voterId, setVoterId] = useState('');

    const [newPoll, setNewPoll] = useState({
        title: '',
        description: '',
        expires_at: '',
        options: ['', '']
    });

    const fetchPolls = async () => {
        setLoading(true);
        try {
            const data = await getPolls();
            setPolls(data || []);
        } catch (error) {
            console.error("Error fetching polls:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchResidents = async () => {
        try {
            const data = await getResidents();
            setResidents(data || []);
            if (data?.length > 0) setVoterId(data[0].id);
        } catch (error) {
            console.error("Error fetching residents:", error);
        }
    };

    useEffect(() => {
        fetchPolls();
        fetchResidents();
    }, []);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPoll({
                ...newPoll,
                options: newPoll.options.filter(o => o.trim() !== '')
            });
            setShowAddForm(false);
            setNewPoll({ title: '', description: '', expires_at: '', options: ['', ''] });
            fetchPolls();
        } catch (error) {
            alert(t("Erreur lors de l'ajout"));
        }
    };

    const handleVote = async (pollId: string, optionId: string) => {
        if (!voterId) {
            alert("Veuillez sélectionner un votant (simulation)");
            return;
        }
        try {
            await castVote(pollId, optionId, voterId);
            fetchPolls();
        } catch (error: any) {
            alert(error.response?.data?.error || "Erreur lors du vote");
        }
    };

    const addOption = () => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    const updateOption = (index: number, val: string) => {
        const newOpts = [...newPoll.options];
        newOpts[index] = val;
        setNewPoll({ ...newPoll, options: newOpts });
    };

    const filteredPolls = polls.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Vote className="text-indigo-500" size={36} />
                        {t("Votes & Décisions")}
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Participez activement aux choix de votre copropriété.</p>
                </div>
                <div className="flex gap-4">
                    {/* User selection simulation */}
                    <div className="bg-slate-800 p-2 rounded-2xl flex items-center gap-3 border border-slate-700">
                      <span className="text-[10px] font-black uppercase text-slate-500 ml-2 whitespace-nowrap">{t("Voter en tant que :")}</span>
                      <select 
                        value={voterId} 
                        onChange={e => setVoterId(e.target.value)}
                        className="bg-transparent text-xs font-bold text-indigo-400 outline-none p-1"
                      >
                        {residents.map(r => <option key={r.id} value={r.id}>{r.name} ({r.apt})</option>)}
                      </select>
                    </div>
                    <button 
                        onClick={() => fetchPolls()}
                        className="p-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:bg-slate-700 transition-all shadow-xl"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-500/20"
                    >
                        <Plus size={20} />
                        <span>{t("Nouveau Sondage")}</span>
                    </button>
                </div>
            </header>

            <div className="bg-slate-800/20 border border-slate-700/30 p-4 rounded-3xl flex items-center gap-4 lg:max-w-md">
                <Search size={20} className="text-slate-500 ml-2" />
                <input 
                    type="text" 
                    placeholder="Rechercher un sondage..." 
                    className="bg-transparent border-none text-white focus:ring-0 w-full placeholder:text-slate-600 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic">{t("Chargement...")}</div>
                ) : filteredPolls.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic bg-slate-800/10 border border-slate-700/30 rounded-[3rem]">
                        Aucun sondage actif.
                    </div>
                ) : (
                    filteredPolls.map((p) => (
                        <div key={p.id} className="bg-slate-800/40 border border-slate-700/50 rounded-[3rem] p-10 flex flex-col h-full shadow-2xl relative overflow-hidden group">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-indigo-500/10 transition-colors"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${
                                    p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600'
                                }`}>
                                    {p.status === 'active' ? t('Ouvert') : t('Clôturé')}
                                </span>
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                    <Clock size={14} />
                                    <span>Expire {p.expires_at ? `le ${new Date(p.expires_at).toLocaleDateString('fr-FR')}` : 'prochainement'}</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-4 leading-tight">{p.title}</h3>
                            <p className="text-slate-400 font-medium mb-10 leading-relaxed italic border-l-4 border-indigo-500/30 pl-4">
                                {p.description || "Aucune description pour ce vote."}
                            </p>

                            <div className="space-y-4 mb-10 relative z-10">
                                {p.poll_options?.map((opt: any) => (
                                    <button 
                                        key={opt.id}
                                        disabled={p.status !== 'active'}
                                        onClick={() => handleVote(p.id, opt.id)}
                                        className="w-full relative group/opt"
                                    >
                                        <div className="absolute inset-0 bg-slate-900/50 rounded-2xl border border-slate-700/50 transition-all group-hover/opt:border-indigo-500/50"></div>
                                        <div 
                                            className="absolute left-0 top-0 bottom-0 bg-indigo-500/10 rounded-l-2xl transition-all duration-1000"
                                            style={{ width: `${opt.percentage}%`, minWidth: opt.percentage > 0 ? '4px' : '0' }}
                                        ></div>
                                        
                                        <div className="relative p-5 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center group-hover/opt:border-indigo-500 transition-colors">
                                                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full scale-0 group-hover/opt:scale-100 transition-transform"></div>
                                                </div>
                                                <span className="font-bold text-slate-100 text-lg">{opt.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-black text-xl">{Math.round(opt.percentage)}%</div>
                                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{opt.votes_count} {t("voix")}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-700/50 flex justify-between items-center text-slate-500 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-indigo-400" />
                                    <span className="text-sm font-black uppercase tracking-tighter">
                                        {t("Participation")} : {p.total_votes} / {residents.length}
                                    </span>
                                </div>
                                <button className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase hover:text-white transition-colors">
                                    {t("Voir détails")} <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden scale-in">
                        <div className="px-12 py-10 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                            <div>
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{t("Nouveau Vote")}</h2>
                                <p className="text-slate-500 font-bold mt-1">Créez un nouveau sondage pour la communauté.</p>
                            </div>
                            <button onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-900 rounded-full">
                                <XCircle size={32} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-12 space-y-8 max-h-[70vh] overflow-y-auto custom-scroll">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Question / Titre")}</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-5 text-white text-xl font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="Que voulez-vous décider ?"
                                        value={newPoll.title}
                                        onChange={e => setNewPoll({...newPoll, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Description (Contexte)")}</label>
                                    <textarea 
                                        rows={2}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-5 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
                                        placeholder="Expliquez l'enjeu du vote..."
                                        value={newPoll.description}
                                        onChange={e => setNewPoll({...newPoll, description: e.target.value})}
                                    />
                                </div>

                                <div>
                                  <div className="flex justify-between items-center mb-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("Options de réponse")}</label>
                                    <button 
                                      type="button" 
                                      onClick={addOption}
                                      className="text-indigo-400 hover:text-indigo-300 text-xs font-black uppercase flex items-center gap-1"
                                    >
                                      <Plus size={14} /> {t("Ajouter une option")}
                                    </button>
                                  </div>
                                  <div className="space-y-4">
                                    {newPoll.options.map((opt, i) => (
                                      <div key={i} className="flex gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center font-black text-slate-600 border border-slate-700">{i+1}</div>
                                        <input 
                                          type="text" required
                                          placeholder={`Réponse ${i+1}`}
                                          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                                          value={opt}
                                          onChange={e => updateOption(i, e.target.value)}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Date d'expiration")}</label>
                                    <input 
                                        type="date"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 text-white font-bold outline-none"
                                        value={newPoll.expires_at}
                                        onChange={e => setNewPoll({...newPoll, expires_at: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="pt-8 flex gap-6">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-5 bg-slate-700 hover:bg-slate-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm transition-colors">{t("Annuler")}</button>
                                <button type="submit" className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm transition-colors shadow-2xl shadow-indigo-500/40">{t("Publier le sondage")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Voting;
