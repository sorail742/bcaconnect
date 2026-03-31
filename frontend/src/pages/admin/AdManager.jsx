import React, { useState, useEffect } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const AdsManager = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        image_url: '',
        lien_redirection: '',
        priorite: 1,
        statut: 'actif'
    });

    const fetchAds = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/ads`);
            setAds(response.data);
        } catch (error) {
            toast.error("Échec de la synchronisation des campagnes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Cesser définitivement la diffusion de cette campagne ?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/ads/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success("Campagne révoquée.");
            fetchAds();
        } catch (error) {
            toast.error("Opération compromise.");
        }
    };

    const handleOpenModal = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                titre: ad.titre,
                image_url: ad.image_url,
                lien_redirection: ad.lien_redirection,
                priorite: ad.priorite,
                statut: ad.statut
            });
        } else {
            setEditingAd(null);
            setFormData({ titre: '', image_url: '', lien_redirection: '', priorite: 1, statut: 'actif' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingAd) {
                await axios.put(`${import.meta.env.VITE_API_URL}/ads/${editingAd.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Campagne actualisée.");
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/ads`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Nouvelle diffusion lancée.");
            }
            setShowModal(false);
            fetchAds();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement de la campagne.");
        }
    };

    return (
        <DashboardLayout title="DIRECTOIRE PUBLICITAIRE">
            <div className="space-y-12 animate-in fade-in duration-700 pb-20">
                
                {/* ── Header Executive ──────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-border pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                            <span className="text-executive-label font-black text-amber-500 uppercase tracking-[0.4em] italic leading-none pt-0.5">Surveillance de l'Audience BCA</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">Gestion des <br /><span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Campagnes.</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-lg italic border-l-4 border-primary/20 pl-8 max-w-xl">Pilotage haut-débit de la visibilité des marques et produits au sein de l'écosystème Guinée.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchAds}
                            className="h-24 w-24 bg-background border-4 border-border rounded-[2.5rem] flex items-center justify-center text-muted-foreground/30 hover:border-primary/40 hover:text-primary transition-all shadow-premium group"
                        >
                            <RefreshCcw className="size-8 group-hover:rotate-180 transition-transform duration-700" />
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="h-24 px-12 bg-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs flex items-center gap-6 shadow-premium-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <Plus className="size-6 group-hover:rotate-90 transition-transform duration-500" />
                            <span className="relative z-10 leading-none pt-1">Lancer Campagne</span>
                        </button>
                    </div>
                </div>

                {/* ── Active Campaigns Grid ─────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {loading ? (
                        [1, 2, 3, 4].map(n => <div key={n} className="h-[28rem] bg-accent/20 rounded-[4rem] animate-pulse border-4 border-border" />)
                    ) : ads.length === 0 ? (
                        <div className="lg:col-span-2 py-40 flex flex-col items-center gap-8 opacity-20">
                            <Zap className="size-20" />
                            <p className="text-2xl font-black italic tracking-tighter uppercase">Silence Diffusion — Aucune Campagne</p>
                        </div>
                    ) : (
                        ads.map(ad => (
                            <div
                                key={ad.id}
                                className="glass-card border-4 border-border rounded-[4rem] overflow-hidden shadow-premium hover:shadow-premium-lg hover:border-primary/20 transition-all duration-700 group flex flex-col"
                            >
                                {/* Banner Preview */}
                                <div className="h-64 relative overflow-hidden bg-accent">
                                    <img 
                                        src={ad.image_url} 
                                        alt={ad.titre}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute top-6 right-6">
                                        <div className={cn(
                                            "flex items-center gap-3 px-4 py-2 rounded-full border-2 backdrop-blur-md",
                                            ad.statut === 'actif' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-500/10 border-white/10 text-white/40"
                                        )}>
                                            {ad.statut === 'actif' ? <Play className="size-3 fill-current" /> : <Pause className="size-3 fill-current" />}
                                            <span className="text-[9px] font-black uppercase tracking-widest italic">{ad.statut === 'actif' ? 'DIFFUSION ACTIVE' : 'CAMPAGNE EN PAUSE'}</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-6 left-8 flex items-end gap-6">
                                        <div className="bg-primary px-4 py-1.5 rounded-lg text-[9px] font-black text-white italic uppercase tracking-[0.2em] shadow-lg">
                                            PRIORITÉ {ad.priorite}
                                        </div>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl truncate max-w-[350px]">
                                            {ad.titre}
                                        </h3>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="p-10 flex-1 space-y-8 flex flex-col justify-between">
                                    <div className="grid grid-cols-3 gap-6 p-6 rounded-[2rem] bg-background border-4 border-border shadow-inner">
                                        <div className="text-center space-y-2 border-r-2 border-border/50">
                                            <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] italic">Vues</p>
                                            <div className="flex items-center justify-center gap-2 text-xl font-black italic tracking-tighter text-executive-data">
                                                <Eye className="size-4 text-primary" />
                                                {Math.floor(Math.random() * 1200)}
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2 border-r-2 border-border/50">
                                            <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] italic">Clics</p>
                                            <div className="flex items-center justify-center gap-2 text-xl font-black italic tracking-tighter text-executive-data">
                                                <MousePointer2 className="size-4 text-primary" />
                                                {Math.floor(Math.random() * 450)}
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] italic">Taux</p>
                                            <div className="flex items-center justify-center gap-2 text-xl font-black italic tracking-tighter text-emerald-500">
                                                <TrendingUp className="size-4" />
                                                {(Math.random() * 8 + 1).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t-2 border-border/50">
                                        <div className="flex items-center gap-3 text-muted-foreground/20 hover:text-primary transition-colors cursor-pointer group/link">
                                            <LinkIcon className="size-4" />
                                            <span className="text-[10px] font-black italic truncate max-w-[200px]">{ad.lien_redirection}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => handleOpenModal(ad)}
                                                className="size-16 bg-background border-4 border-border rounded-2xl flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:border-primary/40 transition-all shadow-premium active:scale-95"
                                            >
                                                <Edit3 className="size-6" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(ad.id)}
                                                className="size-16 bg-background border-4 border-border rounded-2xl flex items-center justify-center text-muted-foreground/40 hover:text-rose-500 hover:border-rose-500/40 transition-all shadow-premium active:scale-95"
                                            >
                                                <Trash2 className="size-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal de Diffusion (Executive Form) */}
                <div className={cn(
                    "fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-500",
                    showModal ? "opacity-100 visible" : "opacity-0 invisible"
                )}>
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-2xl bg-card border-4 border-border rounded-[4rem] shadow-premium-lg overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b-4 border-border flex items-center justify-between bg-accent/20">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{editingAd ? 'AUDIT DE CAMPAGNE' : 'NOUVELLE DIFFUSION'}</h3>
                                <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic">Registre Publicitaire BCA v2</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="size-10 rounded-full bg-background border-2 border-border flex items-center justify-center text-muted-foreground/40 hover:text-primary transition-colors">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-12 space-y-8">
                            <div className="space-y-4">
                                <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Titre de Campagne</label>
                                <input
                                    required
                                    className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/40 text-sm font-black italic uppercase tracking-widest outline-none transition-all shadow-inner"
                                    placeholder="EX: PROMO HIGH-TECH GUINÉE"
                                    value={formData.titre}
                                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Priorité (1-10)</label>
                                    <input
                                        type="number"
                                        min="1" max="10"
                                        className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/40 text-sm font-black italic outline-none transition-all shadow-inner"
                                        value={formData.priorite}
                                        onChange={(e) => setFormData({ ...formData, priorite: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Statut Initial</label>
                                    <select
                                        className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/40 text-[10px] font-black uppercase tracking-widest italic outline-none transition-all shadow-inner appearance-none"
                                        value={formData.statut}
                                        onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                                    >
                                        <option value="actif">STATUT : ACTIF</option>
                                        <option value="inactif">STATUT : PAUSE</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Média Haute-Définition (URL)</label>
                                <div className="relative group/field">
                                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within/field:text-primary transition-colors" />
                                    <input
                                        required
                                        className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/40 text-xs font-medium italic outline-none transition-all shadow-inner"
                                        placeholder="HTTPS://ASSETS.BCA.GN/ADS/SUMMER_PROMO.JPG"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Protocole de Redirection (Lien)</label>
                                <div className="relative group/field">
                                    <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within/field:text-primary transition-colors" />
                                    <input
                                        required
                                        className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/40 text-xs font-medium italic outline-none transition-all shadow-inner"
                                        placeholder="HTTPS://BCACONNECT.GN/CATALOGUE/OFFRE-LIMITE"
                                        value={formData.lien_redirection}
                                        onChange={(e) => setFormData({ ...formData, lien_redirection: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 pt-10">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 h-20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-foreground hover:bg-accent transition-all italic underline decoration-4 underline-offset-8 decoration-transparent hover:decoration-border"
                                >
                                    Annuler l'Opération
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white h-20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-premium-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all italic leading-none"
                                >
                                    {editingAd ? 'CONFIRMER MODIFICATIONS' : 'APPROUVER DIFFUSION'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdsManager;
