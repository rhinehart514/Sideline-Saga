
import React, { useState } from 'react';
import { JobOffer } from '../types';
import { PenTool, DollarSign, Briefcase, Shield, Building2, Calendar, Star, Thermometer, X, Check, ArrowRight, HelpCircle, Siren, UserPlus, Eye, Search, AlertTriangle, Users, Heart, Zap } from 'lucide-react';
import { getTeamDetails } from '../data/teams';

interface Props {
  offers: JobOffer[];
  onAction?: (offerId: string, actionType: 'accept' | 'negotiate' | 'decline', detail?: string) => void;
}

const JobOfferDisplay: React.FC<Props> = ({ offers, onAction }) => {
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);

  if (!offers || offers.length === 0) return null;

  const getPatienceColor = (patience?: string) => {
    switch(patience) {
      case 'High': return 'text-emerald-500 bg-emerald-100 border-emerald-300';
      case 'Medium': return 'text-amber-500 bg-amber-100 border-amber-300';
      case 'Low': return 'text-red-500 bg-red-100 border-red-300';
      case 'Zero': return 'text-slate-500 bg-slate-200 border-slate-300';
      default: return 'text-emerald-500 bg-emerald-100 border-emerald-300';
    }
  };

  const getPatienceLabel = (patience?: string) => {
    switch(patience) {
      case 'High': return 'AD Patience: Stable';
      case 'Medium': return 'AD Patience: Waning';
      case 'Low': return 'AD Patience: Critical';
      case 'Zero': return 'Offer Rescinded';
      default: return 'AD Patience: Stable';
    }
  };

  const getPerceptionColor = (perception: string, type: 'fan' | 'staff') => {
      // Logic for color coding perceptions
      const p = perception.toLowerCase();
      if (p.includes('home run') || p.includes('safe') || p.includes('fit') || p.includes('solid')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      if (p.includes('gamble') || p.includes('who') || p.includes('cheap')) return 'text-amber-600 bg-amber-50 border-amber-200';
      if (p.includes('outrage') || p.includes('desperation') || p.includes('underwhelming')) return 'text-red-600 bg-red-50 border-red-200';
      return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getRosterHealthColor = (level: string) => {
      if (level === 'Elite' || level === 'Strong') return 'text-emerald-400';
      if (level === 'Good' || level === 'Average') return 'text-blue-400';
      if (level === 'Fragile') return 'text-amber-400';
      return 'text-red-400';
  };

  const handleNegotiateClick = (offerId: string) => {
    setNegotiatingId(offerId);
  };

  return (
    <div className="my-8 animate-fade-in">
      <div className="flex items-center space-x-2 mb-4">
        <Briefcase className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Negotiations</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => {
          const isNFL = offer.conference.includes('NFL') || offer.conference.includes('NFC') || offer.conference.includes('AFC');
          const isNegotiating = offer.status === 'Negotiating';
          const isFinal = offer.status === 'Final Offer';
          const isRescinded = offer.status === 'Rescinded';
          const isInterviewing = offer.status === 'Interviewing';
          const isUserNegotiating = negotiatingId === offer.id;

          const teamData = getTeamDetails(offer.team);
          const primaryColor = teamData.colors.primary;
          const secondaryColor = teamData.colors.secondary;
          
          return (
            <div 
              key={offer.id} 
              className={`
                relative rounded-sm p-1 shadow-2xl transform transition-transform duration-300
                ${isNFL ? 'bg-slate-800' : 'bg-white'}
                ${isFinal ? 'ring-4 ring-red-500/50' : ''}
                ${isRescinded ? 'grayscale opacity-75' : ''}
              `}
              style={!isNFL ? { backgroundColor: secondaryColor } : {}}
            >
              <div className={`
                h-full relative overflow-hidden p-6 border-2 flex flex-col
                ${isNFL ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-900'}
              `}>
                
                {/* Background Styling */}
                {isNFL ? (
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Building2 className="w-32 h-32 text-white" />
                  </div>
                ) : (
                  <>
                    <div className="absolute top-0 right-0 w-24 h-24 transform rotate-45 translate-x-12 -translate-y-12 opacity-80 pointer-events-none" style={{ backgroundColor: primaryColor }}></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-20 pointer-events-none"></div>
                  </>
                )}

                {/* Status Badges Row */}
                <div className="relative z-10 flex flex-wrap gap-2 mb-6 mt-1">
                  <span className={`
                     px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded shadow-sm flex items-center
                     ${offer.status === 'New' ? 'bg-emerald-500 text-white' : ''}
                     ${offer.status === 'Negotiating' ? 'bg-amber-500 text-white' : ''}
                     ${offer.status === 'Final Offer' ? 'bg-red-600 text-white' : ''}
                     ${offer.status === 'Rescinded' ? 'bg-slate-700 text-slate-400' : ''}
                     ${offer.status === 'Interviewing' ? 'bg-purple-600 text-white' : ''}
                  `}>
                    {offer.status}
                  </span>
                  
                  {(isNegotiating || isFinal || isInterviewing) && (
                    <div className={`
                       px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border
                       flex items-center gap-1
                       ${getPatienceColor(offer.adPatience)}
                    `}>
                        <Thermometer className="w-3 h-3" />
                        {getPatienceLabel(offer.adPatience).replace('AD Patience: ', '')}
                    </div>
                  )}
                </div>

                {/* Header */}
                <div className="relative z-10 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isNFL ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isNFL ? 'League Office' : 'Athletic Dept'}
                      </span>
                      <h4 
                        className={`text-2xl font-black uppercase tracking-tight leading-none mt-1 ${isNFL ? 'text-white' : ''} ${isRescinded ? 'line-through decoration-red-500 decoration-4' : ''}`}
                        style={!isNFL && !isRescinded ? { color: primaryColor } : {}}
                      >
                        {offer.team}
                      </h4>
                    </div>
                    {isNFL ? <Shield className="w-8 h-8 text-slate-500" /> : (
                         <div 
                           className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xs"
                           style={{ backgroundColor: primaryColor, borderColor: secondaryColor, color: secondaryColor }}
                        >
                            {offer.team.substring(0, 1)}
                        </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                     <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${isNFL ? 'bg-blue-900 text-blue-200' : 'bg-slate-200 text-slate-600'}`}>
                       {offer.conference}
                     </span>
                     <span className={`text-[10px] font-bold uppercase tracking-wider ${isNFL ? 'text-emerald-400' : 'text-amber-600'}`}>
                       {offer.prestige}
                     </span>
                  </div>
                </div>

                {/* Market Buzz (New) */}
                {offer.marketBuzz && (
                    <div className={`mb-4 p-2 rounded border-l-2 text-xs font-serif italic ${isNFL ? 'bg-slate-900/50 border-slate-500 text-slate-400' : 'bg-white/50 border-slate-400 text-slate-600'}`}>
                        <span className="not-italic font-bold uppercase text-[9px] text-slate-500 block mb-0.5">The Word on the Street:</span>
                        "{offer.marketBuzz}"
                    </div>
                )}

                {/* --- NEW SECTION: Perception Tug of War --- */}
                {offer.staffPerception && offer.fanPerception && (
                    <div className="relative z-10 mb-4 grid grid-cols-2 gap-2">
                        <div className={`p-2 rounded border flex flex-col items-center text-center ${getPerceptionColor(offer.staffPerception, 'staff')}`}>
                            <span className="text-[9px] uppercase font-black opacity-50 block mb-0.5">Admin View</span>
                            <div className="flex items-center gap-1 font-bold text-[10px] leading-tight">
                                <Building2 className="w-3 h-3" />
                                {offer.staffPerception}
                            </div>
                        </div>
                        <div className={`p-2 rounded border flex flex-col items-center text-center ${getPerceptionColor(offer.fanPerception, 'fan')}`}>
                            <span className="text-[9px] uppercase font-black opacity-50 block mb-0.5">Public View</span>
                            <div className="flex items-center gap-1 font-bold text-[10px] leading-tight">
                                <Users className="w-3 h-3" />
                                {offer.fanPerception}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- NEW SECTION: Scouting Report (Roster Snapshot) --- */}
                {offer.rosterSnapshot && (
                     <div className={`relative z-10 mb-4 p-3 rounded border ${isNFL ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
                        <span className="text-[10px] font-black uppercase text-slate-500 block mb-2 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Scouting Report
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-200">
                             <div>
                                <span className="block text-[9px] text-slate-400 uppercase font-bold">Talent</span>
                                <span className={`block text-xs font-black ${getRosterHealthColor(offer.rosterSnapshot.talentLevel)}`}>
                                    {offer.rosterSnapshot.talentLevel}
                                </span>
                             </div>
                             <div>
                                <span className="block text-[9px] text-slate-400 uppercase font-bold">Culture</span>
                                <span className={`block text-xs font-black ${getRosterHealthColor(offer.rosterSnapshot.cultureHealth)}`}>
                                    {offer.rosterSnapshot.cultureHealth}
                                </span>
                             </div>
                             <div>
                                <span className="block text-[9px] text-slate-400 uppercase font-bold">Crit. Need</span>
                                <span className={`block text-xs font-black text-slate-600`}>
                                    {offer.rosterSnapshot.primaryNeed}
                                </span>
                             </div>
                        </div>
                     </div>
                )}


                {/* Terms */}
                <div className={`space-y-2 mb-4 relative z-10 border-t border-b py-3 ${isNFL ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                     <span className={`text-xs font-bold uppercase ${isNFL ? 'text-slate-500' : 'text-slate-400'}`}>Role</span>
                     <span className={`font-mono font-bold ${isNFL ? 'text-white' : 'text-slate-800'}`}>{offer.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className={`text-xs font-bold uppercase ${isNFL ? 'text-slate-500' : 'text-slate-400'}`}>Salary</span>
                     <div className="flex items-center text-emerald-600 font-mono font-bold">
                        <DollarSign className="w-3 h-3 mr-0.5" />
                        {offer.salary}
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className={`text-xs font-bold uppercase ${isNFL ? 'text-slate-500' : 'text-slate-400'}`}>Length</span>
                     <div className="flex items-center text-slate-500 font-mono font-bold">
                        <Calendar className="w-3 h-3 mr-1" />
                        {offer.contractLength}
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className={`text-xs font-bold uppercase ${isNFL ? 'text-slate-500' : 'text-slate-400'}`}>Buyout</span>
                     <div className="flex items-center text-red-500 font-mono font-bold">
                        <span className="text-[10px] mr-1">EXIT FEE</span>
                        {offer.buyout}
                     </div>
                  </div>
                </div>

                {/* Perks Section */}
                {offer.perks && offer.perks.length > 0 && (
                   <div className="mb-4 relative z-10">
                      <span className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${isNFL ? 'text-slate-500' : 'text-slate-400'}`}>Included Perks</span>
                      <div className="flex flex-wrap gap-2">
                         {offer.perks.map((perk, idx) => (
                           <div key={idx} className={`flex items-center text-xs px-2 py-1 rounded border ${isNFL ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-300 bg-white text-slate-600'}`}>
                              <Star className="w-3 h-3 mr-1 text-amber-500" />
                              {perk}
                           </div>
                         ))}
                      </div>
                   </div>
                )}

                <div className="flex-grow"></div>

                {/* ACTION AREA */}
                {!isRescinded && onAction && (
                   <div className="relative z-20 mt-4 border-t pt-4 border-slate-300/50">
                      
                      {isUserNegotiating ? (
                         <div className="space-y-2 animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                               <div className="flex items-center space-x-1">
                                   <span className="text-[10px] font-bold uppercase text-slate-500">Select Counter-Offer</span>
                                   <div className="group relative">
                                        <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-slate-200 text-[10px] p-2 rounded shadow-xl hidden group-hover:block z-50">
                                            Negotiating risks AD patience. High leverage (good record) improves success chances.
                                        </div>
                                   </div>
                               </div>
                               <button onClick={() => setNegotiatingId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                               <button 
                                 onClick={() => onAction(offer.id, 'negotiate', 'Asking for Higher Salary')}
                                 className="flex items-center justify-center p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-emerald-700 text-xs font-bold transition-colors"
                               >
                                  <DollarSign className="w-3 h-3 mr-1" /> Money
                               </button>
                               <button 
                                 onClick={() => onAction(offer.id, 'negotiate', 'Asking for More Job Security (Years)')}
                                 className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-700 text-xs font-bold transition-colors"
                               >
                                  <Shield className="w-3 h-3 mr-1" /> Security
                               </button>
                               <button 
                                 onClick={() => onAction(offer.id, 'negotiate', 'Asking for Lower Buyout')}
                                 className="flex items-center justify-center p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-amber-700 text-xs font-bold transition-colors"
                               >
                                  <ArrowRight className="w-3 h-3 mr-1" /> Buyout
                               </button>
                               <button 
                                 onClick={() => onAction(offer.id, 'negotiate', 'Asking for Larger Staff Pool')}
                                 className="flex items-center justify-center p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-purple-700 text-xs font-bold transition-colors"
                               >
                                  <Briefcase className="w-3 h-3 mr-1" /> Staff
                               </button>
                            </div>
                         </div>
                      ) : (
                         <div className="flex space-x-2">
                            <button 
                               onClick={() => onAction(offer.id, 'accept')}
                               className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded font-bold text-xs uppercase flex items-center justify-center shadow-md transition-colors"
                            >
                               {isInterviewing ? <><Calendar className="w-4 h-4 mr-1" /> Attend</> : <><Check className="w-4 h-4 mr-1" /> Accept</>}
                            </button>
                            
                            {!isFinal && !isInterviewing && (
                              <button 
                                 onClick={() => handleNegotiateClick(offer.id)}
                                 className="flex-1 bg-amber-500 hover:bg-amber-400 text-white py-2 rounded font-bold text-xs uppercase flex items-center justify-center shadow-md transition-colors"
                              >
                                 <PenTool className="w-4 h-4 mr-1" /> Negotiate
                              </button>
                            )}

                            <button 
                               onClick={() => onAction(offer.id, 'decline')}
                               className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded font-bold text-xs uppercase flex items-center justify-center transition-colors"
                               title="Decline Offer"
                            >
                               <X className="w-4 h-4" />
                            </button>
                         </div>
                      )}
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobOfferDisplay;
