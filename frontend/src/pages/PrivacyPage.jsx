import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Shield, Lock, Eye, FileText, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter">
                <div className="w-full space-y-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-48 px-6 md:px-12 max-w-7xl mx-auto pt-48">

                    {/* Executive Header */}
                    <div className="space-y-16 text-center relative group">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[60rem] bg-[#FF6600]/10 rounded-full blur-[200px] -z-10 mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-[4s]" />
                        <div className="flex flex-col items-center gap-10">
                            <div className="flex items-center gap-6">
                                <div className="size-4 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_20px_rgba(255,102,0,0.4)]" />
                                <span className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic leading-none pt-0.5">JURIDIQUE & PROTECTION DES DONNÉES</span>
                            </div>
                            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter italic uppercase leading-[0.8] text-white drop-shadow-2xl">
                                POLITIQUE DE <br />
                                <span className="text-[#FF6600] not-italic underline decoration-white/10 decoration-8 underline-offset-[-12px]">CONFIDENTIALITÉ.</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm italic border-b-4 border-white/5 pb-8 inline-block">DERNIÈRE MISE À JOUR : 21 MARS 2026</p>
                    </div>

                    {/* Security Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: Lock, label: "DONNÉES SÉCURISÉES", desc: "CHIFFREMENT AES-256 DE GRADE MILITAIRE POUR TOUTES VOS INFORMATIONS PERSONNELLES ET TRANSACTIONNELLES.", borderColor: "border-[#FF6600]/30", iconColor: "text-[#FF6600]", bgColor: "bg-[#FF6600]/10" },
                            { icon: Eye, label: "INTÉGRITÉ TOTALE", desc: "ENGAGEMENT CONTRACTUEL DE NON-PARTAGE DES FLUX DE DONNÉES AVEC DES ENTITÉS TIERCES SANS CONSENTEMENT.", borderColor: "border-blue-500/30", iconColor: "text-blue-500", bgColor: "bg-blue-500/10" },
                            { icon: Shield, label: "SOUVERAINETÉ", desc: "CONTRÔLE ABSOLU SUR VOTRE EMPREINTE NUMÉRIQUE AVEC DROIT D'EFFACEMENT INTÉGRAL ET IMMÉDIAT.", borderColor: "border-emerald-500/30", iconColor: "text-emerald-500", bgColor: "bg-emerald-500/10" },
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
                        <div className="absolute top-0 right-0 size-[40rem] bg-[#FF6600]/5 rounded-full blur-[200px] -mr-48 -mt-48 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                        <div className="space-y-32 relative z-10">
                            <section className="space-y-12 animate-in slide-in-from-left duration-1000">
                                <div className="flex items-center gap-10 group/title">
                                    <div className="p-4 bg-[#FF6600]/10 rounded-2xl text-[#FF6600] shadow-3xl border-2 border-[#FF6600]/20 group-hover:rotate-6 transition-transform">
                                        <Sparkles className="size-8" />
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none pt-1">
                                        1. COLLECTE INFORMATIONNELLE
                                    </h2>
                                </div>
                                <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs leading-[2.5] italic border-l-[12px] border-[#FF6600]/20 pl-16 py-4">
                                    NOUS COLLECTONS LES INFORMATIONS QUE VOUS NOUS FOURNISSEZ DIRECTEMENT LORS DE LA CRÉATION DE VOTRE COMPTE : NOM, ADRESSE EMAIL, NUMÉRO DE TÉLÉPHONE, ADRESSE DE LIVRAISON ET INFORMATIONS DE PAIEMENT (MOBILE MONEY OU VIREMENT). CES DONNÉES SONT LES BRIQUES FONDAMENTALES DE VOTRE IDENTITÉ AU SEIN DE L'ÉCOSYSTÈME BCA.
                                </div>
                            </section>

                            <section className="space-y-12 animate-in slide-in-from-right duration-1000 delay-100">
                                <div className="flex items-center gap-10 group/title">
                                    <div className="p-4 bg-[#FF6600]/10 rounded-2xl text-[#FF6600] shadow-3xl border-2 border-[#FF6600]/20 group-hover:rotate-6 transition-transform">
                                        <ShieldCheck className="size-8" />
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none pt-1">
                                        2. EXPLOITATION OPÉRATIONNELLE
                                    </h2>
                                </div>
                                <div className="space-y-12">
                                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs italic leading-relaxed border-r-[12px] border-[#FF6600]/20 pr-16 text-right">
                                        VOS FLUX DE DONNÉES SONT EXPLOITÉS EXCLUSIVEMENT POUR GARANTIR L'EFFICIENCE OPÉRATIONNELLE DU RÉSEAU :
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {[
                                            "INGÉNIERIE DU TRAITEMENT DES COMMANDES ET FLUX LOGISTIQUES.",
                                            "GOUVERNANCE DU PORTEFEUILLE VIRTUEL ET SÉCURISATION ESCROW.",
                                            "OPTIMISATION DES SERVICES ET DÉTECTION D'ANOMALIES VIA IA.",
                                            "DIFFUSION DE PROTOCOLES DE NOTIFICATION CRITIQUES."
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-8 p-10 bg-white/[0.01] rounded-3xl border-4 border-white/5 group/item hover:border-[#FF6600]/20 transition-all">
                                                <div className="size-4 rounded-full bg-[#FF6600] group-hover/item:scale-[4] transition-transform duration-700 shadow-[0_0_15px_rgba(255,102,0,0.4)]" />
                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 leading-tight italic">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-12 animate-in slide-in-from-left duration-1000 delay-200">
                                <div className="flex items-center gap-10 group/title">
                                    <div className="p-4 bg-[#FF6600]/10 rounded-2xl text-[#FF6600] shadow-3xl border-2 border-[#FF6600]/20 group-hover:rotate-6 transition-transform">
                                        <Lock className="size-8" />
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none pt-1">
                                        3. SANCTUARISATION
                                    </h2>
                                </div>
                                <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs leading-[2.5] italic border-l-[12px] border-[#FF6600]/20 pl-16 py-4">
                                    BCA CONNECT DÉPLOIE DES ARCHITECTURES DE SÉCURITÉ MULTI-COUCHES (PHYSIQUES, LOGIQUES ET ADMINISTRATIVES) POUR SANCTUARISER VOS INFORMATIONS. TOUTES LES INTERACTIONS FINANCIÈRES SONT ROUTÉES VIA DES TERMINAUX CHIFFRÉS ET AUDITÉS EN PERMANENCE.
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default PrivacyPage;
