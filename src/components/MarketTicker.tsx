import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Gelen WebSocket verisinin tipini tanımlıyoruz
interface TickerData {
  s: string; // Sembol (örn: BTCUSDT)
  c: string; // Son fiyat
  P: string; // Yüzdelik değişim
}

// Bileşenin alacağı prop'ların tipini tanımlıyoruz
interface CryptoData {
  symbol: string;
  price: string;
  change: string;
  status: 'up' | 'down';
}

const MarketTicker: React.FC = () => {
  const { t } = useTranslation();
  // Piyasa verilerini tutacak state
  const [marketData, setMarketData] = useState<Record<string, CryptoData>>({});
  const wsRef = useRef<WebSocket | null>(null);
  
  // Takip edilecek semboller
  const symbols = ['btcusdt', 'ethusdt', 'adausdt', 'solusdt', 'maticusdt', 'avaxusdt'];

  useEffect(() => {
    // WebSocket bağlantısını kuruyoruz
    const ws = new WebSocket('wss://stream.binance.com:9443/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      // Bağlantı açıldığında ticker'lara abone oluyoruz
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: symbols.map(s => `${s}@ticker`),
        id: 1
      }));
    };

    ws.onmessage = (event) => {
      const message: TickerData = JSON.parse(event.data);
      
      // Gelen veri bir ticker verisi ise state'i güncelliyoruz
      if (message.s) {
        const priceChange = parseFloat(message.P);
        const formattedSymbol = message.s.replace('USDT', '/USDT');
        
        setMarketData(prevData => ({
          ...prevData,
          [formattedSymbol]: {
            symbol: formattedSymbol,
            price: parseFloat(message.c).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
            change: `${priceChange.toFixed(2)}%`,
            status: priceChange >= 0 ? 'up' : 'down'
          }
        }));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    // Bileşen kaldırıldığında WebSocket bağlantısını kapatıyoruz
    return () => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          method: 'UNSUBSCRIBE',
          params: symbols.map(s => `${s}@ticker`),
          id: 1
        }));
        ws.close();
      }
    };
  }, []); // Bu effect sadece bileşen ilk render edildiğinde çalışır

  // Görüntülenecek verileri hazırlıyoruz
  const displayData = Object.values(marketData);

  return (
    <div className="bg-cyber-dark border border-cyber-blue cyber-grid overflow-hidden">
      <div className="py-3 px-6">
        <div className="flex justify-between items-center">
          <span className="text-cyber-blue font-mono text-sm">{t('market_ticker.market_data')}</span>
          <div className="flex space-x-6">
            {displayData.length > 0 ? (
              displayData.slice(0, 3).map((crypto) => (
                <div key={crypto.symbol} className="flex items-center space-x-2 animate-pulse-once">
                  <span className="text-cyber-blue font-mono font-bold">
                    {crypto.symbol}
                  </span>
                  <span className="text-white font-mono">
                    ${crypto.price}
                  </span>
                  <span className={`font-mono text-sm ${
                    crypto.status === 'up' ? 'text-neon-green' : 'text-neon-pink'
                  }`}>
                    {crypto.status === 'up' ? '+' : ''}{crypto.change}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-gray-500">Loading market data...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
