import React from 'react';
import { Header } from '../landing/Header';
import { Footer } from '../landing/Footer';

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
