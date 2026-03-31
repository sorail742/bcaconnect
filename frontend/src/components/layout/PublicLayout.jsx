import React from 'react';
import { Header } from '../landing/Header';
import { Footer } from '../landing/Footer';

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-transparent text-foreground flex flex-col">
            <Header />
            <main className="flex-1 pt-28">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
