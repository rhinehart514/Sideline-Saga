import React, { useEffect, useRef } from 'react';
import { TurnLog } from '../types';
import { Tv, Newspaper, ClipboardList, Radio, Film } from 'lucide-react';
import SeasonSummary from './SeasonSummary';
import JobOfferDisplay from './JobOfferDisplay';
import BreakingNews from './BreakingNews';

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
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 space-y-10 bg-gradient-to-b from-zinc-900 to-black">
      
      {history.map((turn, turnIndex) => {
        const isCurrent = turnIndex === history.length - 1;
        const isHotSeat = turn.header.jobSecurity.toLowerCase().includes('hot');
        
        return (
          <div 
            key={turn.turnId} 
            className={`space-y-6 ${!isCurrent ? 'opacity-70' : 'animate-fade-in'}`}
          >
            
            {/* Resolution of Previous Action - Apple: more padding */}
            {turn.resolution && (
              <div className="bg-zinc-900/50 border-l-4 border-yellow-500 p-6 rounded-r-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Film className="w-5 h-5 text-yellow-500" />
                  <span className="font-headline text-xs text-yellow-500 uppercase tracking-wider">Previous Result</span>
                </div>
                <p className="font-broadcast text-zinc-300 italic text-base leading-relaxed">
                  {turn.resolution}
                </p>
              </div>
            )}

            {/* Breaking News Banner */}
            {isCurrent && turn.mediaHeadline && (
              <BreakingNews 
                headline={turn.mediaHeadline} 
                isUrgent={isHotSeat || turn.header.timelinePhase === 'Carousel'}
              />
            )}

            {/* Intel Cards Grid - Apple: more gap, rounded corners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Media Wire Card */}
              {turn.mediaHeadline && !isCurrent && (
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
                  <div className="bg-red-600 px-5 py-3 flex items-center space-x-3">
                    <Newspaper className="w-4 h-4 text-white" />
                    <span className="font-headline text-xs text-white uppercase tracking-wider">Media Wire</span>
                  </div>
                  <div className="p-5">
                    <span className="font-broadcast italic text-zinc-300 text-base leading-relaxed">
                      "{turn.mediaHeadline}"
                    </span>
                  </div>
                </div>
              )}
              
              {/* Staff Intel Card */}
              {turn.staffNotes && (
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
                  <div className="bg-orange-600 px-5 py-3 flex items-center space-x-3">
                    <ClipboardList className="w-4 h-4 text-white" />
                    <span className="font-headline text-xs text-white uppercase tracking-wider">Staff Intel</span>
                  </div>
                  <div className="p-5">
                    <span className="font-broadcast text-zinc-300 text-sm leading-relaxed">
                      {turn.staffNotes}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* The Buzz / Public Sentiment - Apple: more padding */}
            {turn.mediaBuzz && (
              <div className="bg-zinc-950/80 border-y border-zinc-800/50 px-6 py-4 flex items-center justify-center space-x-4">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="font-broadcast text-sm text-zinc-400">
                  <span className="font-headline text-red-500 uppercase mr-3">The Buzz:</span>
                  {turn.mediaBuzz}
                </span>
              </div>
            )}

            {/* Main Scene Content - Apple: generous padding, rounded corners */}
            <div className="bg-zinc-900/50 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/50">
              {/* Broadcast Header Bar */}
              <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Tv className="w-5 h-5 text-white" />
                  <span className="font-headline text-white text-base uppercase tracking-wide">
                    {turn.header.date}
                  </span>
                  <span className="text-red-200 text-sm font-broadcast">
                    Scene {turn.turnId}
                  </span>
                </div>
                
                {/* Phase Badge */}
                <span className={`
                  font-headline text-xs uppercase px-4 py-1.5 rounded-full
                  ${turn.header.timelinePhase === 'Carousel' 
                    ? 'bg-yellow-500 text-black animate-pulse' 
                    : 'bg-black/30 text-white'}
                `}>
                  {turn.header.timelinePhase}
                </span>
              </div>
              
              {/* Scene Content - Apple: very generous padding */}
              <div className="px-8 py-10 md:px-12 md:py-12">
                <p className="font-broadcast text-zinc-200 text-lg md:text-xl leading-8 md:leading-9 whitespace-pre-line">
                  {turn.sceneDescription}
                </p>
              </div>

              {/* Active Threads Footer */}
              {isCurrent && turn.header.openThreads && turn.header.openThreads.length > 0 && (
                <div className="bg-black/30 px-8 py-6 border-t border-zinc-800/50">
                  <span className="font-headline text-xs text-zinc-500 uppercase tracking-wider">Active Threads</span>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {turn.header.openThreads.map((thread, idx) => (
                      <span 
                        key={idx} 
                        className="font-broadcast text-sm text-zinc-400 bg-zinc-800/50 px-4 py-2 rounded-lg border-l-2 border-red-600"
                      >
                        {thread}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Special Events */}
            
            {/* Coaching Carousel Offers */}
            {turn.jobOffers && turn.jobOffers.length > 0 && (
              <JobOfferDisplay 
                offers={turn.jobOffers} 
                onAction={isCurrent ? onOfferAction : undefined}
              />
            )}

            {/* Season Summary Report Card */}
            {turn.seasonSummary && (
              <SeasonSummary summary={turn.seasonSummary} />
            )}

          </div>
        );
      })}

      {/* Loading State - Apple: clean, centered */}
      {loading && (
        <div className="flex items-center justify-center py-12 space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="font-headline text-base text-red-500 uppercase tracking-wider">Simulating Timeline</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default SceneDisplay;
