

import React from 'react';
import { SaveHeader as SaveHeaderType } from '../types';
import { Shield, Calendar, Briefcase, Brain, Activity, Trophy, MapPin, Hash, BarChart3, Heart } from 'lucide-react';
import { getTeamDetails } from '../data/teams';

interface Props {
  header: SaveHeaderType;
}

const SaveHeader: React.FC<Props> = ({ header }) => {
  // Normalize Legacy Score to percentage (0-1000 => 0-100%)
  const legacyPercent = Math.min(100, Math.max(0, header.legacyScore / 10));
  
  // Team Metadata
  const teamData = getTeamDetails(header.team);
  const primaryColor = teamData.colors.primary;
  const secondaryColor = teamData.colors.secondary;

  // Determine legacy tier color
  const getLegacyColor = (score: number) => {
    if (score < 200) return "bg-slate-500";
    if (score < 500) return "bg-emerald-500";
    if (score < 800) return "bg-amber-500";
    return "bg-purple-500";
  };

  const isRanked = header.stats.apRank && header.stats.apRank !== 'NR' && !header.stats.apRank.includes('Unranked');

  // RUTHLESS Sentiment Color Logic
  const getSentimentColor = (val: number) => {
    if (val < 50) return "text-red-500 animate-pulse";
    if (val < 75) return "text-amber-500";
    return "text-emerald-500";
  };
  
  // Check for Hot Seat condition
  const isHotSeat = header.fanSentiment < 35 || header.jobSecurity.toLowerCase().includes('hot') || header.jobSecurity.toLowerCase().includes('unstable');

  return (
    <div className={`bg-slate-900 border-b shadow-2xl transition-all duration-500 ${isHotSeat ? 'border-red-500/50 shadow-red-900/20' : 'border-slate-700'}`}>
      {/* Top Bar: Team, Record, Date */}
      <div className="grid grid-cols-12 gap-0 border-b border-slate-800">
        {/* Team & Role (Left) */}
        <div 
          className="col-span-12 md:col-span-5 p-4 flex items-center space-x-4 border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden"
          style={{ backgroundColor: `${primaryColor}15` }} // 15% opacity background tint
        >
           {/* Team Accent Bar */}
           <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: secondaryColor }}></div>

           <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-inner relative z-10`}
              style={{ backgroundColor: primaryColor, borderColor: secondaryColor }}
           >
             <Shield className="w-6 h-6 text-white" />
           </div>
           <div className="relative z-10">
             <h2 className="text-xl font-black text-white leading-none tracking-tight">{header.team.toUpperCase()}</h2>
             <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1">
                    <Briefcase className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-mono font-medium text-emerald-400 uppercase">{header.role}</span>
                </div>
                <div className="h-3 w-px bg-slate-600"></div>
                <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase">{header.conference}</span>
                </div>
             </div>
           </div>
        </div>

        {/* Season Record & Rank (Center) */}
        <div className="col-span-6 md:col-span-3 p-2 flex flex-col items-center justify-center bg-slate-900 border-r border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center space-x-3">
              <div className="text-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Record</span>
                 <span className="text-3xl font-black font-mono text-white tracking-widest">{header.seasonRecord}</span>
              </div>
              
              {/* Rank Badge */}
              {isRanked && (
                <div className="text-center animate-fade-in">
                   <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block mb-0.5">AP Poll</span>
                   <span className="text-2xl font-black font-mono text-amber-500 tracking-tighter">{header.stats.apRank}</span>
                </div>
              )}
            </div>
            {!isRanked && <span className="text-[10px] text-slate-600 font-mono mt-1">{header.stats.confStanding}</span>}
        </div>

        {/* Date & Age (Right) */}
        <div className="col-span-6 md:col-span-4 p-2 flex flex-col items-center justify-center bg-slate-900">
           <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-300">{header.date}</span>
           </div>
           <span className="text-xs text-slate-500 mt-1">Age: {header.age}</span>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-800 bg-slate-800/80 text-xs border-b border-slate-800">
          
          {/* Fan Sentiment (New) */}
          <div className="p-2 flex items-center justify-between px-4">
             <div className="flex items-center space-x-2">
                <Heart className={`w-3 h-3 ${getSentimentColor(header.fanSentiment)}`} />
                <span className="text-slate-400 font-bold uppercase tracking-wider">APPROVAL</span>
             </div>
             <span className={`font-mono font-bold ${getSentimentColor(header.fanSentiment)}`}>{header.fanSentiment}%</span>
          </div>

          {/* Job Security */}
          <div className="p-2 flex items-center justify-between px-4">
             <div className="flex items-center space-x-2">
                <Activity className={`w-3 h-3 ${isHotSeat ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                <span className="text-slate-400 font-bold uppercase tracking-wider">SECURITY</span>
             </div>
             <span className={`font-mono truncate max-w-[80px] text-right ${isHotSeat ? 'text-red-400 font-bold' : 'text-slate-200'}`}>{header.jobSecurity}</span>
          </div>

           {/* Unit Rankings (Combined to save space) */}
           <div className="p-2 flex items-center justify-between px-4">
             <div className="flex items-center space-x-2">
                <BarChart3 className="w-3 h-3 text-blue-400" />
                <span className="text-slate-400 font-bold uppercase tracking-wider">Ranks</span>
             </div>
             <span className="font-mono text-slate-200">OFF: {header.stats.offRank} / DEF: {header.stats.defRank}</span>
          </div>

          {/* Prestige */}
          <div className="p-2 flex items-center justify-between px-4">
             <div className="flex items-center space-x-2">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span className="text-slate-400 font-bold uppercase tracking-wider">PRESTIGE</span>
             </div>
             <span className="font-mono text-slate-200 truncate max-w-[80px] text-right">{header.stats.prestige}</span>
          </div>
      </div>

      {/* Bottom Context Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-slate-900 text-xs">
        
        {/* Scheme */}
        <div className="p-3 flex items-center space-x-3">
           <Brain className="w-4 h-4 text-slate-500" />
           <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Scheme Identity</span>
              <span className="text-slate-300 font-medium">{header.schemeOffense} / {header.schemeDefense}</span>
           </div>
        </div>

         {/* QB Situation */}
         <div className="p-3 flex items-center space-x-3">
           <Hash className="w-4 h-4 text-slate-500" />
           <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">QB Room</span>
              <span className="text-slate-300 font-medium">{header.qbSituation}</span>
           </div>
        </div>

        {/* Reputation */}
        <div className="p-3 flex items-center space-x-3">
           <Trophy className="w-4 h-4 text-slate-500" />
           <div className="flex-1 overflow-hidden">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">Coach Tags</span>
              <div className="flex flex-wrap gap-1">
                {header.reputationTags.slice(0, 5).map((tag, idx) => (
                    <span key={idx} className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{tag}</span>
                ))}
              </div>
           </div>
        </div>
      </div>

       {/* Legacy Progress Bar */}
       <div className="h-1 w-full bg-slate-800">
          <div 
            className={`h-full ${getLegacyColor(header.legacyScore)} opacity-50`} 
            style={{ width: `${legacyPercent}%` }}
          ></div>
        </div>
    </div>
  );
};

export default SaveHeader;
