import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { HelpCircle, ChevronDown, ChevronUp, Search, ArrowRight, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const FAQ_CATEGORIES = [
    {
        label: 'Inscription & Compte',
        icon: '🔐',
        questions: [
            { q: "Comment créer un compte sur BCA Connect ?", a: "Rendez-vous sur notre page d'inscription. Choisissez votre rôle (Client, Fournisseur ou Transporteur), remplissez le formulaire et validez votre numéro de téléphone via un code OTP. En moins de 3 minutes, vous avez accès à la plateforme." },
            { q: "Quels documents sont nécessaires pour devenir fournisseur ?", a: "Vous aurez besoin d'une pièce d'identité valide (CNI, passeport) et si disponible, d'un registre de commerce. Notre équipe valide votre compte sous 48h ouvrables." },
            { q: "Puis-je avoir plusieurs rôles sur la même plateforme ?", a: "Chaque compte est lié à un seul rôle pour des raisons de sécurité. Vous pouvez créer des comptes distincts avec des adresses email différentes pour chaque rôle." },
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
            "bg-white/[0.02] border-4 transition-all duration-700 shadow-2xl group overflow-hidden rounded-[3rem]",
            isOpen ? "border-[#FF6600]/40 scale-[1.02] bg-white/[0.04]" : "border-white/5 hover:border-white/10"
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-12 text-left gap-8 hover:bg-white/[0.01] transition-colors group/btn"
            >
                <span className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase leading-tight group-hover/btn:translate-x-4 transition-transform duration-700">{question}</span>
                <div className={cn(
                    "size-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border-4 transition-all duration-700 shadow-3xl",
                    isOpen ? "bg-[#FF6600] border-[#FF6600] text-white rotate-180" : "bg-white/5 border-white/5 text-slate-700 group-hover/btn:scale-110 group-hover/btn:border-[#FF6600]/20"
                )}>
                    {isOpen ? <ChevronUp className="size-8" /> : <ChevronDown className="size-8" />}
                </div>
            </button>
            <div className={cn(
                "grid transition-all duration-700 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="px-12 pb-12 text-slate-500 font-extrabold uppercase tracking-[0.2em] text-xs leading-relaxed italic border-t-4 border-white/5 pt-10 mt-2 mx-12 border-l-8 border-l-[#FF6600]/20 pl-10">
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
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter">

                {/* ══ EXECUTIVE HERO ══ */}
                <section className="relative pt-48 pb-32 overflow-hidden text-center border-b-8 border-white/5 group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[60rem] bg-[#FF6600]/10 rounded-full blur-[200px] mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-[4s]" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '5rem 5rem'
                    }} />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <div className="flex flex-col items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="size-4 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_20px_rgba(255,102,0,0.4)]" />
                                <span className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic leading-none pt-0.5">ACADÉMIE & SUPPORT BCA CONNECT</span>
                            </div>
                            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase italic text-white drop-shadow-2xl">
                                PROTOCOLE <br />
                                <span className="text-[#FF6600] not-italic underline decoration-white/10 decoration-8 underline-offset-[-12px]">D'ASSISTANCE.</span>
                            </h1>
                        </div>

                        {/* Executive Search Hub */}
                        <div className="relative max-w-3xl mx-auto group/search">
                            <div className="absolute -inset-4 bg-gradient-to-r from-[#FF6600]/20 via-[#FF6600]/40 to-[#FF6600]/20 rounded-[3rem] blur-2xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-1000" />
                            <div className="relative bg-white/[0.02] border-4 border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl backdrop-blur-3xl">
                                <Search className="absolute left-10 top-1/2 -translate-y-1/2 size-10 text-[#FF6600] group-focus-within/search:scale-125 transition-transform duration-700" />
                                <input
                                    type="text"
                                    placeholder="IDENTIFIER UNE SOLUTION, UN PROCESSUS, UN CONTRAT..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full h-28 pl-26 pr-12 bg-transparent border-none text-white placeholder:text-slate-800 font-black text-xl italic tracking-widest focus:ring-0 uppercase transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 space-y-28">
                    {/* Integrated Control Panel (Categories) */}
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={cn(
                                "h-20 px-14 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.5em] transition-all border-4 italic leading-none pt-1 decoration-8",
                                !activeCategory
                                    ? "bg-[#FF6600] text-white border-[#FF6600] shadow-3xl shadow-[#FF6600]/30 scale-110"
                                    : "bg-white/5 border-white/5 text-slate-500 hover:border-[#FF6600]/40 hover:text-white"
                            )}
                        >
                            ACCÈS TOTAL
                        </button>
                        {FAQ_CATEGORIES.map(cat => (
                            <button
                                key={cat.label}
                                onClick={() => setActiveCategory(cat.label === activeCategory ? null : cat.label)}
                                className={cn(
                                    "h-20 px-10 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all border-4 flex items-center gap-6 italic leading-none pt-1",
                                    activeCategory === cat.label
                                        ? "bg-[#FF6600] text-white border-[#FF6600] shadow-3xl shadow-[#FF6600]/30 scale-110"
                                        : "bg-white/5 border-white/5 text-slate-500 hover:border-[#FF6600]/40 hover:text-white"
                                )}
                            >
                                <span className="text-2xl filter grayscale active:grayscale-0 group-hover:filter-none">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Engine */}
                    <div className="space-y-32">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map(cat => (
                                <div key={cat.label} className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                    <div className="flex items-center gap-10 group/title">
                                        <div className="size-3 bg-[#FF6600] rounded-full group-hover:scale-[12] transition-transform duration-1000 opacity-20 shadow-[0_0_20px_rgba(255,102,0,0.4)]" />
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-[#FF6600] flex items-center gap-8 italic leading-none pt-1">
                                            <span className="text-5xl">{cat.icon}</span> {cat.label}
                                        </h2>
                                        <div className="flex-1 h-1 bg-gradient-to-r from-white/10 to-transparent" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-10">
                                        {cat.questions.map((item, i) => (
                                            <FaqItem key={i} question={item.q} answer={item.a} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-48 text-center space-y-10 bg-white/[0.01] border-4 border-dashed border-white/5 rounded-[4rem]">
                                <div className="size-40 rounded-[3rem] bg-white/5 flex items-center justify-center mx-auto border-4 border-dashed border-white/5 group">
                                    <Search className="size-20 text-slate-800 animate-pulse" />
                                </div>
                                <div className="space-y-6">
                                    <p className="text-5xl font-black italic tracking-tighter text-white uppercase">PROTOCOLE INFRUCTUEUX</p>
                                    <p className="text-slate-500 font-extrabold uppercase tracking-[0.4em] text-xs max-w-2xl mx-auto italic border-r-8 border-[#FF6600]/20 pr-12 text-right">
                                        AUCUNE DONNÉE N'A ÉTÉ IDENTIFIÉE POUR LES CRITÈRES SPÉCIFIÉS DANS NOTRE BASE DE CONNAISSANCES.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Executive Support CTA */}
                    <div className="relative p-24 rounded-[5rem] bg-white group border-x-[12px] border-[#FF6600] text-center space-y-12 overflow-hidden shadow-3xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)]" />
                        <div className="absolute top-0 right-0 size-[40rem] bg-[#FF6600]/10 rounded-full blur-[150px] -mt-48 -mr-48 group-hover:scale-125 transition-transform duration-[2s]" />

                        <div className="relative z-10 size-28 bg-black rounded-[2.5rem] flex items-center justify-center mx-auto shadow-3xl group-hover:rotate-12 transition-transform duration-700">
                            <MessageSquare className="size-14 text-white" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <h3 className="text-5xl md:text-7xl font-black italic tracking-tighter text-black uppercase leading-none">BESOIN D'UNE <span className="text-[#FF6600] not-italic">LIAISON DIRECTE ?</span></h3>
                            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm italic max-w-3xl mx-auto leading-relaxed border-l-8 border-[#FF6600]/40 pl-12 text-left">
                                NOS AGENTS DE LIAISON STRATÉGIQUE SONT PRÊTS À RÉSOUDRE VOS PROBLÉMATIQUES OPÉRATIONNELLES LES PLUS COMPLEXES EN UN TEMPS RECORD.
                            </p>
                        </div>
                        <Link to="/contact" className="relative z-10 inline-block">
                            <Button className="h-28 px-20 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-sm shadow-3xl shadow-[#FF6600]/20 bg-black hover:bg-black text-white border-4 border-black hover:scale-110 active:scale-95 transition-all group/btn relative overflow-hidden italic leading-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                OUVRIR UN CANAL CONSULAIRE <ArrowRight className="size-8 ml-6 group-hover/btn:translate-x-4 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default FaqPage;
