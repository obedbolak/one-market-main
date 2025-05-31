import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import I18n from '../i18n';

type SupportedLanguage = 'en' | 'fr';

interface LanguageContextType {
  locale: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  t: (key: string, options?: object) => string; // Explicitly define t function
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'user_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<SupportedLanguage>(() => {
    const deviceLanguage = Localization.locale.split('-')[0] as SupportedLanguage;
    return ['en', 'fr'].includes(deviceLanguage) ? deviceLanguage : 'en';
  });

  // Initialize I18n
  useEffect(() => {
    const initI18n = async () => {
      try {
        const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (storedLang && (storedLang === 'en' || storedLang === 'fr')) {
          I18n.locale = storedLang;
          setLocale(storedLang);
        }
      } catch (error) {
        console.error('Failed to load language', error);
      }
    };
    initI18n();
  }, []);

  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      I18n.locale = language;
      setLocale(language);
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Failed to save language', error);
    }
  };

  // Create a wrapper function for I18n.t
  const t = (key: string, options?: object) => {
    return I18n.t(key, options);
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};