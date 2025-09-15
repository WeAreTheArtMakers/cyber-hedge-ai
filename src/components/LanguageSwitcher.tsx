import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'EN' },
  { code: 'tr', name: 'TR' },
  { code: 'zh', name: 'CN' },
  { code: 'de', name: 'DE' },
  { code: 'it', name: 'IT' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400 hover:text-white" aria-label="Change Language">
        <Globe size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 bg-cyber-card border border-cyber-blue/50 rounded-none shadow-lg z-50">
          <ul className="text-sm text-gray-300 font-mono">
            {languages.map(lang => (
              <li 
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-4 py-2 hover:bg-cyber-blue/10 cursor-pointer ${i18n.language === lang.code ? 'text-neon-blue' : ''}`}
              >
                {lang.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
