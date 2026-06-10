import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import authService from '../../services/authService';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        try {
            await authService.requestPasswordReset?.(email.trim())
                .catch(() => ({ ok: true }));
            setSent(true);
            toast.success('Si ce compte existe, un lien de réinitialisation a été envoyé.');
        } catch {
            toast.error('Impossible d\'envoyer le lien pour le moment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl space-y-6">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                    <ArrowLeft className="size-4" /> Retour à la connexion
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Entrez votre e-mail pour recevoir un lien de réinitialisation.
                    </p>
                </div>
                {sent ? (
                    <p className="text-sm text-emerald-600 font-medium">
                        Vérifiez votre boîte mail (et les spams). Vous pouvez fermer cette page.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@exemple.com"
                                className="w-full h-11 pl-10 pr-4 border border-border rounded-xl bg-background text-sm outline-none focus:border-primary"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Envoyer le lien'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
