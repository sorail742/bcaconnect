import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
};

export default MainLayout;
