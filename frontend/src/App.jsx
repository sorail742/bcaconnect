import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { cn } from './lib/utils';
import { shouldHidePublicLayout, shouldLockViewport } from './lib/layoutRoutes';
import OfflineBanner from './components/layout/OfflineBanner';
import { syncService } from './services/syncService';
import AIChat from './components/ui/AIChat';
import SmoothScroll from './components/layout/SmoothScroll';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './App.css';

import useAuthStore from './store/authStore';
import authService from './services/authService';
import useSocket from './hooks/useSocket';
import { toast, Toaster } from 'sonner';
import SocketHandler from './components/SocketHandler';
import RealtimeSync from './components/RealtimeSync';
import NetworkProgressBar from './components/layout/NetworkProgressBar';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
  const location = useLocation();
  const hidePublicLayout = shouldHidePublicLayout(location.pathname);
  const lockViewport = shouldLockViewport(location.pathname);
  const setAuth = useAuthStore(state => state.setAuth);
  const clearAuth = useAuthStore(state => state.clearAuth);
  const setLoading = useAuthStore(state => state.setLoading);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const { setAuth, clearAuth, setLoading, isAuthenticated } = useAuthStore.getState();

      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // Fallback de sécurité : Si l'API est bloquée plus de 5s, on libère l'interface
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout lors de la restauration de session')), 5000)
        );
        
        const userData = await Promise.race([
          authService.getCurrentUser(),
          timeoutPromise
        ]);
        
        // Préserver le token s'il a été mis à jour par l'intercepteur de refresh
        const currentToken = useAuthStore.getState().token;
        setAuth(userData, currentToken);
      } catch (error) {
        console.error('Échec de la restauration de session (Cookie Expired):', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
    sessionStorage.removeItem('chunk_failed_reload');
  }, []);

  return (
      <MainLayout>
        <ScrollToTop />
        <div className={cn(
          'bg-background text-foreground selection:bg-primary/30 selection:text-foreground',
          lockViewport ? 'h-svh overflow-hidden' : 'min-h-svh pb-20',
          hidePublicLayout && !lockViewport && 'overflow-y-auto',
        )}>
          <NetworkProgressBar />
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={3000}
            visibleToasts={3}
            toastOptions={{
              style: { fontSize: '13px', fontWeight: '600' },
            }}
          />
          <OfflineBanner />
          <SocketHandler />
          <RealtimeSync />
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </div>
        <AIChat />
      </MainLayout>
  );
}

export default App;
