import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Lang } from './translations';

interface LangContextType {
    lang: Lang;
    toggleLang: () => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const LangContext = createContext<LangContextType>({
    lang: 'fr',
    toggleLang: () => {},
    t: (key: string) => key,
    isRTL: false,
});

export const useLang = () => useContext(LangContext);

export const LangProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLang] = useState<Lang>(() => {
        return (localStorage.getItem('app-lang') as Lang) || 'fr';
    });

    const toggleLang = () => {
        setLang(prev => prev === 'fr' ? 'ar' : 'fr');
    };

    const t = (key: string): string => {
        if (translations[key]) {
            return translations[key][lang];
        }
        return key; // Fallback: return the key itself
    };

    const isRTL = lang === 'ar';

    useEffect(() => {
        localStorage.setItem('app-lang', lang);
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', lang);
        // Change font family for Arabic
        document.body.style.fontFamily = isRTL 
            ? "'Tajawal', 'Inter', sans-serif" 
            : "'Inter', sans-serif";
    }, [lang, isRTL]);

    return (
        <LangContext.Provider value={{ lang, toggleLang, t, isRTL }}>
            {children}
        </LangContext.Provider>
    );
};
