import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, TrendingDown, ShieldAlert, Clock, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Sinyal verisinin tipini güncelliyoruz, 'INFO' tipini ekliyoruz
export interface SignalData {
  symbol: string;
  type: 'BUY' | 'SELL' | 'INFO';
  entryPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  confidence: number;
  timeframe: string;
  createdAt: Date;
}

const SignalCard: React.FC<SignalData> = (props) => {
  const { t } = useTranslation();
  const { symbol, type, entryPrice, targetPrice, stopLossPrice, createdAt } = props;
  const [livePrice, setLivePrice] = useState<number | null>(entryPrice);
  const [priceChange, setPriceChange] = useState({ percent: 0, status: 'up' as 'up' | 'down' });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsSymbol = symbol.replace('/', '').toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@ticker`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.c) {
        setLivePrice(parseFloat(data.c));
        const change = parseFloat(data.P);
        setPriceChange({
          percent: change,
          status: change >= 0 ? 'up' : 'down'
        });
      }
    };

    ws.onerror = (error) => console.error(`WebSocket error for ${symbol}:`, error);

    return () => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      } else if (ws) {
        ws.onopen = () => ws.close();
      }
    };
  }, [symbol]);

  const { progress, pnl } = useMemo(() => {
    if (livePrice === null || type === 'INFO') return { progress: 0, pnl: { percent: 0, value: 0 } };

    const totalDistance = Math.abs(targetPrice - entryPrice);
    const currentDistance = Math.abs(livePrice - entryPrice);
    
    let progress = (currentDistance / totalDistance) * 100;
    if (livePrice > targetPrice && type === 'BUY') progress = 100;
    if (livePrice < targetPrice && type === 'SELL') progress = 100;
    if ((livePrice < entryPrice && type === 'BUY') || (livePrice > entryPrice && type === 'SELL')) progress = 0;

    const pnlPercent = ((livePrice - entryPrice) / entryPrice) * 100 * (type === 'BUY' ? 1 : -1);
    const pnlValue = (livePrice - entryPrice) * (type === 'BUY' ? 1 : -1);

    return {
      progress: Math.min(100, Math.max(0, progress)),
      pnl: { percent: pnlPercent, value: pnlValue }
    };
  }, [livePrice, entryPrice, targetPrice, type]);

  // Sinyal yoksa bilgi kartı göster
  if (type === 'INFO') {
    return (
      <div className="bg-cyber-card p-5 rounded-none border border-cyber-blue/20 cyber-border flex flex-col space-y-4 h-full">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold font-cyber text-white">{symbol.split('/')[0]}</h3>
          <span className="text-xs font-mono text-gray-400">{symbol.split('/')[1]}</span>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <p className="text-3xl font-bold text-white">{livePrice ? `$${livePrice.toFixed(4)}` : 'Loading...'}</p>
          <p className={`text-sm font-bold ${priceChange.status === 'up' ? 'text-neon-green' : 'text-neon-pink'}`}>
            {priceChange.percent.toFixed(2)}% ({t('signal_card.change_24h')})
          </p>
        </div>
        <div className="text-center text-cyber-blue font-mono text-sm p-2 bg-cyber-dark/50">
          <Info size={14} className="inline mr-2" />
          {t('signal_card.no_active_signal')}
        </div>
      </div>
    );
  }

  const isProfit = pnl.percent >= 0;
  const pnlColor = isProfit ? 'text-neon-green' : 'text-neon-pink';

  return (
    <div className="bg-cyber-card p-5 rounded-none border border-cyber-blue/50 cyber-border flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h3 className="text-2xl font-bold font-cyber text-white">{symbol.split('/')[0]}</h3>
          <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-bold rounded-none ${type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {type === 'BUY' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{type === 'BUY' ? t('signal_card.long') : t('signal_card.short')}</span>
          </span>
        </div>
        <span className="px-3 py-1 text-sm font-mono border border-cyber-blue text-cyber-blue">{t('signal_card.active')}</span>
      </div>

      {/* Entry & Target Prices */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-cyber-dark p-3">
          <p className="text-sm text-gray-400 font-mono">{t('signal_card.entry_price')}</p>
          <p className="text-xl font-bold text-white">${entryPrice.toFixed(4)}</p>
        </div>
        <div className="bg-cyber-dark p-3">
          <p className="text-sm text-gray-400 font-mono">{t('signal_card.target_price')}</p>
          <p className="text-xl font-bold text-neon-green">${targetPrice.toFixed(4)}</p>
        </div>
      </div>

      {/* Live Price */}
      <div className="bg-cyber-blue/10 p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-cyber-blue font-mono">{t('signal_card.live_price')} - {symbol.split('/')[0]}</p>
            <p className="text-3xl font-bold text-white">{livePrice ? `$${livePrice.toFixed(4)}` : 'Loading...'}</p>
          </div>
          <div className="text-right">
            <p className={`text-xl font-bold ${priceChange.status === 'up' ? 'text-neon-green' : 'text-neon-pink'}`}>
              {priceChange.percent.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-400 font-mono">{t('signal_card.change_24h')}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm font-mono text-gray-400 mb-1">
          <span>{t('signal_card.progress_to_target')}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-cyber-dark h-2">
          <div className="bg-neon-green h-2" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* PnL & Stop Loss */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-3 text-center rounded-none ${isProfit ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <p className="text-sm text-gray-400 font-mono">{t('signal_card.pnl')}</p>
          <p className={`text-lg font-bold ${pnlColor}`}>{pnl.percent.toFixed(2)}%</p>
          <p className={`text-xs ${pnlColor}`}>${pnl.value.toFixed(4)}</p>
        </div>
        <div className="bg-red-500/10 p-3 text-center rounded-none">
          <p className="text-sm text-gray-400 font-mono flex items-center justify-center"><ShieldAlert size={14} className="mr-1" /> {t('signal_card.stop_loss')}</p>
          <p className="text-lg font-bold text-red-400">${stopLossPrice.toFixed(4)}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-xs text-gray-500 font-mono pt-2 border-t border-cyber-blue/20">
        <Clock size={12} className="inline mr-1" />
        {t('signal_card.created_at')}: {createdAt.toLocaleString()}
      </div>
    </div>
  );
};

export default SignalCard;
