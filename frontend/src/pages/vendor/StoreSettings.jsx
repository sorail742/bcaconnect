import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Sparkles, HelpCircle, Store, Eye, Info, Loader2,
    CheckCircle2, Upload, Activity, ShieldCheck, Zap,
    ArrowUpRight, RefreshCw, Trash2, Mail, Phone,
    FileText, Globe, X
} from 'lucide-react';
import storeService from '../../services/storeService';
import api from '../../services/api';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

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
            return toast.error("Format non supporté (JPEG, PNG, WEBP).");
        }

        if (file.size > 2 * 1024 * 1024) {
            return toast.error("Fichier trop volumineux (max 2MB).");
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(`/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShopData(prev => ({ ...prev, logo_url: response.data.url }));
            toast.success("Logo mis à jour.");
        } catch (error) {
            toast.error("Erreur lors de l'envoi du logo.");
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
                else toast.error("Erreur de connexion au service.");
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
        if (!shopData.name.trim()) return toast.error("Nom de boutique requis.");

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
                toast.success("Boutique créée avec succès.");
            } else {
                const updated = await storeService.updateStore(payload);
                if (updated?.slug) setShopData(prev => ({ ...prev, url: updated.slug }));
                toast.success("Paramètres enregistrés.");
            }
        } catch (error) {
            toast.error("Échec de l'enregistrement.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Configuration">
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="size-10 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Paramètres Boutique">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-24 px-6 md:px-10 pt-10">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Identité Partenaire</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Ma <span className="text-primary italic">Boutique.</span></h2>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-14 px-10 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl"
                        >
                            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                            Enregistrer Profil
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
                            <div className="flex items-center gap-4 text-primary">
                                <Store className="size-6" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Branding</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nom Commercial</label>
                                    <Input
                                        name="name"
                                        value={shopData.name}
                                        onChange={handleChange}
                                        placeholder="NOM DE VOTRE ENSEIGNE..."
                                        className="h-14 px-6 rounded-xl font-bold text-sm uppercase tracking-tight"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Lien de la Boutique (Slug)</label>
                                    <div className="flex items-center h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                                        <div className="h-full px-4 border-r border-slate-200 dark:border-slate-700 flex items-center bg-slate-100/50 dark:bg-slate-800">
                                            <Globe className="size-4 text-slate-400" />
                                            <span className="ml-2 text-[9px] font-bold uppercase text-slate-400">bcaconnect.gn/store/</span>
                                        </div>
                                        <input
                                            readOnly
                                            value={shopData.url}
                                            className="flex-1 bg-transparent px-4 text-xs font-bold text-slate-400 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Logo Officiel</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative group h-48 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary transition-all flex flex-col items-center justify-center gap-4 overflow-hidden">
                                            {isUploading ? (
                                                <Loader2 className="size-8 text-primary animate-spin" />
                                            ) : (
                                                <>
                                                    <Upload className="size-8 text-slate-300 group-hover:text-primary transition-colors" />
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Cliquer pour uploader</p>
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
                                        <div className="h-48 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-center relative overflow-hidden">
                                            {shopData.logo_url ? (
                                                <img src={shopData.logo_url} className="w-full h-full object-contain" alt="Logo Preview" />
                                            ) : (
                                                <Store className="size-12 text-slate-100 dark:text-slate-800" />
                                            )}
                                            {shopData.logo_url && (
                                                <button
                                                    onClick={() => setShopData(prev => ({ ...prev, logo_url: '' }))}
                                                    className="absolute top-2 right-2 size-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-500 rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-sm"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">A Propos (Vision)</label>
                                    <textarea
                                        name="description"
                                        value={shopData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="DÉCRIVEZ VOTRE VISION ET VOTRE ÉTABLISSEMENT..."
                                        className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
                            <div className="flex items-center gap-4 text-emerald-500">
                                <Phone className="size-6" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Contact & Liaisons</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Clientèle</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={shopData.email}
                                        onChange={handleChange}
                                        placeholder="CONTACT@SHOP.GN"
                                        className="h-14 px-6 rounded-xl font-bold text-xs uppercase"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Ligne Directe</label>
                                    <Input
                                        name="phone"
                                        type="tel"
                                        value={shopData.phone}
                                        onChange={handleChange}
                                        placeholder="+224 ..."
                                        className="h-14 px-6 rounded-xl font-bold text-xs uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-4 space-y-8 h-full">
                        <div className="sticky top-28 space-y-8 animate-fade-in">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl group">
                                <div className="h-40 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                                    <Zap className="size-20 text-white/5" />
                                    <div className="absolute -bottom-10 left-10 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-110">
                                        <div className="size-20 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
                                            {shopData.logo_url ? <img src={shopData.logo_url} className="w-full h-full object-contain" /> : <Store className="size-10 text-slate-200" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-16 pb-8 px-10 space-y-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase truncate">{shopData.name || 'Ma Boutique'}</h4>
                                        <p className="text-[9px] text-primary font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                            <Globe className="size-3" /> /store/{shopData.url || 'mon-shop'}
                                        </p>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic line-clamp-3">
                                        {shopData.description || 'Présentez votre vision ici...'}
                                    </p>
                                    <Link to={`/shop/${shopData.url || 'preview'}`} className="block w-full h-12 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center gap-3 text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                        Voir la vitrine <ArrowUpRight className="size-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 flex gap-4">
                                <Info className="text-indigo-500 size-6 shrink-0" />
                                <p className="text-[10px] font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-widest leading-relaxed italic">
                                    Vos informations sont indexées instantanément sur la marketplace.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StoreSettings;
