import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();
export { ThemeContext };

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('bca-theme');
            return saved || 'dark';
        } catch (e) {
            return 'dark';
        }
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;

        if (theme === 'dark') {
            root.classList.add('dark');
            body.classList.add('dark');
            root.classList.remove('light');
            body.classList.remove('light');
        } else {
            root.classList.remove('dark');
            body.classList.remove('dark');
            root.classList.add('light');
            body.classList.add('light');
        }
        try {
            localStorage.setItem('bca-theme', theme);
        } catch (e) {
            // Ignore quota errors
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
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
