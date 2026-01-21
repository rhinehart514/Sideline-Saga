import React from 'react';
import { SaveHeader } from '../types';
import { Shield, Calendar, Trophy, Briefcase, Mic2, Phone, Users, AlertTriangle, FileText, TrendingUp, Building2, Flame, Radio, Tv } from 'lucide-react';
import ScoreBug from './ScoreBug';

interface Props {
  header: SaveHeader;
  onAction: (actionId: string, actionText: string, context: string) => void;
  loading: boolean;
}

const Sidebar: React.FC<Props> = ({ header, onAction, loading }) => {
  const isHotSeat = header.jobSecurity.toLowerCase().includes('hot') || 
                    header.jobSecurity.toLowerCase().includes('imminent');

  return (
    <div className="w-full md:w-96 bg-zinc-950 border-r-2 border-red-600 flex flex-col h-full overflow-y-auto">
      
      {/* Broadcast Header - Apple: generous padding */}
      <div className="bg-gradient-to-b from-red-700 to-red-800 px-6 py-5 border-b border-red-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Tv className="w-5 h-5 text-white" />
            <span className="font-headline text-white text-base uppercase tracking-wide">Coach Cam</span>
          </div>
          <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-broadcast text-xs text-red-200 uppercase">Live</span>
          </div>
        </div>
      </div>
      
      {/* Score Bug - Apple: more padding around */}
      <div className="px-5 py-5">
        <ScoreBug header={header} />
      </div>
      
      {/* Date & Phase Badge - Apple: spaced container */}
      <div className="px-5 pb-5">
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <span className="font-score text-base text-white">{header.date}</span>
          </div>
          <span className={`
            font-headline text-xs uppercase px-3 py-1.5 rounded-full
            ${header.timelinePhase === 'Carousel' 
              ? 'bg-yellow-500 text-black' 
              : 'bg-red-600 text-white'}
          `}>
            {header.timelinePhase}
          </span>
        </div>
      </div>

      {/* Front Office Stats - Apple: card with breathing room */}
      <div className="px-5 pb-5">
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="bg-black/50 px-5 py-3 flex items-center space-x-3 border-b border-zinc-800/50">
            <Building2 className="w-4 h-4 text-red-500" />
            <span className="font-headline text-xs text-zinc-400 uppercase tracking-wider">Front Office</span>
          </div>
          
          <div className="px-5 py-5 space-y-5">
            {/* Fan Approval */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-broadcast text-xs text-zinc-500 uppercase">Fan Approval</span>
                <span className={`font-score text-base ${header.fanSentiment > 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {header.fanSentiment}%
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full animate-fill rounded-full ${
                    header.fanSentiment > 66 ? 'bg-green-500' : 
                    header.fanSentiment < 33 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${header.fanSentiment}%` }}
                />
              </div>
            </div>
            
            {/* Job Security */}
            <div className="flex items-center justify-between py-2">
              <span className="font-broadcast text-xs text-zinc-500 uppercase">Security</span>
              <div className="flex items-center space-x-2">
                {isHotSeat && <Flame className="w-4 h-4 text-red-500 animate-pulse" />}
                <span className={`font-score text-sm ${isHotSeat ? 'text-red-400' : 'text-green-400'}`}>
                  {header.jobSecurity}
                </span>
              </div>
            </div>
            
            {/* Prestige */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <span className="font-broadcast text-xs text-zinc-500 uppercase">Prestige</span>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-score text-sm text-white">{header.stats.prestige}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid - Apple: larger touch targets, more spacing */}
      <div className="px-5 pb-5">
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="bg-black/50 px-5 py-3 flex items-center space-x-3 border-b border-zinc-800/50">
            <Radio className="w-4 h-4 text-red-500" />
            <span className="font-headline text-xs text-zinc-400 uppercase tracking-wider">Coach Actions</span>
          </div>
          
          <div className="p-4 grid grid-cols-2 gap-3">
            <button 
              disabled={loading}
              onClick={() => onAction('action_meet_ad', 'Request meeting with Administration', 'I want to discuss my future, requesting more resources, or addressing job security concerns.')}
              className="flex flex-col items-center justify-center p-5 bg-zinc-800/50 hover:bg-red-600 border border-zinc-700/50 hover:border-red-500 rounded-xl transition-all duration-200 group disabled:opacity-50"
            >
              <Users className="w-5 h-5 text-zinc-400 group-hover:text-white mb-2" />
              <span className="font-broadcast text-xs text-zinc-400 group-hover:text-white uppercase">Meet AD</span>
            </button>

            <button 
              disabled={loading}
              onClick={() => onAction('action_press_conference', 'Call an unscheduled Press Conference', 'I need to address the media directly to spin the narrative, defend my players, or call out the fans.')}
              className="flex flex-col items-center justify-center p-5 bg-zinc-800/50 hover:bg-blue-600 border border-zinc-700/50 hover:border-blue-500 rounded-xl transition-all duration-200 group disabled:opacity-50"
            >
              <Mic2 className="w-5 h-5 text-zinc-400 group-hover:text-white mb-2" />
              <span className="font-broadcast text-xs text-zinc-400 group-hover:text-white uppercase">Presser</span>
            </button>

            <button 
              disabled={loading}
              onClick={() => onAction('action_leak_interest', 'Call Agent / Leak Interest', 'Have my agent float my name for other openings. I am looking for a way out or leverage.')}
              className="flex flex-col items-center justify-center p-5 bg-zinc-800/50 hover:bg-yellow-600 border border-zinc-700/50 hover:border-yellow-500 rounded-xl transition-all duration-200 group disabled:opacity-50"
            >
              <Phone className="w-5 h-5 text-zinc-400 group-hover:text-white mb-2" />
              <span className="font-broadcast text-xs text-zinc-400 group-hover:text-white uppercase">Agent</span>
            </button>

            <button 
              disabled={loading}
              onClick={() => onAction('action_resign', 'Resign from position', 'I am quitting effective immediately. This bridge is burned.')}
              className="flex flex-col items-center justify-center p-5 bg-zinc-800/50 hover:bg-red-900 border border-zinc-700/50 hover:border-red-700 rounded-xl transition-all duration-200 group disabled:opacity-50"
            >
              <AlertTriangle className="w-5 h-5 text-zinc-400 group-hover:text-red-300 mb-2" />
              <span className="font-broadcast text-xs text-zinc-400 group-hover:text-red-300 uppercase">Resign</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Storylines - Apple: card style with space */}
      <div className="px-5 pb-5 flex-1">
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden h-full">
          <div className="bg-black/50 px-5 py-3 flex items-center space-x-3 border-b border-zinc-800/50">
            <FileText className="w-4 h-4 text-red-500" />
            <span className="font-headline text-xs text-zinc-400 uppercase tracking-wider">Active Storylines</span>
          </div>
          
          <div className="p-4 space-y-2">
            {header.openThreads && header.openThreads.length > 0 ? (
              header.openThreads.map((thread, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-zinc-800/30 p-4 rounded-lg border-l-2 border-red-600">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 animate-pulse flex-shrink-0"></div>
                  <span className="font-broadcast text-sm text-zinc-300 leading-relaxed">{thread}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 italic p-4 font-broadcast">No major storylines active.</div>
            )}
          </div>
        </div>
      </div>

      {/* Team DNA Footer - Apple: generous footer padding */}
      <div className="bg-black/80 border-t border-zinc-800/50 px-5 py-5">
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <span className="font-broadcast text-[10px] text-zinc-600 uppercase block mb-1">Offense</span>
            <span className="font-score text-xs text-white">{header.schemeOffense}</span>
          </div>
          <div>
            <span className="font-broadcast text-[10px] text-zinc-600 uppercase block mb-1">Defense</span>
            <span className="font-score text-xs text-white">{header.schemeDefense}</span>
          </div>
          <div>
            <span className="font-broadcast text-[10px] text-zinc-600 uppercase block mb-1">QB Room</span>
            <span className="font-score text-xs text-white truncate block">{header.qbSituation}</span>
          </div>
        </div>
        
        {/* Reputation Tags */}
        <div className="mb-4 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-2">
          {header.reputationTags.slice(0, 4).map(tag => (
            <span key={tag} className="font-broadcast text-[10px] uppercase px-2.5 py-1 bg-red-900/30 text-red-300 rounded-full border border-red-800/50">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Legacy Score */}
        <div className="pt-4 border-t border-zinc-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              <span className="font-broadcast text-xs text-zinc-500 uppercase">Legacy</span>
            </div>
            <span className="font-score text-lg text-yellow-400">{header.legacyScore}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 animate-fill rounded-full"
              style={{ width: `${Math.min(100, header.legacyScore / 10)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
