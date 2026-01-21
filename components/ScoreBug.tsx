import React from 'react';
import { SaveHeader } from '../types';
import { Flame, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  header: SaveHeader;
}

const ScoreBug: React.FC<Props> = ({ header }) => {
  const { wins, losses } = parseRecord(header.seasonRecord);
  const winPct = (wins + losses) > 0 ? ((wins / (wins + losses)) * 100).toFixed(0) : '0';
  
  const getMomentum = () => {
    const pct = parseInt(winPct);
    if (pct >= 70) return { icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-400', label: 'HOT' };
    if (pct >= 50) return { icon: <Minus className="w-4 h-4" />, color: 'text-yellow-400', label: 'STEADY' };
    return { icon: <TrendingDown className="w-4 h-4" />, color: 'text-red-400', label: 'COLD' };
  };
  
  const momentum = getMomentum();
  
  const getSecurityColor = (security: string) => {
    const s = security.toLowerCase();
    if (s.includes('secure') || s.includes('stable') || s.includes('extension')) return 'bg-green-600';
    if (s.includes('hot') || s.includes('imminent') || s.includes('critical')) return 'bg-red-600';
    return 'bg-yellow-500';
  };
  
  const isHotSeat = header.jobSecurity.toLowerCase().includes('hot') || 
                    header.jobSecurity.toLowerCase().includes('imminent');

  return (
    <div className="score-glow rounded-xl overflow-hidden">
      {/* Top Bar - Team & Conference - Apple: more padding */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-headline text-white text-base uppercase leading-none">
              {header.team}
            </div>
            <div className="text-red-200 text-xs font-broadcast uppercase mt-0.5">
              {header.conference}
            </div>
          </div>
        </div>
        
        {/* AP Rank Badge */}
        {header.stats.apRank !== 'NR' && (
          <div className="bg-black/30 px-3 py-1.5 rounded-lg">
            <span className="font-score text-yellow-400 text-sm">{header.stats.apRank}</span>
          </div>
        )}
      </div>
      
      {/* Main Score Display - Apple: generous padding */}
      <div className="bg-zinc-900 px-5 py-5">
        <div className="flex items-center justify-between">
          {/* Record */}
          <div className="flex items-baseline space-x-2">
            <span className="font-score text-5xl text-white">{wins}</span>
            <span className="font-score text-3xl text-zinc-500">-</span>
            <span className="font-score text-5xl text-white">{losses}</span>
          </div>
          
          {/* Momentum */}
          <div className={`flex items-center space-x-2 ${momentum.color}`}>
            {momentum.icon}
            <span className="font-score text-sm">{momentum.label}</span>
          </div>
        </div>
        
        {/* Win Percentage Bar - Apple: more vertical space */}
        <div className="mt-5">
          <div className="flex justify-between text-xs font-broadcast text-zinc-500 mb-2">
            <span>WIN %</span>
            <span className="text-white font-bold">{winPct}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 animate-fill rounded-full"
              style={{ width: `${winPct}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom Info Bar - Apple: more padding */}
      <div className="bg-black px-5 py-3 flex items-center justify-between border-t border-zinc-800/50">
        <div className="flex items-center space-x-3">
          <span className="font-broadcast text-xs text-zinc-500 uppercase">Role</span>
          <span className="font-score text-sm text-white">{header.role}</span>
        </div>
        
        {/* Job Security Indicator */}
        <div className="flex items-center space-x-2">
          {isHotSeat && <Flame className="w-4 h-4 text-red-500 animate-pulse" />}
          <div className={`w-2.5 h-2.5 rounded-full ${getSecurityColor(header.jobSecurity)}`} />
          <span className="font-broadcast text-xs text-zinc-400 uppercase">
            {header.jobSecurity.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

function parseRecord(record: string): { wins: number; losses: number } {
  if (!record || record === '0-0') return { wins: 0, losses: 0 };
  const parts = record.split(/[-–]/).map(s => parseInt(s.trim(), 10));
  return {
    wins: isNaN(parts[0]) ? 0 : parts[0],
    losses: isNaN(parts[1]) ? 0 : parts[1],
  };
}

export default ScoreBug;
