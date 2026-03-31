import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <PublicLayout>
            <div className="w-full space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 font-inter pb-32 px-6 md:px-12 max-w-6xl mx-auto pt-24">
                {/* Executive Header */}
                <div className="space-y-10 text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-96 bg-primary/10 rounded-full blur-[150px] -z-10" />
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-3 rounded-full bg-primary animate-pulse" />
                            <span className="text-executive-label font-black text-primary uppercase tracking-[0.5em] italic leading-none pt-0.5">JURIDIQUE & PROTECTION DES DONNÉES</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter italic uppercase leading-[0.85]">
                            Politique de <br />
                            <span className="text-primary not-italic underline decoration-primary/20 underline-offset-[-8px]">Confidentialité.</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-xs italic border-b-4 border-primary/20 pb-6 inline-block">Dernière mise à jour : 21 Mars 2026</p>
                </div>

                {/* Security Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="glass-card p-10 rounded-[2.5rem] border-4 border-border space-y-6 shadow-premium group hover:border-primary/30 transition-all">
                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <Lock className="size-8" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-foreground">Données Sécurisées</h3>
                            <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] italic leading-relaxed">Chiffrement AES-256 de grade militaire pour toutes vos informations personnelles et transactionnelles.</p>
                        </div>
                    </div>
                    <div className="glass-card p-10 rounded-[2.5rem] border-4 border-border space-y-6 shadow-premium group hover:border-blue-500/30 transition-all">
                        <div className="size-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <Eye className="size-8" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-foreground">Intégrité Totale</h3>
                            <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] italic leading-relaxed">Engagement contractuel de non-partage des flux de données avec des entités tierces sans consentement.</p>
                        </div>
                    </div>
                    <div className="glass-card p-10 rounded-[2.5rem] border-4 border-border space-y-6 shadow-premium group hover:border-emerald-500/30 transition-all">
                        <div className="size-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <Shield className="size-8" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-foreground">Souveraineté</h3>
                            <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] italic leading-relaxed">Contrôle absolu sur votre empreinte numérique avec droit d'effacement intégral et immédiat.</p>
                        </div>
                    </div>
                </div>

                {/* Legal Framework */}
                <div className="glass-card border-4 border-border rounded-[3.5rem] p-12 md:p-20 shadow-premium-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/10 transition-colors duration-1000" />
                    
                    <div className="prose prose-executive max-w-none space-y-20 relative z-10">
                        <section className="space-y-8 animate-in slide-in-from-left duration-700">
                            <div className="flex items-center gap-6 group/title">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-premium border-2 border-primary/20">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none pt-1">
                                    1. Collecte des informations
                                </h2>
                            </div>
                            <div className="text-muted-foreground/80 font-black uppercase tracking-[0.25em] text-xs leading-[2.2] italic border-l-8 border-primary/20 pl-12 py-2">
                                Nous collectons les informations que vous nous fournissez directement lors de la création de votre compte : nom, adresse email, numéro de téléphone, adresse de livraison et informations de paiement (Mobile Money ou virement). Ces données sont les briques fondamentales de votre identité au sein de l'écosystème BCA.
                            </div>
                        </section>

                        <section className="space-y-8 animate-in slide-in-from-right duration-700 delay-100">
                            <div className="flex items-center gap-6 group/title">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-premium border-2 border-primary/20">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none pt-1">
                                    2. Utilisation des données
                                </h2>
                            </div>
                            <div className="space-y-8">
                                <p className="text-muted-foreground/80 font-black uppercase tracking-[0.25em] text-xs italic leading-relaxed border-r-8 border-primary/20 pr-12 text-right">
                                    Vos flux de données sont exploités exclusivement pour garantir l'efficience opérationnelle du réseau :
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        "Ingénierie du traitement des commandes et flux logistiques.",
                                        "Gouvernance du portefeuille virtuel et sécurisation Escrow.",
                                        "Optimisation des services et détection d'anomalies via IA.",
                                        "Diffusion de protocoles de notification critiques."
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-5 p-6 bg-background rounded-2xl border-2 border-border group/item hover:border-primary/20 transition-all">
                                            <div className="size-2 rounded-full bg-primary group-hover/item:scale-[4] transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-tight italic">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8 animate-in slide-in-from-left duration-700 delay-200">
                            <div className="flex items-center gap-6 group/title">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-premium border-2 border-primary/20">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none pt-1">
                                    3. Sécurité
                                </h2>
                            </div>
                            <div className="text-muted-foreground/80 font-black uppercase tracking-[0.25em] text-xs leading-[2.2] italic border-l-8 border-primary/20 pl-12 py-2">
                                BCA Connect déploie des architectures de sécurité multi-couches (physiques, logiques et administratives) pour sanctuariser vos informations. Toutes les interactions financières sont routées via des terminaux chiffrés et audités en permanence.
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default PrivacyPage;
