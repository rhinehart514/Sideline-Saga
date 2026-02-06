
import React, { useState, useMemo } from 'react';
import { CareerLog, Connection, TeamStats } from '../types';
import { X, User, Briefcase, Users, Trophy, Filter, Search, Shield, HeartHandshake, Skull, Calendar, Sprout, GraduationCap, BarChart3, TrendingUp, TrendingDown, Crown } from 'lucide-react';

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
  record: string; // Aggregate record for this specific tenure if possible
  seasons: CareerLog[]; // Store full logs to show stats per year
}

const CareerWikibox: React.FC<Props> = ({ history, network = [], currentRole, currentTeam, age, currentYear, onClose }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'network'>('history');
  
  // Network Filters
  const [loyaltyFilter, setLoyaltyFilter] = useState<string>('All');
  const [relationSearch, setRelationSearch] = useState<string>('');

  // Calculate Birth Year dynamically based on current game state
  const birthYear = currentYear - age;

  // Group History Logic
  const tenures = useMemo(() => {
    if (history.length === 0) return [];
    const groups: Tenure[] = [];
    
    let current: Tenure | null = null;

    history.forEach((log) => {
      if (!current) {
        current = {
          startYear: log.year,
          endYear: log.year,
          team: log.team,
          role: log.role,
          record: log.record,
          seasons: [log]
        };
      } else {
        // If team and role match, extend tenure
        if (log.team === current.team && log.role === current.role) {
          current.endYear = log.year;
          current.seasons.push(log);
          // Update record to latest season record (User might want cumulative, but log stores season. 
          // For visualization, we keep the season logs array)
        } else {
          groups.push(current);
          current = {
            startYear: log.year,
            endYear: log.year,
            team: log.team,
            role: log.role,
            record: log.record,
            seasons: [log]
          };
        }
      }
    });
    if (current) groups.push(current);
    
    // Reverse to show newest first
    return groups.reverse();
  }, [history]);

  // Derived Network Data
  const filteredNetwork = useMemo(() => {
    return network.filter(person => {
      const matchLoyalty = loyaltyFilter === 'All' || person.loyalty === loyaltyFilter;
      const matchSearch = !relationSearch || 
                          person.relation.toLowerCase().includes(relationSearch.toLowerCase()) || 
                          person.name.toLowerCase().includes(relationSearch.toLowerCase());
      return matchLoyalty && matchSearch;
    });
  }, [network, loyaltyFilter, relationSearch]);

  const splitNetwork = useMemo(() => {
     const mentors: Connection[] = [];
     const tree: Connection[] = []; // Former assistants, players, etc.
     
     filteredNetwork.forEach(p => {
         const rel = p.relation.toLowerCase();
         if (rel.includes('boss') || rel.includes('ad') || rel.includes('mentor') || rel.includes('hired you')) {
             mentors.push(p);
         } else {
             tree.push(p);
         }
     });
     return { mentors, tree };
  }, [filteredNetwork]);

  const getLoyaltyIcon = (level: string) => {
    switch(level) {
        case 'High': return <HeartHandshake className="w-4 h-4 text-emerald-600" />;
        case 'Medium': return <Users className="w-4 h-4 text-blue-600" />;
        case 'Low': return <Shield className="w-4 h-4 text-amber-600" />;
        case 'Rival': return <Skull className="w-4 h-4 text-red-600" />;
        default: return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const getHCRecord = () => {
    let wins = 0;
    let losses = 0;
    let ties = 0;
    history.forEach(log => {
        // STRICT FILTER: Only count HC roles for the Topline Career Record
        const r = log.role.toLowerCase();
        if ((r.includes('head coach') && !r.includes('assistant head')) || r === 'hc' || r.includes('interim hc')) {
            const parts = log.record.split(/[-–]/).map(s => parseInt(s.trim(), 10));
            if (!isNaN(parts[0])) wins += parts[0];
            if (!isNaN(parts[1])) losses += parts[1];
            if (parts.length > 2 && !isNaN(parts[2])) ties += parts[2];
        }
    });
    return `${wins}-${losses}${ties > 0 ? `-${ties}` : ''}`;
  };

  const getRankColor = (rankStr?: string) => {
    if (!rankStr) return 'text-slate-400';
    const rank = parseInt(rankStr.replace('#', ''));
    if (isNaN(rank)) return 'text-slate-400'; 
    if (rank <= 10) return 'text-emerald-600 font-bold';
    if (rank <= 25) return 'text-amber-600 font-bold';
    return 'text-slate-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-50 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="bg-slate-200 border-b border-slate-300 p-6 flex justify-between items-start">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-32 bg-slate-300 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
               <User className="w-12 h-12 text-slate-400" />
            </div>
            <div>
               <h2 className="text-3xl font-serif font-bold text-slate-900 leading-none mb-2">Jacob Rhinehart</h2>
               <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                     <span className="font-bold w-28">Born:</span>
                     <span>{birthYear} (Age {age})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <span className="font-bold w-28">Current Role:</span>
                     <span className="flex items-center">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {currentRole} at {currentTeam}
                     </span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <span className="font-bold w-28">HC Record:</span>
                     <span className="font-mono bg-slate-800 text-white px-1.5 rounded text-xs flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        {getHCRecord()}
                     </span>
                  </div>
               </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-300 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-300 bg-white">
           <button 
             onClick={() => setActiveTab('history')}
             className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors
               ${activeTab === 'history' ? 'border-b-4 border-emerald-600 text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'}
             `}
           >
             <Calendar className="w-4 h-4" />
             <span>Career Log</span>
           </button>
           <button 
             onClick={() => setActiveTab('network')}
             className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors
               ${activeTab === 'network' ? 'border-b-4 border-blue-600 text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}
             `}
           >
             <Users className="w-4 h-4" />
             <span>Coaching Tree ({network.length})</span>
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6 custom-scrollbar">
           
           {/* HISTORY VIEW */}
           {activeTab === 'history' && (
             <div className="space-y-4">
                {tenures.map((tenure, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                     {/* Tenure Header */}
                     <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-slate-800">{tenure.team}</h3>
                            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded text-slate-600 uppercase border border-slate-200">{tenure.role}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500">
                           {tenure.startYear === tenure.endYear ? tenure.startYear : `${tenure.startYear}-${tenure.endYear}`}
                        </div>
                     </div>

                     {/* Seasons Table */}
                     <div className="divide-y divide-slate-100">
                        {tenure.seasons.map((season, sIdx) => (
                            <div key={sIdx} className="p-3 text-sm flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4 mb-2 md:mb-0 w-1/3">
                                    <span className="font-mono font-bold text-slate-400 w-10">{season.year}</span>
                                    <span className="font-bold text-slate-900 w-16">{season.record}</span>
                                    <span className="text-slate-600 truncate flex-1">{season.result}</span>
                                </div>
                                
                                {/* Historical Stats Snapshot */}
                                {season.statsSnapshot ? (
                                    <div className="flex items-center gap-4 text-xs font-mono">
                                        <div className="flex items-center gap-1" title="Offensive Rank">
                                            <TrendingUp className="w-3 h-3 text-slate-400" />
                                            <span className={getRankColor(season.statsSnapshot.offRank)}>Off: {season.statsSnapshot.offRank}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Defensive Rank">
                                            <Shield className="w-3 h-3 text-slate-400" />
                                            <span className={getRankColor(season.statsSnapshot.defRank)}>Def: {season.statsSnapshot.defRank}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="AP Poll Rank">
                                            <Trophy className="w-3 h-3 text-slate-400" />
                                            <span className={getRankColor(season.statsSnapshot.apRank)}>AP: {season.statsSnapshot.apRank}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic">No detailed stats archived</div>
                                )}
                            </div>
                        ))}
                     </div>
                  </div>
                ))}
                
                {tenures.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No career history logged yet.</p>
                  </div>
                )}
             </div>
           )}

           {/* NETWORK VIEW */}
           {activeTab === 'network' && (
             <div className="h-full flex flex-col">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search contacts..." 
                      value={relationSearch}
                      onChange={(e) => setRelationSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                     <Filter className="w-4 h-4 text-slate-500" />
                     <select 
                       value={loyaltyFilter}
                       onChange={(e) => setLoyaltyFilter(e.target.value)}
                       className="bg-white border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                     >
                       <option value="All">All Relations</option>
                       <option value="High">High Loyalty</option>
                       <option value="Medium">Medium Loyalty</option>
                       <option value="Low">Low Loyalty</option>
                       <option value="Rival">Rivals</option>
                     </select>
                  </div>
                </div>

                <div className="space-y-6">
                    {/* Mentors Section */}
                    {splitNetwork.mentors.length > 0 && (
                        <div>
                             <h4 className="flex items-center space-x-2 text-sm font-bold uppercase text-slate-500 mb-3 border-b border-slate-300 pb-1">
                                <GraduationCap className="w-4 h-4" />
                                <span>Mentors & Bosses</span>
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {splitNetwork.mentors.map((person, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-lg shadow-sm border border-slate-200 flex items-start space-x-3">
                                        <div className={`p-2 rounded-full flex-shrink-0 bg-white border border-slate-100`}>
                                            {getLoyaltyIcon(person.loyalty)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-900 truncate pr-2">{person.name}</h4>
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border whitespace-nowrap
                                                    ${person.loyalty === 'High' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}
                                                    ${person.loyalty === 'Rival' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                                                    ${person.loyalty === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                                                `}>
                                                    {person.loyalty}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-bold mb-0.5">{person.currentRole}</p>
                                            <p className="text-xs text-slate-400 italic truncate">{person.relation}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {/* Coaching Tree Section */}
                    {splitNetwork.tree.length > 0 && (
                        <div>
                             <h4 className="flex items-center space-x-2 text-sm font-bold uppercase text-slate-500 mb-3 border-b border-slate-300 pb-1">
                                <Sprout className="w-4 h-4 text-emerald-600" />
                                <span>Coaching Tree</span>
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {splitNetwork.tree.map((person, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-start space-x-3 hover:shadow-md transition-shadow">
                                        <div className={`p-2 rounded-full flex-shrink-0 bg-slate-50`}>
                                            {getLoyaltyIcon(person.loyalty)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-900 truncate pr-2">{person.name}</h4>
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border whitespace-nowrap
                                                    ${person.loyalty === 'High' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}
                                                    ${person.loyalty === 'Rival' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                                                    ${person.loyalty === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                                                    ${person.loyalty === 'Low' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
                                                `}>
                                                    {person.loyalty}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-bold mb-0.5">{person.currentRole}</p>
                                            <p className="text-xs text-slate-400 italic truncate">{person.relation}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {filteredNetwork.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No connections found matching filters.</p>
                        </div>
                    )}
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default CareerWikibox;
