import { useState, useEffect } from 'react';
import { getResidents } from '../services/api';
import { 
  Users as UsersIcon, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Shield, 
  ExternalLink,
  Search,
  RefreshCcw,
  Key
} from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const Users = () => {
    const { t } = useLang();
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredUsers = residents.filter(res => 
        (res.name && res.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (res.email && res.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeCount = residents.filter(r => r.user_id).length;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <UsersIcon className="text-emerald-500" size={32} />
                        {t("Gestion des Utilisateurs")}
                    </h1>
                    <p className="text-slate-400 mt-1">{t("Gérez les comptes d'accès à la plateforme")}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchResidents}
                        className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20">
                        <Key size={20} />
                        <span>{t("Générer Identifiants")}</span>
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t("Total Résidents")}</p>
                    <div className="text-3xl font-black text-white">{residents.length}</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                    <p className="text-emerald-500/60 text-[10px] font-bold uppercase tracking-widest mb-1">{t("Comptes Actifs")}</p>
                    <div className="text-3xl font-black text-emerald-400">{activeCount}</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
                    <p className="text-amber-500/60 text-[10px] font-bold uppercase tracking-widest mb-1">{t("Sans Accès")}</p>
                    <div className="text-3xl font-black text-amber-400">{residents.length - activeCount}</div>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl">
                    <p className="text-indigo-500/60 text-[10px] font-bold uppercase tracking-widest mb-1">{t("Administrateurs")}</p>
                    <div className="text-3xl font-black text-indigo-400">1</div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder={t("Rechercher un utilisateur...")}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* User Table/Grid */}
            <div className="overflow-hidden border border-slate-700/50 rounded-2xl bg-slate-800/20">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/40 border-b border-slate-700/50">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("Utilisateur")}</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("Contact")}</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("Statut d'accès")}</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("Rôle")}</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">{t("Chargement...")}</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">{t("Aucun utilisateur trouvé.")}</td></tr>
                        ) : (
                            filteredUsers.map((res) => (
                                <tr key={res.id} className="hover:bg-slate-800/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600">
                                                {res.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white shrink-0">{res.name}</p>
                                                <p className="text-xs text-slate-500">{res.apt || 'Apt ??'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Mail size={12} className="text-slate-600" />
                                                <span className="truncate max-w-[150px]">{res.email || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Phone size={12} className="text-slate-600" />
                                                <span>{res.phone || '—'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {res.user_id ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                                <UserCheck size={12} />
                                                {t("Compte Lié")}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700 text-slate-400 text-[10px] font-bold">
                                                <UserX size={12} />
                                                {t("Pas d'accès")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                            <Shield size={14} className={res.role === 'admin' ? 'text-indigo-400' : 'text-slate-500'} />
                                            {res.role === 'admin' ? 'Administrateur' : 'Résident'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            <ExternalLink size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
