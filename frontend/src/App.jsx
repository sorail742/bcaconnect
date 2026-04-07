import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import OfflineBanner from './components/layout/OfflineBanner';
import { syncService } from './services/syncService';
import AIChat from './components/ui/AIChat';
import SmoothScroll from './components/layout/SmoothScroll';
import './App.css';

function App() {
  useEffect(() => {
    const handleOnline = () => {
      const token = localStorage.getItem('token');
      if (token) {
        syncService.syncOrders(token);
      }
    };

    window.addEventListener('online', handleOnline);
    handleOnline();

    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <SmoothScroll>
                <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground">
                  <OfflineBanner />
                  <AppRoutes />
                </div>
                <AIChat />
              </SmoothScroll>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
