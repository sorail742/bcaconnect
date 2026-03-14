import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();
export { ThemeContext };

export const ThemeProvider = ({ children }) => {
    // Default to dark theme as per user preference
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('bca-theme');
        return saved || 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('bca-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
