import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Sparkles, HelpCircle, Store, Eye, Info, Loader2, CheckCircle2, Upload } from 'lucide-react';
import storeService from '../../services/storeService';
import api from '../../services/api';
import { toast } from 'sonner';

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

        // Validation format
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            return toast.error("Format non supporté. JPEG, PNG ou WEBP uniquement.");
        }

        // Validation taille (2MB)
        if (file.size > 2 * 1024 * 1024) {
            return toast.error("Le fichier est trop lourd (max 2MB).");
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Utiliser l'URL absolue pour éviter tout problème de proxy/relative path
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            console.log("📤 Tentative d'upload vers:", `${backendUrl}/upload`);
            const response = await api.post(`${backendUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setShopData(prev => ({ ...prev, logo_url: response.data.url }));
            toast.success("Logo mis à jour !");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Échec de l'upload du fichier.");
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
                    setIsLoading(false);
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
                if (error.response?.status === 404) {
                    setIsNew(true);
                } else {
                    console.error("Erreur chargement boutique:", error);
                    toast.error("Impossible de charger les paramètres de la boutique.");
                }
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
        if (!shopData.name.trim()) {
            return toast.error("Le nom de la boutique est requis.");
        }

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
                // Mise à jour dynamique du state avec les données retournées par l'API
                setShopData(prev => ({
                    ...prev,
                    url: newStore.slug || '',
                    name: newStore.nom_boutique || prev.name,
                    email: newStore.email_boutique || prev.email,
                    phone: newStore.telephone_boutique || prev.phone,
                    description: newStore.description || prev.description,
                    logo_url: newStore.logo_url || prev.logo_url,
                }));
                setIsNew(false);
                toast.success("🎉 Votre boutique a été créée avec succès !");
            } else {
                const updated = await storeService.updateStore(payload);
                if (updated?.slug) {
                    setShopData(prev => ({ ...prev, url: updated.slug }));
                }
                toast.success("✅ Paramètres de la boutique mis à jour !");
            }
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
            const status = error.response?.status;
            const msg = error.response?.data?.message;

            if (status === 400 && error.response?.data?.store) {
                // Cas spécial : le backend dit "vous avez déjà une boutique"
                // On charge les données existantes au lieu d'afficher une erreur
                const existingStore = error.response.data.store;
                setShopData({
                    name: existingStore.nom_boutique || '',
                    url: existingStore.slug || '',
                    email: existingStore.email_boutique || '',
                    phone: existingStore.telephone_boutique || '',
                    description: existingStore.description || '',
                    logo_url: existingStore.logo_url || ''
                });
                setIsNew(false);
                toast.info("Votre boutique existante a été chargée.");
            } else {
                toast.error(msg || "Erreur lors de l'enregistrement. Vérifiez votre connexion.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Paramètres Boutique">
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="size-10 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Paramètres Boutique">
            <div className="max-w-6xl mx-auto animate-in fade-in duration-500 font-inter pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-foreground leading-tight tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8 decoration-4">Paramètres du Magasin</h1>
                        <p className="text-muted-foreground text-sm mt-4 font-medium">Gérez votre identité visuelle et vos coordonnées professionnelles en Guinée.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Annuler</Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 gap-2"
                        >
                            {isSaving ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Left Section: Form */}
                    <div className="xl:col-span-2 flex flex-col gap-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3 border-b border-border py-4">
                                <Sparkles className="size-5 text-primary" />
                                <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">Identité de la marque</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nom de la boutique</label>
                                    <Input name="name" value={shopData.name} onChange={handleChange} placeholder="Ex: Ma Boutique Artisanale" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">URL personnalisée (Lecture seule)</label>
                                    <div className="flex rounded-md overflow-hidden border border-input bg-muted/30">
                                        <span className="px-4 py-2 text-[10px] font-black uppercase text-muted-foreground border-r border-input flex items-center select-none tracking-widest">bcaconnect.com/shop/</span>
                                        <input
                                            readOnly
                                            className="flex-1 border-none bg-transparent text-sm font-medium px-4 outline-none opacity-50 cursor-not-allowed"
                                            value={shopData.url}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Logo de la boutique</label>
                                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-muted/10 border border-dashed border-border group hover:border-primary/50 transition-all">
                                        <div className="size-24 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                            {shopData.logo_url ? (
                                                <img src={shopData.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Store className="size-10 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <p className="text-sm font-bold text-foreground italic">Sélectionnez une image de marque</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">Format JPEG, PNG ou WEBP. Max 2MB.</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => fileInputRef.current.click()}
                                                    disabled={isUploading}
                                                    variant="outline"
                                                    className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                                                >
                                                    {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                                                    {isUploading ? 'Chargement...' : 'Choisir un fichier'}
                                                </Button>
                                                {shopData.logo_url && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => setShopData(prev => ({ ...prev, logo_url: '' }))}
                                                        variant="ghost"
                                                        className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10"
                                                    >
                                                        Supprimer
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Ou URL directe de l'image (optionnel)</label>
                                        <Input name="logo_url" value={shopData.logo_url} onChange={handleChange} placeholder="https://..." className="h-11" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Description de la boutique</label>
                                    <textarea
                                        name="description"
                                        className="w-full px-5 py-4 rounded-xl border border-input bg-transparent text-sm font-medium focus:ring-2 focus:ring-ring outline-none transition-all placeholder:text-muted-foreground min-h-[140px]"
                                        placeholder="Parlez-nous de votre boutique..."
                                        value={shopData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3 border-b border-border py-4">
                                <HelpCircle className="size-5 text-primary" />
                                <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">Contact & Coordonnées</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email professionnel</label>
                                    <Input name="email" type="email" value={shopData.email} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Numéro de téléphone</label>
                                    <Input name="phone" type="tel" value={shopData.phone} onChange={handleChange} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Section: Preview */}
                    <div className="flex flex-col gap-8">
                        <div className="sticky top-28">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <Eye className="size-5 text-primary" />
                                Aperçu de la boutique
                            </h3>
                            <Card className="shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-500 relative border-border">
                                <div className="h-40 bg-gradient-to-br from-primary via-blue-600 to-indigo-900 relative">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                    <div className="absolute -bottom-10 left-8 p-1.5 bg-card rounded-2xl shadow-xl border border-border">
                                        <div className="size-20 bg-muted rounded-xl flex items-center justify-center border border-border overflow-hidden">
                                            {shopData.logo_url ? (
                                                <img src={shopData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <Store className="size-8 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-16 pb-8 px-8">
                                    <h4 className="text-2xl font-black text-foreground uppercase tracking-tight italic">{shopData.name || 'Ma Boutique'}</h4>
                                    <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-2 truncate">bca-connect.com/shop/{shopData.url || 'mon-shop'}</p>

                                    <div className="h-px bg-border my-6"></div>

                                    <p className="text-sm text-muted-foreground leading-relaxed font-medium line-clamp-4">
                                        {shopData.description || 'Présentez votre boutique ici...'}
                                    </p>

                                    <div className="mt-8 space-y-3">
                                        <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <span className="material-symbols-outlined !text-lg text-primary">mail</span>
                                            {shopData.email || 'Non défini'}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <span className="material-symbols-outlined !text-lg text-primary">call</span>
                                            {shopData.phone || 'Non défini'}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-8 pb-8">
                                    <Button asChild variant="outline" className="w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all border-primary/20 text-primary">
                                        <Link to={`/shop/${shopData.url || 'mon-shop'}`}>
                                            Visiter la page publique
                                        </Link>
                                    </Button>
                                </div>
                            </Card>

                            <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex gap-4">
                                <Info className="text-amber-500 size-6 shrink-0" />
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold leading-relaxed uppercase tracking-widest">
                                    Les modifications seront appliquées instantanément sur la place de marché BCA Connect.
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
