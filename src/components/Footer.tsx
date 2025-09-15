import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-cyber-dark border-t border-cyber-blue/30 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400 font-mono text-sm">
        <p>&copy; {new Date().getFullYear()} CyberHedge Signals. All rights reserved.</p>
        <a 
          href="https://modfxmarket.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyber-blue hover:text-neon-blue transition-colors"
        >
          {t('footer.powered_by')}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
