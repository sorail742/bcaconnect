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
        <div className={cn(
            "glass-card border-4 border-border rounded-[2rem] overflow-hidden transition-all duration-700 shadow-premium group",
            isOpen && "border-primary/40 scale-[1.02] shadow-primary/10"
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-10 text-left gap-8 hover:bg-primary/5 transition-colors group/btn"
            >
                <span className="text-xl font-black text-foreground italic tracking-tighter uppercase leading-tight group-hover/btn:translate-x-2 transition-transform duration-500">{question}</span>
                <div className={cn(
                    "size-14 rounded-2xl flex items-center justify-center shrink-0 border-4 transition-all duration-500 shadow-premium",
                    isOpen ? "bg-primary border-primary text-white rotate-180" : "bg-background border-border text-primary group-hover/btn:scale-110"
                )}>
                    {isOpen ? <ChevronUp className="size-6" /> : <ChevronDown className="size-6" />}
                </div>
            </button>
            <div className={cn(
                "grid transition-all duration-700 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="px-10 pb-10 text-muted-foreground/60 font-black uppercase tracking-[0.2em] text-xs leading-relaxed italic border-t-4 border-border pt-8 mt-2 mx-10 border-l-8 border-l-primary/20 pl-8">
                        {answer}
                    </div>
                </div>
            </div>
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
            <div className="font-inter pb-32">

                {/* ══ EXECUTIVE HERO ══ */}
                <section className="relative py-40 overflow-hidden text-center group">
                    {/* Background layers */}
                    <div className="absolute inset-0 bg-slate-950" />
                    <div className="absolute top-0 left-1/4 size-[40rem] bg-primary/10 rounded-full blur-[150px] group-hover:bg-primary/20 transition-colors duration-1000" />
                    <div className="absolute bottom-0 right-1/4 size-[40rem] bg-blue-600/5 rounded-full blur-[150px]" />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--primary)_1.5px,transparent_1.5px)] bg-[size:48px_48px]" />
                    
                    <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="size-3 rounded-full bg-primary animate-pulse" />
                                <span className="text-executive-label font-black text-primary uppercase tracking-[0.6em] italic leading-none pt-0.5">ACADÉMIE & SUPPORT BCA CONNECT</span>
                            </div>
                            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
                                PROTOCOLE <br />
                                <span className="text-primary not-italic underline decoration-white/10 underline-offset-[-12px]">D'ASSISTANCE.</span>
                            </h1>
                        </div>

                        {/* Executive Search Hub */}
                        <div className="relative max-w-2xl mx-auto group/search">
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-700" />
                            <div className="relative glass-card border-4 border-white/10 rounded-[2rem] overflow-hidden shadow-premium-lg">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 size-8 text-primary group-focus-within/search:scale-125 transition-transform" />
                                <input
                                    type="text"
                                    placeholder="IDENTIFIER UNE SOLUTION, UN PROCESSUS, UN CONTRAT..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full h-24 pl-22 pr-10 bg-transparent border-none text-white placeholder:text-white/20 font-black text-lg italic tracking-widest focus:ring-0 uppercase"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 space-y-24">
                    {/* Integrated Control Panel (Categories) */}
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={cn(
                                "h-16 px-10 rounded-[1.2rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all border-4 italic leading-none pt-1",
                                !activeCategory 
                                    ? "bg-primary text-white border-primary shadow-premium-lg shadow-primary/40 scale-105" 
                                    : "glass-card border-border text-muted-foreground/60 hover:border-primary/40 hover:text-primary"
                            )}
                        >
                            ACCÈS TOTAL
                        </button>
                        {FAQ_CATEGORIES.map(cat => (
                            <button
                                key={cat.label}
                                onClick={() => setActiveCategory(cat.label === activeCategory ? null : cat.label)}
                                className={cn(
                                    "h-16 px-8 rounded-[1.2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all border-4 flex items-center gap-4 italic leading-none pt-1",
                                    activeCategory === cat.label 
                                        ? "bg-primary text-white border-primary shadow-premium-lg shadow-primary/40 scale-105" 
                                        : "glass-card border-border text-muted-foreground/60 hover:border-primary/40 hover:text-primary"
                                )}
                            >
                                <span className="text-xl filter grayscale active:grayscale-0">{cat.icon}</span> 
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Engine */}
                    <div className="space-y-20">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map(cat => (
                                <div key={cat.label} className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="flex items-center gap-8 group/title">
                                        <div className="size-2 bg-primary rounded-full group-hover:scale-[10] transition-transform duration-700 opacity-20" />
                                        <h2 className="text-executive-label font-black uppercase tracking-[0.5em] text-primary flex items-center gap-6 italic leading-none pt-1">
                                            <span className="text-4xl">{cat.icon}</span> {cat.label}
                                        </h2>
                                        <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-8">
                                        {cat.questions.map((item, i) => (
                                            <FaqItem key={i} question={item.q} answer={item.a} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-40 text-center space-y-8 glass-card border-4 border-dashed border-border rounded-[3rem]">
                                <div className="size-32 rounded-[2.5rem] bg-muted/10 flex items-center justify-center mx-auto border-4 border-dashed border-border group">
                                    <Search className="size-16 text-muted-foreground/20 animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-4xl font-black italic tracking-tighter text-foreground uppercase">Protocole Infructueux</p>
                                    <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-xs max-w-lg mx-auto italic border-r-8 border-primary/20 pr-10 text-right">
                                        Aucune donnée n'a été identifiée pour les critères spécifiés dans notre base de connaissances.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Executive Support CTA */}
                    <div className="relative p-20 rounded-[4rem] glass-card border-4 border-primary/20 text-center space-y-10 overflow-hidden shadow-premium-lg group">
                        <div className="absolute top-0 right-0 size-96 bg-primary/10 rounded-full blur-[120px] -mt-48 -mr-48 group-hover:scale-125 transition-transform duration-[2s]" />
                        <div className="relative z-10 size-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-premium-lg group-hover:rotate-12 transition-transform">
                            <MessageSquare className="size-12 text-white" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-foreground uppercase leading-none">Besoin d'une <span className="text-primary not-italic">Intervention Directe ?</span></h3>
                            <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-sm italic max-w-2xl mx-auto leading-relaxed border-l-8 border-primary/20 pl-10">
                                Nos agents de liaison stratégique sont prêts à résoudre vos problématiques opérationnelles les plus complexes en un temps record.
                            </p>
                        </div>
                        <Link to="/contact" className="relative z-10 inline-block">
                            <Button className="h-20 px-14 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-premium-lg shadow-primary/40 bg-primary hover:bg-primary text-white border-0 hover:scale-105 active:scale-95 transition-all group/btn relative overflow-hidden italic leading-none pt-1">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                OUVRIR UN CANAL DE SUPPORT <ArrowRight className="size-5 ml-4 group-hover/btn:translate-x-2 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default FaqPage;
