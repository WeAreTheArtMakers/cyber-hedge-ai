import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Newspaper } from 'lucide-react';
import { getKlineData, generateRealSignal } from '../services/signalService';
import { useTranslation } from 'react-i18next';

// Fırsat token'ı tipini tanımlıyoruz
interface Opportunity {
  symbol: string;
  reason: string;
  score: number;
}

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [marketSentiment, setMarketSentiment] = useState({ value: 50, text: 'Neutral' });
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunitySearchTerm, setOpportunitySearchTerm] = useState('');
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Piyasa duyarlılığını hesapla
  useEffect(() => {
    const calculateSentiment = async () => {
      setIsLoadingSentiment(true);
      const sentimentPairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];
      let totalVolume = 0;
      let weightedChange = 0;

      for (const pair of sentimentPairs) {
        const { closes, volumes } = await getKlineData(pair, '1d', 2);
        if (closes.length === 2 && volumes.length === 2) {
          const priceChangePercent = ((closes[1] - closes[0]) / closes[0]) * 100;
          const volume = volumes[1];
          totalVolume += volume;
          weightedChange += priceChangePercent * volume;
        }
      }

      const averageChange = totalVolume > 0 ? weightedChange / totalVolume : 0;
      const scaledScore = Math.max(-10, Math.min(10, averageChange));
      const finalScore = Math.round((scaledScore + 10) * 5);

      let text = 'Neutral';
      if (finalScore < 25) text = 'Extreme Fear';
      else if (finalScore < 45) text = 'Fear';
      else if (finalScore > 75) text = 'Extreme Greed';
      else if (finalScore > 55) text = 'Greed';
      
      setMarketSentiment({ value: finalScore, text });
      setIsLoadingSentiment(false);
    };

    calculateSentiment();
    const interval = setInterval(calculateSentiment, 3600000); 
    return () => clearInterval(interval);
  }, []);

  const analyzeToken = useCallback(async (pair: string) => {
    const signal = await generateRealSignal(pair, '4h');
    if (signal && signal.type !== 'INFO') {
      return { symbol: signal.symbol, reason: `Potential ${signal.type} signal based on technicals`, score: signal.confidence };
    } else if (signal) {
      return { symbol: pair, reason: `${t('analytics_page.no_strong_signal')} $${signal.entryPrice.toFixed(4)}`, score: 50 };
    }
    return null;
  }, [t]);

  // Sayfa ilk yüklendiğinde varsayılan token'ları analiz et
  useEffect(() => {
    const fetchInitialOpportunities = async () => {
      setIsSearching(true);
      const defaultPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
      const promises = defaultPairs.map(pair => analyzeToken(pair));
      const results = await Promise.all(promises);
      setOpportunities(results.filter((r): r is Opportunity => r !== null));
      setIsSearching(false);
    };
    fetchInitialOpportunities();
  }, [analyzeToken]);

  const handleOpportunitySearch = useCallback(async () => {
    if (!opportunitySearchTerm) return;
    setIsSearching(true);
    let formattedPair = opportunitySearchTerm.toUpperCase().replace(/[^A-Z/]/g, '');
    if (!formattedPair.includes('/')) {
      formattedPair += '/USDT';
    }
    const result = await analyzeToken(formattedPair);
    if (result) {
      setOpportunities([result]);
    }
    setIsSearching(false);
  }, [opportunitySearchTerm, analyzeToken]);

  const greedColor = useMemo(() => {
    const value = marketSentiment.value;
    const red = Math.floor(255 * (1 - value / 100));
    const green = Math.floor(255 * (value / 100));
    return `rgb(${red}, ${green}, 50)`;
  }, [marketSentiment.value]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold font-cyber text-neon-blue mb-8">{t('analytics_page.title')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Market Sentiment */}
          <div className="bg-cyber-card p-6 cyber-border">
            <h3 className="text-xl font-bold font-cyber text-white mb-4">{t('analytics_page.market_sentiment')}</h3>
            <div className="text-center">
              {isLoadingSentiment ? (
                <div className="text-neon-blue">Calculating...</div>
              ) : (
                <div className="w-48 h-48 mx-auto rounded-full flex items-center justify-center" style={{ background: `radial-gradient(circle, ${greedColor} 0%, #1A1A1A 70%)` }}>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-white">{marketSentiment.value}</p>
                    <p className="font-mono" style={{ color: greedColor }}>{marketSentiment.text}</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4 font-mono">{t('analytics_page.sentiment_index_subtitle')}</p>
            </div>
          </div>

          {/* Opportunity Scanner */}
          <div className="bg-cyber-card p-6 cyber-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold font-cyber text-white flex items-center"><Search size={20} className="mr-2" /> {t('analytics_page.opportunity_scanner')}</h3>
              <div className="flex">
                <input 
                  type="text"
                  placeholder={t('analytics_page.search_tokens_placeholder')}
                  value={opportunitySearchTerm}
                  onChange={(e) => setOpportunitySearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleOpportunitySearch()}
                  className="bg-cyber-dark text-white font-mono text-sm p-1 border border-cyber-blue/50 focus:outline-none focus:border-neon-blue"
                />
                <button onClick={handleOpportunitySearch} className="bg-cyber-blue text-black p-1 ml-2" aria-label="Search"><Search size={16}/></button>
              </div>
            </div>
            <div className="space-y-4">
              {isSearching ? <div className="text-neon-blue">Searching...</div> : opportunities.map(op => (
                <div key={op.symbol} className="bg-cyber-dark p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg text-white">{op.symbol}</p>
                    <p className="text-xs text-gray-400 font-mono">{op.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neon-green">{op.score}</p>
                    <p className="text-xs font-mono text-gray-400">{t('analytics_page.opportunity_score')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* News Feed */}
        <div className="bg-cyber-card p-1 cyber-border h-[600px] md:h-auto">
          <iframe 
            width="100%" 
            scrolling="yes" 
            allowTransparency={true} 
            frameBorder="0" 
            src={`https://cryptopanic.com/widgets/news/?bg_color=1A1A1A&font_family=Share%20Tech%20Mono&header_bg_color=0A0A0A&header_text_color=00FFFF&link_color=39FF14&news_feed=recent&posts_limit=50&text_color=FFFFFF&title=${t('analytics_page.latest_news')}`} 
            height="100%">
          </iframe>
        </div>
      </div>
    </main>
  );
};

export default AnalyticsPage;
