import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Sparkles, HelpCircle, Store, Eye, Info } from 'lucide-react';

const StoreSettings = () => {
    const [shopData, setShopData] = useState({
        name: 'Atelier Créatif Conakry',
        url: 'atelier-creatif-gn',
        email: 'contact@ateliercreatif.gn',
        phone: '+224 620 00 00 00',
        description: "Bienvenue à l'Atelier Créatif Conakry, nous proposons des créations uniques faites à la main avec passion au cœur de la capitale guinéenne."
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShopData(prev => ({ ...prev, [name]: value }));
    };

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
                        <Button className="px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20">
                            Enregistrer
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">URL personnalisée</label>
                                    <div className="flex rounded-md overflow-hidden border border-input focus-within:ring-1 focus-within:ring-ring transition-all">
                                        <span className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted border-r border-input flex items-center select-none">bca-connect.com/shop/</span>
                                        <input
                                            name="url"
                                            className="flex-1 border-none bg-transparent focus:ring-0 text-sm font-medium px-4 outline-none"
                                            placeholder="mon-atelier"
                                            type="text"
                                            value={shopData.url}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Logo de la boutique</label>
                                    <div className="mt-1 flex justify-center px-8 pt-8 pb-10 border-2 border-border border-dashed rounded-xl hover:border-primary transition-all cursor-pointer group bg-muted/30">
                                        <div className="space-y-3 text-center">
                                            <span className="material-symbols-outlined text-5xl text-muted-foreground group-hover:text-primary transition-all group-hover:scale-110">image</span>
                                            <div className="flex flex-col text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-primary hover:underline">Charger une image</span>
                                                <p className="text-muted-foreground mt-1">PNG, JPG (MAX. 10MB)</p>
                                            </div>
                                        </div>
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
                                        <div className="size-20 bg-muted rounded-xl flex items-center justify-center border border-border">
                                            <Store className="size-8 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-16 pb-8 px-8">
                                    <h4 className="text-2xl font-black text-foreground uppercase tracking-tight italic">{shopData.name || 'Ma Boutique'}</h4>
                                    <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-2">bca-connect.com/shop/{shopData.url || 'mon-shop'}</p>

                                    <div className="h-px bg-border my-6"></div>

                                    <p className="text-sm text-muted-foreground leading-relaxed font-medium line-clamp-4">
                                        {shopData.description || 'Présentez votre boutique ici...'}
                                    </p>

                                    <div className="mt-8 space-y-3">
                                        <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <span className="material-symbols-outlined !text-lg text-primary">mail</span>
                                            {shopData.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <span className="material-symbols-outlined !text-lg text-primary">call</span>
                                            {shopData.phone}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-8 pb-8">
                                    <Button variant="outline" className="w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all border-primary/20 text-primary">
                                        Visiter la page publique
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
