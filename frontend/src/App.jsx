import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
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
import NetworkProgressBar from './components/layout/NetworkProgressBar';

function App() {
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
        const userData = await authService.getCurrentUser();
        setAuth(userData, null);
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
    <SmoothScroll>
      <MainLayout>
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground">
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
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </div>
        <AIChat />
      </MainLayout>
    </SmoothScroll>
  );
}

export default App;
