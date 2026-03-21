import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { HelpCircle, ChevronDown, ChevronUp, Search, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

const FAQ_CATEGORIES = [
    {
        label: 'Inscription & Compte',
        icon: '🔐',
        questions: [
            { q: "Comment créer un compte sur BCA Connect ?", a: "Rendez-vous sur notre page d'inscription. Choisissez votre rôle (Client, Fournisseur ou Transporteur), remplissez le formulaire et validez votre numéro de téléphone via un code OTP. En moins de 3 minutes, vous avez accès à la plateforme." },
            { q: "Quels documents sont nécessaires pour devenir fournisseur ?", a: "Vous aurez besoin d'une pièce d'identité valide (CNI, passeport) et si disponible, d'un registre de commerce. Notre équipe valide votre compte sous 48h ouvrables." },
            { q: "Puis-je avoir plusieurs rôles sur la même plateforme ?", a: "Non, chaque compte est lié à un seul rôle pour des raisons de sécurité. Vous pouvez créer des comptes distincts avec des adresses email différentes pour chaque rôle." },
            { q: "J'ai oublié mon mot de passe, que faire ?", a: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Vous recevrez un code OTP sur votre numéro de téléphone enregistré pour réinitialiser votre mot de passe." },
        ]
    },
    {
        label: 'Paiements & Portefeuille',
        icon: '💳',
        questions: [
            { q: "Quels moyens de paiement sont acceptés ?", a: "BCA Connect accepte le Mobile Money (Orange Money, MTN Money), les virements bancaires et le portefeuille virtuel BCA. Les paiements en espèces sont disponibles pour certains marchands locaux." },
            { q: "Comment fonctionne le portefeuille virtuel BCA ?", a: "Votre portefeuille est créé automatiquement à l'inscription. Vous pouvez le recharger via Mobile Money ou virement bancaire. Il comporte deux soldes : un solde disponible et un solde en séquestre (bloqué pendant les transactions actives pour garantir la sécurité)." },
            { q: "Comment retirer de l'argent de mon portefeuille ?", a: "Accédez à Portefeuille > Retrait. Choisissez votre moyen de retrait (Mobile Money ou compte bancaire), entrez le montant et validez avec votre code OTP. Les retraits sont traités sous 24-48h." },
            { q: "Qu'est-ce que le système de séquestre (Escrow) ?", a: "Lors d'une commande, le montant est d'abord prélevé et bloqué dans un compte de séquestre. Il n'est reversé au vendeur qu'une fois la livraison confirmée par le client. Cela protège les deux parties contre la fraude." },
        ]
    },
    {
        label: 'Commandes & Livraison',
        icon: '📦',
        questions: [
            { q: "Comment passer une commande ?", a: "Ajoutez les produits souhaités à votre panier depuis le catalogue ou la page d'un produit. Accédez au panier, vérifiez votre commande et procédez au paiement via votre portefeuille BCA. Vous recevrez une confirmation instantanée." },
            { q: "Quels sont les délais de livraison ?", a: "Pour Conakry : 24-48h en express, 3-5 jours en standard. Pour les autres régions de Guinée : 5-10 jours selon l'accessibilité. Ces délais peuvent varier selon les fournisseurs." },
            { q: "Comment suivre ma commande ?", a: "Accédez à votre tableau de bord puis 'Mes Commandes'. Cliquez sur la commande souhaitée pour voir son statut en temps réel. Vous pouvez aussi utiliser la page /tracking avec votre numéro de commande." },
            { q: "Que faire si ma commande n'arrive pas ?", a: "Patientez d'abord le délai indiqué. Si la livraison dépasse ce délai, ouvrez un litige depuis 'Mes Commandes > Signaler un problème'. Notre équipe intervient sous 24h et le montant en séquestre vous sera remboursé si le problème est confirmé." },
        ]
    },
    {
        label: 'Pour les Fournisseurs',
        icon: '🏪',
        questions: [
            { q: "Comment créer et configurer ma boutique ?", a: "Après inscription en tant que fournisseur, rendez-vous dans votre dashboard > 'Paramètres boutique'. Renseignez le nom, description, logo et coordonnées. Un slug unique est généré automatiquement pour l'URL publique de votre boutique." },
            { q: "Quelles commissions BCA Connect prélève-t-il ?", a: "BCA Connect prélève une commission de 3% à 5% sur chaque vente selon votre plan. La commission est automatiquement déduite lors du reversement au fournisseur via le système de Split Payment." },
            { q: "Comment ajouter des produits à mon catalogue ?", a: "Dans votre dashboard, cliquez sur 'Produits > Ajouter un produit'. Renseignez le nom, la description, le prix en GNF, la quantité en stock et la catégorie. Les produits sont publiés instantanément après validation." },
            { q: "Puis-je vendre en mode hors-ligne ?", a: "Oui ! BCA Connect est l'une des rares plateformes à offrir la résilience hors-ligne. L'application met vos commandes en file d'attente et les synchronise automatiquement dès que la connexion est rétablie." },
        ]
    },
    {
        label: 'Sécurité & Confiance',
        icon: '🛡️',
        questions: [
            { q: "Comment BCA Connect sécurise mes données personnelles ?", a: "Toutes les données sont chiffrées en AES-256. Les mots de passe sont hachés via Bcrypt. Les communications utilisent SSL/TLS. Nous ne partageons jamais vos données avec des tiers sans votre consentement explicite." },
            { q: "Qu'est-ce que le Score de Confiance IA ?", a: "Chaque utilisateur possède un Score de Confiance (de 0 à 100) calculé par notre IA en analysant son historique transactionnel, ses délais de paiement et son comportement. Ce score est visible sur votre profil et influe sur certains avantages (limites de crédit, avantages tarifaires)." },
            { q: "Comment signaler une fraude ou une arnaque ?", a: "Utilisez le bouton 'Signaler' sur la commande ou le profil concerné. Ou contactez directement notre équipe via la page Contact. Toutes les alertes sont traitées prioritairement dans les 4h." },
        ]
    }
];

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={cn("border border-border rounded-2xl overflow-hidden transition-all duration-300", isOpen && "border-primary/30 shadow-lg shadow-primary/5")}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left gap-4 hover:bg-muted/30 transition-colors"
            >
                <span className="text-sm font-black text-foreground">{question}</span>
                <span className={cn("size-8 rounded-xl flex items-center justify-center shrink-0 border transition-all", isOpen ? "bg-primary border-primary text-white" : "border-border text-muted-foreground")}>
                    {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </span>
            </button>
            {isOpen && (
                <div className="px-6 pb-6 text-muted-foreground font-medium leading-relaxed text-sm border-t border-border pt-4">
                    {answer}
                </div>
            )}
        </div>
    );
};

const FaqPage = () => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    const filteredCategories = FAQ_CATEGORIES
        .map(cat => ({
            ...cat,
            questions: cat.questions.filter(q =>
                !search || q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(cat => (!activeCategory || cat.label === activeCategory) && cat.questions.length > 0);

    return (
        <PublicLayout>
            <div className="font-inter pb-20">

                {/* ══ HERO ══ */}
                <section className="relative py-24 bg-slate-950 overflow-hidden text-center">
                    <div className="absolute top-0 left-1/3 size-96 bg-primary/10 rounded-full blur-[150px]" />
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-8">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                            <HelpCircle className="size-3" /> Centre d'Aide BCA Connect
                        </span>
                        <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
                            Des Questions ?<br />
                            <span className="text-primary">On a les réponses.</span>
                        </h1>
                        {/* Barre de recherche */}
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher dans la FAQ..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-400 font-medium text-base focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                            />
                        </div>
                    </div>
                </section>

                <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 space-y-10">
                    {/* Filtres par catégorie */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={cn("px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
                                !activeCategory ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            )}
                        >
                            Toutes les catégories
                        </button>
                        {FAQ_CATEGORIES.map(cat => (
                            <button
                                key={cat.label}
                                onClick={() => setActiveCategory(cat.label === activeCategory ? null : cat.label)}
                                className={cn("px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border gap-2 flex items-center",
                                    activeCategory === cat.label ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                )}
                            >
                                <span>{cat.icon}</span> {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Questions */}
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                            <div key={cat.label} className="space-y-4">
                                <h2 className="text-sm font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2">
                                    <span className="text-xl">{cat.icon}</span> {cat.label}
                                </h2>
                                <div className="space-y-3">
                                    {cat.questions.map((item, i) => (
                                        <FaqItem key={i} question={item.q} answer={item.a} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <p className="text-2xl font-black italic tracking-tighter text-foreground">Aucun résultat</p>
                            <p className="text-muted-foreground font-medium">Aucune réponse ne correspond à votre recherche.</p>
                        </div>
                    )}

                    {/* CTA Pas trouvé */}
                    <div className="relative p-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 text-center space-y-5 overflow-hidden">
                        <div className="absolute top-0 right-0 size-48 bg-primary/5 rounded-full blur-[80px] -mt-20 -mr-20" />
                        <MessageSquare className="size-12 text-primary mx-auto" />
                        <div>
                            <h3 className="text-2xl font-black italic tracking-tighter text-foreground">Vous n'avez pas trouvé votre réponse ?</h3>
                            <p className="text-muted-foreground font-medium mt-2">Notre équipe est disponible pour répondre à toutes vos questions.</p>
                        </div>
                        <Link to="/contact">
                            <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm gap-2 shadow-xl shadow-primary/20">
                                Contacter le support <ArrowRight className="size-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default FaqPage;
