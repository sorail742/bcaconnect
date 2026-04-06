import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const hideLayout = ['/login', '/register', '/onboarding', '/forgot-password', '/reset-password'].includes(location.pathname);

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
