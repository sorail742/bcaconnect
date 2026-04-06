import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Plus, Edit3, Trash2, Image as ImageIcon, Link as LinkIcon,
    Eye, TrendingUp, RefreshCcw, Play, CheckCircle2,
    Target, BarChart3, Activity, ChevronDown, Megaphone
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const Field = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />}
            <input
                className={cn(
                    "h-10 w-full bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground",
                    Icon ? "pl-10 pr-3" : "px-3"
                )}
                {...props}
            />
        </div>
    </div>
);

const AdsManager = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [formData, setFormData] = useState({
        titre: '', image_url: '', lien_redirection: '', priorite: 1, statut: 'actif'
    });

    const fetchAds = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/ads');
            setAds(Array.isArray(response.data) ? response.data : []);
        } catch {
            toast.error("Impossible de charger les campagnes.");
            setAds([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAds(); }, [fetchAds]);

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer définitivement cette campagne ?")) return;
        try {
            await api.delete(`/ads/${id}`);
            toast.success("Campagne supprimée.");
            fetchAds();
        } catch {
            toast.error("Erreur lors de la suppression.");
        }
    };

    const handleOpenModal = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                titre: ad.titre || '', image_url: ad.image_url || '',
                lien_redirection: ad.lien_redirection || '',
                priorite: ad.priorite || 1, statut: ad.statut || 'actif'
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
            const data = {
                titre: formData.titre.trim(),
                image_url: formData.image_url.trim(),
                lien_redirection: formData.lien_redirection.trim(),
                priorite: parseInt(formData.priorite),
                statut: formData.statut
            };
            if (editingAd) {
                await api.put(`/ads/${editingAd.id}`, data);
                toast.success("Campagne mise à jour.");
            } else {
                await api.post('/ads', data);
                toast.success("Campagne créée.");
            }
            setShowModal(false);
            fetchAds();
        } catch {
            toast.error("Erreur lors de l'enregistrement.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout title="Gestion des publicités">
            <div className="space-y-5 pb-10">

                {/* Header */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Megaphone className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">Campagnes publicitaires</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-xs text-muted-foreground">
                                    Diffusion active — {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchAds}
                            className="size-9 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                        >
                            <RefreshCcw className={cn("size-4", loading && "animate-spin")} />
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                        >
                            <Plus className="size-4" />
                            Nouvelle campagne
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Campagnes actives', value: ads.filter(a => a.statut === 'actif').length.toString(), icon: Play, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Total campagnes', value: ads.length.toString(), icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
                        { label: 'Affichages', value: '12.4K', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'ROI estimé', value: '+8.5%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
                            <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0 border border-border", stat.bg)}>
                                <stat.icon className={cn("size-4", stat.color)} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-lg font-bold text-foreground tabular-nums">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ads grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[1,2,3].map(i => <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse border border-border" />)}
                    </div>
                ) : ads.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-4 text-center bg-card rounded-2xl border border-dashed border-border">
                        <BarChart3 className="size-10 text-muted-foreground/30" />
                        <div>
                            <p className="text-sm font-bold text-foreground">Aucune campagne déployée</p>
                            <p className="text-xs text-muted-foreground mt-1">Créez votre première campagne publicitaire.</p>
                        </div>
                        <button onClick={() => handleOpenModal()}
                            className="h-9 px-5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                            <Plus className="size-4" /> Créer une campagne
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {ads.map((ad, idx) => (
                                <motion.div
                                    key={ad.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-muted overflow-hidden">
                                        {ad.image_url ? (
                                            <img
                                                src={ad.image_url}
                                                alt={ad.titre}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="size-10 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                                        {/* Status badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={cn(
                                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm",
                                                ad.statut === 'actif'
                                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                    : "bg-muted/80 text-muted-foreground border-border"
                                            )}>
                                                <div className={cn("size-1.5 rounded-full", ad.statut === 'actif' ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground")} />
                                                {ad.statut === 'actif' ? 'Active' : 'Pausée'}
                                            </span>
                                        </div>
                                        {/* Priority */}
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2.5 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold backdrop-blur-sm">
                                                P{ad.priorite}
                                            </span>
                                        </div>
                                        {/* Title overlay */}
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">{ad.titre}</h3>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-4 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <LinkIcon className="size-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-xs text-muted-foreground truncate">{ad.lien_redirection}</span>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleOpenModal(ad)}
                                                className="size-8 rounded-lg bg-muted border border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center transition-all"
                                            >
                                                <Edit3 className="size-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ad.id)}
                                                className="size-8 rounded-lg bg-muted border border-border text-muted-foreground hover:text-rose-500 hover:border-rose-500/40 flex items-center justify-center transition-all"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl relative z-10"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <Megaphone className="size-4 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">
                                        {editingAd ? 'Modifier la campagne' : 'Nouvelle campagne'}
                                    </h3>
                                </div>
                                <button onClick={() => setShowModal(false)}
                                    className="size-8 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-muted-foreground transition-colors text-lg font-bold">
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <Field label="Titre de la campagne *" icon={Activity}
                                    required value={formData.titre}
                                    onChange={e => setFormData({ ...formData, titre: e.target.value })}
                                    placeholder="Ex: Offre spéciale été 2024" />

                                <Field label="URL de l'image *" icon={ImageIcon}
                                    required value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..." />

                                <Field label="Lien de redirection *" icon={LinkIcon}
                                    required value={formData.lien_redirection}
                                    onChange={e => setFormData({ ...formData, lien_redirection: e.target.value })}
                                    placeholder="https://..." />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priorité (1-10)</label>
                                        <input type="number" min="1" max="10"
                                            value={formData.priorite}
                                            onChange={e => setFormData({ ...formData, priorite: e.target.value })}
                                            className="h-10 w-full px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground tabular-nums" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</label>
                                        <div className="relative">
                                            <select
                                                value={formData.statut}
                                                onChange={e => setFormData({ ...formData, statut: e.target.value })}
                                                className="h-10 w-full px-3 pr-8 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground appearance-none"
                                            >
                                                <option value="actif">Active</option>
                                                <option value="inactif">Pausée</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                {formData.image_url && (
                                    <div className="rounded-xl overflow-hidden border border-border h-32 bg-muted">
                                        <img src={formData.image_url} alt="Aperçu"
                                            className="w-full h-full object-cover"
                                            onError={e => { e.target.style.display = 'none'; }} />
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 h-10 rounded-xl bg-muted border border-border text-muted-foreground font-medium text-sm hover:text-foreground transition-colors">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={isSaving}
                                        className="flex-[2] h-10 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                        {isSaving
                                            ? <><RefreshCcw className="size-4 animate-spin" /> Enregistrement...</>
                                            : <><CheckCircle2 className="size-4" /> {editingAd ? 'Mettre à jour' : 'Créer la campagne'}</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default AdsManager;
