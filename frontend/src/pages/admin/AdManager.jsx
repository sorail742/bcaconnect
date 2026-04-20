import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Plus, Edit3, Trash2, Image as ImageIcon,
    Activity, RefreshCcw, CheckCircle2,
    Target, Megaphone, ShieldCheck, Play, Eye, TrendingUp, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAdminAds } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';
import Modal from '../../components/ui/Modal';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group"
    >
        <div className={cn("absolute top-0 right-0 p-5 opacity-5 group-hover:scale-125 transition-transform duration-700", color)}>
            <Icon className="size-10" />
        </div>
        <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>
            <h3 className="text-2xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {value}
            </h3>
        </div>
    </motion.div>
);

const AdsManager = () => {
    const { data: ads = [], loading, refetch } = useAdminAds();
    const [showModal, setShowModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [formData, setFormData] = useState({
        titre: '', image_url: '', lien_redirection: '', priorite: 1, statut: 'actif'
    });

    const { mutate: deleteMutation } = useApiMutation(
        (id) => api.delete(`/ads/${id}`),
        {
            invalidateKeys: [['admin-ads']],
            successMessage: "CAMPAGNE RÉVOQUÉE.",
            errorMessage: "ERREUR DE RÉVOCATION."
        }
    );

    const { mutate: saveMutation, isPending: isSaving } = useApiMutation(
        (data) => {
            if (editingAd) {
                return api.put(`/ads/${editingAd.id}`, data);
            }
            return api.post('/ads', data);
        },
        {
            invalidateKeys: [['admin-ads']],
            successMessage: editingAd ? "CAMPAGNE ACTUALISÉE." : "PROPAGATION RÉUSSIE.",
            onSuccess: () => setShowModal(false)
        }
    );

    const handleDelete = (id) => {
        if (!window.confirm("CONFIRMER LA SUPPRESSION DE CETTE CAMPAGNE ?")) return;
        deleteMutation(id);
    };

    const handleOpenModal = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                titre: ad.titre || '', image_url: ad.url_image || '',
                lien_redirection: ad.url_destination || '',
                priorite: ad.priorite || 1, statut: ad.statut || 'actif'
            });
        } else {
            setEditingAd(null);
            setFormData({ titre: '', image_url: '', lien_redirection: '', priorite: 1, statut: 'actif' });
        }
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation({
            titre: formData.titre.trim(),
            url_image: formData.image_url.trim(),
            url_destination: formData.lien_redirection.trim(),
            format: 'banner',
            priorite: parseInt(formData.priorite),
            statut: formData.statut,
            date_debut: new Date().toISOString(),
            date_fin: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
            budget_total: 0
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, image_url: res.data.url }));
            toast.success("Média chargé avec succès");
        } catch (error) {
            toast.error("Erreur de transfert média");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <DashboardLayout title="GESTION DES PUBLICITÉS" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Megaphone className="size-7 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Ad <span className="text-primary">Manager</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    Diffusion en cours • Sync Satellite Active
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => refetch()} className="h-12 px-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-all">
                            <RefreshCcw className={cn("size-4", loading && "animate-spin")} />
                        </button>
                        <button onClick={() => handleOpenModal()} className="h-12 px-8 bg-primary text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3">
                            <Plus className="size-4" />
                            Nouvelle Campagne
                        </button>
                    </div>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard label="Campagnes Actives" value={ads.filter(a => a.statut === 'actif').length.toString()} icon={Play} color="text-emerald-500" />
                    <StatCard label="Volume Total" value={ads.length.toString()} icon={Target} color="text-primary" />
                    <StatCard label="Affichages Globaux" value="12.4K" icon={Eye} color="text-blue-500" />
                    <StatCard label="Coefficient ROI" value="+8.5%" icon={TrendingUp} color="text-primary" />
                </div>

                {/* Main Content Area */}
                <div className="space-y-8 pb-20">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1,2,3].map(i => <div key={i} className="h-72 bg-white border border-slate-100 rounded-3xl animate-pulse" />)}
                        </div>
                    ) : ads.length === 0 ? (
                        <div className="py-32 flex flex-col items-center gap-6 opacity-40 text-slate-400 text-center">
                            <Target className="size-20" />
                            <p className="text-xl font-black uppercase tracking-widest">Aucun flux publicitaire</p>
                            <button onClick={() => handleOpenModal()} className="px-8 h-12 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Initialiser Campagne</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence mode="popLayout">
                                {ads.map((ad, idx) => (
                                    <motion.div
                                        key={ad.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group flex flex-col min-h-[400px]"
                                    >
                                        <div className="h-52 relative overflow-hidden bg-slate-50">
                                            {ad.url_image ? (
                                                <img src={ad.url_image} alt={ad.titre} className="size-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="size-full flex items-center justify-center opacity-10">
                                                    <ImageIcon className="size-16" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                                            
                                            <div className="absolute top-4 left-4">
                                                <span className={cn(
                                                    "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md",
                                                    ad.statut === 'actif' ? "bg-emerald-50/80 text-emerald-500 border-emerald-100" : "bg-slate-50/80 text-slate-400 border-slate-100"
                                                )}>
                                                    {ad.statut === 'actif' ? 'Diffusion Active' : 'Pause'}
                                                </span>
                                            </div>

                                            <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
                                                <button onClick={() => handleOpenModal(ad)} className="size-10 rounded-xl bg-white/90 backdrop-blur shadow-xl flex items-center justify-center text-slate-600 hover:text-primary transition-all">
                                                    <Edit3 className="size-4" />
                                                </button>
                                                <button onClick={() => handleDelete(ad.id)} className="size-10 rounded-xl bg-white/90 backdrop-blur shadow-xl flex items-center justify-center text-slate-600 hover:text-rose-500 transition-all">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-8 flex flex-col flex-1">
                                            <div className="mb-4 flex items-center justify-between gap-4">
                                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    {ad.titre}
                                                </h3>
                                                <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg shrink-0">P{ad.priorite}</span>
                                            </div>
                                            <div className="mt-auto space-y-4">
                                                <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                                                    <Activity className="size-3.5 text-slate-300" />
                                                    <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight">{ad.url_destination || 'Aucune redirection'}</p>
                                                </div>
                                                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
                                                    <span>Ref: #{ad.id?.slice(0, 8).toUpperCase()}</span>
                                                    <span>Format: Banner 1200x400</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Campaign Terminal Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAd ? "ÉDITION CAMPAGNE" : "DÉPLOIEMENT PUBLICITAIRE"}
                glass
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Intitulé de la Campagne</label>
                        <input 
                            required 
                            value={formData.titre} 
                            onChange={(e) => setFormData({...formData, titre: e.target.value})} 
                            className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" 
                            placeholder="EX: OFFRE SPÉCIALE ÉTÉ..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Média Créatif (Upload ou URL)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                                className="h-14 w-full bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black file:mr-4 file:py-4 file:px-6 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:bg-primary file:text-foreground file:cursor-pointer hover:file:opacity-90 transition-all"
                            />
                            <div className="relative">
                                <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                                <input 
                                    value={formData.image_url} 
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                                    className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-medium text-slate-500 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                    placeholder="OU COLLEZ URL IMAGE..."
                                />
                            </div>
                        </div>
                        {isUploading && <p className="text-[9px] font-black text-primary animate-pulse uppercase tracking-widest text-center mt-2">Transfert de données satellite en cours...</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Destination de Redirection</label>
                        <input 
                            required 
                            value={formData.lien_redirection} 
                            onChange={(e) => setFormData({...formData, lien_redirection: e.target.value})} 
                            className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            placeholder="https://..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Niveau Priorité</label>
                            <input type="number" min="1" max="10"
                                value={formData.priorite}
                                onChange={e => setFormData({ ...formData, priorite: e.target.value })}
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 transition-all tabular-nums" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">État Global</label>
                            <div className="relative">
                                <select
                                    value={formData.statut}
                                    onChange={e => setFormData({ ...formData, statut: e.target.value })}
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                >
                                    <option value="actif">ACTIVÉ</option>
                                    <option value="inactif">PAUSE</option>
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={isSaving} className="flex-1 h-14 bg-primary text-foreground rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3">
                            {isSaving ? <RefreshCcw className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
                            {editingAd ? "Reconfigurer Campagne" : "Lancer Propagation"}
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdsManager;
