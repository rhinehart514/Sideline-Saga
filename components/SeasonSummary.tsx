import React from 'react';
import { SeasonSummary as SeasonSummaryType } from '../types';
import { Medal, Star, Target, UserCheck } from 'lucide-react';

interface Props {
  summary: SeasonSummaryType;
}

const SeasonSummary: React.FC<Props> = ({ summary }) => {
  return (
    <div className="bg-slate-200 text-slate-900 rounded-sm shadow-2xl overflow-hidden my-6 max-w-2xl mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-300">
      {/* Official Header */}
      <div className="bg-slate-800 text-slate-100 p-4 border-b-4 border-emerald-600 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">Season Review</h2>
          <p className="text-xs font-mono text-emerald-400">YEAR {summary.year} // OFFICIAL RECORD</p>
        </div>
        <div className="text-3xl font-black font-mono tracking-tighter">
          {summary.finalRecord}
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Main Result */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-300">
          <div className="bg-emerald-100 p-3 rounded-full border border-emerald-300">
             <Medal className="w-8 h-8 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Season Result</div>
            <div className="text-xl font-bold text-slate-900">{summary.accomplishment}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
            <Star className="w-3 h-3 mr-1" /> Key Metrics
          </div>
          <div className="grid grid-cols-2 gap-3">
            {summary.keyStats.map((stat, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-slate-300 shadow-sm text-sm font-medium text-slate-800">
                {stat}
              </div>
            ))}
          </div>
        </div>

        {/* Board/AD Feedback */}
        <div className="bg-slate-100 p-4 rounded border-l-4 border-slate-800">
           <div className="flex items-center space-x-2 mb-2">
             <UserCheck className="w-4 h-4 text-slate-600" />
             <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Evaluation</span>
           </div>
           <p className="font-serif italic text-slate-700 leading-relaxed">
             "{summary.boardFeedback}"
           </p>
        </div>
        
      </div>

      <div className="bg-slate-300 p-2 text-center">
         <span className="text-[10px] font-mono text-slate-500 uppercase">End of Report // {summary.year}</span>
      </div>
    </div>
  );
};

export default SeasonSummary;