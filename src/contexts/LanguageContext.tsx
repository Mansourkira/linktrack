"use client";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import React, { createContext, useContext, useEffect, useState } from "react";

const translations = { en, fr };
const defaultLang = "en";

const LanguageContext = createContext({
  lang: defaultLang,
  setLang: (lang: string) => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState(defaultLang);

  // Save language to localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    if (storedLang && translations[storedLang as keyof typeof translations])
      setLang(storedLang);
  }, []);
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  function t(key: string) {
    return (
      key
        .split(".")
        .reduce(
          (obj, k) => obj?.[k],
          translations[lang as keyof typeof translations] as Record<string, any>
        ) || key
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
