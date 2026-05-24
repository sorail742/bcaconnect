import React from 'react';

export const PageWrapper = ({ children, className = '' }) => {
    return (
        <div className={`min-h-screen bg-background text-foreground ${className}`}>
            {children}
        </div>
    );
};

export default PageWrapper;
