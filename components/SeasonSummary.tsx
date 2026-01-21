import React from 'react';
import { SeasonSummary as SeasonSummaryType } from '../types';
import { Medal, Star, MessageSquare, TrendingUp, Award } from 'lucide-react';

interface Props {
  summary: SeasonSummaryType;
}

const SeasonSummary: React.FC<Props> = ({ summary }) => {
  return (
    <div className="bg-zinc-900 rounded overflow-hidden shadow-2xl my-6 max-w-2xl mx-auto border border-zinc-800">
      
      {/* ESPN-Style Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Award className="w-6 h-6 text-white" />
          <div>
            <h2 className="font-headline text-xl text-white uppercase tracking-wide">Season Review</h2>
            <p className="font-broadcast text-xs text-red-200">Year {summary.year} • Official Report</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-score text-4xl text-white tracking-tighter">
            {summary.finalRecord}
          </div>
          <div className="font-broadcast text-[10px] text-red-200 uppercase">Final Record</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Main Result */}
        <div className="flex items-center space-x-4 pb-6 border-b border-zinc-800">
          <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/50">
            <Medal className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <div className="font-headline text-[10px] text-zinc-500 uppercase tracking-wider">Season Result</div>
            <div className="font-broadcast text-xl text-white font-bold">{summary.accomplishment}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-red-500" />
            <span className="font-headline text-xs text-zinc-500 uppercase tracking-wider">Key Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {summary.keyStats.map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-zinc-800 p-3 rounded border-l-2 border-red-600 flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4 text-zinc-500" />
                <span className="font-broadcast text-sm text-zinc-300">{stat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Board/AD Feedback */}
        <div className="bg-black/50 p-4 rounded border border-zinc-800">
          <div className="flex items-center space-x-2 mb-3">
            <MessageSquare className="w-4 h-4 text-yellow-500" />
            <span className="font-headline text-xs text-zinc-500 uppercase tracking-wider">AD Evaluation</span>
          </div>
          <p className="font-broadcast italic text-zinc-300 leading-relaxed">
            "{summary.boardFeedback}"
          </p>
        </div>
        
      </div>

      {/* Footer */}
      <div className="bg-black px-4 py-2 border-t border-zinc-800">
        <span className="font-broadcast text-[10px] text-zinc-600 uppercase">
          End of Report • {summary.year} Season
        </span>
      </div>
    </div>
  );
};

export default SeasonSummary;
