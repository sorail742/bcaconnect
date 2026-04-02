import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { FileText, CheckCircle2, LayoutGrid, Award, ShieldAlert, BadgeCheck, ShieldCheck, Sparkles } from 'lucide-react';

const TermsPage = () => {
    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter">
                <div className="w-full space-y-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-48 px-6 md:px-12 max-w-7xl mx-auto pt-48">

                    {/* Executive Header */}
                    <div className="space-y-16 text-center relative group">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[65rem] bg-[#FF6600]/10 rounded-full blur-[220px] -z-10 mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-[4s]" />
                        <div className="flex flex-col items-center gap-10">
                            <div className="flex items-center gap-6">
                                <div className="size-4 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_25px_rgba(255,102,0,0.5)]" />
                                <span className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic leading-none pt-0.5">CONTRAT DE CONFIANCE & GOUVERNANCE</span>
                            </div>
                            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter italic uppercase leading-[0.8] text-white drop-shadow-2xl">
                                CONDITIONS D' <br />
                                <span className="text-[#FF6600] not-italic underline decoration-white/10 decoration-8 underline-offset-[-12px]">UTILISATION.</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm italic border-b-4 border-white/5 pb-8 inline-block">DERNIÈRE MISE À JOUR : 21 MARS 2026</p>
                    </div>

                    {/* Trust Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: BadgeCheck, label: "ENGAGEMENT QUALITÉ", desc: "ACCRÉDITATION RIGOUREUSE DES MARCHANDS ET VÉRIFICATION SYSTÉMATIQUE DES ACTIFS COMMERCIAUX MIS EN LIGNE.", borderColor: "border-[#FF6600]/30", iconColor: "text-[#FF6600]", bgColor: "bg-[#FF6600]/10" },
                            { icon: Award, label: "ÉTHIQUE BUSINESS", desc: "TOLÉRANCE ZÉRO POUR LES CONTREFAÇONS, LES ABUS DE POSITION ET TOUTE FORME DE FRAUDE TRANSACTIONNELLE.", borderColor: "border-blue-500/30", iconColor: "text-blue-500", bgColor: "bg-blue-500/10" },
                            { icon: ShieldAlert, label: "SÉQUESTRE GARANTI", desc: "PROTOCOLE ESCROW ACTIVÉ PAR DÉFAUT : VOS FONDS SONT SANCTUARISÉS JUSQU'À CONFIRMATION DE LIVRAISON.", borderColor: "border-emerald-500/30", iconColor: "text-emerald-500", bgColor: "bg-emerald-500/10" },
                        ].map((item, i) => (
                            <div key={i} className={`bg-white/[0.02] p-12 rounded-[4rem] border-4 ${item.borderColor} space-y-10 shadow-3xl group hover:scale-105 transition-all duration-700 relative overflow-hidden`}>
                                <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                                <div className={`size-24 rounded-[1.5rem] ${item.bgColor} flex items-center justify-center ${item.iconColor} shadow-inner group-hover:rotate-12 transition-transform duration-700 relative z-10`}>
                                    <item.icon className="size-12" />
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">{item.label}</h3>
                                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] italic leading-relaxed border-l-8 border-white/5 pl-8">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legal Framework */}
                    <div className="bg-white/[0.02] border-4 border-white/5 rounded-[5rem] p-16 md:p-24 shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 size-[45rem] bg-[#FF6600]/5 rounded-full blur-[200px] -mr-48 -mt-48 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                        <div className="space-y-32 relative z-10">
                            {/* Section 1 */}
                            <section className="space-y-12 animate-in slide-in-from-left duration-1000">
                                <div className="flex items-center gap-10 group/title">
                                    <div className="p-4 bg-[#FF6600]/10 rounded-2xl text-[#FF6600] shadow-3xl border-2 border-[#FF6600]/20 group-hover:rotate-6 transition-transform">
                                        <Sparkles className="size-8" />
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none pt-1">
                                        1. OBJET ET RATIFICATION
                                    </h2>
                                </div>
                                <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs leading-[2.5] italic border-l-[12px] border-[#FF6600]/20 pl-16 py-4">
                                    LES PRÉSENTES CONDITIONS GÉNÉRALES D'UTILISATION (CGU) DÉFINISSENT LES ARCHITECTURES DE GOUVERNANCE, D'ACCÈS ET D'UTILISATION DE L'ÉCOSYSTÈME BCA CONNECT. EN ACCÉDANT AU SERVICE, VOUS RATIFIEZ SANS RÉSERVE CES PROTOCOLES.
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section className="space-y-16 animate-in slide-in-from-right duration-1000 delay-100">
                                <div className="flex items-center gap-10 group/title">
                                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 shadow-3xl border-2 border-blue-500/20 group-hover:-rotate-6 transition-transform">
                                        <ShieldCheck className="size-8" />
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none pt-1">
                                        2. ACTEURS STRATÉGIQUES
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {[
                                        { role: "VENDEURS", desc: "RESPONSABLES DE L'INTÉGRITÉ DES ACTIFS, DE LA CONFORMITÉ DES ANNONCES ET DE L'EXCELLENCE DE SERVICE.", icon: Sparkles },
                                        { role: "ACHETEURS", desc: "S'ENGAGENT À RESPECTER LES PROTOCOLES DE PAIEMENT ET À CONFIRMER LA RÉCEPTION DES ACTIFS DÈS LIVRAISON.", icon: ShieldCheck },
                                        { role: "TRANSPORTEURS", desc: "GARANTISSENT LA SÉCURITÉ DES ACTIFS EN TRANSIT ET LE RESPECT STRICT DES FENÊTRES TEMPORELLES.", icon: BadgeCheck }
                                    ].map((item, i) => (
                                        <div key={i} className="p-10 bg-white/[0.01] rounded-[3rem] border-4 border-white/5 hover:border-[#FF6600]/20 transition-all space-y-6 group/item">
                                            <p className="text-[#FF6600] font-black italic tracking-[0.3em] text-xs uppercase border-b-4 border-white/5 pb-4 group-hover/item:border-[#FF6600]/30 transition-all">{item.role}</p>
                                            <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px] leading-relaxed italic">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section className="space-y-12 animate-in slide-in-from-left duration-1000 delay-200">
                                <div className="flex items-center gap-10 group/title">
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-3xl border-2 border-emerald-500/20 group-hover:rotate-6 transition-transform">
                                        <BadgeCheck className="size-8" />
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none pt-1">
                                        3. PAIEMENT SÉQUESTRE
                                    </h2>
                                </div>
                                <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs leading-[2.5] italic border-r-[12px] border-[#FF6600]/20 pr-16 py-4 text-right">
                                    TOUT FLUX FINANCIER SUR BCA CONNECT EST SANCTUARISÉ DANS UNE UNITÉ DE SÉQUESTRE (ESCROW). LES ACTIFS MONÉTAIRES NE SONT TRANSFÉRÉS AU CÉDANT QU'APRÈS VALIDATION EXPLICITE DE L'ACQUÉREUR OU EXPIRATION DU DÉLAI DE PROTECTION.
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section className="space-y-12 animate-in slide-in-from-right duration-1000 delay-300">
                                <div className="flex items-center gap-10 group/title">
                                    <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 shadow-3xl border-2 border-red-500/20 group-hover:-rotate-6 transition-transform">
                                        <ShieldAlert className="size-8" />
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none pt-1">
                                        4. LITIGES & ARBITRAGE
                                    </h2>
                                </div>
                                <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs leading-[2.5] italic border-l-[12px] border-[#FF6600]/20 pl-16 py-4">
                                    EN CAS D'ANOMALIE OPÉRATIONNELLE, L'ACHETEUR DOIT INITIER UN PROTOCOLE DE LITIGE DANS LES 24 HEURES SUIVANT LA RÉCEPTION. LE DÉPARTEMENT D'ARBITRAGE DE BCA CONNECT INTERVIENDRA POUR STATUER ET ORDONNER LE REMBOURSEMENT INTÉGRAL.
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default TermsPage;
