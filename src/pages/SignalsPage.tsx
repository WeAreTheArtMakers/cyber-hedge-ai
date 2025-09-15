import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SignalCard, { SignalData } from '../components/SignalCard';
import PerformanceStats from '../components/PerformanceStats';
import { generateRealSignal } from '../services/signalService';
import { ChevronDown, Plus, X, Lock } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useTranslation } from 'react-i18next';

const initialPairs = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT', 'AVAX/USDT'];
const timeframes = ['5m', '15m', '30m', '1h', '4h', '8h', '1d', '1w', '1M'];

const SignalsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isConnected, modxBalance, connectWallet } = useWallet();
  const [results, setResults] = useState<SignalData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('4h');
  const [trackedPairs, setTrackedPairs] = useState<string[]>(initialPairs);
  const [newPair, setNewPair] = useState('');

  const hasAccess = useMemo(() => {
    return isConnected && modxBalance && parseFloat(modxBalance) > 0;
  }, [isConnected, modxBalance]);

  const fetchSignals = useCallback(async (pairs: string[], timeframe: string) => {
    if (!hasAccess || pairs.length === 0) {
      setResults([]);
      setIsLoading(false);
      setIsInitialLoading(false);
      return;
    }
    setIsLoading(true);
    const signalPromises = pairs.map(pair => generateRealSignal(pair, timeframe));
    const newResults = await Promise.all(signalPromises);
    
    setResults(newResults.sort((a, b) => {
      if (a.type === 'INFO' && b.type !== 'INFO') return 1;
      if (a.type !== 'INFO' && b.type === 'INFO') return -1;
      return b.confidence - a.confidence;
    }));
    setIsLoading(false);
    setIsInitialLoading(false);
  }, [hasAccess]);

  const handleAddPair = useCallback(async () => {
    let formattedPair = newPair.toUpperCase().replace(/[^A-Z/]/g, '');
    if (!formattedPair) return;

    if (!formattedPair.includes('/')) {
      formattedPair += '/USDT';
    }

    if (formattedPair && !trackedPairs.includes(formattedPair)) {
      setIsLoading(true);
      const newResult = await generateRealSignal(formattedPair, selectedTimeframe);
      if (newResult) {
        setResults(prev => [...prev, newResult]);
        setTrackedPairs(prev => [...prev, formattedPair]);
      }
      setNewPair('');
      setIsLoading(false);
    }
  }, [newPair, trackedPairs, selectedTimeframe]);

  const handleRemovePair = (pairToRemove: string) => {
    setTrackedPairs(prev => prev.filter(p => p !== pairToRemove));
    setResults(prev => prev.filter(r => r.symbol !== pairToRemove));
  };

  const handleScan = () => {
    fetchSignals(trackedPairs, selectedTimeframe);
  };

  useEffect(() => {
    fetchSignals(initialPairs, '4h');
  }, [fetchSignals]);

  const activeSignals = results.filter(r => r.type !== 'INFO');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PerformanceStats signals={activeSignals} />

      <div className="bg-cyber-card p-4 mb-8 cyber-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-mono text-gray-400">{t('signals_page.add_token')}</label>
            <div className="flex">
              <input 
                type="text"
                value={newPair}
                onChange={(e) => setNewPair(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPair()}
                className="w-full bg-cyber-dark text-white font-mono p-2 border border-cyber-blue"
                placeholder={t('signals_page.add_token_placeholder')}
              />
              <button onClick={handleAddPair} className="bg-cyber-blue text-black p-2" aria-label="Add Pair"><Plus /></button>
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-gray-400">{t('signals_page.timeframe')}</label>
            <div className="relative">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full appearance-none bg-cyber-dark border border-cyber-blue text-white p-2 pr-8"
                aria-label="Select Timeframe"
              >
                {timeframes.map(tf => <option key={tf} value={tf}>{tf.toUpperCase()}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-blue pointer-events-none" />
            </div>
          </div>
          <button 
            onClick={handleScan}
            disabled={isLoading}
            className="w-full h-full px-4 py-2 bg-gradient-to-r from-cyber-green to-cyber-blue text-black font-bold"
          >
            {isLoading ? t('signals_page.scanning_button') : t('signals_page.scan_button')}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {trackedPairs.map(pair => (
            <div key={pair} className="flex items-center bg-cyber-dark text-xs font-mono text-cyber-blue border border-cyber-blue/50 px-2 py-1">
              <span>{pair}</span>
              <button onClick={() => handleRemovePair(pair)} className="ml-2 text-gray-500 hover:text-neon-pink" aria-label={`Remove ${pair}`}><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <h3 className="text-2xl font-bold font-cyber text-cyber-blue mb-4">
        {t('signals_page.tracked_tokens')}
      </h3>
      {!isConnected ? (
        <div className="text-center text-yellow-400 font-mono py-10 bg-cyber-card border border-yellow-400/50">
          <Lock className="mx-auto mb-2" />
          {t('signals_page.connect_wallet_prompt')}
          <button onClick={connectWallet} className="mt-4 px-4 py-2 bg-yellow-400 text-black font-bold">{t('header.connect_wallet')}</button>
        </div>
      ) : !hasAccess ? (
        <div className="text-center text-yellow-400 font-mono py-10 bg-cyber-card border border-yellow-400/50">
          <Lock className="mx-auto mb-2" />
          {t('signals_page.hold_modx_prompt')}
        </div>
      ) : isInitialLoading ? (
        <div className="text-center text-neon-blue font-cyber py-10">Loading initial signals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {results.map((result) => (
            <SignalCard key={`${result.symbol}-${result.timeframe}`} {...result} />
          ))}
        </div>
      )}
    </main>
  );
};

export default SignalsPage;
