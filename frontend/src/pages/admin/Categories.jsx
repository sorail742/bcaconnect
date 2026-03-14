import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    PlusCircle,
    Search,
    Edit2,
    Trash2,
    Folder,
    ChevronRight,
    MoreHorizontal,
    X,
    UploadCloud,
    CheckCircle2,
    Clock
} from 'lucide-react';
import Button from '../../components/ui/Button';

const AdminCategories = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const categories = [
        { id: 1, name: 'Électronique', parent: '—', products: 1240, status: 'Active', date: '12/01/2024', isParent: true },
        { id: 2, name: 'Smartphones', parent: 'Électronique', products: 450, status: 'Active', date: '15/01/2024', isParent: false },
        { id: 3, name: 'Audio & Casques', parent: 'Électronique', products: 312, status: 'Inactive', date: '20/01/2024', isParent: false },
        { id: 4, name: 'Maison & Jardin', parent: '—', products: 856, status: 'Active', date: '10/01/2024', isParent: true },
    ];

    return (
        <DashboardLayout title="Gestion des Catégories">
            <div className="space-y-8 animate-in fade-in duration-500 font-inter pb-12">
                {/* Title & Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Gestion des Catégories</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Structurez votre catalogue avec une hiérarchie précise.</p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <PlusCircle className="size-4" />
                        Ajouter une catégorie
                    </Button>
                </div>

                {/* Filters & Tabs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Filtrer les catégories..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold dark:text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Toutes
                            </button>
                            <button
                                onClick={() => setActiveTab('archived')}
                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'archived' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Archivées
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto italic">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-8 py-5">Nom de la catégorie</th>
                                    <th className="px-8 py-5">Parente</th>
                                    <th className="px-8 py-5 text-center">Produits</th>
                                    <th className="px-8 py-5">Statut</th>
                                    <th className="px-8 py-5">Création</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className={`flex items-center gap-3 ${!cat.isParent ? 'pl-10' : ''}`}>
                                                {cat.isParent ? (
                                                    <Folder className="size-4 text-primary" />
                                                ) : (
                                                    <ChevronRight className="size-3 text-slate-300" />
                                                )}
                                                <span className={`text-sm font-black tracking-tight ${cat.isParent ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {cat.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">{cat.parent}</td>
                                        <td className="px-8 py-5 text-center text-sm font-black italic">{cat.products}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${cat.status === 'Active'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                                }`}>
                                                <div className={`size-1.5 rounded-full ${cat.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                {cat.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-[11px] text-slate-400 font-bold">{cat.date}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-all group-hover:scale-110">
                                                    <Edit2 className="size-4" />
                                                </button>
                                                <button className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 rounded-xl transition-all group-hover:scale-110">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Slide-over Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex justify-end animate-in fade-in duration-300">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transform animate-in slide-in-from-right duration-500 font-inter">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Ajouter une catégorie</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Nouveaux paramètres du catalogue</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:rotate-90"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="flex-1 p-8 space-y-8 overflow-y-auto scrollbar-hide italic">
                            {/* Nom field */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center">
                                    Nom de la catégorie <span className="text-primary ml-1">*</span>
                                </label>
                                <input
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-black text-sm dark:text-white"
                                    placeholder="Ex: Informatique"
                                    type="text"
                                />
                            </div>

                            {/* Parent select */}
                            <div className="space-y-3 font-normal">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Catégorie parente</label>
                                <select className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold dark:text-white appearance-none">
                                    <option value="">Aucune (Catégorie racine)</option>
                                    <option value="1">Électronique</option>
                                    <option value="2">Maison & Jardin</option>
                                    <option value="3">Mode</option>
                                </select>
                            </div>

                            {/* Description field */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</label>
                                <textarea
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium dark:text-white min-h-[120px]"
                                    placeholder="Décrivez brièvement cette catégorie..."
                                />
                            </div>

                            {/* Icon Upload */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Icône (Optionnel)</label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all bg-slate-50/30 dark:bg-slate-800/10 group">
                                    <UploadCloud className="size-10 text-primary/40 group-hover:text-primary transition-all group-hover:scale-110" />
                                    <div className="text-center">
                                        <p className="text-xs font-black uppercase tracking-widest">Choisir un fichier</p>
                                        <p className="text-[10px] text-slate-400 mt-2 font-bold">SVG, PNG JUSQU'À 2 MO</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all"
                            >
                                Annuler
                            </button>
                            <Button className="flex-1 bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminCategories;
