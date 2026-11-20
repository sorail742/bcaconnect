import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import {
    Plus, Edit3, Trash2, Image as ImageIcon,
    Activity, RefreshCcw, CheckCircle2,
    Target, Megaphone, ShieldCheck, Play, Eye, TrendingUp, ChevronDown,
    Zap, LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, getImageUrl } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useAdsManagement } from '../hooks/useMarketingData';
import { useProducts } from '../../product/hooks/useProductData';
import { useWallet } from '../../wallet/hooks/useWalletData';
import useApiMutation from '../../hooks/useApiMutation';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import socketService from '../../services/socketService';

const AdsManager = () => {
    const isVendor = window.location.pathname.includes('/vendor');
    const { data: wallet } = useWallet();
    const { data: ads = [], isLoading: loading, refetch, isFetching } = useQuery({
        queryKey: ['ads-admin'],
        queryFn: async () => {
            const res = await api.get(isVendor ? '/ads?mine=1' : '/ads');
            return res.data;
        }
    });
    const queryClient = useQueryClient();
    const { data: productsData = [] } = useProducts({ limit: 50 });
    const products = productsData.products || [];

    const [showModal, setShowModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [redirectType, setRedirectType] = useState('url');
    const toDateInputValue = (d) => new Date(d).toISOString().slice(0, 10);
    const defaultDates = () => ({
        date_debut: toDateInputValue(new Date()),
        date_fin: toDateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    });
    const [formData, setFormData] = useState({
        titre: '', image_url: '', lien_redirection: '', priorite: 1, statut: 'actif',
        budget_total: 500000, ...defaultDates()
    });

    const { mutateAsync: deleteMutation } = useApiMutation(
        ({ id, confirmationText }) => api.delete(`/ads/${id}`, { data: { confirmation_nom: confirmationText } }),
        {
            invalidateKeys: [['ads-admin']],
            successMessage: "CAMPAGNE RÉVOQUÉE.",
            onSuccess: () => setDeleteTarget(null),
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
            invalidateKeys: [['ads-admin']],
            successMessage: editingAd ? "CAMPAGNE ACTUALISÉE." : "PROPAGATION RÉUSSIE.",
            onSuccess: () => setShowModal(false)
        }
    );

    // Socket.io Real-time connection
    React.useEffect(() => {
        socketService.connect();
        
        const handleStatsUpdate = (data) => {
            queryClient.setQueryData(['ads-admin'], (oldAds) => {
                if (!oldAds) return oldAds;
                return oldAds.map(ad => {
                    if (ad.id === data.id) {
                        const newStats = [...(ad.stats || [])];
                        if (newStats.length === 0) newStats.push({ clics: 0, impressions: 0 });
                        
                        if (data.type === 'clic') newStats[0].clics = (newStats[0].clics || 0) + 1;
                        if (data.type === 'impression') newStats[0].impressions = (newStats[0].impressions || 0) + 1;
                        
                        return { ...ad, stats: newStats };
                    }
                    return ad;
                });
            });
        };

        socketService.on('ad_stats_updated', handleStatsUpdate);

        return () => {
            socketService.off('ad_stats_updated', handleStatsUpdate);
        };
    }, [queryClient]);

    const handleDelete = (ad) => setDeleteTarget(ad);

    const handleOpenModal = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                titre: ad.titre || '', image_url: ad.url_image || '',
                lien_redirection: ad.url_destination || '',
                priorite: ad.priorite || 1, statut: ad.statut || 'actif',
                budget_total: parseFloat(ad.budget_total) || 500000,
                date_debut: ad.date_debut ? toDateInputValue(ad.date_debut) : defaultDates().date_debut,
                date_fin: ad.date_fin ? toDateInputValue(ad.date_fin) : defaultDates().date_fin,
            });
        } else {
            setEditingAd(null);
            setFormData({ titre: '', image_url: '', lien_redirection: '', priorite: 1, statut: 'actif', budget_total: 500000, ...defaultDates() });
        }
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (new Date(formData.date_fin) <= new Date(formData.date_debut)) {
            return toast.error("La date de fin doit être postérieure à la date de début.");
        }
        saveMutation({
            titre: formData.titre.trim(),
            url_image: formData.image_url.trim(),
            url_destination: formData.lien_redirection.trim(),
            format: 'banner',
            priorite: parseInt(formData.priorite),
            statut: formData.statut,
            date_debut: new Date(formData.date_debut).toISOString(),
            date_fin: new Date(formData.date_fin).toISOString(),
            budget_total: parseFloat(formData.budget_total) || 500000
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
        <DashboardLayout title={isVendor ? 'MES PUBLICITÉS' : 'GESTION DES PUBLICITÉS'} noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Megaphone className="size-7 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Ad <span className="text-primary">Manager</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                    Diffusion en cours • Sync Satellite Active
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                queryClient.invalidateQueries(['ads-admin']);
                                toast.success("Données synchronisées", { duration: 1000 });
                            }} 
                            className="h-12 px-5 bg-card border border-border rounded-2xl flex items-center gap-2 text-muted-foreground hover:bg-muted transition-all group"
                        >
                            <RefreshCcw className={cn("size-4 transition-transform group-active:rotate-180", isFetching && "animate-spin text-primary")} />
                        </button>
                        <button onClick={() => handleOpenModal()} className="h-12 px-8 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3">
                            <Plus className="size-4" />
                            Nouvelle Campagne
                        </button>
                    </div>
                </div>

                {/* KPIs Grid - Dynamic Aggregation */}
                {(() => {
                    const totalImpressions = ads.reduce((acc, ad) => 
                        acc + (ad.stats?.reduce((sum, s) => sum + (s.impressions || 0), 0) || 0), 0);
                    
                    const totalClicks = ads.reduce((acc, ad) => 
                        acc + (ad.stats?.reduce((sum, s) => sum + (s.clics || 0), 0) || 0), 0);
                    
                    const totalConversions = ads.reduce((acc, ad) => 
                        acc + (ad.stats?.reduce((sum, s) => sum + (s.conversions || 0), 0) || 0), 0);

                    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0";
                    const roi = totalClicks > 0 ? ((totalConversions / totalClicks) * 10).toFixed(1) : "0";

                    return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <DashboardCard title="Campagnes Actives" value={ads.filter(a => a.statut === 'actif').length.toString()} icon={Play} iconColor="emerald" />
                            <DashboardCard title="Volume Total" value={ads.length.toString()} icon={Target} iconColor="primary" />
                            <DashboardCard title="Affichages Globaux" value={totalImpressions > 1000 ? `${(totalImpressions/1000).toFixed(1)}K` : totalImpressions.toString()} icon={Eye} iconColor="primary" />
                            <DashboardCard title="Coefficient ROI" value={`+${roi}%`} icon={TrendingUp} iconColor="primary" />
                        </div>
                    );
                })()}

                {/* Main Content Area */}
                <div className="space-y-8 pb-20">
                {/* BCA-Style High-Performance Table */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm relative">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-6 py-4">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Campagne</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Statut</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Performance</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Budget</span>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    [1,2,3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="5" className="px-6 py-8"><div className="h-12 bg-muted rounded-xl w-full" /></td>
                                        </tr>
                                    ))
                                ) : ads.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center gap-6 opacity-40">
                                                <Target className="size-12 text-muted-foreground" />
                                                <p className="text-xl font-black uppercase tracking-widest text-muted-foreground">Aucun flux publicitaire</p>
                                                <button onClick={() => handleOpenModal()} className="px-8 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest">Initialiser Campagne</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    ads.map((ad) => (
                                        <tr key={ad.id} className="group hover:bg-muted transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-11 rounded-xl bg-muted border border-border flex-shrink-0 overflow-hidden relative group-hover:border-primary/40 transition-all">
                                                        {ad.url_image ? (
                                                            <img 
                                                                src={getImageUrl(ad.url_image)} 
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                alt={ad.titre}
                                                            />
                                                        ) : (
                                                            <Megaphone className="size-5 text-muted-foreground m-auto" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-bold text-foreground truncate max-w-[200px]">{ad.titre}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="px-1.5 py-0.5 rounded-md bg-muted text-[8px] font-black text-muted-foreground uppercase">ID: {ad.id.slice(0, 8)}</span>
                                                            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-[8px] font-black text-primary uppercase">{ad.format || 'Standard'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={cn(
                                                    "w-fit px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border",
                                                    ad.statut === 'actif' 
                                                        ? "bg-emerald-50 text-emerald-500 border-emerald-100" 
                                                        : "bg-amber-50 text-amber-500 border-amber-100"
                                                )}>
                                                    <div className={cn("size-1.5 rounded-full", ad.statut === 'actif' ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                                                    {ad.statut === 'actif' ? 'En Diffusion' : 'En Attente'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-6">
                                                    {(() => {
                                                        const adClicks = ad.stats?.reduce((sum, s) => sum + (s.clics || 0), 0) || 0;
                                                        const adImpressions = ad.stats?.reduce((sum, s) => sum + (s.impressions || 0), 0) || 0;
                                                        const adCTR = adImpressions > 0 ? ((adClicks / adImpressions) * 100).toFixed(1) : "0";
                                                        return (
                                                            <>
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Clicks</p>
                                                                    <p className="text-xs font-black text-foreground tabular-nums">{adClicks}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">CTR</p>
                                                                    <p className="text-xs font-black text-primary tabular-nums">{adCTR}%</p>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-foreground tabular-nums">{Number(ad.budget_total || 0).toLocaleString('fr-FR')} GNF</p>
                                                    <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500"
                                                            style={{ width: `${ad.budget_total > 0 ? Math.min(100, (Number(ad.budget_restant || 0) / Number(ad.budget_total)) * 100) : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(ad)} className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                                                        <Edit3 className="size-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(ad)} className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-all">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
            </div>

            {/* Campaign Terminal Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAd ? "ÉDITION CAMPAGNE" : "DÉPLOIEMENT PUBLICITAIRE"}
                glass
            >
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-2 px-1">
                            <Megaphone className="size-3.5 text-primary" />
                            Nom de la Campagne
                        </label>
                        <div className="relative group">
                            <input 
                                required 
                                value={formData.titre} 
                                onChange={(e) => setFormData({...formData, titre: e.target.value})} 
                                className="w-full h-12 px-6 bg-muted border border-border rounded-3xl text-sm font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card focus:border-primary transition-all uppercase placeholder:text-muted-foreground shadow-inner" 
                                placeholder="EX: PROMOTION ÉTÉ : -50% SUR TOUT"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-2 px-1">
                            <ImageIcon className="size-3.5 text-primary" />
                            Visuel Publicitaire
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="h-14 w-full bg-muted border-2 border-dashed border-border rounded-3xl flex items-center justify-center gap-4 group-hover:bg-primary/5 group-hover:border-primary group-hover:border-solid transition-all">
                                    <div className="size-10 rounded-2xl bg-card shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all">
                                        <Plus className="size-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-foreground/80 uppercase tracking-widest">Choisir un fichier</span>
                                        <span className="text-[8px] font-bold text-muted-foreground">PNG, JPG (Max 5MB)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <input 
                                    value={formData.image_url} 
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                                    className="w-full h-14 px-6 bg-muted border border-border rounded-3xl text-[10px] font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card focus:border-primary transition-all shadow-inner placeholder:text-muted-foreground/60" 
                                    placeholder="OU INSÉRER UNE URL DIRECTE..."
                                />
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {formData.image_url && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="relative h-60 rounded-3xl overflow-hidden border-4 border-white shadow-2xl group ring-1 ring-border"
                                >
                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain bg-muted" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, image_url: ''})} 
                                            className="px-6 py-2.5 bg-card border border-border rounded-2xl text-[10px] font-black text-rose-500 uppercase tracking-widest shadow-xl hover:scale-110 transition-all"
                                        >
                                            Retirer l'image
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {isUploading && <p className="text-[9px] font-black text-primary animate-pulse uppercase tracking-widest text-center">Téléchargement du média sécurisé...</p>}
                    </div>

                    {/* Configuration de la Redirection (Dynamique) */}
                    <div className="space-y-6 p-6 bg-muted rounded-3xl border border-border">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-2 px-1">
                                <Target className="size-3.5 text-primary" />
                                Type de Redirection
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { id: 'url', label: 'URL Libre', icon: Target },
                                    { id: 'produit', label: 'Produit', icon: Zap },
                                    { id: 'categorie', label: 'Catégorie', icon: LayoutGrid },
                                    { id: 'boutique', label: 'Boutique', icon: ShieldCheck }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => {
                                            setRedirectType(type.id);
                                            if (type.id === 'url') setFormData({...formData, lien_redirection: ''});
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                                            redirectType === type.id 
                                                ? "bg-primary border-primary text-foreground shadow-lg shadow-primary/20 scale-105" 
                                                : "bg-card border-border text-muted-foreground hover:border-border"
                                        )}
                                    >
                                        <type.icon className="size-4" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {redirectType === 'url' ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Saisir le lien manuellement</label>
                                <input 
                                    required 
                                    value={formData.lien_redirection} 
                                    onChange={(e) => setFormData({...formData, lien_redirection: e.target.value})} 
                                    className="w-full h-14 px-6 bg-card border border-border rounded-2xl text-sm font-black text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground" 
                                    placeholder="https://..."
                                />
                            </div>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                                    Sélectionner {redirectType === 'produit' ? 'un produit' : redirectType === 'categorie' ? 'une catégorie' : 'une boutique'}
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const path = redirectType === 'produit' ? `/products/${val}` : redirectType === 'categorie' ? `/categories/${val}` : `/stores/${val}`;
                                            setFormData({...formData, lien_redirection: path});
                                        }}
                                        className="w-full h-14 px-6 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">-- CHOISISSEZ DANS LA LISTE --</option>
                                        {redirectType === 'produit' && products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.nom_produit} ({p.prix} GNF)
                                            </option>
                                        ))}
                                        {redirectType === 'categorie' && [
                                            {id:'electronics', n: '💻 Électronique'}, 
                                            {id:'fashion', n: '👕 Mode & Vêtements'}, 
                                            {id:'home', n: '🏠 Maison & Déco'},
                                            {id:'beauty', n: '✨ Beauté & Soins'}
                                        ].map(c => <option key={c.id} value={c.id}>{c.n}</option>)}
                                        {redirectType === 'boutique' && [
                                            {id:'all', n: '🏪 Toutes les Boutiques'},
                                            {id:'featured', n: '⭐ Boutiques Certifiées'}
                                        ].map(s => <option key={s.id} value={s.id}>{s.n}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        )}
                        
                        {formData.lien_redirection && (
                            <div className="px-4 py-3 bg-card/50 border border-border rounded-xl flex items-center justify-between gap-4">
                                <p className="text-[9px] font-bold text-muted-foreground truncate tracking-tight">Cible active : <span className="text-emerald-600">{formData.lien_redirection}</span></p>
                                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-foreground px-1">Date de Début</label>
                            <input type="date"
                                value={formData.date_debut}
                                onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
                                className="w-full h-12 px-8 bg-muted border border-border rounded-3xl text-sm font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card focus:border-primary transition-all" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-foreground px-1">Date de Fin</label>
                            <input type="date"
                                value={formData.date_fin}
                                onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
                                className="w-full h-12 px-8 bg-muted border border-border rounded-3xl text-sm font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card focus:border-primary transition-all" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-foreground px-1">Budget Total (GNF)</label>
                            <input type="number" min="0" step="1000"
                                value={formData.budget_total}
                                onChange={e => setFormData({ ...formData, budget_total: e.target.value })}
                                className="w-full h-12 px-8 bg-muted border border-border rounded-3xl text-sm font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card focus:border-primary transition-all tabular-nums" />
                            {isVendor && (
                                <p className="text-[10px] font-bold text-muted-foreground px-1 tabular-nums">
                                    {editingAd
                                        ? "Toute augmentation du budget est débitée immédiatement de votre portefeuille."
                                        : "Ce montant est débité immédiatement de votre portefeuille."}
                                    {' '}Solde disponible : {Number(wallet?.solde_virtuel || 0).toLocaleString('fr-FR')} GNF.
                                </p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-foreground px-1">Priorité d'Affichage</label>
                            <input type="number" min="1" max="10"
                                value={formData.priorite}
                                onChange={e => setFormData({ ...formData, priorite: e.target.value })}
                                className="w-full h-12 px-8 bg-muted border border-border rounded-3xl text-sm font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card focus:border-primary transition-all tabular-nums" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-foreground px-1">Statut du Signal</label>
                            <div className="relative">
                                <select
                                    value={formData.statut}
                                    onChange={e => setFormData({ ...formData, statut: e.target.value })}
                                    className="w-full h-12 px-8 bg-muted border border-border rounded-3xl text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card focus:border-primary transition-all appearance-none cursor-pointer"
                                >
                                    <option value="actif">● EN DIFFUSION</option>
                                    <option value="inactif">○ ARRÊTÉ</option>
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={isSaving} 
                            className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[13px] uppercase tracking-[0.25em] shadow-2xl shadow-slate-200 hover:bg-primary hover:text-foreground hover:-translate-y-1.5 active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 group"
                        >
                            {isSaving ? <RefreshCcw className="size-6 animate-spin" /> : <ShieldCheck className="size-6 text-primary group-hover:text-foreground transition-colors" />}
                            {editingAd ? "Mettre à jour la campagne" : "Déployer la Publicité"}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                itemName={deleteTarget?.titre}
                itemLabel="cette campagne publicitaire"
                onConfirm={(confirmationText) => deleteMutation({ id: deleteTarget.id, confirmationText })}
            />
        </DashboardLayout>
    );
};

export default AdsManager;
