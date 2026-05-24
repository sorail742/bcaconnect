import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('bca-lang') || 'FR';
    });

    useEffect(() => {
        localStorage.setItem('bca-lang', lang);
    }, [lang]);

    const changeLanguage = (newLang) => {
        setLang(newLang);
    };

    const t = (key, params = {}) => {
        let text = translations[lang]?.[key] || translations['FR']?.[key] || key;
        
        // Handle placeholders like {name}
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p]);
        });
        
        return text;
    };

    return (
        <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
