import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Sparkles, HelpCircle, Store, Eye, Info, Loader2,
    CheckCircle2, Upload, Activity, ShieldCheck, Zap,
    ArrowUpRight, RefreshCw, Trash2, Mail, Phone,
    FileText, Globe
} from 'lucide-react';
import storeService from '../../services/storeService';
import api from '../../services/api';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const StoreSettings = () => {
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [shopData, setShopData] = useState({
        name: '',
        url: '',
        email: '',
        phone: '',
        description: '',
        logo_url: ''
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            return toast.error("Protocole non supporté. JPEG, PNG ou WEBP uniquement.");
        }

        if (file.size > 2 * 1024 * 1024) {
            return toast.error("Volume d'asset excessif (max 2MB).");
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await api.post(`${backendUrl}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShopData(prev => ({ ...prev, logo_url: response.data.url }));
            toast.success("Identité visuelle synchronisée.");
        } catch (error) {
            toast.error("Échec du déploiement de l'asset.");
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const data = await storeService.getMyStore();
                if (!data) {
                    setIsNew(true);
                    return;
                }
                setShopData({
                    name: data.nom_boutique || '',
                    url: data.slug || '',
                    email: data.email_boutique || '',
                    phone: data.telephone_boutique || '',
                    description: data.description || '',
                    logo_url: data.logo_url || ''
                });
                setIsNew(false);
            } catch (error) {
                if (error.response?.status === 404) setIsNew(true);
                else toast.error("Accès base de données restreint.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStore();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShopData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!shopData.name.trim()) return toast.error("Désignation commerciale requise.");

        setIsSaving(true);
        try {
            const payload = {
                nom_boutique: shopData.name.trim(),
                description: shopData.description,
                email_boutique: shopData.email,
                telephone_boutique: shopData.phone,
                logo_url: shopData.logo_url
            };

            if (isNew) {
                const newStore = await storeService.createStore(payload);
                setShopData(prev => ({
                    ...prev,
                    url: newStore.slug || '',
                    name: newStore.nom_boutique || prev.name,
                }));
                setIsNew(false);
                toast.success("Entité commerciale créée.");
            } else {
                const updated = await storeService.updateStore(payload);
                if (updated?.slug) setShopData(prev => ({ ...prev, url: updated.slug }));
                toast.success("Paramètres synchronisés.");
            }
        } catch (error) {
            toast.error("Échec de la validation.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="CONFIGURATION BOUTIQUE">
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="size-16 border-8 border-primary border-t-transparent rounded-full animate-spin shadow-premium-lg shadow-primary/20" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="PARAMÈTRES PARTENAIRE">
            <div className="space-y-12 animate-in fade-in duration-1000 pb-20">

                {/* ── Executive Header ─────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-border pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                            <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none pt-0.5">Configuration de l'Entité</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">Profil <br /><span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Partenaire.</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-lg italic border-l-4 border-primary/20 pl-8 max-w-xl">Administration de votre présence digitale et de vos protocoles de communication sur l'écosystème BCA.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-24 px-12 bg-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs flex items-center gap-6 shadow-premium-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden h-24"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            {isSaving ? <Loader2 className="size-6 animate-spin" /> : <CheckCircle2 className="size-6" />}
                            <span className="relative z-10 leading-none pt-1">{isSaving ? 'SYNCHRONISATION...' : 'SCELLER PROFIL'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    
                    {/* ── Configuration Section ────────────────────────── */}
                    <div className="xl:col-span-8 space-y-12">
                        
                        {/* Branding & Identity */}
                        <div className="glass-card rounded-[3.5rem] border-4 border-border p-12 space-y-12 shadow-premium hover:border-primary/20 transition-all duration-500">
                            <div className="flex items-center gap-6 border-b-4 border-border pb-8">
                                <div className="size-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-premium-lg shadow-primary/20">
                                    <Sparkles className="size-8" />
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Identité de Marque</h3>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-3 ml-2">
                                        Désignation Commerciale <span className="text-primary">·</span>
                                    </label>
                                    <input
                                        name="name"
                                        value={shopData.name}
                                        onChange={handleChange}
                                        placeholder="EX: ALPHA TRADING GUINÉE"
                                        className="w-full h-20 px-8 rounded-[2rem] border-4 border-border bg-background focus:border-primary/40 text-lg font-black italic uppercase tracking-tighter outline-none transition-all shadow-inner"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-3 ml-2">
                                        Adresse Indexée (Slug)
                                    </label>
                                    <div className="flex items-center h-20 rounded-[2rem] border-4 border-border bg-accent/20 overflow-hidden shadow-inner">
                                        <div className="h-full px-8 bg-border/50 flex items-center justify-center border-r-4 border-border">
                                            <Globe className="size-5 text-muted-foreground/40" />
                                            <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">bcaconnect.gn/store/</span>
                                        </div>
                                        <input
                                            readOnly
                                            value={shopData.url}
                                            className="flex-1 bg-transparent px-8 text-sm font-black italic uppercase tracking-widest text-muted-foreground/30 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-3 ml-2">
                                        Asset Visuel (Logo)
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="relative group/upload h-64 rounded-[2.5rem] bg-background border-4 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center gap-6 overflow-hidden shadow-inner">
                                            {isUploading ? (
                                                <Loader2 className="size-12 text-primary animate-spin" />
                                            ) : (
                                                <>
                                                    <div className="size-20 rounded-full bg-accent/30 flex items-center justify-center text-muted-foreground/20 group-hover/upload:scale-110 group-hover/upload:text-primary transition-all">
                                                        <Upload className="size-10" />
                                                    </div>
                                                    <div className="text-center space-y-2">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Transférer l'Asset</p>
                                                        <p className="text-[9px] font-bold text-muted-foreground/30 uppercase">HD REQUIRED · 2MB MAX</p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileUpload}
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </>
                                            )}
                                        </div>
                                        <div className="h-64 rounded-[2.5rem] bg-accent/20 border-4 border-border p-8 flex flex-col gap-6 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                                <Store className="size-32" />
                                            </div>
                                            <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/20 italic">Aperçu Logo</label>
                                            <div className="flex-1 flex items-center justify-center bg-background rounded-3xl border-4 border-border shadow-premium overflow-hidden group-hover:scale-[1.02] transition-transform">
                                                {shopData.logo_url ? (
                                                    <img src={shopData.logo_url} className="w-full h-full object-cover" alt="Preview" />
                                                ) : (
                                                    <Store className="size-16 text-muted-foreground/10" />
                                                )}
                                            </div>
                                            {shopData.logo_url && (
                                                <button
                                                    onClick={() => setShopData(prev => ({ ...prev, logo_url: '' }))}
                                                    className="absolute top-4 right-4 size-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-premium-lg shadow-rose-500/20"
                                                >
                                                    <Trash2 className="size-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-3 ml-2">
                                        Vision & Description Analytique
                                    </label>
                                    <textarea
                                        name="description"
                                        value={shopData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="EXPOSEZ VOTRE EXPERTISE, VOS VALEURS ET VOTRE IMPACT..."
                                        className="w-full px-8 py-8 rounded-[2rem] border-4 border-border bg-background text-sm font-bold italic uppercase tracking-widest focus:border-primary/40 outline-none transition-all shadow-inner resize-none placeholder:text-muted-foreground/10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Protocols */}
                        <div className="glass-card rounded-[3.5rem] border-4 border-border p-12 space-y-12 shadow-premium hover:border-amber-500/20 transition-all duration-500">
                            <div className="flex items-center gap-6 border-b-4 border-border pb-8">
                                <div className="size-16 rounded-[1.5rem] bg-amber-500 text-white flex items-center justify-center shadow-premium-lg shadow-amber-500/20">
                                    <HelpCircle className="size-8" />
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Protocoles de Liaison</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-3 ml-2">
                                        Canal Email Pro
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors pointer-events-none" />
                                        <input
                                            name="email"
                                            type="email"
                                            value={shopData.email}
                                            onChange={handleChange}
                                            className="w-full h-20 pl-16 pr-8 rounded-[2rem] border-4 border-border bg-background focus:border-primary/40 text-sm font-black italic uppercase tracking-widest outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-3 ml-2">
                                        Ligne Directe (SAV)
                                    </label>
                                    <div className="relative group">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors pointer-events-none" />
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={shopData.phone}
                                            onChange={handleChange}
                                            className="w-full h-20 pl-16 pr-8 rounded-[2rem] border-4 border-border bg-background focus:border-primary/40 text-sm font-black italic uppercase tracking-widest outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Preview Column ──────────────────────────────── */}
                    <div className="xl:col-span-4 h-full">
                        <div className="sticky top-28 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                                <h3 className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic">Projection Public</h3>
                            </div>

                            <div className="glass-card rounded-[3.5rem] overflow-hidden border-4 border-border shadow-premium hover:shadow-premium-lg transition-all duration-700 group">
                                <div className="h-48 bg-slate-950 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent scale-150 animate-pulse" />
                                    <div className="absolute -bottom-12 left-10 p-2 bg-card rounded-[2rem] border-4 border-border shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                        <div className="size-24 bg-accent/20 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-border shadow-inner">
                                            {shopData.logo_url ? (
                                                <img src={shopData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                                            ) : (
                                                <Store className="size-10 text-muted-foreground/10" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-20 pb-10 px-10 space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none truncate group-hover:text-primary transition-colors">
                                            {shopData.name || 'NOM DE L\'ENTITÉ'}
                                        </h4>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest italic truncate opacity-50">
                                            <Globe className="size-3" /> bcaconnect.gn/store/{shopData.url || 'slug-id'}
                                        </div>
                                    </div>
                                    
                                    <p className="text-muted-foreground/60 text-xs font-bold leading-relaxed italic uppercase tracking-widest line-clamp-4 border-l-4 border-primary/10 pl-6">
                                        {shopData.description || 'AUCUNE STRATÉGIE DE MARQUE DÉFINIE...'}
                                    </p>

                                    <div className="grid grid-cols-1 gap-4 pt-4 border-t-2 border-border/50">
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest italic opacity-40 group-hover:opacity-100 transition-all">
                                            <Mail className="size-4 text-primary" /> {shopData.email || 'CANAL NON RÉFÉRENCÉ'}
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest italic opacity-40 group-hover:opacity-100 transition-all">
                                            <Phone className="size-4 text-primary" /> {shopData.phone || 'LIGNE NON RÉFÉRENCÉE'}
                                        </div>
                                    </div>

                                    <Link to={`/shop/${shopData.url || 'mon-shop'}`} className="block w-full h-16 mt-8 rounded-2xl border-4 border-primary/20 flex items-center justify-center gap-4 hover:bg-primary hover:text-white transition-all group/visit shadow-premium active:scale-95">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] pt-1">VOIR SUR LA PLACE</span>
                                        <ArrowUpRight className="size-5 group-hover/visit:translate-x-1 group-hover/visit:-translate-y-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border-4 border-indigo-500/10 flex gap-6 group hover:border-indigo-500/30 transition-all duration-500">
                                <Info className="text-indigo-500 size-8 shrink-0 animate-pulse" />
                                <div>
                                    <p className="text-[11px] font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest italic leading-relaxed">
                                        Les modifications de profil sont indexées en temps réel sur le réseau BCA. Assurez-vous de la conformité de vos informations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StoreSettings;
