import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Zap, Wallet, Menu, X } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import SettingsMenu from './SettingsMenu';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isConnected, address, modxBalance, connectWallet, disconnectWallet } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const navLinks = (
    <>
      <NavLink to="/signals" className={({ isActive }) => `font-cyber text-sm ${isActive ? 'text-neon-blue' : 'text-gray-300 hover:text-neon-blue'} transition-colors block md:inline-block px-3 py-2`}>
        {t('header.signals')}
      </NavLink>
      <NavLink to="/portfolio" className={({ isActive }) => `font-cyber text-sm ${isActive ? 'text-neon-blue' : 'text-gray-300 hover:text-neon-blue'} transition-colors block md:inline-block px-3 py-2`}>
        {t('header.portfolio')}
      </NavLink>
      <NavLink to="/analytics" className={({ isActive }) => `font-cyber text-sm ${isActive ? 'text-neon-blue' : 'text-gray-300 hover:text-neon-blue'} transition-colors block md:inline-block px-3 py-2`}>
        {t('header.analytics')}
      </NavLink>
    </>
  );

  return (
    <header className="bg-cyber-dark/80 backdrop-blur-sm border-b border-cyber-blue/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <Zap className="h-8 w-8 text-neon-blue" />
            <span className="ml-2 text-2xl font-bold font-cyber text-white">
              CYBER<span className="text-neon-pink">HEDGE</span>
            </span>
          </Link>

          <nav className="hidden md:flex md:space-x-4">{navLinks}</nav>

          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-mono text-white">{formatAddress(address)}</p>
                  <p className="text-xs font-mono text-cyber-green">{modxBalance} MODX</p>
                </div>
                <button onClick={disconnectWallet} className="px-3 py-2 border border-neon-pink text-neon-pink font-cyber text-xs font-bold hover:bg-neon-pink hover:text-black transition-colors">
                  {t('header.disconnect')}
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="hidden md:flex items-center px-4 py-2 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white font-bold font-cyber text-sm cyber-glow">
                <Wallet className="h-4 w-4 mr-2" />
                {t('header.connect_wallet')}
              </button>
            )}
            <LanguageSwitcher />
            <SettingsMenu />
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-cyber-card">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks}
            <div className="pt-4 mt-4 border-t border-cyber-blue/30">
              {isConnected ? (
                <div className="flex items-center justify-between px-3">
                  <div className="text-left">
                    <p className="text-sm font-mono text-white">{formatAddress(address)}</p>
                    <p className="text-xs font-mono text-cyber-green">{modxBalance} MODX</p>
                  </div>
                  <button onClick={disconnectWallet} className="px-3 py-2 border border-neon-pink text-neon-pink font-cyber text-xs font-bold hover:bg-neon-pink hover:text-black transition-colors">
                    {t('header.disconnect')}
                  </button>
                </div>
              ) : (
                <button onClick={connectWallet} className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white font-bold font-cyber text-sm cyber-glow">
                  <Wallet className="h-4 w-4 mr-2" />
                  {t('header.connect_wallet')}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
