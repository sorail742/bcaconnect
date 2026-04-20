import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Store, Info, Loader2,
    CheckCircle2, Upload, Zap,
    ArrowUpRight, Globe, X,
    Mail, Phone, ShieldCheck, ShoppingBag,
    Images, ImagePlus, Layout, Monitor,
    ChevronLeft, ChevronRight, MousePointer2, Trash2
} from 'lucide-react';
import storeService from '../../services/storeService';
import api from '../../services/api';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useMyStore } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';

const Toggle = ({ enabled, onChange, label, sublabel }) => (
    <div className="flex items-center justify-between group p-4 bg-white/[0.02] border border-foreground/5 rounded-2xl hover:border-[#FFB703]/20 transition-all duration-700 shadow-inner">
        <div className="space-y-2">
            <p className="text-[10px] font-black text-foreground uppercase  leading-none pt-0.5">{label}</p>
            <p className="text-[9px] font-black text-muted-foreground uppercase  leading-none opacity-60">{sublabel}</p>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={cn(
                "relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full transition-all duration-700 ease-in-out",
                enabled ? "bg-[#FFB703] shadow-[0_0_25px_rgba(255,183,3,0.4)]" : "bg-foreground/10"
            )}
        >
            <div
                className={cn(
                    "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-2xl transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1)",
                    enabled ? "translate-x-8" : "translate-x-1.5"
                )}
            />
        </button>
    </div>
);

const StoreSettings = () => {
    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    
    // React Query Data
    const { data: storeInfo, loading: isLoading, refetch: refreshStore } = useMyStore();
    const isNew = !storeInfo;
    
    const [shopData, setShopData] = useState({
        name: '',
        url: '',
        email: '',
        phone: '',
        description: '',
        logo_url: '',
        use_carousel: false,
        banner_images: []
    });
    
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // Initialisation synchrone avec useMyStore
    useEffect(() => {
        if (storeInfo) {
            setShopData({
                name: storeInfo.nom_boutique || '',
                url: storeInfo.slug || '',
                email: storeInfo.email_boutique || '',
                phone: storeInfo.telephone_boutique || '',
                description: storeInfo.description || '',
                logo_url: storeInfo.logo_url || '',
                use_carousel: storeInfo.use_carousel || false,
                banner_images: storeInfo.banner_images || []
            });
        }
    }, [storeInfo]);

    const handleFileUpload = async (e, type = 'logo') => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (type === 'banner' && shopData.use_carousel && (shopData.banner_images.length + files.length > 5)) {
            return toast.error("Limite de 5 images atteinte.");
        }

        const validFiles = files.filter(file => {
            const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
            const isValidSize = file.size <= 2 * 1024 * 1024;
            return isValidType && isValidSize;
        });

        if (validFiles.length < files.length) {
            toast.warning("Images rejetées.");
        }

        if (!validFiles.length) return;

        if (type === 'logo') setIsUploading(true);
        else setIsUploadingBanner(true);

        try {
            const uploadedUrls = [];
            for (const file of validFiles) {
                const formData = new FormData();
                formData.append('file', file);
                const response = await api.post(`/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls.push(response.data.url);
            }

            if (type === 'logo') {
                setShopData(prev => ({ ...prev, logo_url: uploadedUrls[0] }));
                toast.success("Logo enregistré.");
            } else {
                if (shopData.use_carousel) {
                    setShopData(prev => ({ 
                        ...prev, 
                        banner_images: [...prev.banner_images, ...uploadedUrls].slice(0, 5) 
                    }));
                    toast.success("Carousel mis à jour.");
                } else {
                    setShopData(prev => ({ ...prev, banner_images: [uploadedUrls[0]] }));
                    toast.success("Bannière enregistrée.");
                }
            }
        } catch (error) {
            toast.error("Échec du téléchargement de l'image.");
        } finally {
            setIsUploading(false);
            setIsUploadingBanner(false);
        }
    };

    const removeBannerImage = (index) => {
        setShopData(prev => ({
            ...prev,
            banner_images: prev.banner_images.filter((_, i) => i !== index)
        }));
    };

    const { mutate: saveStore, isPending: isSaving } = useApiMutation(
        (payload) => isNew ? storeService.createStore(payload) : storeService.updateStore(payload),
        {
            invalidateKeys: [['my-store']],
            successMessage: isNew ? "Boutique créée." : "Paramètres enregistrés.",
            errorMessage: "Échec de l'enregistrement.",
            onSuccess: (data) => {
                if (data?.slug) setShopData(prev => ({ ...prev, url: data.slug }));
            }
        }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShopData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!shopData.name.trim()) return toast.error("Nom de boutique requis.");
        
        const payload = {
            nom_boutique: shopData.name.trim(),
            description: shopData.description,
            email_boutique: shopData.email,
            telephone_boutique: shopData.phone,
            logo_url: shopData.logo_url,
            use_carousel: shopData.use_carousel,
            banner_images: shopData.banner_images
        };
        
        saveStore(payload);
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Configuration de la Boutique">
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                    <div className="size-6 rounded-2xl border-4 border-[#FFB703]/10 border-t-[#FFB703] animate-spin shadow-2xl shadow-[#FFB703]/20" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase  animate-pulse">Chargement...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Boutique & Vitrine" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">

                {/* Executive Command Bar — Master Directive */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group/header">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 transition-all duration-700 group-hover:rotate-12 shadow-sm">
                                <Store className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Configuration <span className="text-primary">Boutique</span>.
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        Instance Active — {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link 
                                to={`/shop/${shopData.url || 'preview'}`} 
                                className="hidden sm:flex h-11 px-6 bg-slate-50 border border-slate-100 rounded-2xl items-center gap-3 text-slate-500 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                            >
                                <Globe className="size-4" />
                                <span>Ma Vitrine</span>
                            </Link>
                            <button
                                id="btn-save-store-settings"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-11 px-8 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center gap-3 group/save border-0"
                            >
                                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4 transition-transform group-hover/save:scale-125" />}
                                <span>{isSaving ? 'SYNC...' : 'SAUVEGARDER'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                    <div className="xl:col-span-8 space-y-6">
                        {/* Branding Station — High Density HUD */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8 group/branding">
                             <div className="flex items-center gap-3 text-slate-900">
                                <Zap className="size-5 text-amber-500 animate-pulse" />
                                <h3 className="text-sm font-black uppercase tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Identité Visuelle</h3>
                             </div>

                             <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom Commercial</label>
                                    <input
                                        name="name"
                                        value={shopData.name}
                                        onChange={handleChange}
                                        placeholder="EX: BCA CONNECT OFFICE..."
                                        className="h-12 w-full px-6 bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 rounded-2xl text-base font-black tracking-tight outline-none transition-all text-slate-900 uppercase"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Lien Permanent (URL)</label>
                                    <div className="flex items-center h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                                        <div className="h-full px-6 border-r border-slate-100 flex items-center bg-slate-100/50">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">/STORE/</span>
                                        </div>
                                        <input
                                            readOnly
                                            value={shopData.url || 'AUTOMATIQUE'}
                                            className="flex-1 bg-transparent px-6 text-sm font-bold text-slate-400 outline-none cursor-not-allowed uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Logo Officiel (PNG, WEBP)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative group/upload h-48 rounded-2xl bg-slate-50 border border-dashed border-slate-200 hover:border-primary/40 transition-all duration-500 flex flex-col items-center justify-center gap-4 overflow-hidden">
                                            {isUploading ? (
                                                <Loader2 className="size-6 text-primary animate-spin" />
                                            ) : (
                                                <>
                                                    <div className="size-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover/upload:text-primary group-hover/upload:rotate-12 transition-all">
                                                        <Upload className="size-5" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TELEVERSER LOGO</p>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={(e) => handleFileUpload(e, 'logo')}
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    />
                                                </>
                                            )}
                                        </div>
                                        <div className="h-48 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-center relative overflow-hidden group shadow-inner">
                                            {shopData.logo_url ? (
                                                <img src={shopData.logo_url} className="w-full h-full object-contain drop-shadow-sm transition-transform duration-700 group-hover:scale-110" alt="Logo Preview" />
                                            ) : (
                                                <Store className="size-8 text-slate-200" />
                                            )}
                                            {shopData.logo_url && (
                                                <button
                                                    onClick={() => setShopData(prev => ({ ...prev, logo_url: '' }))}
                                                    className="absolute top-3 right-3 size-8 bg-white text-slate-400 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Banner & Carousel Architecture — High Density Multi-Node */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8 group/layout">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-900 border-none">
                                    <Layout className="size-5 text-amber-500" />
                                    <h3 className="text-sm font-black uppercase tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Visuels Publicitaires</h3>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 border border-slate-100 rounded-xl">
                                     <Monitor className="size-4 text-slate-400" />
                                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pt-0.5">Format Desktop & Mobile</span>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <Toggle 
                                    label="Activer les images défilantes (Carrousel)" 
                                    sublabel="Jusqu'à 5 images d'en-tête" 
                                    enabled={shopData.use_carousel}
                                    onChange={(val) => setShopData(prev => ({ ...prev, use_carousel: val }))}
                                />

                                <div className="space-y-4">
                                     <div className="flex items-center justify-between border-b border-foreground/5 pb-8">
                                         <label className="text-[10px] font-black uppercase  text-muted-foreground ml-2">
                                             {shopData.use_carousel ? `Images ( ${shopData.banner_images.length}/5 )` : 'Image de Bannière'}
                                         </label>
                                         <button 
                                            onClick={() => bannerInputRef.current?.click()}
                                            disabled={isUploadingBanner || (shopData.use_carousel && shopData.banner_images.length >= 5)}
                                            className="h-11 px-8 bg-white/[0.03] border border-foreground/10 rounded-2xl text-[10px] font-black text-[#FFB703] uppercase  flex items-center gap-4 hover:bg-[#FFB703] hover:text-background transition-all group disabled:opacity-20 "
                                         >
                                            <ImagePlus className="size-5" />
                                            <span>Ajouter</span>
                                         </button>
                                         <input 
                                            type="file" 
                                            ref={bannerInputRef} 
                                            onChange={(e) => handleFileUpload(e, 'banner')} 
                                            multiple={shopData.use_carousel}
                                            accept="image/*"
                                            className="hidden"
                                         />
                                     </div>

                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                         {shopData.banner_images.map((img, idx) => (
                                             <div key={idx} className="relative aspect-video rounded-2xl bg-black border border-foreground/10 overflow-hidden group shadow-2xl transition-all duration-500 hover:border-[#FFB703]/30">
                                                 <img src={img} className="size-full object-cover transition-transform duration-1000 group-hover:scale-125 opacity-80 group-hover:opacity-100" alt="" />
                                                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                                 <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                      <button 
                                                        onClick={() => removeBannerImage(idx)}
                                                        className="size-6 rounded-2xl bg-rose-500 text-foreground flex items-center justify-center hover:rotate-12 transition-all  shadow-2xl"
                                                      >
                                                          <Trash2 className="size-6" />
                                                      </button>
                                                 </div>
                                                 <div className="absolute top-4 left-4 px-4 py-1.5 bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-xl text-[8px] font-black text-[#FFB703] uppercase  shadow-lg">Image {idx + 1}</div>
                                             </div>
                                         ))}

                                         {(shopData.banner_images.length === 0 || (shopData.use_carousel && shopData.banner_images.length < 5)) && (
                                             <button 
                                                onClick={() => bannerInputRef.current?.click()}
                                                disabled={isUploadingBanner}
                                                className="aspect-video rounded-2xl border border-dashed border-foreground/10 flex flex-col items-center justify-center gap-3 hover:border-[#FFB703]/40 hover:bg-[#FFB703]/[0.02] transition-all duration-700 group shadow-inner"
                                             >
                                                 {isUploadingBanner ? (
                                                     <Loader2 className="size-6 text-[#FFB703] animate-spin" />
                                                 ) : (
                                                     <>
                                                        <Images className="size-6 text-slate-800 group-hover:text-[#FFB703] transition-all group-hover:scale-110" />
                                                        <p className="text-[10px] font-black text-slate-600 uppercase  group-hover:text-foreground transition-colors">Ajouter une image</p>
                                                     </>
                                                 )}
                                             </button>
                                         )}
                                     </div>
                                </div>
                             </div>
                        </div>

                        {/* Communications Hub — Secure Signals */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8 group/comm">
                            <div className="flex items-center gap-3 text-slate-900 border-none">
                                <Phone className="size-5 text-emerald-500 group-hover/comm:rotate-12 transition-transform duration-700" />
                                <h3 className="text-sm font-black uppercase tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Canaux de Contact</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">E-mail Professionnel</label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 size-4 group-focus-within/input:text-primary transition-colors" />
                                        <input
                                            name="email"
                                            type="email"
                                            value={shopData.email}
                                            onChange={handleChange}
                                            placeholder="HELLO@BOUTIQUE.COM"
                                            className="h-12 w-full pl-12 pr-6 bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 rounded-2xl text-xs font-bold tracking-widest outline-none transition-all text-slate-900 uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ligne Directe</label>
                                    <div className="relative group/input">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 size-4 group-focus-within/input:text-primary transition-colors" />
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={shopData.phone}
                                            onChange={handleChange}
                                            placeholder="+224 XXX XX XX XX"
                                            className="h-12 w-full pl-12 pr-6 bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 rounded-2xl text-xs font-bold tracking-widest outline-none transition-all text-slate-900 tabular-nums"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Manifeste de la Boutique</label>
                                <textarea
                                    name="description"
                                    value={shopData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="DECRIRE VOTRE HISTOIRE ET VOS PRODUITS..."
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold tracking-tight focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-slate-900 leading-relaxed uppercase shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-4 space-y-6">
                        {/* Live Preview Display — High Intensity HUD Preview */}
                        <div className="sticky top-40 space-y-4">
                             <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="h-1 w-8 bg-slate-200 rounded-full" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Preview</p>
                                <div className="h-1 w-8 bg-slate-200 rounded-full" />
                             </div>
                            
                            <div className="mx-auto w-[280px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-[6px] border-slate-800 relative overflow-hidden group">
                                <div className="bg-white rounded-[2.2rem] h-[500px] overflow-hidden relative flex flex-col">
                                    <div className="h-[120px] bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                        {shopData.banner_images.length > 0 ? (
                                            <div className="size-full">
                                                <img src={shopData.banner_images[0]} className="size-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white" />
                                        )}
                                        
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 p-1.5 bg-white rounded-2xl shadow-xl z-20">
                                            <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 p-1">
                                                {shopData.logo_url ? <img src={shopData.logo_url} className="w-full h-full object-contain" /> : <Store className="size-6 text-slate-200" />}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 px-5 py-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                                        <div className="text-center space-y-2">
                                            <h4 className="text-xs font-black text-slate-900 uppercase truncate tracking-tight">{shopData.name || 'MA BOUTIQUE'}</h4>
                                            <p className="text-[9px] text-primary font-bold uppercase tracking-widest">{shopData.url || 'INSTANCE'}.BCA</p>
                                        </div>

                                        <div className="h-px bg-slate-100 w-full" />

                                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase opacity-70">
                                            {shopData.description || 'AUCUNE DESCRIPTION DISPONIBLE.'}
                                        </p>

                                        <div className="flex flex-col gap-2 pt-2">
                                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest py-2 border-y border-slate-50">
                                                <span className="text-slate-400">Statut</span>
                                                <span className="text-emerald-500">En ligne</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest py-2 border-b border-slate-50">
                                                <span className="text-slate-400">Localisation</span>
                                                <span className="text-slate-600">Guinée</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <Link 
                                            to={`/shop/${shopData.url || 'preview'}`} 
                                            className="w-full h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                        >
                                            Visiter la Vitrine
                                        </Link>
                                    </div>
                                </div>
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-b-xl z-30" />
                            </div>

                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4 items-start group/info shadow-sm">
                                <Info className="text-amber-500 size-5 shrink-0 mt-0.5 transition-transform group-hover/info:scale-110" />
                                <p className="text-[10px] font-bold text-amber-900/60 uppercase tracking-widest leading-relaxed">
                                    Les modifications seront propagées en temps réel sur le réseau BCA Connect.
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
