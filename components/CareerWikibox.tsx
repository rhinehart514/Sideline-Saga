import React, { useState, useMemo } from 'react';
import { CareerLog, Connection } from '../types';
import { X, User, Briefcase, Users, Trophy } from 'lucide-react';

interface Props {
  history: CareerLog[];
  network: Connection[];
  currentRole: string;
  currentTeam: string;
  age: number;
  currentYear: number;
  onClose: () => void;
}

interface Tenure {
  startYear: number;
  endYear: number;
  team: string;
  role: string;
  achievements: string[];
}

const CareerWikibox: React.FC<Props> = ({ history, network = [], currentRole, currentTeam, age, currentYear, onClose }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'network'>('history');

  // Calculate Birth Year dynamically based on current game state
  const birthYear = currentYear - age;

  // Group History Logic
  const tenures = useMemo(() => {
    if (history.length === 0) return [];
    const groups: Tenure[] = [];
    
    let current: Tenure | null = null;

    history.forEach((log) => {
      // Extract main result keywords for display
      const notableResult = log.result.toLowerCase().match(/(champion|bowl|playoff|fired|promoted)/i) 
        ? log.result 
        : null;

      if (!current) {
        current = {
          startYear: log.year,
          endYear: log.year,
          team: log.team,
          role: log.role,
          achievements: notableResult ? [`${log.year}: ${notableResult}`] : []
        };
      } else {
        // If team and role match, extend tenure
        if (log.team === current.team && log.role === current.role) {
          current.endYear = log.year;
          if (notableResult) {
             current.achievements.push(`${log.year}: ${notableResult}`);
          }
        } else {
          groups.push(current);
          current = {
            startYear: log.year,
            endYear: log.year,
            team: log.team,
            role: log.role,
            achievements: notableResult ? [`${log.year}: ${notableResult}`] : []
          };
        }
      }
    });
    if (current) groups.push(current);
    
    // Add "Current" if the last history log is older than current year or if history is empty but game started
    // Actually, usually history updates at end of season. 
    // If current year > last log year, we show "Present" for current role?
    // For simplicity, we just list completed seasons in history, and show "Current" in the header.
    
    return groups;
  }, [history]);

  const getLoyaltyColor = (level: string) => {
    switch(level) {
        case 'High': return 'text-emerald-600 bg-emerald-100';
        case 'Medium': return 'text-blue-600 bg-blue-100';
        case 'Low': return 'text-amber-600 bg-amber-100';
        case 'Rival': return 'text-red-600 bg-red-100';
        default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-white text-slate-900 shadow-2xl max-w-lg w-full border border-slate-400 relative max-h-[90vh] flex flex-col rounded-sm overflow-hidden">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-2 right-2 bg-slate-100 text-slate-500 hover:text-red-500 p-1.5 rounded-full hover:bg-slate-200 transition-colors z-50"
        >
            <X className="w-5 h-5" />
        </button>

        {/* Header Content */}
        <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h3 className="font-serif font-bold text-3xl leading-tight text-slate-900">Jacob Rhinehart</h3>
            <p className="text-sm text-slate-600 mt-1">American football coach</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-300 bg-white text-sm">
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 px-4 font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
                <Briefcase className="w-4 h-4" />
                <span>Career</span>
            </button>
            <button 
                onClick={() => setActiveTab('network')}
                className={`flex-1 py-3 px-4 font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors border-b-2 ${activeTab === 'network' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
                <Users className="w-4 h-4" />
                <span>Connections</span>
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-0">
            
            {/* TAB: HISTORY (Infobox Style) */}
            {activeTab === 'history' && (
                <div className="flex flex-col md:flex-row">
                    {/* Infobox Sidebar (Wikipedia Style) */}
                    <div className="w-full md:w-5/12 bg-[#f8f9fa] border-b md:border-b-0 md:border-r border-[#a2a9b1] p-4 text-sm leading-snug">
                         <div className="mb-4 text-center">
                            <div className="w-24 h-24 mx-auto bg-slate-200 rounded border border-slate-300 flex items-center justify-center text-slate-400 mb-2">
                                <User className="w-12 h-12" />
                            </div>
                            <div className="font-bold text-slate-900">Jacob Rhinehart</div>
                         </div>
                         
                         <h4 className="bg-[#eaecf0] font-bold text-center border-t border-b border-[#a2a9b1] py-1 mb-2">Personal information</h4>
                         <div className="grid grid-cols-[1fr,2fr] gap-x-2 gap-y-1 mb-3">
                             <div className="font-bold text-slate-700">Born</div>
                             <div>{birthYear} (age {age})</div>
                         </div>

                         <h4 className="bg-[#eaecf0] font-bold text-center border-t border-b border-[#a2a9b1] py-1 mb-2">Career information</h4>
                         <div className="grid grid-cols-[1fr,2fr] gap-x-2 gap-y-1 mb-3">
                             <div className="font-bold text-slate-700">Current team</div>
                             <div>{currentTeam}</div>
                             <div className="font-bold text-slate-700">Position</div>
                             <div>{currentRole}</div>
                         </div>

                         <h4 className="bg-[#eaecf0] font-bold text-center border-t border-b border-[#a2a9b1] py-1 mb-2">Career history</h4>
                         <div className="space-y-1">
                             {tenures.length === 0 ? (
                                <div className="text-slate-500 italic text-xs">No history yet</div>
                             ) : (
                                 tenures.map((t, i) => (
                                     <div key={i} className="grid grid-cols-[auto,1fr] gap-x-2 text-xs">
                                         <div className="font-mono text-slate-600 whitespace-nowrap">
                                             {t.startYear === t.endYear ? t.startYear : `${t.startYear}–${t.endYear}`}
                                         </div>
                                         <div>
                                             <span className="font-bold">{t.team}</span>
                                             <span className="block text-slate-500 text-[10px]">{t.role}</span>
                                         </div>
                                     </div>
                                 ))
                             )}
                              {/* Current Job Entry (Projected) */}
                             <div className="grid grid-cols-[auto,1fr] gap-x-2 text-xs mt-1 bg-blue-50/50 p-1 -mx-1 rounded">
                                 <div className="font-mono text-blue-600 whitespace-nowrap">
                                     {currentYear}–
                                 </div>
                                 <div>
                                     <span className="font-bold text-slate-900">{currentTeam}</span>
                                     <span className="block text-slate-500 text-[10px]">{currentRole}</span>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Main Content: Detailed Stats Table */}
                    <div className="flex-1 p-4">
                        <h4 className="font-serif font-bold text-lg border-b border-slate-300 pb-1 mb-3 text-slate-800">Head coaching record</h4>
                        
                        <div className="overflow-x-auto border border-slate-300 shadow-sm">
                            <table className="w-full text-xs text-left border-collapse bg-white">
                                <thead className="bg-[#eaecf0]">
                                    <tr>
                                        <th className="p-2 border border-slate-300 font-bold w-12 text-center">Year</th>
                                        <th className="p-2 border border-slate-300 font-bold">Team</th>
                                        <th className="p-2 border border-slate-300 font-bold">Role</th>
                                        <th className="p-2 border border-slate-300 font-bold text-center">Rec</th>
                                        <th className="p-2 border border-slate-300 font-bold">Bowl/Playoffs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr><td colSpan={5} className="p-6 text-center text-slate-500 italic">No completed seasons.</td></tr>
                                    ) : (
                                        history.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors border-b border-slate-200">
                                                <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-700">{log.year}</td>
                                                <td className="p-2 border-r border-slate-200 font-bold text-slate-900">{log.team}</td>
                                                <td className="p-2 border-r border-slate-200 text-slate-600">{log.role}</td>
                                                <td className="p-2 border-r border-slate-200 text-center font-mono">{log.record}</td>
                                                <td className="p-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${log.result.toLowerCase().includes('fired') ? 'bg-red-100 text-red-700' : (log.result.toLowerCase().includes('champion') || log.result.toLowerCase().includes('bowl win')) ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {log.result}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start space-x-2">
                             <Trophy className="w-4 h-4 flex-shrink-0 mt-0.5" />
                             <div>
                                <span className="font-bold">Career Highlights:</span>
                                <ul className="list-disc list-inside mt-1 space-y-0.5 ml-1">
                                    {tenures.flatMap(t => t.achievements).length > 0 ? (
                                        tenures.flatMap(t => t.achievements).map((a, i) => (
                                            <li key={i}>{a}</li>
                                        ))
                                    ) : (
                                        <span className="italic opacity-75 ml-1">None yet.</span>
                                    )}
                                </ul>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: NETWORK */}
            {activeTab === 'network' && (
                <div className="p-4 space-y-3">
                    <div className="bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200 rounded italic mb-4">
                        "The Coaching Tree tracks allies, rivals, and mentors encountered throughout the career."
                    </div>

                    {network.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Users className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Your network is empty.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {network.map((person, idx) => (
                                <div key={idx} className="flex items-start bg-white p-3 rounded border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3 border border-slate-200 group-hover:bg-slate-200 transition-colors">
                                        <User className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-bold text-slate-900 text-sm">{person.name}</h5>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${getLoyaltyColor(person.loyalty)}`}>
                                                {person.loyalty}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-bold uppercase mt-0.5">{person.relation}</div>
                                        <div className="flex items-center mt-2 text-xs text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-100">
                                            <Briefcase className="w-3 h-3 mr-1.5 text-slate-400" />
                                            <span className="font-mono">{person.currentRole}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] border-t border-slate-300 p-2 text-center text-[10px] text-slate-500">
           Last updated: {currentYear}
        </div>
      </div>
    </div>
  );
}

export default CareerWikibox;