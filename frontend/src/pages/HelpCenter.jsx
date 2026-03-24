import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { HelpCircle, Star, ShoppingBag, Truck, CheckCircle2, ShieldCheck, ArrowRight, BookOpen, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const HelpCenter = () => {
    return (
        <PublicLayout>
            <div className="font-inter pb-20">
                {/* ══ HERO ══ */}
                <section className="relative py-24 bg-slate-950 overflow-hidden text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-96 bg-primary/10 rounded-full blur-[150px] -mt-10" />
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-8">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                            <BookOpen className="size-3" /> Guide & Ressources BCA Connect
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none uppercase">
                            Besoin d'aide ? <br />
                            <span className="text-primary">Guide Complet.</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                            Tout ce que vous devez savoir pour naviguer, vendre et acheter en toute sécurité sur la première marketplace guinéenne.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 space-y-24">
                    {/* ══ SECTION : ACHETER ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Guide Acheteur</span>
                                <h2 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">
                                    Comment <span className="text-primary not-italic">Acheter ?</span>
                                </h2>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { title: "Trouvez vos produits", desc: "Explorez notre catalogue intelligent avec filtres par catégorie, prix et localisation.", icon: ShoppingBag },
                                    { title: "Paiement Séquestre", desc: "Payez par Mobile Money ou Wallet. Votre argent est bloqué jusqu'à livraison. Zéro risque.", icon: ShieldCheck },
                                    { title: "Suivi en temps réel", desc: "Suivez chaque étape du colis, du ramassage à votre porte.", icon: Truck },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
                                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                            <step.icon className="size-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black italic text-foreground tracking-tight">{step.title}</h4>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="aspect-video rounded-[3rem] bg-gradient-to-br from-primary/20 via-slate-900 to-slate-800 border border-border overflow-hidden relative shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800" alt="Expérience achat" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent" />
                        </div>
                    </div>

                    {/* ══ SECTION : VENDRE ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center flex-row-reverse">
                        <div className="order-2 lg:order-1 aspect-video rounded-[3rem] bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-800 border border-border overflow-hidden relative shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=800" alt="Expérience vendeur" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent" />
                        </div>
                        <div className="order-1 lg:order-2 space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Guide Vendeur</span>
                                <h2 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">
                                    Vendre sur <span className="text-blue-400 not-italic">BCA Connect</span>
                                </h2>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { title: "Boutique en 3 minutes", desc: "Créez votre vitrine, ajoutez vos produits et commencez à vendre instantanément.", icon: ShoppingBag },
                                    { title: "Gestion intelligente", desc: "Gérez vos stocks, analysez vos ventes et améliorez votre score de confiance.", icon: Star },
                                    { title: "Paiements automatiques", desc: "Récupérez vos gains directement par Mobile Money dès validation de livraison.", icon: ShieldCheck },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-blue-500/30 transition-all group">
                                        <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                                            <step.icon className="size-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black italic text-foreground tracking-tight">{step.title}</h4>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/register">
                                <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 gap-2">
                                    Créer ma boutique <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* ══ CTA FINAL ══ */}
                    <div className="relative p-12 rounded-[3.5rem] bg-slate-950 border border-white/10 text-center space-y-10 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-[size:24px_24px]" />
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                                Toujours bloqué ? <br />
                                <span className="text-primary not-italic text-3xl md:text-4xl">Contactez un expert.</span>
                            </h2>
                            <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
                                Notre équipe de support est disponible 24/7 pour vous accompagner par Chat ou Téléphone.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/contact">
                                    <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 gap-2">
                                        Support Technique <MessageCircle className="size-4" />
                                    </Button>
                                </Link>
                                <Link to="/faq">
                                    <Button variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-white/10 text-white hover:bg-white/10">
                                        Consulter la FAQ
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default HelpCenter;
