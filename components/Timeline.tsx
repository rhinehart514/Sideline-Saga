import React from 'react';
import { TimelinePhase } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  currentPhase: TimelinePhase;
}

const PHASES: TimelinePhase[] = ['Preseason', 'Regular Season', 'Postseason', 'Carousel', 'Offseason'];

const Timeline: React.FC<Props> = ({ currentPhase }) => {
  const currentIndex = PHASES.indexOf(currentPhase);

  return (
    <div className="w-full bg-black px-8 py-5 border-b-2 border-red-600">
      {/* ESPN-style Phase Tracker - Apple: generous spacing */}
      <div className="flex items-center justify-between relative max-w-4xl mx-auto">
        
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-zinc-800 -translate-y-1/2 -z-0 rounded-full"></div>
        
        {/* Progress Bar Fill */}
        <div 
          className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-red-700 to-red-500 -translate-y-1/2 -z-0 transition-all duration-500 rounded-full"
          style={{ width: `${(currentIndex / (PHASES.length - 1)) * 100}%` }}
        ></div>

        {PHASES.map((phase, idx) => {
          const isActive = idx === currentIndex;
          const isPast = idx < currentIndex;
          const isCarousel = phase === 'Carousel';
          const isCarouselActive = isCarousel && isActive;

          return (
            <div key={phase} className="flex flex-col items-center z-10 relative group">
              
              {/* Carousel Glow Effect */}
              {isCarouselActive && (
                <div className="absolute -inset-4 bg-yellow-500/30 blur-xl rounded-full animate-pulse"></div>
              )}
              
              {/* Phase Dot - Apple: larger, cleaner */}
              <div className={`
                relative w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                ${isActive && !isCarouselActive ? 'bg-red-600 border-red-400 scale-125 shadow-lg shadow-red-500/50' : ''}
                ${isCarouselActive ? 'bg-yellow-500 border-yellow-300 scale-150 shadow-lg shadow-yellow-500/50' : ''}
                ${isPast ? 'bg-red-700 border-red-700' : ''}
                ${!isActive && !isPast ? 'bg-zinc-900 border-zinc-700' : ''}
              `}>
                {isPast && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              
              {/* Phase Label - Apple: more spacing from dot */}
              <span className={`
                mt-4 font-headline text-xs uppercase tracking-wider transition-colors duration-300
                hidden md:block
                ${isCarouselActive ? 'text-yellow-400 animate-pulse' : ''}
                ${isActive && !isCarouselActive ? 'text-red-400' : ''}
                ${isPast ? 'text-zinc-600' : ''}
                ${!isActive && !isPast ? 'text-zinc-700' : ''}
              `}>
                {phase}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Mobile Phase Display - Apple: cleaner */}
      <div className="md:hidden text-center mt-5">
        <span className={`
          font-headline text-base uppercase tracking-widest
          ${currentPhase === 'Carousel' ? 'text-yellow-500' : 'text-red-500'}
        `}>
          {currentPhase}
        </span>
      </div>
    </div>
  );
};

export default Timeline;
