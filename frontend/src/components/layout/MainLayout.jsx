import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { cn } from '../../lib/utils';
import { shouldHidePublicLayout } from '../../lib/layoutRoutes';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const hideLayout = shouldHidePublicLayout(location.pathname);

    return (
        <div className={cn(
            'relative flex flex-col bg-white dark:bg-background selection:bg-primary/20 selection:text-foreground',
            hideLayout ? 'h-svh max-h-svh overflow-hidden' : 'min-h-screen',
        )}>
            {!hideLayout && <Navbar />}
            <main className={cn('flex-1', hideLayout && 'min-h-0 overflow-hidden')}>
                {children}
            </main>
            {!hideLayout && <Footer />}
        </div>
    );
};

export default MainLayout;
