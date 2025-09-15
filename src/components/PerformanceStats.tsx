import React, { useMemo } from 'react';
import { SignalData } from './SignalCard'; // SignalData tipini SignalCard'dan alıyoruz

interface PerformanceStatsProps {
  signals: SignalData[];
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ signals }) => {
  const stats = useMemo(() => {
    if (!signals || signals.length === 0) {
      return {
        activeWinning: 0,
        activeLosing: 0,
      };
    }

    let activeWinning = 0;
    let activeLosing = 0;

    signals.forEach(signal => {
      // Bu hesaplama anlık kar/zarar durumuna göre basit bir varsayımdır.
      // Canlı fiyatın giriş fiyatından karlı bir yönde olup olmadığını kontrol ediyoruz.
      // Gerçek bir PnL takibi için daha karmaşık bir state yönetimi gerekir.
      // Şimdilik bu kısmı basitleştiriyoruz.
      // Not: Bu hesaplama canlı fiyat verisi olmadan yapılamaz, bu yüzden şimdilik 0 döndürüyoruz.
      // Bu mantığı daha sonra SignalCard'daki canlı PnL verisini yukarı taşıyarak geliştirebiliriz.
    });

    // TODO: Canlı PnL verisi buraya taşındığında bu mantığı etkinleştir.
    // Şimdilik yer tutucu olarak bırakıyoruz.
    return {
      activeWinning,
      activeLosing,
    };
  }, [signals]);

  // Tamamlanan sinyaller için yer tutucu veriler
  const completed = {
    winRate: 'N/A',
    totalWins: 'x',
    totalLosses: 'x',
  };

  return (
    <div className="bg-cyber-card border border-cyber-blue/30 p-4 mb-8 cyber-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {/* Win Rate */}
        <div className="bg-cyber-dark p-3">
          <p className="text-xs text-gray-400 font-mono mb-1">Win Rate (Completed)</p>
          <p className="text-3xl font-bold text-neon-green">{completed.winRate}</p>
        </div>

        {/* Active Signals */}
        <div className="bg-cyber-dark p-3">
          <p className="text-xs text-gray-400 font-mono mb-1">Active Signals</p>
          <p className="text-3xl font-bold text-cyber-blue">{signals.length}</p>
        </div>

        {/* Active Breakdown */}
        <div className="bg-cyber-dark p-3">
          <p className="text-xs text-gray-400 font-mono mb-1">Active P/L</p>
          <div className="flex justify-center items-center space-x-4">
            <span className="text-lg font-bold text-neon-green">{stats.activeWinning}</span>
            <span className="text-gray-500">/</span>
            <span className="text-lg font-bold text-neon-pink">{stats.activeLosing}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats;
