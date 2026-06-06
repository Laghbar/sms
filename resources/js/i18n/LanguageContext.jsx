import { createContext, useContext, useState } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem('sms_lang') || 'en');

    function toggle() {
        const next = lang === 'en' ? 'fr' : 'en';
        localStorage.setItem('sms_lang', next);
        setLang(next);
    }

    function t(key, vars = {}) {
        const str = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
        return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str);
    }

    return (
        <LanguageContext.Provider value={{ lang, toggle, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
