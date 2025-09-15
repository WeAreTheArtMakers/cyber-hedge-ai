import React from 'react';
import { Activity, DollarSign, TrendingUp, Users } from 'lucide-react';

const StatsGrid: React.FC = () => {
  const stats = [
    {
      icon: Activity,
      label: 'ACTIVE SIGNALS',
      value: '24',
      change: '+12%',
      color: 'text-neon-blue'
    },
    {
      icon: DollarSign,
      label: 'TOTAL PROFIT',
      value: '$45,231',
      change: '+28%',
      color: 'text-neon-green'
    },
    {
      icon: TrendingUp,
      label: 'WIN RATE',
      value: '87.3%',
      change: '+5.2%',
      color: 'text-neon-pink'
    },
    {
      icon: Users,
      label: 'ACTIVE TRADERS',
      value: '1,247',
      change: '+156',
      color: 'text-neon-purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-cyber-card p-6 rounded-none border border-cyber-blue cyber-glow hover:cyber-pulse transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
            <span className="text-neon-green font-mono text-sm font-bold">
              {stat.change}
            </span>
          </div>
          
          <div>
            <p className="text-gray-400 font-mono text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold font-cyber ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;