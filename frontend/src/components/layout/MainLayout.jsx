import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const currentPath = location.pathname.toLowerCase();
    
    const dashboardRoutes = [
        '/dashboard', '/messages', '/wallet', '/profile', '/orders', 
        '/notifications', '/settings', '/credits', '/tracking', '/payments',
        '/vendor', '/admin', '/bank', '/carrier', '/dispute', '/disputes', '/technician', '/sav'
    ];
    
    const authRoutes = ['/login', '/register', '/onboarding', '/forgot-password', '/reset-password', '/ai-mode'];
    
    const hideLayout = authRoutes.includes(currentPath) 
        || dashboardRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'));

    return (
        <div className="relative flex min-h-screen flex-col bg-white dark:bg-background selection:bg-primary/20 selection:text-foreground">
            {!hideLayout && <Navbar />}
            <main className="flex-1">
                {children}
            </main>
            {!hideLayout && <Footer />}
        </div>
    );
};

export default MainLayout;
