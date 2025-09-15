import { RSI, MACD, ATR, OBV, Stochastic, EMA } from 'technicalindicators';

// Pine Script'teki pivot bulma mantığını JavaScript'e uyarlıyoruz
const findPivot = (data: number[], left: number, right: number, isHigh: boolean) => {
  const pivots = [];
  for (let i = left; i < data.length - right; i++) {
    const window = data.slice(i - left, i + right + 1);
    const pivotValue = isHigh ? Math.max(...window) : Math.min(...window);
    if (data[i] === pivotValue) {
      pivots.push({ index: i, value: data[i] });
    }
  }
  return pivots.length > 0 ? pivots[pivots.length - 1] : null;
};

// Binance API'sinden gelen mum verisinin tipini tanımlıyoruz
type Kline = [number, string, string, string, string, string, number, string, number, string, string, string];

// Binance API'sinden mum verilerini çeken fonksiyon
export const getKlineData = async (symbol: string = 'BTCUSDT', interval: string = '4h', limit: number = 200) => {
  try {
    const response = await fetch(`/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    if (!response.ok) throw new Error(`Binance API error: ${response.statusText}`);
    const data: Kline[] = await response.json();
    
    return {
      opens: data.map(k => parseFloat(k[1])),
      highs: data.map(k => parseFloat(k[2])),
      lows: data.map(k => parseFloat(k[3])),
      closes: data.map(k => parseFloat(k[4])),
      volumes: data.map(k => parseFloat(k[5])),
    };
  } catch (error) {
    console.error("Failed to fetch Kline data:", error);
    return { opens: [], highs: [], lows: [], closes: [], volumes: [] };
  }
};

// Tek bir token'ın anlık fiyatını çeken fonksiyon
export const fetchCurrentPrice = async (symbol: string) => {
  try {
    const response = await fetch(`/api/v3/ticker/price?symbol=${symbol}`);
    if (!response.ok) throw new Error(`Binance API error: ${response.statusText}`);
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};

// Gerçek verilere dayalı sinyal üreten fonksiyon
export const generateRealSignal = async (symbol: string, interval: string): Promise<any> => {
  const { opens, highs, lows, closes, volumes } = await getKlineData(symbol.replace('/', ''), interval);
  const currentPrice = closes.length > 0 ? closes[closes.length - 1] : 0;

  if (closes.length < 50) { // Yeterli veri yoksa
    return { symbol, type: 'INFO', entryPrice: currentPrice, createdAt: new Date() };
  }

  // Pine Script'teki otomatik ayarları zaman dilimine göre yap
  const tfConfig = { left: 10, right: 10, rsiLen: 20, macdFast: 12, macdSlow: 26, macdSig: 9, atrLen: 20, emaPeriod: 20 };
  
  // Göstergeleri hesapla
  const lastPH = findPivot(highs, tfConfig.left, tfConfig.right, true);
  const lastPL = findPivot(lows, tfConfig.left, tfConfig.right, false);
  const rsi = RSI.calculate({ period: tfConfig.rsiLen, values: closes });
  const macd = MACD.calculate({ values: closes, fastPeriod: tfConfig.macdFast, slowPeriod: tfConfig.macdSlow, signalPeriod: tfConfig.macdSig, SimpleMAOscillator: false, SimpleMASignal: false });
  const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: tfConfig.atrLen });
  const obv = OBV.calculate({ close: closes, volume: volumes });
  const stoch = Stochastic.calculate({ high: highs, low: lows, close: closes, period: 14, signalPeriod: 3 });
  const ema = EMA.calculate({ period: tfConfig.emaPeriod, values: closes });

  const currentRSI = rsi[rsi.length - 1];
  const currentMACD = macd[macd.length - 1];
  const currentATR = atr[atr.length - 1];
  const currentOBV = obv[obv.length - 1];
  const prevOBV = obv[obv.length - 2];
  const currentStoch = stoch[stoch.length - 1];
  const currentEMA = ema[ema.length - 1];

  let type: 'BUY' | 'SELL' | null = null;

  // Long Giriş Koşulları
  const breakUp = lastPL && currentPrice > lastPL.value;
  const rsiOk = currentRSI > 30 && currentRSI < 70;
  const macdOk = currentMACD && currentMACD.histogram !== undefined && currentMACD.histogram > 0;
  const obvUp = currentOBV > prevOBV;
  const trendUp = currentPrice > currentEMA;
  const stochUp = currentStoch && currentStoch.k > currentStoch.d;

  if (breakUp && rsiOk && macdOk && obvUp && trendUp && stochUp) {
    type = 'BUY';
  }

  // Short Giriş Koşulları
  const breakDown = lastPH && currentPrice < lastPH.value;
  const macdDown = currentMACD && currentMACD.histogram !== undefined && currentMACD.histogram < 0;
  const stochDown = currentStoch && currentStoch.k < currentStoch.d;
  const trendDown = currentPrice < currentEMA;

  if (breakDown && rsiOk && macdDown && !obvUp && trendDown && stochDown) {
    type = 'SELL';
  }

  // Sinyal yoksa INFO kartı döndür
  if (!type) {
    return { symbol, type: 'INFO', entryPrice: currentPrice, createdAt: new Date() };
  }

  // Risk Yönetimi: ATR'ye dayalı TP ve SL
  const tpMultiplier = 1.5;
  const slMultiplier = 0.75;
  const target = type === 'BUY' ? currentPrice + (currentATR * tpMultiplier) : currentPrice - (currentATR * tpMultiplier);
  const stopLoss = type === 'BUY' ? currentPrice - (currentATR * slMultiplier) : currentPrice + (currentATR * slMultiplier);

  return {
    symbol,
    type,
    entryPrice: currentPrice,
    targetPrice: target,
    stopLossPrice: stopLoss,
    confidence: Math.round(50 + Math.abs(currentRSI - 50)),
    timeframe: interval,
    createdAt: new Date()
  };
};
