import React from 'react';
import { TimelinePhase } from '../types';

interface Props {
  currentPhase: TimelinePhase;
}

const PHASES: TimelinePhase[] = ['Preseason', 'Regular Season', 'Postseason', 'Carousel', 'Offseason'];

const Timeline: React.FC<Props> = ({ currentPhase }) => {
  const currentIndex = PHASES.indexOf(currentPhase);

  return (
    <div className="w-full bg-slate-950 px-4 pt-4 pb-2 border-b border-slate-800">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-0"></div>
        
        {/* Progress Bar Fill */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-emerald-600 -z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (PHASES.length - 1)) * 100}%` }}
        ></div>

        {PHASES.map((phase, idx) => {
          const isActive = idx === currentIndex;
          const isPast = idx < currentIndex;
          const isCarousel = phase === 'Carousel';
          const isCarouselActive = isCarousel && isActive;

          return (
            <div key={phase} className="flex flex-col items-center z-10 group relative">
              
              {/* Special Glow for Active Carousel */}
              {isCarouselActive && (
                 <div className="absolute -inset-2 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
              )}

              <div 
                className={`
                  w-3 h-3 rounded-full border-2 transition-all duration-300 relative
                  ${isActive ? 'scale-125 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : ''}
                  ${isCarouselActive ? 'bg-amber-500 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]' : ''}
                  ${isActive && !isCarouselActive ? 'bg-emerald-500 border-emerald-300' : ''}
                  ${isPast ? 'bg-emerald-700 border-emerald-700' : ''}
                  ${!isActive && !isPast ? 'bg-slate-900 border-slate-700' : ''}
                `}
              ></div>
              <span 
                className={`
                  mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300
                  ${isCarouselActive ? 'text-amber-400 animate-pulse' : ''}
                  ${isActive && !isCarouselActive ? 'text-emerald-400' : ''}
                  ${!isActive ? 'text-slate-600' : ''}
                  hidden md:block
                `}
              >
                {phase}
              </span>
            </div>
          );
        })}
      </div>
      <div className="md:hidden text-center mt-2">
         <span className={`text-xs font-bold uppercase tracking-widest ${currentPhase === 'Carousel' ? 'text-amber-500' : 'text-emerald-500'}`}>{currentPhase}</span>
      </div>
    </div>
  );
};

export default Timeline;