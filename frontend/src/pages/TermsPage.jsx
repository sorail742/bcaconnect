import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { FileText, CheckCircle2, LayoutGrid, Award, ShieldAlert, BadgeCheck } from 'lucide-react';

const TermsPage = () => {
    return (
        <PublicLayout>
            <div className="w-full space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 font-inter pb-32 px-6 md:px-12 max-w-6xl mx-auto pt-24">
                {/* Executive Header */}
                <div className="space-y-10 text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-96 bg-primary/10 rounded-full blur-[150px] -z-10" />
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-3 rounded-full bg-primary animate-pulse" />
                            <span className="text-executive-label font-black text-primary uppercase tracking-[0.5em] italic leading-none pt-0.5">CONTRAT DE CONFIANCE & GOUVERNANCE</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter italic uppercase leading-[0.85]">
                            Conditions d' <br />
                            <span className="text-primary not-italic underline decoration-primary/20 underline-offset-[-8px]">Utilisation.</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-xs italic border-b-4 border-primary/20 pb-6 inline-block">Dernière mise à jour : 21 Mars 2026</p>
                </div>

                {/* Trust Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="glass-card p-10 rounded-[2.5rem] border-4 border-border space-y-6 shadow-premium group hover:border-primary/30 transition-all">
                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <BadgeCheck className="size-8" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-foreground">Engagement Qualité</h3>
                            <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] italic leading-relaxed">Accréditation rigoureuse des marchands et vérification systématique des actifs commerciaux mis en ligne.</p>
                        </div>
                    </div>
                    <div className="glass-card p-10 rounded-[2.5rem] border-4 border-border space-y-6 shadow-premium group hover:border-blue-500/30 transition-all">
                        <div className="size-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <Award className="size-8" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-foreground">Éthique Business</h3>
                            <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] italic leading-relaxed">Tolérance zéro pour les contrefaçons, les abus de position et toute forme de fraude transactionnelle.</p>
                        </div>
                    </div>
                    <div className="glass-card p-10 rounded-[2.5rem] border-4 border-border space-y-6 shadow-premium group hover:border-emerald-500/30 transition-all">
                        <div className="size-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <ShieldAlert className="size-8" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-foreground">Séquestre Garanti</h3>
                            <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] italic leading-relaxed">Protocole Escrow activé par défaut : vos fonds sont sanctuarisés jusqu'à confirmation de livraison.</p>
                        </div>
                    </div>
                </div>

                {/* Legal Framework */}
                <div className="glass-card border-4 border-border rounded-[3.5rem] p-12 md:p-20 shadow-premium-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/10 transition-colors duration-1000" />
                    
                    <div className="prose prose-executive max-w-none space-y-24 relative z-10">
                        <section className="space-y-8 animate-in slide-in-from-left duration-700">
                            <div className="flex items-center gap-6 group/title">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-premium border-2 border-primary/20">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none pt-1">
                                    1. Objet et Acceptation
                                </h2>
                            </div>
                            <div className="text-muted-foreground/80 font-black uppercase tracking-[0.25em] text-xs leading-[2.2] italic border-l-8 border-primary/20 pl-12 py-2">
                                Les présentes Conditions Générales d'Utilisation (CGU) définissent les architectures de gouvernance, d'accès et d'utilisation de l'écosystème BCA Connect. En accédant au service, vous ratifiez sans réserve ces protocoles.
                            </div>
                        </section>

                        <section className="space-y-12 animate-in slide-in-from-right duration-700 delay-100">
                            <div className="flex items-center gap-6 group/title">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-premium border-2 border-primary/20">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none pt-1">
                                    2. Rôle des Acteurs Stratégiques
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { role: "VENDEURS", desc: "Responsables de l'intégrité de leurs actifs, de la conformité des annonces et de l'excellence de service." },
                                    { role: "ACHETEURS", desc: "S'engagent à respecter les protocoles de paiement et à confirmer la réception des actifs dès livraison." },
                                    { role: "TRANSPORTEURS", desc: "Garantissent la sécurité des actifs en transit et le respect strict des fenêtres temporelles de livraison." }
                                ].map((item, i) => (
                                    <div key={i} className="p-8 bg-background/50 rounded-[2rem] border-2 border-border hover:border-primary/20 transition-all space-y-4">
                                        <p className="text-primary font-black italic tracking-widest text-[11px] uppercase border-b-2 border-primary/10 pb-2">{item.role}</p>
                                        <p className="text-muted-foreground/60 font-black uppercase tracking-widest text-[9px] leading-relaxed italic">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-8 animate-in slide-in-from-left duration-700 delay-200">
                            <div className="flex items-center gap-6 group/title">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-premium border-2 border-primary/20">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none pt-1">
                                    3. Protocole de Paiement Séquestre
                                </h2>
                            </div>
                            <div className="text-muted-foreground/80 font-black uppercase tracking-[0.25em] text-xs leading-[2.2] italic border-r-8 border-primary/20 pr-12 py-2 text-right">
                                Tout flux financier sur BCA Connect est sanctuarisé dans une unité de séquestre (Escrow). Les actifs monétaires ne sont transférés au cédant qu'après validation explicite de l'acquéreur ou expiration du délai de protection de 72 heures post-livraison.
                            </div>
                        </section>

                        <section className="space-y-8 animate-in slide-in-from-right duration-700 delay-300">
                            <div className="flex items-center gap-6 group/title">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-premium border-2 border-primary/20">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none pt-1">
                                    4. Litiges et Arbitrage
                                </h2>
                            </div>
                            <div className="text-muted-foreground/80 font-black uppercase tracking-[0.25em] text-xs leading-[2.2] italic border-l-8 border-primary/20 pl-12 py-2">
                                En cas d'anomalie opérationnelle, l'acheteur doit initier un protocole de litige dans les 24 heures suivant la réception. Le département d'arbitrage de BCA Connect interviendra pour statuer et ordonner le remboursement intégral si la faille est confirmée.
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default TermsPage;
