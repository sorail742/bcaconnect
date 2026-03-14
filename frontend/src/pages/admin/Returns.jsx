import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    RotateCcw,
    CheckCircle2,
    XCircle,
    Eye,
    Mail,
    AlertCircle,
    Clock,
    Plus,
    Search,
    MessageSquare,
    TrendingDown
} from 'lucide-react';
import Button from '../../components/ui/Button';

const AdminDisputes = () => {
    const [activeTab, setActiveTab] = useState('returns');

    const stats = [
        { label: 'En attente', value: '12', icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
        { label: 'Approuvées (24h)', value: '48', icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
        { label: 'Taux de litige', value: '1.2%', icon: TrendingDown, color: 'text-rose-500', bgColor: 'bg-rose-500/10' }
    ];

    const requests = [
        {
            id: '#BC-9821',
            product: 'Casque Audio Sans Fil',
            client: 'Jean Dupont',
            email: 'jean.dupont@email.com',
            reason: 'Produit défectueux',
            status: 'En attente',
            date: '12 Oct 2023',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwgIssunMUrFCrSVbpJn7ZBVeTrNGzQyEdVrircWpaI07t9xuGud6ee3Q68LXnqvTc9LPLoMGtyFSVFHSfTPlD6KsISQZ-TjnVChl0GBtrXhSNX-D1FdDvbp4kq1jasCC5lFs0EirDFl9RaQI1W3wRgD9gI31t4tsGfZADU9pozSs7dahGsYb2F8gQlXyomzvrVqXLt1Lh1o-f8rWEXNGg0KcYfX9nR98UGBBhff1KAoKBT4fpiKmicQvAxVIUjK43lIQjKLsTxS3N'
        },
        {
            id: '#BC-9815',
            product: 'Clavier Mécanique RGB',
            client: 'Marie Lavoie',
            email: 'm.lavoie@email.com',
            reason: "Erreur d'article",
            status: 'Approuvé',
            date: '11 Oct 2023',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg2exFobLnSt2aZkng5Ls1u8brnyWE-_xycAxO9TBhvLh5SV7z0-b0jIsr4y79NuR95Vnm721tfCOC7jxRT48hBoT7IT3ZqsRwuJmBs2A4ihS3uDk2IZAvwLXrxs5ZsXwX49RSMk5xqHJgcQ27bCGTZ4bay8t08BLGCGjw55K_SF0G3Z6R6_aleYdyihellqRgsbquA2oTpaowJ3GOKtC15kOv2FyCYvu2IJbqsd-i90i4HghjMqQfxadaT0gvE_CBQLgcGIu9oTvB'
        },
        {
            id: '#BC-9802',
            product: 'Souris Gaming Pro',
            client: 'Lucas Martin',
            email: 'lucas.m@email.com',
            reason: "Changement d'avis",
            status: 'Rejeté',
            date: '10 Oct 2023',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOreOoOE6vPsz9evNxQ7XRc21yYGmzNb78VBc3DvAZo5bV2gkVd2Bo1ErbvV0PaQ5bk6cWers2BjRBYrGNFBs05b7R_tW6VsW3tYOf-bRcDPArWE5wpMjgqFft_DjbSv6OTmXg-GHvFZLwEQPw0IPKIvv79PSXGECyj8z32Q-cOC6P_tE2kUOGfKOEsr8iEbto6HRDNDClb4wxzIREoUspyQuse8iID-q3wdm4r3eHzlNhWf5gF96WEqqNc95pQkz5H2mhB154ZtDy'
        }
    ];

    return (
        <DashboardLayout title="Retours & Litiges">
            <div className="space-y-8 animate-in fade-in duration-500 font-inter pb-12">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Retours & Litiges</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Gérez le SAV et les contentieux clients en temps réel.</p>
                    </div>
                    <Button className="bg-primary text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                        <Plus className="size-4" />
                        Nouveau Litige
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
                            <div className={`size-14 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="size-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs & Search */}
                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-2">
                        <nav className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full xl:w-auto overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setActiveTab('returns')}
                                className={`whitespace-nowrap px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'returns' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Demandes de retour
                            </button>
                            <button
                                onClick={() => setActiveTab('refunds')}
                                className={`whitespace-nowrap px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'refunds' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Remboursements
                            </button>
                            <button
                                onClick={() => setActiveTab('disputes')}
                                className={`whitespace-nowrap px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'disputes' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Litiges Clients
                            </button>
                        </nav>
                        <div className="relative w-full xl:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher #BC-9XXX..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold dark:text-white placeholder:text-slate-400 placeholder:italic"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto italic">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-8 py-5">ID Commande</th>
                                    <th className="px-8 py-5">Produit</th>
                                    <th className="px-8 py-5">Client</th>
                                    <th className="px-8 py-5">Motif</th>
                                    <th className="px-8 py-5">Statut</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {requests.map((req, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-8 py-5 text-xs font-black text-primary tracking-tighter italic">{req.id}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110">
                                                    <img src={req.image} alt={req.product} className="size-full object-cover" />
                                                </div>
                                                <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{req.product}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{req.client}</span>
                                                <span className="text-[10px] text-slate-400 font-bold lowercase tracking-tighter mt-0.5">{req.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-tighter">{req.reason}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${req.status === 'En attente'
                                                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                                    : req.status === 'Approuvé'
                                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                                }`}>
                                                <div className={`size-1.5 rounded-full ${req.status === 'En attente' ? 'bg-blue-500 animate-pulse' :
                                                        req.status === 'Approuvé' ? 'bg-emerald-500' : 'bg-rose-500'
                                                    }`}></div>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-[11px] text-slate-400 font-bold">{req.date}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                                {req.status === 'En attente' && (
                                                    <>
                                                        <button className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Approuver">
                                                            <CheckCircle2 className="size-4" />
                                                        </button>
                                                        <button className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Rejeter">
                                                            <XCircle className="size-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary rounded-xl transition-all shadow-sm" title="Détails">
                                                    <Eye className="size-4" />
                                                </button>
                                                <button className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm" title="Contacter">
                                                    <MessageSquare className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Affichage de 1 à 3 sur 12 demandes</span>
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all" disabled>Précédent</button>
                            <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-primary text-white rounded-lg shadow-lg shadow-primary/20">1</button>
                            <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all">2</button>
                            <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all">Suivant</button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDisputes;
