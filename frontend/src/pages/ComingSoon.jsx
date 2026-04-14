import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, ArrowLeft, Zap, Bell, CheckCircle2, Loader2 } from 'lucide-react';
import BcaLogo from '../components/ui/BcaLogo';
import { toast } from 'sonner';

/**
 * Page générique pour les routes en cours de développement.
 * Affichée pour toutes les routes orphelines détectées dans l'audit.
 */
const PAGE_LABELS = {
    '/careers':     { title: 'Carrières',              desc: 'Rejoignez notre équipe et faites partie de l\'aventure BCA Connect.' },
    '/ads':         { title: 'BCA Ads',                desc: 'La régie publicitaire BCA pour promouvoir vos produits auprès de milliers d\'acheteurs.' },
    '/insights':    { title: 'BCA Insights',           desc: 'Tableau de bord analytique pour piloter votre activité avec précision.' },
    '/consultant':  { title: 'Devenir Consultant',     desc: 'Accompagnez les entreprises guinéennes dans leur transformation digitale.' },
    '/logistics':   { title: 'BCA Logistique',         desc: 'Infrastructure logistique de bout en bout pour vos livraisons en Guinée.' },
    '/carrier-join':{ title: 'Devenir Transporteur',   desc: 'Rejoignez le réseau de transporteurs certifiés BCA Connect.' },
    '/download':    { title: 'Application Mobile',     desc: 'BCA Connect sur iOS et Android — disponible prochainement.' },
    '/returns':     { title: 'Retours & Remboursements', desc: 'Système de retours et de remboursements entièrement automatisé.' },
};

const DEFAULT_LABEL = {
    title: 'Bientôt disponible',
    desc: 'Cette fonctionnalité est en cours de développement. Elle sera disponible très prochainement.',
};

export default function ComingSoon() {
    const location = useLocation();
    const page = PAGE_LABELS[location.pathname] || DEFAULT_LABEL;
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleNotifyMe = async (e) => {
        e.preventDefault();

        // Validation email basique
        if (!email.trim()) {
            toast.error('Veuillez entrer une adresse email.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Veuillez entrer une adresse email valide.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Sauvegarde locale (en attendant un endpoint API dédié)
            const subscriptions = JSON.parse(localStorage.getItem('bca-notify-subscriptions') || '[]');
            const alreadySubscribed = subscriptions.some(s => s.email === email && s.page === location.pathname);
            
            if (alreadySubscribed) {
                toast.info('Vous êtes déjà inscrit pour les notifications de cette page.');
                setIsSubscribed(true);
                return;
            }

            subscriptions.push({ email, page: location.pathname, date: new Date().toISOString() });
            localStorage.setItem('bca-notify-subscriptions', JSON.stringify(subscriptions));

            // Simuler un délai réseau réaliste
            await new Promise(resolve => setTimeout(resolve, 600));

            setIsSubscribed(true);
            toast.success(`Vous serez alerté lorsque "${page.title}" sera disponible.`, {
                duration: 5000,
            });
        } catch {
            toast.error('Impossible de vous inscrire pour le moment. Réessayez plus tard.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[40rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
                backgroundSize: '3rem 3rem'
            }} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center text-center max-w-lg gap-8"
            >
                {/* Logo */}
                <Link to="/">
                    <BcaLogo size="h-10" />
                </Link>

                {/* Icon */}
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="size-24 rounded-[2rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-xl shadow-primary/10"
                >
                    <Rocket className="size-12 text-primary" />
                </motion.div>

                {/* Badge */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <Zap className="size-3 text-primary fill-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">En développement</span>
                </div>

                {/* Title */}
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-tight">
                        {page.title}
                    </h1>
                    <p className="text-base text-muted-foreground leading-relaxed font-medium max-w-sm mx-auto">
                        {page.desc}
                    </p>
                </div>

                {/* Notify CTA */}
                {isSubscribed ? (
                    <div className="w-full flex items-center justify-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <CheckCircle2 className="size-5 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            Vous serez alerté dès le lancement !
                        </span>
                    </div>
                ) : (
                    <form onSubmit={handleNotifyMe} className="w-full flex items-center gap-2 p-1.5 bg-muted border border-border rounded-2xl">
                        <div className="flex items-center gap-3 flex-1 px-4">
                            <Bell className="size-4 text-muted-foreground shrink-0" />
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none disabled:opacity-50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="shrink-0 h-10 px-5 bg-primary text-primary-foreground rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                "M'alerter"
                            )}
                        </button>
                    </form>
                )}

                {/* Back link */}
                <Link
                    to="/"
                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à l'accueil
                </Link>
            </motion.div>
        </div>
    );
}

