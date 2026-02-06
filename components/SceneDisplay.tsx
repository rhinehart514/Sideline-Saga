
import React, { useEffect, useRef, useState } from 'react';
import { TurnLog, MediaContent, FanReaction } from '../types';
import { Terminal, ClipboardList, Radio, Globe, AlertTriangle, Mic, Twitter, Tv, Cpu, Flame, Newspaper, AlertOctagon, TrendingUp, Sparkles, CloudRain, MinusCircle, PartyPopper } from 'lucide-react';
import SeasonSummary from './SeasonSummary';
import JobOfferDisplay from './JobOfferDisplay';

interface Props {
  history: TurnLog[];
  loading: boolean;
  onOfferAction?: (offerId: string, actionType: 'accept' | 'negotiate' | 'decline', detail?: string) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

const getYear = (dateStr: string): number => {
  const match = dateStr.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 1995;
};

// --- SUB-COMPONENTS ---

const TypewriterText: React.FC<{ text: string; isActive: boolean; onComplete?: () => void }> = ({ text, isActive, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(text);
      return;
    }
    setDisplayedText('');
    indexRef.current = 0;

    const intervalId = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 10); 

    return () => clearInterval(intervalId);
  }, [text, isActive, onComplete]);

  return (
    <p className={`text-slate-200 text-base md:text-lg leading-7 whitespace-pre-line font-serif ${isActive ? 'typing-cursor' : ''}`}>
      {displayedText}
    </p>
  );
};

// Updated: Dynamic Press Clipping based on 'source' AND 'mood'
const PressClipping: React.FC<{ media: MediaContent; date: string }> = ({ media, date }) => {
    const year = getYear(date);
    const source = media.source || 'Local Beat';
    const mood = media.narrativeMood || 'Stability';

    // Helper to get Mood Styles
    const getMoodStyles = () => {
        switch (mood) {
            case 'Crisis': return { border: 'border-red-600', text: 'text-red-500', icon: <AlertOctagon className="w-5 h-5 text-red-600 animate-pulse" /> };
            case 'Euphoria': return { border: 'border-amber-400', text: 'text-amber-400', icon: <PartyPopper className="w-5 h-5 text-amber-400 animate-bounce" /> };
            case 'Skepticism': return { border: 'border-orange-500', text: 'text-orange-500', icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> };
            case 'Apathy': return { border: 'border-slate-500', text: 'text-slate-500', icon: <CloudRain className="w-5 h-5 text-slate-500" /> };
            case 'Tension': return { border: 'border-purple-500', text: 'text-purple-500', icon: <TrendingUp className="w-5 h-5 text-purple-500" /> };
            default: return { border: 'border-emerald-500', text: 'text-emerald-500', icon: <Sparkles className="w-5 h-5 text-emerald-500" /> };
        }
    };
    const moodStyle = getMoodStyles();

    // 1. National TV (ESPN Style Ticker)
    if (source === 'National TV') {
        return (
            <div className={`max-w-2xl mx-auto my-6 bg-black border-y-4 shadow-2xl relative overflow-hidden group ${moodStyle.border}`}>
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                
                <div className="p-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
                     <div className="flex items-center space-x-2">
                        <Tv className={`w-5 h-5 ${moodStyle.text}`} />
                        <span className="font-black italic text-xl text-white tracking-tighter">SPORTS<span className={moodStyle.text}>CENTER</span></span>
                     </div>
                     <span className={`font-mono text-xs font-bold uppercase ${moodStyle.text} flex items-center gap-2`}>
                        {moodStyle.icon} {mood} MODE
                     </span>
                </div>
                
                <div className="p-6 bg-zinc-900">
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase leading-none mb-2 tracking-tight">
                        {media.headline}
                    </h3>
                    <div className={`h-1 w-20 mb-4 bg-current ${moodStyle.text}`}></div>
                    <p className="text-slate-300 font-sans text-sm md:text-base leading-relaxed">
                        {media.beatWriterAnalysis}
                    </p>
                </div>
                
                {/* Ticker Bottom */}
                <div className="bg-black py-1 px-4 overflow-hidden whitespace-nowrap border-t border-zinc-800">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase inline-block animate-pulse">BREAKING NEWS  ///  {date}  ///  SIDELINE SAGA EXCLUSIVE  ///</span>
                </div>
            </div>
        );
    }

    // 2. Tactical Blog (Minimalist, Dark Mode)
    if (source === 'Tactical Blog') {
        return (
            <div className="max-w-2xl mx-auto my-6 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden font-mono">
                <div className="bg-slate-900 p-3 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-emerald-400">
                        <Cpu className="w-4 h-4" />
                        <span className="text-sm font-bold tracking-wider">/var/log/football_analysis</span>
                    </div>
                    <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded bg-slate-800 ${moodStyle.text}`}>{mood}</span>
                </div>
                <div className="p-6">
                    <h3 className={`text-xl font-bold mb-4 ${moodStyle.text}`}>
                        {">"} {media.headline}
                    </h3>
                    <div className="text-slate-300 text-sm leading-relaxed border-l-2 border-slate-700 pl-4">
                        {media.beatWriterAnalysis}
                    </div>
                </div>
            </div>
        );
    }

    // 3. Tabloid (Loud, Sensational)
    if (source === 'Tabloid') {
        const bgColors: Record<string, string> = {
            'Crisis': 'bg-red-600',
            'Euphoria': 'bg-yellow-400',
            'Skepticism': 'bg-orange-400',
            'Apathy': 'bg-slate-400',
            'Tension': 'bg-purple-500',
            'Stability': 'bg-blue-400'
        };

        return (
            <div className="max-w-2xl mx-auto my-6 bg-white border-4 border-black p-1 shadow-[8px_8px_0px_rgba(0,0,0,1)] transform -rotate-1">
                <div className={`p-4 border-b-4 border-black ${bgColors[mood] || 'bg-yellow-300'}`}>
                     <div className="flex justify-between items-center">
                        <h2 className="text-4xl font-black text-black uppercase tracking-tighter leading-none transform scale-y-110">THE INSIDER</h2>
                        <Flame className="w-8 h-8 text-black" />
                     </div>
                </div>
                <div className="p-4 relative overflow-hidden">
                    {/* Watermark */}
                    <span className="absolute -bottom-4 -right-4 text-9xl font-black text-slate-100 opacity-50 z-0 select-none uppercase">{mood}</span>
                    
                    <h3 className="relative z-10 text-3xl md:text-4xl font-black text-black uppercase leading-none mb-4 text-center">
                        {media.headline}
                    </h3>
                    <div className="relative z-10 columns-1 md:columns-2 gap-4 text-sm font-sans font-bold text-slate-900 leading-snug">
                        {media.beatWriterAnalysis}
                    </div>
                </div>
            </div>
        );
    }

    // 4. Default / Local Beat (Newspaper Style)
    const isDigital = year >= 2008;
    return (
        <div className={`
            max-w-2xl mx-auto my-6 p-1 relative
            ${isDigital ? 'bg-white border-l-4 shadow-md rounded-r' : 'bg-[#f4e4bc] shadow-xl rotate-1'}
            ${isDigital ? moodStyle.border : ''}
        `}>
            {!isDigital && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-30 pointer-events-none"></div>}
            
            <div className={`p-4 ${isDigital ? 'font-sans' : 'font-newspaper'}`}>
                {/* Header */}
                <div className="flex justify-between items-end border-b pb-2 mb-3 border-slate-300">
                    <div className="flex items-center space-x-2">
                        {isDigital ? <Globe className={`w-4 h-4 ${moodStyle.text}`} /> : <Newspaper className="w-4 h-4 text-slate-800" />}
                        <span className={`uppercase font-black tracking-tight ${isDigital ? `text-lg ${moodStyle.text}` : 'text-slate-900 text-2xl'}`}>
                            {isDigital ? 'The Athletic Pulse' : 'The Morning Gazette'}
                        </span>
                    </div>
                    <span className={`text-xs font-bold uppercase ${moodStyle.text}`}>{mood} Watch</span>
                </div>

                {/* Headline */}
                <h3 className={`font-bold leading-tight mb-2 ${isDigital ? 'text-2xl text-slate-900' : 'text-3xl text-slate-900'}`}>
                    {media.headline}
                </h3>
                
                {/* Analysis Body */}
                <div className={`text-sm leading-relaxed ${isDigital ? 'text-slate-700' : 'text-slate-800'}`}>
                    <p className="first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                        {media.beatWriterAnalysis}
                    </p>
                </div>
            </div>
        </div>
    );
};

// New: Interview Block
const InterviewBlock: React.FC<{ quote: { speaker: string; context: string; quote: string } }> = ({ quote }) => {
    return (
        <div className="flex items-start space-x-3 bg-slate-800/50 p-4 rounded-lg border-l-4 border-purple-500 backdrop-blur-sm max-w-xl">
             <div className="bg-purple-500/20 p-2 rounded-full">
                <Mic className="w-5 h-5 text-purple-400" />
             </div>
             <div>
                <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-slate-200 text-sm">{quote.speaker}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">• {quote.context}</span>
                </div>
                <p className="text-slate-300 italic text-sm md:text-base">"{quote.quote}"</p>
             </div>
        </div>
    );
};

// New: Fan Reaction Feed
const FanPulse: React.FC<{ reactions: FanReaction[]; date: string }> = ({ reactions, date }) => {
    const year = getYear(date);
    const isTwitterEra = year >= 2012;
    const isMessageBoardEra = year >= 2002 && year < 2012;

    if (!reactions || reactions.length === 0) return null;

    return (
        <div className="space-y-3 max-w-sm ml-auto">
            <div className="flex items-center justify-end space-x-2 text-xs font-bold text-slate-500 uppercase">
                {isTwitterEra ? <Twitter className="w-3 h-3 text-blue-400" /> : (isMessageBoardEra ? <Globe className="w-3 h-3 text-emerald-500" /> : <Radio className="w-3 h-3 text-amber-500" />)}
                <span>{isTwitterEra ? 'Trending' : (isMessageBoardEra ? 'The Boards' : 'Call-In Show')}</span>
            </div>

            {reactions.map((rxn, idx) => (
                <div key={idx} className={`
                    p-3 text-xs rounded shadow-sm border
                    ${isTwitterEra 
                        ? 'bg-slate-900 border-slate-700 text-slate-300 rounded-xl' 
                        : (isMessageBoardEra ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-amber-50 border-amber-200 text-amber-900 font-mono')}
                `}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{rxn.author}</span>
                        {rxn.sentiment === 'Negative' && <AlertTriangle className="w-3 h-3 opacity-50" />}
                    </div>
                    <p className={isMessageBoardEra ? 'font-sans' : ''}>"{rxn.content}"</p>
                </div>
            ))}
        </div>
    );
};


const SceneDisplay: React.FC<Props> = ({ history, loading, onOfferAction, viewportRef }) => {
  const bottomMarkerRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (viewportRef.current) {
        // Option A: Smooth scroll
        viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  // Scroll when history updates (new turn added)
  useEffect(() => {
    scrollToBottom();
  }, [history.length, loading]);

  if (history.length === 0) return null;

  return (
    // No more internal overflow-y-auto. This div simply expands with content.
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-12 pb-12">
        {history.map((turn, index) => {
          const isLast = index === history.length - 1;
          const media = turn.mediaContent; 

          return (
            <div key={turn.turnId} className={`space-y-8 ${!isLast ? 'opacity-60 grayscale-[0.3] hover:opacity-100 hover:grayscale-0 transition-all duration-500' : ''}`}>
              
              {/* 1. Resolution */}
              {turn.resolution && (
                <div className="flex justify-center">
                    <div className="bg-slate-800/80 border-l-2 border-emerald-500/50 p-2 px-4 rounded-r-md max-w-lg text-center backdrop-blur-sm">
                        <p className="text-emerald-500 italic text-sm font-mono">
                         {turn.resolution}
                        </p>
                    </div>
                </div>
              )}

              {/* 2. Media Landscape (New) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Col: Beat Writer & Interview */}
                  <div className="lg:col-span-8 space-y-6">
                      {media && <PressClipping media={media} date={turn.header.date} />}
                      
                      {media?.interviewQuote && (
                         <InterviewBlock quote={media.interviewQuote} />
                      )}
                  </div>

                  {/* Right Col: Fan Pulse & Staff Notes */}
                  <div className="lg:col-span-4 space-y-4">
                      {media?.fanReactions && (
                          <FanPulse reactions={media.fanReactions} date={turn.header.date} />
                      )}

                      {turn.staffNotes && (
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded flex items-start space-x-3 ml-auto max-w-sm">
                            <ClipboardList className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                            <div>
                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-0.5">Staff Intel</span>
                            <span className="font-mono text-slate-400 text-xs leading-tight">{turn.staffNotes}</span>
                            </div>
                        </div>
                      )}
                  </div>
              </div>

              {/* 3. System Log / Narrative */}
              <div className="relative pl-4 md:pl-0">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800 md:hidden"></div>
                <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-emerald-500 md:hidden"></div>

                <div className="bg-slate-800/50 rounded-lg p-5 md:p-8 shadow-2xl border border-slate-700/50 relative overflow-hidden backdrop-blur-sm">
                  
                  <div className="flex items-center space-x-3 mb-6 border-b border-slate-700/50 pb-2 relative z-10">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest">
                        Narrative Log // {turn.header.date}
                      </span>
                  </div>
                  
                  <div className="relative z-10 min-h-[60px]">
                     <TypewriterText 
                        text={turn.sceneDescription} 
                        isActive={isLast} 
                        onComplete={scrollToBottom}
                     />
                  </div>

                  {isLast && turn.header.openThreads && turn.header.openThreads.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-slate-700/50 animate-fade-in relative z-10">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        Storylines
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {turn.header.openThreads.map((thread, idx) => (
                          <span key={idx} className="text-xs font-mono text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20">
                            #{thread.replace(/\s+/g, '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Events */}
              {turn.jobOffers && turn.jobOffers.length > 0 && (
                <JobOfferDisplay 
                    offers={turn.jobOffers} 
                    onAction={isLast ? onOfferAction : undefined} 
                />
              )}

              {turn.seasonSummary && (
                <SeasonSummary summary={turn.seasonSummary} />
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-pulse">
             <div className="flex space-x-2">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
             </div>
             <span className="text-xs text-emerald-500 font-mono uppercase tracking-widest">Processing World Events...</span>
          </div>
        )}

        {/* Marker for scrolling */}
        <div ref={bottomMarkerRef} className="h-1" />
    </div>
  );
};

export default SceneDisplay;
