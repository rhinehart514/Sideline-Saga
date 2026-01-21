import React from 'react';
import { SaveHeader } from '../types';
import { Shield, Calendar, Activity, Trophy, MapPin, Hash, Heart, Briefcase, Mic2, Phone, Users, AlertTriangle, FileText, TrendingUp, Building2 } from 'lucide-react';

interface Props {
  header: SaveHeader;
  onAction: (actionId: string, actionText: string, context: string) => void;
  loading: boolean;
}

const Sidebar: React.FC<Props> = ({ header, onAction, loading }) => {
  // Normalize Legacy Score
  const legacyPercent = Math.min(100, Math.max(0, header.legacyScore / 10));
  
  // Helper for Security Color/Status
  const getSecurityStatus = (security: string) => {
    const s = security.toLowerCase();
    if (s.includes('safe') || s.includes('secure') || s.includes('stable')) return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Secure' };
    if (s.includes('hot') || s.includes('unstable') || s.includes('review')) return { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Critical' };
    return { color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Shaky' };
  };

  const securityStatus = getSecurityStatus(header.jobSecurity);
  const isHotSeat = securityStatus.label === 'Critical';

  return (
    <div className="w-full md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-2xl z-20">
      
      {/* 1. Profile / Header Card */}
      <div className={`p-5 border-b border-slate-800 relative overflow-hidden ${isHotSeat ? 'bg-red-950/10' : 'bg-slate-900'}`}>
        {isHotSeat && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>}
        
        <div className="flex items-start justify-between mb-4">
           <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded flex items-center justify-center border-2 shadow-sm ${isHotSeat ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-800 border-slate-700'}`}>
                <Shield className={`w-6 h-6 ${isHotSeat ? 'text-red-400' : 'text-slate-300'}`} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white leading-tight tracking-tight uppercase">{header.team}</h2>
                <div className="flex items-center space-x-1.5 mt-0.5">
                    <Briefcase className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wide">{header.role}</span>
                </div>
              </div>
           </div>
           <div className="text-right">
              <div className="text-2xl font-mono font-black text-white leading-none">{header.seasonRecord}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">{header.stats.apRank !== 'NR' ? header.stats.apRank : header.stats.confStanding}</div>
           </div>
        </div>

        {/* Date & Phase Ribbon */}
        <div className="bg-slate-950 rounded border border-slate-800 p-2 flex items-center justify-between">
           <div className="flex items-center space-x-2 text-xs text-slate-400">
             <Calendar className="w-3 h-3" />
             <span className="font-mono">{header.date}</span>
           </div>
           <span className="text-[10px] font-bold uppercase text-slate-500 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
             {header.timelinePhase}
           </span>
        </div>
      </div>

      {/* 2. Front Office Dashboard */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center space-x-2 mb-3">
          <Building2 className="w-4 h-4 text-slate-400" />
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Front Office Status</h3>
        </div>

        <div className="space-y-3">
            {/* Administration Trust */}
            <div className="space-y-1">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Board Confidence</span>
                  <span className={`text-[10px] font-mono font-bold ${securityStatus.color}`}>{header.jobSecurity}</span>
               </div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className={`h-full ${securityStatus.label === 'Secure' ? 'bg-emerald-500' : securityStatus.label === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`} 
                   style={{ width: securityStatus.label === 'Secure' ? '85%' : securityStatus.label === 'Critical' ? '25%' : '50%' }}
                 ></div>
               </div>
            </div>

            {/* Fan Sentiment */}
            <div className="space-y-1">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Fan Approval</span>
                  <span className={`text-[10px] font-mono font-bold ${header.fanSentiment > 50 ? 'text-emerald-400' : 'text-red-400'}`}>{header.fanSentiment}%</span>
               </div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className={`h-full ${header.fanSentiment > 66 ? 'bg-emerald-500' : header.fanSentiment < 33 ? 'bg-red-500' : 'bg-amber-500'}`} 
                   style={{ width: `${header.fanSentiment}%` }}
                 ></div>
               </div>
            </div>
            
            {/* Resources / Prestige */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800/50 mt-2">
               <span className="text-[10px] font-bold text-slate-500 uppercase">Program Prestige</span>
               <div className="flex items-center space-x-1">
                 <Trophy className="w-3 h-3 text-amber-500" />
                 <span className="text-xs font-mono text-slate-300">{header.stats.prestige}</span>
               </div>
            </div>
        </div>
      </div>

      {/* 3. Office Actions (Grid) */}
      <div className="p-4 border-b border-slate-800">
         <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Coach's Desk</h3>
         
         <div className="grid grid-cols-2 gap-2">
            {/* Meet AD */}
            <button 
              disabled={loading}
              onClick={() => onAction('action_meet_ad', 'Request meeting with Administration', 'I want to discuss my future, requesting more resources, or addressing job security concerns.')}
              className="flex flex-col items-center justify-center p-3 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-emerald-500/50 transition-all group disabled:opacity-50"
            >
               <Users className="w-4 h-4 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase">Meet AD</span>
            </button>

            {/* Press Conference */}
            <button 
              disabled={loading}
              onClick={() => onAction('action_press_conference', 'Call an unscheduled Press Conference', 'I need to address the media directly to spin the narrative, defend my players, or call out the fans.')}
              className="flex flex-col items-center justify-center p-3 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-blue-500/50 transition-all group disabled:opacity-50"
            >
               <Mic2 className="w-4 h-4 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase">Presser</span>
            </button>

            {/* Contact Agent */}
            <button 
              disabled={loading}
              onClick={() => onAction('action_leak_interest', 'Call Agent / Leak Interest', 'Have my agent float my name for other openings. I am looking for a way out or leverage.')}
              className="flex flex-col items-center justify-center p-3 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-amber-500/50 transition-all group disabled:opacity-50"
            >
               <Phone className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase">Call Agent</span>
            </button>

             {/* Resign */}
             <button 
              disabled={loading}
              onClick={() => onAction('action_resign', 'Resign from position', 'I am quitting effective immediately. This bridge is burned.')}
              className="flex flex-col items-center justify-center p-3 rounded bg-slate-900 border border-slate-700 hover:bg-red-900/20 hover:border-red-500/50 transition-all group disabled:opacity-50"
            >
               <AlertTriangle className="w-4 h-4 text-red-500 mb-1 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-slate-300 group-hover:text-red-200 uppercase">Resign</span>
            </button>
         </div>
      </div>

      {/* 4. Active Intel / Threads */}
      <div className="p-4 border-b border-slate-800 flex-1">
         <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Storylines</h3>
         </div>
         
         <div className="space-y-2">
            {header.openThreads && header.openThreads.length > 0 ? (
                header.openThreads.map((thread, idx) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 flex items-start space-x-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-xs text-slate-300 leading-tight">{thread}</span>
                    </div>
                ))
            ) : (
                <div className="text-xs text-slate-600 italic p-2">No major active storylines.</div>
            )}
         </div>
      </div>

      {/* 5. Team DNA / Context */}
      <div className="p-4 border-b border-slate-800 bg-slate-950">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Team Identity</h3>
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="text-slate-500">Scheme</span>
                <span className="text-slate-300 font-mono">{header.schemeOffense}</span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-slate-500">Defense</span>
                <span className="text-slate-300 font-mono">{header.schemeDefense}</span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-slate-500">QB Room</span>
                <span className="text-slate-300 font-mono">{header.qbSituation}</span>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800">
             <div className="flex flex-wrap gap-1.5">
                {header.reputationTags.map(tag => (
                    <span key={tag} className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
      </div>

      {/* Legacy Bar at bottom */}
      <div className="p-4 bg-slate-900">
         <div className="flex justify-between items-center mb-1">
            <div className="flex items-center space-x-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">Legacy Score</span>
            </div>
            <span className="text-xs font-mono text-emerald-500">{header.legacyScore}</span>
         </div>
         <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: `${legacyPercent}%` }}></div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
