import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ChevronDown, Search, MessageSquare, ArrowRight, ShieldCheck, CreditCard, LifeBuoy } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/useLanguage';

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={cn(
            "bg-white dark:bg-slate-800 border transition-all duration-300 rounded-2xl overflow-hidden",
            isOpen ? "border-[#FF6600]/40 shadow-md" : "border-border hover:border-slate-300 dark:hover:border-slate-600"
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left gap-6 group"
            >
                <span className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#FF6600] transition-colors">{question}</span>
                <div className={cn(
                    "size-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300",
                    isOpen ? "bg-[#FF6600]/10 border-[#FF6600]/20 text-[#FF6600] rotate-180" : "bg-slate-50 dark:bg-slate-700/50 border-black/5 text-slate-400 group-hover:bg-slate-100"
                )}>
                    <ChevronDown className="size-5" />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-6 pt-2">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed border-l-4 border-[#FF6600] pl-4">
                                {answer}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FaqPage = () => {
    const { t, lang } = useLanguage();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    const FAQ_CATEGORIES = [
        {
            label: lang === 'FR' ? 'Compte & Accès' : 'Account & Access',
            icon: LifeBuoy,
            questions: [
                { q: lang === 'FR' ? "Comment créer un compte professionnel ?" : "How to create a pro account?", a: lang === 'FR' ? "Allez sur la page d'inscription, choisissez le rôle 'Fournisseur' ou 'Transporteur' et remplissez votre RCCM." : "Go to the registration page, choose the 'Vendor' or 'Carrier' role and fill in your details." },
                { q: lang === 'FR' ? "Puis-je changer mon email ?" : "Can I change my email?", a: lang === 'FR' ? "Oui, vous pouvez modifier votre adresse email directement depuis les paramètres de votre profil." : "Yes, you can modify your email address directly from your profile settings." },
            ]
        },
        {
            label: lang === 'FR' ? 'Transactions & Paiements' : 'Payments & Wallet',
            icon: CreditCard,
            questions: [
                { q: lang === 'FR' ? "Quels sont les frais de transaction ?" : "Transaction fees?", a: lang === 'FR' ? "Les dépôts sont sans frais. Un pourcentage de 2% est appliqué sur les retraits vers Mobile Money." : "Deposits are free. A 2% fee is applied on withdrawals to Mobile Money." },
                { q: lang === 'FR' ? "Le paiement est-il sécurisé ?" : "Is payment secure?", a: lang === 'FR' ? "Totalement. Le système de séquestre (Escrow) de BCA Connect garantit que le vendeur n'est payé que lorsque vous recevez la commande." : "Fully secured. Our escrow system guarantees payment only upon delivery." },
            ]
        },
        {
            label: lang === 'FR' ? 'Sécurité' : 'Security',
            icon: ShieldCheck,
            questions: [
                { q: lang === 'FR' ? "À quoi servent les KYC ?" : "What are KYCs for?", a: lang === 'FR' ? "Le KYC (Know Your Customer) nous permet de vérifier l'identité des fournisseurs pour éviter les fraudes." : "KYC helps us verify vendor identities to prevent fraud." }
            ]
        }
    ];

    const filteredCategories = FAQ_CATEGORIES
        .map(cat => ({
            ...cat,
            questions: cat.questions.filter(q =>
                !search || q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(cat => (!activeCategory || cat.label === activeCategory) && cat.questions.length > 0);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

    return (
        <div className="bg-slate-50 dark:bg-[#0A0D14] min-h-screen text-slate-900 dark:text-foreground font-sans">
            {/* ══ HERO SECTION ══ */}
            <section className="relative pt-32 pb-20 overflow-hidden text-center border-b border-border bg-white dark:bg-[#0F1219]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#FF6600]/5 to-transparent pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-4xl mx-auto px-6 space-y-8"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        <span className="text-[#FF6600]">Foire</span> Aux Questions
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                        Tout ce que vous devez savoir pour exploiter la plateforme au maximum.
                    </p>

                    {/* Search Hub */}
                    <div className="relative max-w-2xl mx-auto pt-4">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une question..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-16 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-border focus:border-[#FF6600] rounded-2xl text-base font-medium outline-none shadow-sm transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>
                </motion.div>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Category Filters */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={cn(
                            "px-6 py-3 rounded-full text-sm font-bold transition-all border",
                            !activeCategory
                                ? "bg-[#FF6600] text-white border-[#FF6600] shadow-md"
                                : "bg-white dark:bg-slate-800 border-border text-slate-600 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        Toutes les catégories
                    </button>
                    {FAQ_CATEGORIES.map(cat => (
                        <button
                            key={cat.label}
                            onClick={() => setActiveCategory(cat.label === activeCategory ? null : cat.label)}
                            className={cn(
                                "px-6 py-3 rounded-full text-sm font-bold transition-all border flex items-center gap-2",
                                activeCategory === cat.label
                                    ? "bg-[#FF6600] text-white border-[#FF6600] shadow-md"
                                    : "bg-white dark:bg-slate-800 border-border text-slate-600 hover:text-slate-900 dark:text-slate-400 hover:border-[#FF6600]/40"
                            )}
                        >
                            <cat.icon className="size-4" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQ Content */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-12"
                >
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                            <div key={cat.label} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600]">
                                        <cat.icon className="size-4" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{cat.label}</h2>
                                    <div className="flex-1 h-px bg-border ml-4" />
                                </div>
                                <div className="space-y-4">
                                    {cat.questions.map((item, i) => (
                                        <FaqItem key={i} question={item.q} answer={item.a} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white dark:bg-slate-800 border border-dashed border-border rounded-3xl">
                            <Search className="size-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-xl font-bold text-slate-900 dark:text-white">Aucun résultat trouvé pour "{search}"</p>
                            <p className="text-sm text-slate-500 mt-2">Essayez d'utiliser des termes différents.</p>
                        </div>
                    )}
                </motion.div>

                {/* Contact CTA */}
                <div className="mt-20 p-10 md:p-12 rounded-3xl bg-slate-900 text-center flex flex-col items-center border border-slate-800 shadow-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[#FF6600]/10 mix-blend-overlay" />
                    <MessageSquare className="size-12 text-[#FF6600] mb-6 relative z-10" />
                    <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Toujours besoin d'aide ?</h3>
                    <p className="text-sm font-medium text-slate-300 max-w-lg mb-8 relative z-10">
                        Notre équipe de support est disponible pour répondre à toutes vos questions complémentaires.
                    </p>
                    <Link to="/contact" className="relative z-10">
                        <Button className="h-12 px-8 bg-[#FF6600] text-white hover:bg-[#FF6600]/90 rounded-xl font-bold text-sm shadow-md">
                            Contacter le Support
                            <ArrowRight className="size-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
