import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import trTranslation from './locales/tr/translation.json';
import zhTranslation from './locales/zh/translation.json';
import deTranslation from './locales/de/translation.json';
import itTranslation from './locales/it/translation.json';

const resources = {
  en: { translation: enTranslation },
  tr: { translation: trTranslation },
  zh: { translation: zhTranslation },
  de: { translation: deTranslation },
  it: { translation: itTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React zaten XSS'e karşı koruma sağlar
    },
  });

export default i18n;
