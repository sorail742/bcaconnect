import React, { createContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export { LanguageContext };

// Langues effectivement disponibles dans `translations.js`. 'NKO' a existé un temps
// dans l'UI sans dictionnaire réel (le contenu Malinké existant est en écriture latine,
// pas en script N'Ko) — on migre silencieusement les anciens choix persistés vers 'MA'.
const SUPPORTED_LANGS = ['FR', 'EN', 'SO', 'PE', 'MA'];

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        const stored = localStorage.getItem('bca-lang');
        return SUPPORTED_LANGS.includes(stored) ? stored : 'FR';
    });

    useEffect(() => {
        localStorage.setItem('bca-lang', lang);
        document.documentElement.lang = lang.toLowerCase();
        document.documentElement.dir = 'ltr';
    }, [lang]);

    const changeLanguage = (newLang) => {
        setLang(newLang);
    };

    const t = (key, params = {}) => {
        // Une clé absente des deux dictionnaires renvoie une chaîne vide (et non
        // la clé brute) afin que le pattern répandu `t('x') || 'repli'` fonctionne
        // réellement partout dans l'app, au lieu d'afficher la clé technique à l'écran.
        let text = translations[lang]?.[key] ?? translations['FR']?.[key] ?? '';

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
