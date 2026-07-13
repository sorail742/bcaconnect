import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { cn } from '../../lib/utils';
import { shouldHidePublicLayout, shouldLockViewport } from '../../lib/layoutRoutes';

const MainLayout = ({ children }) => {
    const location = useLocation();
<<<<<<< HEAD
    const hideLayout = shouldHidePublicLayout(location.pathname);
    const lockViewport = shouldLockViewport(location.pathname);
=======
    const currentPath = location.pathname.toLowerCase();
    
    const dashboardRoutes = [
        '/dashboard', '/messages', '/wallet', '/profile', '/orders', 
        '/notifications', '/settings', '/credits', '/tracking', '/payments',
        '/vendor', '/admin', '/bank', '/carrier', '/dispute', '/disputes', '/technician', '/sav'
    ];
    
    const authRoutes = ['/login', '/register', '/onboarding', '/forgot-password', '/reset-password', '/ai-mode'];
    
    const hideLayout = authRoutes.includes(currentPath) 
        || dashboardRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'));
>>>>>>> cc9e8c22a12230e3e9d0244ad41cdcde74833070

    return (
        <div className={cn(
            'relative flex flex-col bg-white dark:bg-background selection:bg-primary/20 selection:text-foreground',
            lockViewport ? 'h-svh max-h-svh overflow-hidden' : 'min-h-screen',
        )}>
            {!hideLayout && <Navbar />}
            <main className={cn(
                'flex-1',
                lockViewport ? 'min-h-0 overflow-hidden' : hideLayout ? 'min-h-0 overflow-y-auto' : undefined,
            )}>
                {children}
            </main>
            {!hideLayout && <Footer />}
        </div>
    );
};

export default MainLayout;
