import React, { useState, useRef, useEffect } from 'react';
import { Settings, PlusCircle, Link } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const SettingsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addBSCTestnet } = useWallet();
  const menuRef = useRef<HTMLDivElement>(null);

  const getTestBNB = () => {
    window.open('https://testnet.bnbchain.org/faucet-smart', '_blank', 'noopener');
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
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400 hover:text-white" aria-label="Settings">
        <Settings size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-cyber-card border border-cyber-blue/50 rounded-none shadow-lg z-50">
          <ul className="text-sm text-gray-300 font-mono">
            <li 
              onClick={addBSCTestnet}
              className="flex items-center px-4 py-2 hover:bg-cyber-blue/10 cursor-pointer"
            >
              <PlusCircle size={16} className="mr-2" />
              Add BSC Testnet
            </li>
            <li 
              onClick={getTestBNB}
              className="flex items-center px-4 py-2 hover:bg-cyber-blue/10 cursor-pointer"
            >
              <Link size={16} className="mr-2" />
              Get Test BNB
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
