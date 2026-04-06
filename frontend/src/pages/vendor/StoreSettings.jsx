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
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    
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

    const handleFileUpload = async (e, type = 'logo') => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (type === 'banner' && shopData.use_carousel && (shopData.banner_images.length + files.length > 5)) {
            return toast.error("LIMITE_DE_5_IMAGES_ATTEINTE.");
        }

        const validFiles = files.filter(file => {
            const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
            const isValidSize = file.size <= 2 * 1024 * 1024;
            return isValidType && isValidSize;
        });

        if (validFiles.length < files.length) {
            toast.warning("ASSETS_REJETÉS_RÉSEAU.");
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
                toast.success("LOGO_SCELLÉ.");
            } else {
                if (shopData.use_carousel) {
                    setShopData(prev => ({ 
                        ...prev, 
                        banner_images: [...prev.banner_images, ...uploadedUrls].slice(0, 5) 
                    }));
                    toast.success("ASSETS_CAROUSEL_ACTUALISÉS.");
                } else {
                    setShopData(prev => ({ ...prev, banner_images: [uploadedUrls[0]] }));
                    toast.success("BANNER_STATIQUE_FIXÉE.");
                }
            }
        } catch (error) {
            toast.error("ÉCHEC_EXPÉDITION_ASSET.");
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
                    logo_url: data.logo_url || '',
                    use_carousel: data.use_carousel || false,
                    banner_images: data.banner_images || []
                });
                setIsNew(false);
            } catch (error) {
                if (error.response?.status === 404) setIsNew(true);
                else toast.error("CONFLIT_SYNC_PROTOCOLE.");
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
        if (!shopData.name.trim()) return toast.error("IDENTIFIANT_LÉGAL_REQUIS.");

        setIsSaving(true);
        try {
            const payload = {
                nom_boutique: shopData.name.trim(),
                description: shopData.description,
                email_boutique: shopData.email,
                telephone_boutique: shopData.phone,
                logo_url: shopData.logo_url,
                use_carousel: shopData.use_carousel,
                banner_images: shopData.banner_images
            };

            if (isNew) {
                const newStore = await storeService.createStore(payload);
                setShopData(prev => ({
                    ...prev,
                    url: newStore.slug || '',
                    name: newStore.nom_boutique || prev.name,
                }));
                setIsNew(false);
                toast.success("TERMINAL_CRÉÉ_RÉSEAU.");
            } else {
                const updated = await storeService.updateStore(payload);
                if (updated?.slug) setShopData(prev => ({ ...prev, url: updated.slug }));
                toast.success("PARAMÈTRES_ENREGISTRÉS.");
            }
        } catch (error) {
            toast.error("ÉCHEC_ENREGISTREMENT_CORE.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="CONFIGURATION_ALPHA">
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                    <div className="size-6 rounded-2xl border-4 border-[#FFB703]/10 border-t-[#FFB703] animate-spin shadow-2xl shadow-[#FFB703]/20" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase  animate-pulse">SYNC_TERMINAL...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="PARAMÈTRES_BOUTIQUE_EXECUTIVE">
            <div className="space-y-6 animate-in pb-16">

                {/* Executive Command Bar — Master Directive */}
                <div className="executive-card !p-4 group overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFB703]/[0.02] to-transparent pointer-events-none" />
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-6 rounded-[2.2rem] bg-[#FFB703]/10 flex items-center justify-center text-[#FFB703] border border-[#FFB703]/20 shadow-inner group-hover:rotate-6 transition-transform">
                                <Store className="size-6 shadow-sm" />
                            </div>
                            <div className="space-y-2.5">
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5">
                                    MON_<span className="text-[#FFB703]">TERMINAL</span>.
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-muted-foreground/80 uppercase  opacity-80 pt-0.5 underline decoration-[#FFB703]/40 underline-offset-8">
                                        NODE_SYNC — CONFIG_LIVE_{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link 
                                to={`/shop/${shopData.url || 'preview'}`} 
                                className="hidden sm:flex h-11 px-10 bg-white/[0.03] border border-foreground/10 rounded-2xl items-center gap-3 text-muted-foreground/80 hover:text-foreground hover:border-foreground/20 transition-all font-black text-[10px] uppercase  shadow-sm "
                            >
                                <Globe className="size-6" />
                                <span>VOIR_VITRINE</span>
                            </Link>
                            <button
                                id="btn-save-store-settings"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-11 px-6 bg-white text-background hover:bg-[#FFB703] rounded-2xl font-medium text-sm text-muted-foreground transition-all shadow-[0_30px_90px_rgba(0,0,0,0.5)]  flex items-center gap-3 group/save border-0"
                            >
                                {isSaving ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5 transition-transform group-hover/save:scale-125" />}
                                <span className="pt-0.5">{isSaving ? 'SÉCURISATION...' : 'SCELLER_COMMANDES'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                    <div className="xl:col-span-8 space-y-6">
                        {/* Branding Station — High Density HUD */}
                        <div className="executive-card !p-4 space-y-6 group/branding overflow-hidden">
                             <div className="flex items-center gap-3 text-foreground mb-2">
                                <Zap className="size-5 text-[#FFB703] animate-pulse" />
                                <h3 className="text-[13px] font-black uppercase  pt-1 leading-none">IDENTITÉ_VISUELLE_&_BRANDING_UNIT</h3>
                             </div>

                             <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase  text-muted-foreground ml-2">NOM_COMMERCIAL_ENSEIGNE</label>
                                    <input
                                        name="name"
                                        value={shopData.name}
                                        onChange={handleChange}
                                        placeholder="NOM_DE_VOTRE_BOUTIQUE..."
                                        className="h-11 w-full px-8 bg-white/[0.02] border border-foreground/10 focus:border-[#FFB703]/30 rounded-2xl text-[18px] font-black tracking-tight outline-none transition-all text-foreground shadow-inner uppercase"
                                    />
                                </div>

                                <div className="space-y-4 opacity-70 group-hover/branding:opacity-100 transition-opacity duration-700">
                                    <label className="text-[10px] font-black uppercase  text-muted-foreground ml-2">INDEX_RÉSEAU_SYS (URL_SLUG)</label>
                                    <div className="flex items-center h-11 rounded-2xl bg-background/40 border border-foreground/10 overflow-hidden shadow-inner">
                                        <div className="h-full px-8 border-r border-foreground/10 flex items-center bg-white/[0.03]">
                                            <span className="text-[10px] font-black uppercase  text-[#FFB703]">/STORE/</span>
                                        </div>
                                        <input
                                            readOnly
                                            value={shopData.url || 'GÉNERATION_AUTO_PRÉAMBULE'}
                                            className="flex-1 bg-transparent px-8 text-[14px] font-black text-muted-foreground/80 outline-none cursor-not-allowed uppercase tracking-wider"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black uppercase  text-muted-foreground ml-2">ASSET_LOGO_SÉCURISÉ (SVG/PNG/WEBP)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="relative group h-56 rounded-2xl bg-white/[0.01] border border-dashed border-foreground/10 hover:border-[#FFB703]/40 transition-all duration-700 flex flex-col items-center justify-center gap-4 overflow-hidden shadow-2xl group/upload">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFB703]/5 to-transparent opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                                            {isUploading ? (
                                                <Loader2 className="size-6 text-[#FFB703] animate-spin" />
                                            ) : (
                                                <>
                                                    <Upload className="size-6 text-slate-700 group-hover/upload:text-[#FFB703] transition-all group-hover/upload:rotate-12" />
                                                    <p className="text-[10px] font-black uppercase  text-muted-foreground group-hover/upload:text-foreground transition-colors">INITIER_TRANSFERT</p>
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
                                        <div className="h-56 rounded-2xl bg-background/60 border border-foreground/10 p-4 flex items-center justify-center relative overflow-hidden group shadow-[inset_0_20px_60px_rgba(0,0,0,0.4)]">
                                            {shopData.logo_url ? (
                                                <img src={shopData.logo_url} className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-1000 group-hover:scale-125" alt="Logo Preview" />
                                            ) : (
                                                <Store className="size-6 text-foreground/5" />
                                            )}
                                            {shopData.logo_url && (
                                                <button
                                                    onClick={() => setShopData(prev => ({ ...prev, logo_url: '' }))}
                                                    className="absolute top-4 right-4 size-6 bg-white text-background border border-foreground/10 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-foreground transition-all shadow-2xl "
                                                >
                                                    <X className="size-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Banner & Carousel Architecture — High Density Multi-Node */}
                        <div className="executive-card !p-4 space-y-6 group/layout overflow-hidden">
                             <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 text-foreground">
                                    <Layout className="size-5 text-[#FFB703]" />
                                    <h3 className="text-[13px] font-black uppercase  pt-1 leading-none">ARCHITECTURE_VITRINE_PANORAMIQUE</h3>
                                </div>
                                <div className="flex items-center gap-4 px-5 py-2 bg-[#FFB703]/10 border border-[#FFB703]/20 rounded-xl">
                                     <Monitor className="size-4 text-[#FFB703]" />
                                     <span className="text-[9px] font-black text-[#FFB703] uppercase  pt-0.5">RÉSEAU_GLOBAL_VIEW</span>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <Toggle 
                                    label="ACTIVER_CAROUSEL_DYNAMIQUE_RÉSEAU" 
                                    sublabel="SÉQUENCEUR_D'INDEXATION : JUSQU'À 5 ASSETS HD" 
                                    enabled={shopData.use_carousel}
                                    onChange={(val) => setShopData(prev => ({ ...prev, use_carousel: val }))}
                                />

                                <div className="space-y-4">
                                     <div className="flex items-center justify-between border-b border-foreground/5 pb-8">
                                         <label className="text-[10px] font-black uppercase  text-muted-foreground ml-2">
                                             {shopData.use_carousel ? `ASSETS_MODULAIRES (NODE : ${shopData.banner_images.length}/5)` : 'ASSET_BANNER_STATIQUE_FIXE'}
                                         </label>
                                         <button 
                                            onClick={() => bannerInputRef.current?.click()}
                                            disabled={isUploadingBanner || (shopData.use_carousel && shopData.banner_images.length >= 5)}
                                            className="h-11 px-8 bg-white/[0.03] border border-foreground/10 rounded-2xl text-[10px] font-black text-[#FFB703] uppercase  flex items-center gap-4 hover:bg-[#FFB703] hover:text-background transition-all group disabled:opacity-20 "
                                         >
                                            <ImagePlus className="size-5" />
                                            <span>AJOUTER_NODES</span>
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
                                                 <div className="absolute top-4 left-4 px-4 py-1.5 bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-xl text-[8px] font-black text-[#FFB703] uppercase  shadow-lg">NODE_#{idx + 1}</div>
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
                                                        <p className="text-[10px] font-black text-slate-600 uppercase  group-hover:text-foreground transition-colors">IMPORT_NOEUD_ASSET</p>
                                                     </>
                                                 )}
                                             </button>
                                         )}
                                     </div>
                                </div>
                             </div>
                        </div>

                        {/* Communications Hub — Secure Signals */}
                        <div className="executive-card !p-4 space-y-6 group/comm overflow-hidden">
                            <div className="flex items-center gap-3 text-foreground mb-2">
                                <Phone className="size-5 text-[#FFB703] group-hover/comm:rotate-12 transition-transform duration-700" />
                                <h3 className="text-[13px] font-black uppercase  pt-1 leading-none">TERMINAUX_DE_COMMUNICATION_SÉCURISÉS</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase  text-muted-foreground ml-2">SUPPORT_CLIENT_CORE (EMAIL)</label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 size-6 group-focus-within/input:text-[#FFB703] transition-colors" />
                                        <input
                                            name="email"
                                            type="email"
                                            value={shopData.email}
                                            onChange={handleChange}
                                            placeholder="CONTACT@DOMAIN.SIGNAL"
                                            className="h-11 w-full pl-16 pr-8 bg-white/[0.02] border border-foreground/10 focus:border-[#FFB703]/30 rounded-2xl text-[14px] font-black tracking-widest outline-none transition-all text-foreground shadow-inner uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase  text-muted-foreground ml-2">LIGNE_DIRECTE_TERMINAL (GSM)</label>
                                    <div className="relative group/input">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 size-6 group-focus-within/input:text-[#FFB703] transition-colors" />
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={shopData.phone}
                                            onChange={handleChange}
                                            placeholder="+224_555_SIGNAL"
                                            className="h-11 w-full pl-16 pr-8 bg-white/[0.02] border border-foreground/10 focus:border-[#FFB703]/30 rounded-2xl text-[14px] font-black tracking-widest outline-none transition-all text-foreground shadow-inner tabular-nums"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6">
                                <label className="text-[10px] font-black uppercase  text-muted-foreground ml-2">VISION_STRATÉGIQUE_&_MISSION (PROFIL)</label>
                                <textarea
                                    name="description"
                                    value={shopData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="DÉFINISSEZ_VOTRE_IDENTITÉ_D'ENSEIGNE_SUR_L'INDEX_GLOBAL..."
                                    className="w-full px-10 py-8 rounded-2xl border border-foreground/10 bg-background/40 text-[14px] font-black tracking-tight focus:border-[#FFB703]/40 outline-none transition-all resize-none text-foreground shadow-inner leading-relaxed uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-4 space-y-6">
                        {/* Live Preview Display — High Intensity HUD Preview */}
                        <div className="sticky top-40 space-y-6 animate-in slide-in-from-right-12 duration-1000">
                             <p className="text-[10px] font-black uppercase  text-slate-600 text-center mb-[-2rem] relative z-10">RENDU_RÉSEAU_TEMPS_RÉEL_PRÉVISUALISATION</p>
                            
                            <div className="executive-card !p-0 overflow-hidden border-[#FFB703]/20 bg-background/60 shadow-[0_50px_120px_rgba(0,0,0,0.9)] group border-[8px] border-black/40">
                                <div className="h-64 bg-card relative overflow-hidden flex items-center justify-center border-b border-foreground/10">
                                    {shopData.banner_images.length > 0 ? (
                                        <div className="size-full">
                                            <img src={shopData.banner_images[0]} className="size-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-[2s]" />
                                            {shopData.use_carousel && shopData.banner_images.length > 1 && (
                                                <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3 relative z-20">
                                                     {shopData.banner_images.map((_, i) => (
                                                         <div key={i} className={cn("h-1.5 rounded-full transition-all duration-700", i === 0 ? "w-10 bg-[#FFB703]" : "w-2 bg-foreground/20")} />
                                                     ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#FFB703]/10 to-transparent" />
                                            <ShieldCheck className="size-6 text-foreground/5" />
                                        </>
                                    )}
                                    
                                    <div className="absolute -bottom-14 left-12 p-3 bg-black border border-[#FFB703]/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-all duration-700 z-30">
                                        <div className="size-6 rounded-2xl bg-white/[0.03] flex items-center justify-center overflow-hidden border border-foreground/10 p-2 shadow-inner">
                                            {shopData.logo_url ? <img src={shopData.logo_url} className="w-full h-full object-contain" /> : <ShoppingBag className="size-6 text-foreground/5" />}
                                        </div>
                                    </div>
                                    
                                    {shopData.use_carousel && shopData.banner_images.length > 1 && (
                                        <div className="absolute inset-y-0 inset-x-6 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                             <div className="size-6 rounded-xl bg-background/60 backdrop-blur-xl border border-foreground/10 flex items-center justify-center text-foreground"><ChevronLeft className="size-5" /></div>
                                             <div className="size-6 rounded-xl bg-background/60 backdrop-blur-xl border border-foreground/10 flex items-center justify-center text-foreground"><ChevronRight className="size-5" /></div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-24 pb-12 px-6 space-y-6 group-hover:bg-white/[0.01] transition-colors">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-foreground uppercase truncate tracking-tighter leading-none">{shopData.name || 'NOM_TERMINAL_VIDE'}</h4>
                                        <div className="flex items-center gap-4">
                                             <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                             <p className="text-[10px] text-[#FFB703] font-black uppercase  opacity-80">{shopData.url || 'ALPHA-INDEX'}.SIGNAL</p>
                                        </div>
                                    </div>
                                    <p className="text-[12px] text-muted-foreground font-black leading-relaxed uppercase  line-clamp-4 opacity-60 group-hover:opacity-100 transition-opacity">
                                        {shopData.description || 'DEFINIR_VOTRE_MISSION_POUR_INDEXATION_CORE_DÉCLENCHÉE.'}
                                    </p>
                                    <div className="h-px bg-foreground/5 w-full shadow-inner" />
                                    <div className="flex items-center justify-between pt-2">
                                         <div className="space-y-2">
                                             <p className="text-[9px] font-black text-slate-600 uppercase  leading-none">STATUS_NODE</p>
                                             <p className="text-[10px] font-black text-emerald-500 uppercase  leading-none">ACTIF_OPÉRATIONNEL</p>
                                         </div>
                                         <Link 
                                            to={`/shop/${shopData.url || 'preview'}`} 
                                            className="size-6 rounded-[2.2rem] bg-[#FFB703] text-background flex items-center justify-center shadow-[0_20px_50px_rgba(255,183,3,0.3)] hover:bg-white hover:rotate-45 transition-all duration-700 "
                                         >
                                             <ArrowUpRight className="size-6" />
                                         </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="executive-card !py-10 flex gap-3 items-start bg-[#FFB703]/5 border-[#FFB703]/20 shadow-inner group/info">
                                <Info className="text-[#FFB703] size-6 shrink-0 mt-1 transition-transform group-hover/info:scale-125" />
                                <p className="text-[12px] font-black text-[#FFB703] uppercase  leading-relaxed opacity-80">
                                    LES_MODIFICATIONS_SCELLÉES_SUR_CE_TERMINAL_SONT_PROJETÉES_SUR_L'INDEX_GLOBAL_DU_MARKETPLACE_BCA_CONNECT_INSTANCE_ALPHA.
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
