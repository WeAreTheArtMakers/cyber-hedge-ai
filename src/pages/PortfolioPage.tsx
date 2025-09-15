import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { fetchCurrentPrice } from '../services/signalService';
import { useTranslation } from 'react-i18next';

interface AssetItem {
  symbol: string;
  amount: number;
  avgBuyPrice: number;
}

interface LivePrice {
  [symbol: string]: number;
}

const PortfolioPage: React.FC = () => {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<AssetItem[]>(() => {
    const savedAssets = localStorage.getItem('portfolioAssets');
    return savedAssets ? JSON.parse(savedAssets) : [];
  });
  const [livePrices, setLivePrices] = useState<LivePrice>({});
  
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('portfolioAssets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    const symbols = assets.map(a => a.symbol.replace('/', '').toLowerCase());
    if (symbols.length === 0) return;

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbols.join('@ticker/')}@ticker`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.s) {
        const formattedSymbol = data.s.replace('USDT', '/USDT');
        setLivePrices(prev => ({ ...prev, [formattedSymbol]: parseFloat(data.c) }));
      }
    };

    return () => ws.close();
  }, [assets]);

  const formatInputSymbol = (input: string): string => {
    let formatted = input.toUpperCase().replace(/[^A-Z/]/g, '');
    if (!formatted.includes('/')) {
      formatted += '/USDT';
    }
    return formatted;
  };

  const handleAddAsset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formattedSymbol = formatInputSymbol(symbol);
    const amountNum = parseFloat(amount);
    let priceNum = parseFloat(price);

    if (!price) {
      const fetchedPrice = await fetchCurrentPrice(formattedSymbol.replace('/', ''));
      if (fetchedPrice) {
        priceNum = fetchedPrice;
      } else {
        alert(`Could not fetch price for ${formattedSymbol}. Please enter it manually.`);
        setIsLoading(false);
        return;
      }
    }

    if (formattedSymbol && amountNum > 0 && priceNum > 0) {
      setAssets(prevAssets => {
        const existingAsset = prevAssets.find(a => a.symbol === formattedSymbol);
        if (existingAsset) {
          // Varlık zaten var, güncelle
          const totalAmount = existingAsset.amount + amountNum;
          const totalValue = (existingAsset.amount * existingAsset.avgBuyPrice) + (amountNum * priceNum);
          const newAvgBuyPrice = totalValue / totalAmount;
          return prevAssets.map(a => 
            a.symbol === formattedSymbol 
              ? { ...a, amount: totalAmount, avgBuyPrice: newAvgBuyPrice } 
              : a
          );
        } else {
          // Yeni varlık ekle
          return [...prevAssets, { symbol: formattedSymbol, amount: amountNum, avgBuyPrice: priceNum }];
        }
      });
      setSymbol('');
      setAmount('');
      setPrice('');
    }
    setIsLoading(false);
  }, [symbol, amount, price]);

  const handleRemoveAsset = (symbolToRemove: string) => {
    setAssets(prev => prev.filter(a => a.symbol !== symbolToRemove));
  };

  const portfolioData = useMemo(() => {
    return assets.map(asset => {
      const currentPrice = livePrices[asset.symbol] || asset.avgBuyPrice;
      const currentValue = asset.amount * currentPrice;
      const initialValue = asset.amount * asset.avgBuyPrice;
      const pnl = currentValue - initialValue;
      const pnlPercent = initialValue > 0 ? (pnl / initialValue) * 100 : 0;
      return { ...asset, currentPrice, currentValue, pnl, pnlPercent };
    });
  }, [assets, livePrices]);

  const totalValue = portfolioData.reduce((sum, asset) => sum + asset.currentValue, 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold font-cyber text-neon-blue">{t('portfolio_page.title')}</h2>
        <div className="text-right">
          <p className="text-gray-400 font-mono">{t('portfolio_page.total_value')}</p>
          <p className="text-2xl font-bold text-white">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-cyber-card p-4 mb-8 cyber-border">
        <form onSubmit={handleAddAsset} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-mono text-gray-400">{t('portfolio_page.add_asset_form.token')}</label>
            <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full bg-cyber-dark text-white p-2 border border-cyber-blue" placeholder="BTC" required />
          </div>
          <div>
            <label className="text-xs font-mono text-gray-400">{t('portfolio_page.add_asset_form.amount')}</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-cyber-dark text-white p-2 border border-cyber-blue" placeholder="1.5" required />
          </div>
          <div>
            <label className="text-xs font-mono text-gray-400">{t('portfolio_page.add_asset_form.avg_buy_price')}</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-cyber-dark text-white p-2 border border-cyber-blue" placeholder="Auto" />
          </div>
          <button type="submit" disabled={isLoading} className="flex items-center justify-center w-full h-full px-4 py-2 bg-cyber-blue text-black font-bold disabled:opacity-50">
            {isLoading ? 'Adding...' : <><Plus size={16} className="mr-2" /> {t('portfolio_page.add_asset_form.add_asset_button')}</>}
          </button>
        </form>
      </div>

      <div className="bg-cyber-card p-4 cyber-border">
        <table className="w-full text-left font-mono">
          <thead>
            <tr className="border-b border-cyber-blue/50 text-xs text-gray-400">
              <th className="p-2">{t('portfolio_page.assets_table.asset')}</th>
              <th className="p-2 text-right">{t('portfolio_page.assets_table.amount')}</th>
              <th className="p-2 text-right">{t('portfolio_page.assets_table.avg_buy_price')}</th>
              <th className="p-2 text-right">{t('portfolio_page.assets_table.current_price')}</th>
              <th className="p-2 text-right">{t('portfolio_page.assets_table.value')}</th>
              <th className="p-2 text-right">{t('portfolio_page.assets_table.pnl')}</th>
              <th className="p-2 text-center">{t('portfolio_page.assets_table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {portfolioData.map(asset => (
              <tr key={asset.symbol} className="border-b border-cyber-blue/20">
                <td className="p-2 font-bold text-white">{asset.symbol}</td>
                <td className="p-2 text-right">{asset.amount}</td>
                <td className="p-2 text-right">${asset.avgBuyPrice.toLocaleString()}</td>
                <td className="p-2 text-right text-cyber-blue">${asset.currentPrice > 0 ? asset.currentPrice.toLocaleString() : '...'}</td>
                <td className="p-2 text-right font-bold text-white">${asset.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className={`p-2 text-right font-bold ${asset.pnl >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                  {asset.pnl.toFixed(2)} ({asset.pnlPercent.toFixed(2)}%)
                </td>
                <td className="p-2 text-center">
                  <button onClick={() => handleRemoveAsset(asset.symbol)} className="text-gray-500 hover:text-neon-pink" aria-label={`Remove ${asset.symbol}`}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default PortfolioPage;
