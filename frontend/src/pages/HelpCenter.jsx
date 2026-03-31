import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { HelpCircle, Star, ShoppingBag, Truck, CheckCircle2, ShieldCheck, ArrowRight, BookOpen, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const HelpCenter = () => {
    return (
        <PublicLayout>
            <div className="font-inter pb-32">
                {/* ══ EXECUTIVE HERO ══ */}
                <section className="relative py-40 overflow-hidden text-center group">
                    <div className="absolute inset-0 bg-slate-950" />
                    <div className="absolute top-0 left-1/4 size-[40rem] bg-primary/10 rounded-full blur-[150px] group-hover:bg-primary/20 transition-colors duration-1000" />
                    <div className="absolute bottom-0 right-1/4 size-[40rem] bg-blue-600/5 rounded-full blur-[150px]" />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--primary)_1.5px,transparent_1.5px)] bg-[size:48px_48px]" />
                    
                    <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="size-3 rounded-full bg-primary animate-pulse" />
                                <span className="text-executive-label font-black text-primary uppercase tracking-[0.6em] italic leading-none pt-0.5">CENTRE DE RESSOURCES & ACADÉMIE</span>
                            </div>
                            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
                                PROTOCOLE <br />
                                <span className="text-primary not-italic underline decoration-white/10 underline-offset-[-12px]">D'ASSISTANCE.</span>
                            </h1>
                        </div>
                        <p className="text-white/40 text-lg md:text-xl font-black uppercase tracking-[0.3em] max-w-3xl mx-auto leading-relaxed border-x-4 border-primary/20 px-10 italic">
                            Maîtrisez l'écosystème BCA Connect. Identifiez les processus, sécurisez vos transactions et optimisez votre croissance opérationnelle.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 space-y-40">
                    {/* ══ SECTION : ACHETER ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center group/section">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-2 bg-primary rounded-full" />
                                    <span className="text-executive-label font-black text-primary uppercase tracking-[0.5em] italic pt-1">GUIDE ACQUÉREUR</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-foreground uppercase leading-[0.9]">
                                    Flux de <span className="text-primary not-italic">L'Acquisition.</span>
                                </h2>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { title: "Identification d'Actifs", desc: "Explorez notre catalogue intelligent avec filtres par catégorie, prix et localisation stratégique.", icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
                                    { title: "Paiement Séquestre (Escrow)", desc: "Règlement via Mobile Money ou Wallet. Vos fonds sont sanctuarisés jusqu'à validation de livraison.", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                    { title: "Logistique en Temps Réel", desc: "Suivi chirurgical de chaque étape du colis, du ramassage à votre porte.", icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-8 p-10 rounded-[2.5rem] glass-card border-4 border-border hover:border-primary/30 transition-all duration-500 group shadow-premium hover:scale-[1.02]">
                                        <div className={cn("size-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-all duration-500 shadow-inner border-2 border-white/5", step.bg, step.color)}>
                                            <step.icon className="size-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black italic text-foreground tracking-tighter uppercase leading-none mb-3">{step.title}</h4>
                                            <p className="text-xs text-muted-foreground/60 font-black uppercase tracking-widest leading-relaxed italic">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="aspect-[4/3] rounded-[4rem] glass-card border-4 border-border overflow-hidden relative shadow-premium-lg group/img">
                            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800" alt="Expérience achat" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover/img:scale-110 group-hover/img:opacity-80 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                            <div className="absolute bottom-12 left-12 right-12">
                                <div className="p-6 glass-card border-2 border-white/10 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic mb-2">INFRASTRUCTURE ACHAT</p>
                                    <p className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">Sécurité Transactionnelle 100% Garantie</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ SECTION : VENDRE ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center group/section">
                        <div className="order-2 lg:order-1 aspect-[4/3] rounded-[4rem] glass-card border-4 border-border overflow-hidden relative shadow-premium-lg group/img">
                            <img src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=800" alt="Expérience vendeur" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover/img:scale-110 group-hover/img:opacity-80 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                            <div className="absolute bottom-12 left-12 right-12 text-right">
                                <div className="p-6 glass-card border-2 border-white/10 rounded-2xl ml-auto inline-block text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic mb-2">ÉCOSYSTÈME MARCHAND</p>
                                    <p className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">Croissance Aliméntée par l'IA</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-2 bg-blue-500 rounded-full" />
                                    <span className="text-executive-label font-black text-blue-500 uppercase tracking-[0.5em] italic pt-1">EXPANSION COMMERCIALE</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-foreground uppercase leading-[0.9]">
                                    Vendre sur <span className="text-blue-500 not-italic">BCA Network.</span>
                                </h2>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { title: "Boutique en 3 Minutes", desc: "Créez votre vitrine, ajoutez vos produits et commencez à vendre instantanément.", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
                                    { title: "Gouvernance de Stock", desc: "Analysez vos flux, optimisez vos inventaires et augmentez votre Score de Confiance IA.", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
                                    { title: "Reversements Instantanés", desc: "Récupérez vos gains directement par Mobile Money dès validation de livraison client.", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-8 p-10 rounded-[2.5rem] glass-card border-4 border-border hover:border-blue-500/30 transition-all duration-500 group shadow-premium hover:scale-[1.02]">
                                        <div className={cn("size-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-all duration-500 shadow-inner border-2 border-white/5", step.bg, step.color)}>
                                            <step.icon className="size-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black italic text-foreground tracking-tighter uppercase leading-none mb-3">{step.title}</h4>
                                            <p className="text-xs text-muted-foreground/60 font-black uppercase tracking-widest leading-relaxed italic">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/register" className="inline-block pt-4">
                                <Button className="h-20 px-14 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-premium-lg shadow-blue-500/40 bg-blue-600 hover:bg-blue-600 text-white border-0 hover:scale-105 active:scale-95 transition-all group/btn relative overflow-hidden italic leading-none pt-1">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                    DÉPLOYER MA BOUTIQUE <ArrowRight className="size-6 ml-4 group-hover/btn:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* ══ EXECUTIVE CTA ══ */}
                    <div className="relative p-20 rounded-[4rem] glass-card border-4 border-primary/20 text-center space-y-12 overflow-hidden shadow-premium-lg group">
                        <div className="absolute top-0 right-0 size-[40rem] bg-primary/10 rounded-full blur-[120px] -mt-40 -mr-40 group-hover:scale-110 transition-transform duration-[3s]" />
                        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(var(--primary)_1.5px,transparent_1.5px)] bg-[size:32px_32px]" />
                        
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">
                                Besoin d'une <br />
                                <span className="text-primary not-italic">Intervention Directe ?</span>
                            </h2>
                            <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-sm italic max-w-2xl mx-auto leading-relaxed border-l-8 border-primary/20 pl-10">
                                Nos ingénieurs de support sont mobilisés pour résoudre vos blocages opérationnels 24/7 via notre canal sécurisé.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
                            <Link to="/contact">
                                <Button className="h-20 px-14 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-premium-lg shadow-primary/40 bg-primary hover:bg-primary text-white border-0 hover:scale-105 active:scale-95 transition-all group/btn relative overflow-hidden italic leading-none pt-1">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                    CANAL DE SUPPORT <MessageCircle className="size-6 ml-4" />
                                </Button>
                            </Link>
                            <Link to="/faq">
                                <Button variant="outline" className="h-20 px-14 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs border-4 border-border text-foreground hover:bg-card/40 hover:border-primary/40 transition-all hover:scale-105 active:scale-95 bg-card/20 backdrop-blur-xl italic leading-none pt-1">
                                    PROTOCOLES FAQ
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default HelpCenter;
