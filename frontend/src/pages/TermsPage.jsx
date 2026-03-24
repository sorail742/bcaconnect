import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { FileText, CheckCircle2, LayoutGrid, Award, ShieldAlert, BadgeCheck } from 'lucide-react';

const TermsPage = () => {
    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-4 py-20 space-y-12 animate-in fade-in duration-700">
                <div className="space-y-4 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">Contrat de confiance</span>
                    <h1 className="text-5xl font-black text-foreground tracking-tighter italic uppercase">Conditions d' <span className="text-primary not-italic">Utilisation</span></h1>
                    <p className="text-muted-foreground font-medium italic">Dernière mise à jour : 21 Mars 2026</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                        <BadgeCheck className="size-8 text-primary" />
                        <h3 className="font-bold">Engagement Qualité</h3>
                        <p className="text-xs text-muted-foreground">Marchands certifiés et produits vérifiés par notre équipe.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                        <Award className="size-8 text-primary" />
                        <h3 className="font-bold">Zéro Fraude</h3>
                        <p className="text-xs text-muted-foreground">Tolérance zéro pour les contrefaçons et les abus.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                        <ShieldAlert className="size-8 text-primary" />
                        <h3 className="font-bold">Protection Client</h3>
                        <p className="text-xs text-muted-foreground">Paiement séquestre (Escrow) garanti jusqu'à réception.</p>
                    </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                            <CheckCircle2 className="size-6 text-primary" /> 1. Objet et Acceptation
                        </h2>
                        <p>Les présentes CGU définissent les règles d'accès et d'utilisation de la plateforme BCA Connect. En accédant au service, vous acceptez sans réserve ces conditions.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                            <CheckCircle2 className="size-6 text-primary" /> 2. Rôle des Acteurs
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Vendeurs :</strong> Responsables de la véracité de leurs annonces et de la qualité des produits.</li>
                            <li><strong>Acheteurs :</strong> S'engagent à finaliser l'achat pour toute commande passée.</li>
                            <li><strong>Livreurs :</strong> S'engagent à respecter les délais et à protéger le colis durant son transport.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                            <CheckCircle2 className="size-6 text-primary" /> 3. Système de Paiement Séquestre
                        </h2>
                        <p>Tout paiement effectué sur BCA Connect est d'abord placé dans un compte de séquestre (Escrow). Les fonds ne sont débloqués au vendeur qu'après confirmation de réception par l'acheteur ou après expiration du délai de protection standard de 3 jours après livraison.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                            <CheckCircle2 className="size-6 text-primary" /> 4. Litiges et Remboursements
                        </h2>
                        <p>En cas de non-conformité, l'acheteur doit signaler le litige dans les 24h suivant la livraison. BCA Connect interviendra alors pour arbitrer et procéder au remboursement intégral sur le portefeuille virtuel si nécessaire.</p>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
};

export default TermsPage;
