import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import OfflineBanner from './components/layout/OfflineBanner';
import { syncService } from './services/syncService';
import AIChat from './components/ui/AIChat';
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
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <OfflineBanner />
            <AppRoutes />
          </div>
          <AIChat />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
