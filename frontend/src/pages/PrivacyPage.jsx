import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-4 py-20 space-y-12 animate-in fade-in duration-700">
                <div className="space-y-4 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">Juridique & Protection</span>
                    <h1 className="text-5xl font-black text-foreground tracking-tighter italic uppercase">Politique de <span className="text-primary not-italic">Confidentialité</span></h1>
                    <p className="text-muted-foreground font-medium italic">Dernière mise à jour : 21 Mars 2026</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                        <Lock className="size-8 text-primary" />
                        <h3 className="font-bold">Données Sécurisées</h3>
                        <p className="text-xs text-muted-foreground">Chiffrement AES-256 pour toutes vos informations personnelles.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                        <Eye className="size-8 text-primary" />
                        <h3 className="font-bold">Zéro Partage</h3>
                        <p className="text-xs text-muted-foreground">Nous ne vendons jamais vos données à des tiers publicitaires.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                        <Shield className="size-8 text-primary" />
                        <h3 className="font-bold">Contrôle Total</h3>
                        <p className="text-xs text-muted-foreground">Vous pouvez demander la suppression de vos données à tout moment.</p>
                    </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                            <CheckCircle2 className="size-6 text-primary" /> 1. Collecte des informations
                        </h2>
                        <p>Nous collectons les informations que vous nous fournissez directement lors de la création de votre compte : nom, adresse email, numéro de téléphone, adresse de livraison et informations de paiement (Mobile Money ou virement).</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                            <CheckCircle2 className="size-6 text-primary" /> 2. Utilisation des données
                        </h2>
                        <p>Vos données sont utilisées exclusivement pour :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Traiter vos commandes et livraisons.</li>
                            <li>Gérer votre portefeuille virtuel et sécuriser vos transactions.</li>
                            <li>Améliorer nos services et détecter les fraudes via notre IA.</li>
                            <li>Vous envoyer des notifications importantes concernant votre compte.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                            <CheckCircle2 className="size-6 text-primary" /> 3. Sécurité
                        </h2>
                        <p>BCA Connect met en œuvre des mesures de sécurité physiques, électroniques et administratives pour protéger vos informations. Toutes les transactions financières passent par des passerelles certifiées et sécurisées.</p>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
};

export default PrivacyPage;
