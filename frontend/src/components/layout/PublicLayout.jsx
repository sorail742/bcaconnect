import React from 'react';
import Navbar from './Navbar';
import { Footer } from '../landing/Footer';

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#0A0D14] text-white flex flex-col">
            <Navbar />
            <main className="flex-1 pt-24">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
