import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Plus,
    Edit3,
    Trash2,
    Image as ImageIcon,
    Link as LinkIcon,
    Eye,
    MousePointer2,
    TrendingUp,
    RefreshCcw,
    Zap,
    Play,
    Pause,
    AlertCircle,
    CheckCircle2,
    Target,
    BarChart3,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const AdsManager = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        image_url: '',
        lien_redirection: '',
        priorite: 1,
        statut: 'actif'
    });

    const fetchAds = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/ads`);
            setAds(response.data || []);
        } catch (error) {
            toast.error("Impossible de synchroniser les campagnes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    const handleDelete = async (id) => {
        if (!window.confirm("Révoquer définitivement cette campagne publicitaire ?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/ads/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success("Campagne révoquée.");
            fetchAds();
        } catch (error) {
            toast.error("Échec de l'opération.");
        }
    };

    const handleOpenModal = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                titre: ad.titre || '',
                image_url: ad.image_url || '',
                lien_redirection: ad.lien_redirection || '',
                priorite: ad.priorite || 1,
                statut: ad.statut || 'actif'
            });
        } else {
            setEditingAd(null);
            setFormData({ titre: '', image_url: '', lien_redirection: '', priorite: 1, statut: 'actif' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const data = {
                titre: formData.titre.trim(),
                image_url: formData.image_url.trim(),
                lien_redirection: formData.lien_redirection.trim(),
                priorite: parseInt(formData.priorite),
                statut: formData.statut
            };

            if (editingAd) {
                await axios.put(`${import.meta.env.VITE_API_URL}/ads/${editingAd.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Campagne actualisée.");
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/ads`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Campagne déployée.");
            }
            setShowModal(false);
            fetchAds();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout title="Ad Manager">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-24 px-6 md:px-10 pt-10">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Contrôle de Visibilité</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Directoire <span className="text-primary italic">Publicitaire.</span></h2>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchAds} className="size-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                            <RefreshCcw className={cn("size-5", loading && "animate-spin")} />
                        </button>
                        <Button onClick={() => handleOpenModal()} className="h-14 px-10 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl">
                            <Plus className="size-5" /> Lancer Diffusion
                        </Button>
                    </div>
                </div>

                {/* Performance Hub */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 p-8 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col justify-between h-[200px]">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audience Active</p>
                            <Target className="size-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white uppercase tabular-nums">High</p>
                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <TrendingUp className="size-3" /> Optimale
                            </p>
                        </div>
                    </div>
                    <div className="md:col-span-3 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-12 w-full max-w-2xl">
                            <div className="text-center space-y-2">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Affichages</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white italic tracking-tight">12.4K</p>
                            </div>
                            <div className="text-center space-y-2 border-x border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Interactions</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white italic tracking-tight">3.2K</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">ROI Moyen</p>
                                <p className="text-2xl font-bold text-primary italic tracking-tight">+8.5%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {loading ? (
                        [1, 2].map(n => <div key={n} className="h-96 bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem] animate-pulse border border-slate-200 dark:border-slate-700" />)
                    ) : ads.length === 0 ? (
                        <div className="md:col-span-2 py-32 flex flex-col items-center justify-center gap-6 opacity-30 text-center">
                            <BarChart3 className="size-16" />
                            <p className="text-xs font-bold uppercase tracking-widest">Aucune campagne en cours</p>
                        </div>
                    ) : (
                        ads.map(ad => (
                            <div
                                key={ad.id}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="h-56 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <img
                                        src={ad.image_url}
                                        alt=""
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                                    <div className="absolute top-6 left-6">
                                        <div className={cn(
                                            "flex items-center gap-3 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border backdrop-blur-md",
                                            ad.statut === 'actif' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/10 text-white/50 border-white/10"
                                        )}>
                                            <div className={cn("size-2 rounded-full", ad.statut === 'actif' ? "bg-emerald-500" : "bg-white/30")} />
                                            {ad.statut === 'actif' ? 'Diffusion Active' : 'En Pause'}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-6 left-8 right-8">
                                        <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter truncate">{ad.titre}</h3>
                                        <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mt-1">Priorité Niveau {ad.priorite}</p>
                                    </div>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors cursor-pointer group/url">
                                            <LinkIcon className="size-3" />
                                            <span className="text-[10px] font-bold tracking-tight truncate max-w-[200px]">{ad.lien_redirection}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(ad)} className="size-12 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary rounded-xl flex items-center justify-center transition-all border border-slate-100 dark:border-slate-800"><Edit3 className="size-5" /></button>
                                            <button onClick={() => handleDelete(ad.id)} className="size-12 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all border border-slate-100 dark:border-slate-800"><Trash2 className="size-5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAd ? "Audit Campagne" : "Nouveau Déploiement"}
            >
                <form onSubmit={handleSubmit} className="space-y-8 p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Titre Promotionnel</label>
                            <Input
                                required
                                value={formData.titre}
                                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                placeholder="EX: VENTES PRIVÉES..."
                                className="h-14 px-6 rounded-xl font-bold text-sm uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Priorité (1-10)</label>
                                <Input
                                    type="number"
                                    min="1" max="10"
                                    value={formData.priorite}
                                    onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                                    className="h-14 px-6 rounded-xl font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Statut Diffusion</label>
                                <select
                                    className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest outline-none"
                                    value={formData.statut}
                                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                                >
                                    <option value="actif">Actif</option>
                                    <option value="inactif">Pause</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Asset HD (URL)</label>
                            <Input
                                required
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                                className="h-14 px-6 rounded-xl font-bold text-[10px] tracking-widest"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Protocole Redirection (URL)</label>
                            <Input
                                required
                                value={formData.lien_redirection}
                                onChange={(e) => setFormData({ ...formData, lien_redirection: e.target.value })}
                                placeholder="https://..."
                                className="h-14 px-6 rounded-xl font-bold text-[10px] tracking-widest text-primary"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full h-14 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                        >
                            {isSaving ? <RefreshCcw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                            Approuver Diffusion
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdsManager;
