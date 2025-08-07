"use client";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import React, { createContext, useContext, useEffect, useState } from "react";

const translations = { en, fr };
const defaultLang = "en";

const LanguageContext = createContext({
  lang: defaultLang,
  setLang: (_lang: string) => {},
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
    const result = key
      .split(".")
      .reduce(
        (obj: unknown, k: string) => (obj as Record<string, unknown>)?.[k],
        translations[lang as keyof typeof translations] as Record<
          string,
          unknown
        >
      );
    return typeof result === "string" ? result : key;
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
