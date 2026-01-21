import React from 'react';
import { Zap, TrendingUp, AlertTriangle, Trophy, Flame } from 'lucide-react';

interface TickerItem {
  type: 'breaking' | 'trade' | 'injury' | 'score' | 'rumor';
  text: string;
  highlight?: boolean;
}

interface Props {
  items: TickerItem[];
  mediaHeadline?: string;
  mediaBuzz?: string;
}

const getIcon = (type: TickerItem['type']) => {
  switch (type) {
    case 'breaking': return <Zap className="w-3.5 h-3.5" />;
    case 'trade': return <TrendingUp className="w-3.5 h-3.5" />;
    case 'injury': return <AlertTriangle className="w-3.5 h-3.5" />;
    case 'score': return <Trophy className="w-3.5 h-3.5" />;
    case 'rumor': return <Flame className="w-3.5 h-3.5" />;
    default: return <Zap className="w-3.5 h-3.5" />;
  }
};

const getTypeColor = (type: TickerItem['type']) => {
  switch (type) {
    case 'breaking': return 'bg-red-600 text-white';
    case 'trade': return 'bg-blue-600 text-white';
    case 'injury': return 'bg-orange-500 text-white';
    case 'score': return 'bg-green-600 text-white';
    case 'rumor': return 'bg-purple-600 text-white';
    default: return 'bg-gray-600 text-white';
  }
};

const TickerBar: React.FC<Props> = ({ items, mediaHeadline, mediaBuzz }) => {
  const tickerContent: TickerItem[] = [
    ...(mediaHeadline ? [{ type: 'breaking' as const, text: mediaHeadline, highlight: true }] : []),
    ...(mediaBuzz ? [{ type: 'rumor' as const, text: mediaBuzz }] : []),
    ...items,
    { type: 'score', text: 'CFB: Rankings shake-up expected after Week 12 results' },
    { type: 'trade', text: 'COACHING CAROUSEL: Multiple Power 5 jobs expected to open' },
    { type: 'rumor', text: 'Sources: Top coordinators fielding calls from blue bloods' },
  ];

  const duplicatedContent = [...tickerContent, ...tickerContent];

  return (
    <div className="w-full bg-black border-t-2 border-red-600 overflow-hidden">
      {/* Network Bar - Apple: more padding */}
      <div className="flex items-stretch">
        {/* LIVE Badge */}
        <div className="bg-red-600 px-5 py-3 flex items-center space-x-2 shine-effect">
          <div className="w-2.5 h-2.5 bg-white rounded-full live-pulse"></div>
          <span className="font-score text-sm text-white uppercase tracking-wider">Live</span>
        </div>
        
        {/* Network Logo */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-3 flex items-center">
          <span className="font-headline text-white text-base tracking-tight">
            SIDELINE<span className="text-yellow-400">SAGA</span>
          </span>
        </div>
        
        {/* Ticker Content */}
        <div className="flex-1 bg-zinc-900 overflow-hidden relative">
          <div className="ticker-animate flex items-center whitespace-nowrap py-3">
            {duplicatedContent.map((item, idx) => (
              <div key={idx} className="flex items-center mx-6">
                <span className={`
                  ${getTypeColor(item.type)} 
                  px-3 py-1 text-xs font-bold uppercase flex items-center space-x-1.5 mr-3 rounded-full
                `}>
                  {getIcon(item.type)}
                  <span>{item.type}</span>
                </span>
                <span className={`
                  font-broadcast text-base
                  ${item.highlight ? 'text-yellow-400 font-bold' : 'text-gray-200'}
                `}>
                  {item.text}
                </span>
                <span className="text-red-600 mx-6 text-lg">●</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TickerBar;
