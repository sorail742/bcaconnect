import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { HelpCircle, Star, ShoppingBag, Truck, CheckCircle2, ShieldCheck, ArrowRight, BookOpen, MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const HelpCenter = () => {
    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter">
                {/* ══ EXECUTIVE HERO ══ */}
                <section className="relative pt-48 pb-32 overflow-hidden text-center group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[65rem] bg-[#FF6600]/10 rounded-full blur-[220px] mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-[4s]" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '5rem 5rem'
                    }} />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <div className="flex flex-col items-center gap-10">
                            <div className="flex items-center gap-6">
                                <div className="size-4 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_20px_rgba(255,102,0,0.4)]" />
                                <span className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic leading-none pt-0.5">CENTRE DE RESSOURCES & ACADÉMIE</span>
                            </div>
                            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase italic text-white drop-shadow-2xl">
                                PROTOCOLE <br />
                                <span className="text-[#FF6600] not-italic underline decoration-white/10 decoration-8 underline-offset-[-12px]">D'ASSISTANCE.</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-lg md:text-2xl font-black uppercase tracking-[0.3em] max-w-4xl mx-auto leading-relaxed border-x-8 border-[#FF6600]/20 px-12 italic">
                            MAÎTRISEZ L'ÉCOSYSTÈME BCA CONNECT. IDENTIFIEZ LES PROCESSUS, SÉCURISEZ VOS TRANSACTIONS ET OPTIMISEZ VOTRE CROISSANCE OPÉRATIONNELLE.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 space-y-48 pb-64">
                    {/* ══ SECTION : ACHETER ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center group/section">
                        <div className="space-y-16">
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="size-3 bg-[#FF6600] rounded-full shadow-[0_0_15px_rgba(255,102,0,0.4)]" />
                                    <span className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic pt-1">GUIDE ACQUÉREUR</span>
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-[0.85]">
                                    FLUX DE <span className="text-[#FF6600] not-italic">L'ACQUISITION.</span>
                                </h2>
                            </div>
                            <div className="space-y-10">
                                {[
                                    { title: "IDENTIFICATION D'ACTIFS", desc: "EXPLOREZ NOTRE CATALOGUE INTELLIGENT AVEC FILTRES PAR CATÉGORIE, PRIX ET LOCALISATION STRATÉGIQUE.", icon: ShoppingBag, color: "text-[#FF6600]", bg: "bg-[#FF6600]/10" },
                                    { title: "PAIEMENT SÉQUESTRE (ESCROW)", desc: "RÈGLEMENT VIA MOBILE MONEY OU WALLET. VOS FONDS SONT SANCTUARISÉS JUSQU'À VALIDATION DE LIVRAISON.", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                    { title: "LOGISTIQUE EN TEMPS RÉEL", desc: "SUIVI CHIRURGICAL DE CHAQUE ÉTAPE DU COLIS, DU RAMASSAGE À VOTRE PORTE.", icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-10 p-12 rounded-[3.5rem] bg-white/[0.02] border-4 border-white/5 hover:border-[#FF6600]/30 transition-all duration-700 group shadow-3xl hover:scale-[1.05]">
                                        <div className={cn("size-20 rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover:rotate-12 transition-all duration-700 shadow-inner border-2 border-white/5", step.bg, step.color)}>
                                            <step.icon className="size-10" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-2xl font-black italic text-white tracking-tighter uppercase leading-none mb-4">{step.title}</h4>
                                            <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest leading-relaxed italic border-l-4 border-white/5 pl-6">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="aspect-[4/5] lg:aspect-square rounded-[5rem] bg-white/[0.02] border-8 border-white/5 overflow-hidden relative shadow-3xl group/img">
                            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200" alt="Expérience achat" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-[2s]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent" />
                            <div className="absolute bottom-16 left-16 right-16">
                                <div className="p-10 bg-black/60 backdrop-blur-3xl border-4 border-[#FF6600]/20 rounded-[3rem] shadow-3xl">
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#FF6600] italic mb-4">INFRASTRUCTURE ACHAT</p>
                                    <p className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">SÉCURITÉ TRANSACTIONNELLE <br /> 100% GARANTIE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ SECTION : VENDRE ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center group/section">
                        <div className="order-2 lg:order-1 aspect-[4/5] lg:aspect-square rounded-[5rem] bg-white/[0.02] border-8 border-white/5 overflow-hidden relative shadow-3xl group/img">
                            <img src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1200" alt="Expérience vendeur" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-[2s]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent" />
                            <div className="absolute bottom-16 left-16 right-16 text-right">
                                <div className="p-10 bg-black/60 backdrop-blur-3xl border-4 border-blue-500/20 rounded-[3rem] shadow-3xl ml-auto inline-block text-left">
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500 italic mb-4">ÉCOSYSTÈME MARCHAND</p>
                                    <p className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">CROISSANCE PROPULSÉE <br /> PAR L'IA EXÉCUTIVE</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-16">
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="size-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
                                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.6em] italic pt-1">EXPANSION COMMERCIALE</span>
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-[0.85]">
                                    VENDRE SUR <span className="text-blue-500 not-italic">BCA NETWORK.</span>
                                </h2>
                            </div>
                            <div className="space-y-10">
                                {[
                                    { title: "BOUTIQUE EN 180 SECONDES", desc: "CRÉEZ VOTRE VITRINE, AJOUTEZ VOS PRODUITS ET COMMENCEZ À VENDRE INSTANTANÉMENT.", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
                                    { title: "GOUVERNANCE DE STOCK", desc: "ANALYSEZ VOS FLUX, OPTIMISEZ VOS INVENTAIRES ET AUGMENTEZ VOTRE SCORE DE CONFIANCE IA.", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
                                    { title: "REVERSEMENTS INSTANTANÉS", desc: "RÉCUPÉREZ VOS GAINS DIRECTEMENT PAR MOBILE MONEY DÈS VALIDATION DE LIVRAISON CLIENT.", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-10 p-12 rounded-[3.5rem] bg-white/[0.02] border-4 border-white/5 hover:border-blue-500/30 transition-all duration-700 group shadow-3xl hover:scale-[1.05]">
                                        <div className={cn("size-20 rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover:rotate-12 transition-all duration-700 shadow-inner border-2 border-white/5", step.bg, step.color)}>
                                            <step.icon className="size-10" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-2xl font-black italic text-white tracking-tighter uppercase leading-none mb-4">{step.title}</h4>
                                            <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest leading-relaxed italic border-l-4 border-white/5 pl-6">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/register" className="inline-block pt-10">
                                <Button className="h-28 px-20 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-sm shadow-3xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-600 text-white border-4 border-blue-600 hover:scale-110 active:scale-95 transition-all group/btn relative overflow-hidden italic leading-none">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                    DÉPLOYER MA BOUTIQUE <ArrowRight className="size-8 ml-6 group-hover/btn:translate-x-4 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* ══ EXECUTIVE CTA ══ */}
                    <div className="relative p-24 rounded-[6rem] bg-white group border-x-[16px] border-[#FF6600] text-center space-y-16 overflow-hidden shadow-3xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)]" />
                        <div className="absolute top-0 right-0 size-[50rem] bg-[#FF6600]/10 rounded-full blur-[200px] -mt-64 -mr-64 group-hover:scale-125 transition-transform duration-[3s]" />

                        <div className="relative z-10 space-y-12">
                            <h2 className="text-6xl md:text-9xl font-black text-black italic tracking-tighter uppercase leading-[0.8]">
                                BESOIN D'UNE <br />
                                <span className="text-[#FF6600] not-italic">LIAISON DIRECTE ?</span>
                            </h2>
                            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm italic max-w-4xl mx-auto leading-relaxed border-l-8 border-[#FF6600]/40 pl-16 text-left">
                                NOS INGÉNIEURS DE SUPPORT SONT MOBILISÉS POUR RÉSOUDRE VOS BLOCAGES OPÉRATIONNELS 24/7 VIA NOTRE CANAL SÉCURISÉ. RÉPONSE GARANTIE DANS LA FENÊTRE CRITIQUE.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 relative z-10">
                            <Link to="/contact">
                                <Button className="h-28 px-20 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-sm shadow-3xl shadow-[#FF6600]/20 bg-black hover:bg-black text-white border-4 border-black hover:scale-110 active:scale-95 transition-all group/btn relative overflow-hidden italic leading-none">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                    OUVRIR CANAL SUPPORT <MessageCircle className="size-8 ml-6" />
                                </Button>
                            </Link>
                            <Link to="/faq">
                                <Button variant="outline" className="h-28 px-20 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-sm border-4 border-black/10 text-black hover:bg-black hover:text-white transition-all hover:scale-110 active:scale-95 italic leading-none">
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
