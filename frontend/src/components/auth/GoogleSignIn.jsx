import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/useLanguage';
import { getDashboardRoute } from '../../constants/roles';
import authService from '../../services/authService';
import { initGoogleSSO } from '../../utils/googleInit';
import { cn } from '../../lib/utils';

const GoogleLogo = ({ className = 'size-5' }) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export default function GoogleSignIn({ containerId = 'google-button-container', className = '' }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!clientId) return undefined;

        const handleGoogleResponse = async (response) => {
            try {
                setIsLoading(true);
                const data = await authService.googleLogin(response.credential);
                setAuth(data.user, data.accessToken);
                toast.success(t('googleLoginSuccess') || 'Connexion Google réussie !');
                navigate(getDashboardRoute(data.user.role));
            } catch (error) {
                const errorMsg = error?.response?.data?.message || error?.message || 'Erreur inconnue';
                toast.error(`${t('googleLoginError') || 'Échec Google'} : ${errorMsg}`);
            } finally {
                setIsLoading(false);
            }
        };

        const cleanup = initGoogleSSO((response) => {
            handleGoogleResponse(response);
            setIsReady(true);
            setTimeout(() => {
                const buttonDiv = document.getElementById(containerId);
                if (buttonDiv && window.google?.accounts?.id) {
                    buttonDiv.innerHTML = '';
                    window.google.accounts.id.renderButton(buttonDiv, {
                        theme: 'outline',
                        size: 'large',
                        width: buttonDiv.offsetWidth || 400,
                        text: 'continue_with',
                        shape: 'rectangular',
                        logo_alignment: 'left',
                    });
                }
            }, 100);
        });

        return cleanup;
    }, [clientId, containerId, navigate, setAuth, t]);

    const handleCustomClick = () => {
        if (!clientId) {
            toast.error(t('googleNotConfigured') || 'Connexion Google non configurée.');
            return;
        }
        if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
        }
    };

    return (
        <div className={cn('space-y-3', className)}>
            <div className="relative flex items-center">
                <div className="flex-1 border-t border-border" />
                <span className="px-3 text-xs text-muted-foreground">{t('loginOr') || 'Ou continuer avec'}</span>
                <div className="flex-1 border-t border-border" />
            </div>

            <button
                type="button"
                onClick={handleCustomClick}
                disabled={isLoading || (!isReady && !!clientId)}
                className="w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-60 shadow-sm"
            >
                {isLoading ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                ) : (
                    <>
                        <GoogleLogo />
                        <span>{t('continueWithGoogle') || 'Continuer avec Google'}</span>
                    </>
                )}
            </button>

            {clientId && (
                <div
                    id={containerId}
                    className="w-full min-h-[44px] overflow-hidden rounded-xl flex justify-center [&>div]:!w-full"
                />
            )}
        </div>
    );
}
