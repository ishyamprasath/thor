import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TranslationContextType {
    language: string;
    setLanguage: (lang: string) => void;
    translate: (text: string) => string; // synchronous return (cached or original text while fetching)
    translateAsync: (text: string) => Promise<string>;
    supportedLanguages: string[];
}

const defaultLang = localStorage.getItem("thor_lang") || "English";

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

import { API_URL } from "../config/api";

export function TranslationProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState(defaultLang);
    const [cache, setCache] = useState<Record<string, Record<string, string>>>({}); // { lang: { EnglishText: TranslatedText } }

    const supportedLanguages = [
        "English", "Spanish", "French", "German", "Italian", "Portuguese",
        "Russian", "Japanese", "Korean", "Simplified Chinese", "Hindi",
        "Arabic", "Turkish", "Vietnamese", "Thai", "Indonesian", "Dutch",
        "Tamil", "Telugu", "Malayalam", "Kannada"
    ];

    const setLanguage = (lang: string) => {
        setLanguageState(lang);
        localStorage.setItem("thor_lang", lang);
    };

    const translateAsync = async (text: string): Promise<string> => {
        if (language === "English" || !text) return text;

        // Check cache
        if (cache[language]?.[text]) {
            return cache[language][text];
        }

        try {
            const res = await fetch(`${API_URL}/translate/text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, target_language: language })
            });
            const data = await res.json();
            const translated = data.translated_text || text;

            // Update cache
            setCache(prev => ({
                ...prev,
                [language]: { ...(prev[language] || {}), [text]: translated }
            }));

            return translated;
        } catch (e) {
            console.error("Translation error:", e);
            return text;
        }
    };

    const translate = (text: string): string => {
        if (language === "English" || !text) return text;

        // If it's in the cache, return it synchronously.
        if (cache[language]?.[text]) {
            return cache[language][text];
        }

        // If not in cache, trigger async fetch but return original text immediately to avoid React suspense/blocking.
        // The next render cycle after cache updation will show the translated text.
        translateAsync(text);
        return text; // Return English as fallback temporarily
    };

    return (
        <TranslationContext.Provider value={{ language, setLanguage, translate, translateAsync, supportedLanguages }}>
            {children}
        </TranslationContext.Provider>
    );
}

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within a TranslationProvider");
    }
    return context;
};
