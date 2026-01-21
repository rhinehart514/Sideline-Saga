import React, { useEffect, useRef } from 'react';
import { TurnLog } from '../types';
import { Terminal, Newspaper, ClipboardList, Radio } from 'lucide-react';
import SeasonSummary from './SeasonSummary';
import JobOfferDisplay from './JobOfferDisplay';

interface Props {
  history: TurnLog[];
  loading: boolean;
  onOfferAction?: (offerId: string, actionType: 'accept' | 'negotiate' | 'decline', detail?: string) => void;
}

const SceneDisplay: React.FC<Props> = ({ history, loading, onOfferAction }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  if (history.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-slate-900">
      
      {history.map((turn) => (
        <div key={turn.turnId} className={`space-y-4 ${turn.turnId < history.length - 1 ? 'opacity-80' : 'animate-fade-in'}`}>
          
          {/* Resolution of previous action (if exists) */}
          {turn.resolution && (
            <div className="bg-slate-800/40 border-l-4 border-amber-600/50 p-4 rounded-r-md">
              <h3 className="text-amber-600 text-[10px] font-bold uppercase tracking-wider mb-1">Previous Result</h3>
              <p className="text-slate-400 italic text-sm md:text-base leading-relaxed">
                {turn.resolution}
              </p>
            </div>
          )}

          {/* The Noise: Media & Staff Intel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Media Headline */}
             {turn.mediaHeadline && (
               <div className="bg-slate-950 border border-slate-800 p-3 rounded flex items-start space-x-3">
                 <Newspaper className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                 <div>
                   <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-0.5">Media Wire</span>
                   <span className="font-serif italic text-slate-300 text-sm leading-tight">"{turn.mediaHeadline}"</span>
                 </div>
               </div>
             )}
             
             {/* Staff Notes */}
             {turn.staffNotes && (
               <div className="bg-slate-950 border border-slate-800 p-3 rounded flex items-start space-x-3">
                 <ClipboardList className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                 <div>
                   <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-0.5">Staff Intel</span>
                   <span className="font-mono text-slate-300 text-xs leading-tight">{turn.staffNotes}</span>
                 </div>
               </div>
             )}
          </div>

          {/* Media Buzz / Public Sentiment (New) */}
          {turn.mediaBuzz && (
             <div className="bg-slate-900/50 border-t border-b border-slate-800 p-3 flex items-center justify-center space-x-3">
                <Radio className="w-4 h-4 text-slate-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-400 tracking-tight">
                  <span className="font-bold text-slate-500 uppercase mr-2">The Buzz:</span>
                  {turn.mediaBuzz}
                </span>
             </div>
          )}

          {/* Main Scene Content */}
          <div className="bg-slate-800 rounded-lg p-5 md:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
            <div className="flex items-center space-x-3 mb-4 border-b border-slate-700 pb-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest">
                  {turn.header.date} // Scene {turn.turnId}
                </span>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-200 text-base md:text-lg leading-7 whitespace-pre-line font-serif">
                {turn.sceneDescription}
              </p>
            </div>

            {turn.turnId === history.length - 1 && turn.header.openThreads && turn.header.openThreads.length > 0 && (
               <div className="mt-6 pt-4 border-t border-slate-700/50">
                 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Threads</span>
                 <div className="mt-2 flex flex-wrap gap-2">
                   {turn.header.openThreads.map((thread, idx) => (
                     <span key={idx} className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                       {thread}
                     </span>
                   ))}
                 </div>
               </div>
            )}
          </div>

          {/* Special Events */}
          
          {/* 1. Coaching Carousel Offers */}
          {turn.jobOffers && turn.jobOffers.length > 0 && (
            <JobOfferDisplay 
                offers={turn.jobOffers} 
                onAction={turn.turnId === history.length - 1 ? onOfferAction : undefined} // Only active for current turn
            />
          )}

          {/* 2. Season Summary Report Card */}
          {turn.seasonSummary && (
            <SeasonSummary summary={turn.seasonSummary} />
          )}

        </div>
      ))}

      {loading && (
        <div className="flex items-center justify-center py-8 space-x-2 animate-pulse">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animation-delay-200"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animation-delay-400"></div>
            <span className="text-sm text-emerald-500 font-mono">Simulating Timeline...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default SceneDisplay;