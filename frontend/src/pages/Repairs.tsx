import { useState, useEffect } from 'react';
import { getRepairs, createRepair, getRepairContributions, payRepairContribution } from '../services/api';
import { 
    Hammer, 
    Plus, 
    Search, 
    RefreshCcw, 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    PaintRoller, 
    ArrowUpDown, 
    ShieldCheck, 
    Zap,
    Eye
} from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const Repairs = () => {
    const { t } = useLang();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [contributions, setContributions] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        budget: '',
        icon: 'hammer'
    });

    const icons: any = {
        hammer: <Hammer size={24} />,
        'paint-roller': <PaintRoller size={24} />,
        'arrow-up-down': <ArrowUpDown size={24} />,
        'shield-check': <ShieldCheck size={24} />,
        zap: <Zap size={24} />
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await getRepairs();
            setProjects(data || []);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchContributions = async (projectId: string) => {
        try {
            const data = await getRepairContributions(projectId);
            setContributions(data || []);
        } catch (error) {
            console.error("Error fetching contributions:", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSelectProject = async (project: any) => {
        setSelectedProject(project);
        await fetchContributions(project.id);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRepair({
                ...newProject,
                budget: parseFloat(newProject.budget)
            });
            setShowAddForm(false);
            setNewProject({ title: '', description: '', budget: '', icon: 'hammer' });
            fetchProjects();
        } catch (error) {
            alert(t("Erreur lors de l'ajout"));
        }
    };

    const handlePayContribution = async (contributionId: string) => {
        if (!window.confirm(t("Supprimer ce résident ?"))) return;
        try {
            await payRepairContribution(contributionId);
            if (selectedProject) {
                fetchContributions(selectedProject.id);
                // Refresh project stats too
                fetchProjects();
            }
        } catch (error) {
            alert(t("Erreur lors de la suppression"));
        }
    };

    const filteredProjects = projects.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedProject) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <button 
                    onClick={() => setSelectedProject(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-4"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">{t("Retour aux projets")}</span>
                </button>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-10 shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                                    {icons[selectedProject.icon] || <Hammer size={24} />}
                                </div>
                                <h1 className="text-4xl font-black text-white">{selectedProject.title}</h1>
                            </div>
                            <p className="text-slate-400 text-lg max-w-2xl">{selectedProject.description}</p>
                        </div>
                        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50 text-right min-w-[200px]">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{t("Part Individuelle")}</p>
                            <p className="text-3xl font-black text-white">
                                {(selectedProject.budget / (contributions.length || 1)).toLocaleString()} MAD
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Sur {contributions.length} appartements</p>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-sm font-bold text-slate-400">{t("Progression de la collecte")}</span>
                                <span className="text-2xl font-black text-white">
                                    {Math.round((selectedProject.collected / selectedProject.budget) * 100)}%
                                </span>
                            </div>
                            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                    style={{ width: `${Math.min(100, (selectedProject.collected / selectedProject.budget) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-10">
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{t("Total Requis")}</p>
                                <p className="text-xl font-bold text-white">{selectedProject.budget?.toLocaleString()} MAD</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">{t("Collecté")}</p>
                                <p className="text-xl font-bold text-emerald-400">{selectedProject.collected?.toLocaleString()} MAD</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/30 border border-slate-700 rounded-[2rem] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-500 text-xs uppercase font-black tracking-widest">
                                <th className="px-8 py-5">{t("Résident / Apt")}</th>
                                <th className="px-8 py-5">{t("Part Requis")}</th>
                                <th className="px-8 py-5">{t("Statut")}</th>
                                <th className="px-8 py-5 text-right">{t("Action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {contributions.map((c: any) => (
                                <tr key={c.id} className="hover:bg-slate-700/10 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center font-black text-xs text-white">
                                                {c.residents?.apt}
                                            </div>
                                            <div className="font-bold text-white">{c.residents?.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-300">
                                        {c.amount?.toLocaleString()} MAD
                                    </td>
                                    <td className="px-8 py-5">
                                        {c.paid ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border border-emerald-500/20">
                                                <CheckCircle2 size={12} /> {t("Payé")}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border border-amber-500/20">
                                                <XCircle size={12} /> {t("Non Payé")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {!c.paid && (
                                            <button 
                                                onClick={() => handlePayContribution(c.id)}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
                                            >
                                                {t("Encaisser")}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">{t("Fonds de Réparation")}</h1>
                    <p className="text-slate-400 mt-2">Gérez les projets exceptionnels et la collecte des fonds dédiés.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => fetchProjects()}
                        className="p-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:bg-slate-700 transition-all shadow-xl"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-500/20"
                    >
                        <Plus size={20} />
                        <span>{t("Nouveau Projet")}</span>
                    </button>
                </div>
            </header>

            <div className="bg-slate-800/20 border border-slate-700/30 p-4 rounded-3xl flex items-center gap-4 lg:max-w-md">
                <Search size={20} className="text-slate-500 ml-2" />
                <input 
                    type="text" 
                    placeholder="Rechercher un projet..." 
                    className="bg-transparent border-none text-white focus:ring-0 w-full placeholder:text-slate-600 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic">{t("Chargement...")}</div>
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic bg-slate-800/10 border border-slate-700/30 rounded-[3rem]">
                        Aucun projet trouvé. Cliquez sur "Nouveau Projet" pour commencer.
                    </div>
                ) : (
                    filteredProjects.map((p) => (
                        <div key={p.id} className="group bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all hover:scale-[1.02] shadow-xl flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${p.collected >= p.budget ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                    {icons[p.icon] || <Hammer size={24} />}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                    p.status === 'active' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    'bg-slate-700 text-slate-300 border-slate-600'
                                }`}>
                                    {p.status}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{p.title}</h3>
                            <p className="text-slate-500 text-sm line-clamp-3 mb-8 font-medium leading-relaxed">
                                {p.description || "Aucune description fournie pour ce projet."}
                            </p>

                            <div className="mt-auto space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{t("Budget requis")}</p>
                                        <p className="text-lg font-bold text-white leading-none">{p.budget?.toLocaleString()} MAD</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">{t("Collecté")}</p>
                                        <p className="text-lg font-bold text-emerald-400 leading-none">{p.collected?.toLocaleString()} MAD</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${p.collected >= p.budget ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.min(100, (p.collected / p.budget) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <span>{Math.round((p.collected / p.budget) * 100)}%</span>
                                        <span>{t("Reste")} {Math.max(0, p.budget - p.collected).toLocaleString()} MAD</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleSelectProject(p)}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                                >
                                    <Eye size={16} className="group-hover:scale-110 transition-transform" />
                                    {t("Gérer les cotisations")}
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
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t("Nouveau Projet")}</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white transition-colors"><Plus size={32} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Nom du projet")}</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        placeholder="Ex: Peinture Façade Extérieure"
                                        value={newProject.title}
                                        onChange={e => setNewProject({...newProject, title: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Description")}</label>
                                    <textarea 
                                        required rows={3}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                                        placeholder="Décrivez les travaux prévus..."
                                        value={newProject.description}
                                        onChange={e => setNewProject({...newProject, description: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Budget (MAD)")}</label>
                                    <input 
                                        type="number" required
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-black focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        placeholder="15000"
                                        value={newProject.budget}
                                        onChange={e => setNewProject({...newProject, budget: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t("Icône")}</label>
                                    <select 
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                                        value={newProject.icon}
                                        onChange={e => setNewProject({...newProject, icon: e.target.value})}
                                    >
                                        <option value="hammer">Marteau</option>
                                        <option value="paint-roller">Peinture</option>
                                        <option value="arrow-up-down">Ascenseur</option>
                                        <option value="shield-check">Sécurité</option>
                                        <option value="zap">Électricité</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors">{t("Annuler")}</button>
                                <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-indigo-500/20">{t("Lancer le projet")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Repairs;
