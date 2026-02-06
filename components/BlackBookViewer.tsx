
import React, { useState, useMemo } from 'react';
import { BlackBookEntry } from '../types';
import { Search, Filter, Skull, User, Users, Mic2, Briefcase, BookOpen, Clock, MapPin } from 'lucide-react';

interface Props {
  entries: BlackBookEntry[];
}

const BlackBookViewer: React.FC<Props> = ({ entries }) => {
  const [filterRole, setFilterRole] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchRole = filterRole === 'All' || entry.role === filterRole;
      const matchSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          entry.history.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [entries, filterRole, searchTerm]);

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'Player': return <User className="w-4 h-4 text-blue-400" />;
      case 'Coach': return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case 'Admin': return <Users className="w-4 h-4 text-slate-400" />;
      case 'Media': return <Mic2 className="w-4 h-4 text-purple-400" />;
      case 'Booster': return <Skull className="w-4 h-4 text-amber-400" />;
      default: return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Retired': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Deceased': return 'bg-slate-900 text-slate-600 border-slate-800 decoration-line-through';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const getRelationshipColor = (score: number) => {
      if (score < 20) return 'bg-red-600';
      if (score < 40) return 'bg-red-400';
      if (score < 60) return 'bg-slate-400';
      if (score < 80) return 'bg-blue-400';
      return 'bg-emerald-500';
  };

  const getRelationshipLabel = (score: number) => {
      if (score < 20) return 'NEMESIS';
      if (score < 40) return 'RIVAL';
      if (score < 60) return 'NEUTRAL';
      if (score < 80) return 'ALLY';
      return 'LOYALIST';
  };

  return (
    // Removed overflow-y-auto and flex-1. This is now just a container.
    <div className="w-full p-6">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3 mb-2">
            <BookOpen className="w-8 h-8 text-slate-200" />
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">The Black Book</h1>
          </div>
          <p className="text-slate-500 text-sm max-w-xl">
            A private dossier of key figures encountered throughout your career. 
            Their lives continue even when you aren't watching.
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 bg-slate-900 z-10 py-2 shadow-sm">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search by name or history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none transition-all"
              />
           </div>
           
           <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
             <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
             {['All', 'Coach', 'Player', 'Admin', 'Media', 'Booster'].map(role => (
               <button
                 key={role}
                 onClick={() => setFilterRole(role)}
                 className={`
                   px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap
                   ${filterRole === role 
                     ? 'bg-slate-200 text-slate-900' 
                     : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300'}
                 `}
               >
                 {role}
               </button>
             ))}
           </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
           {filteredEntries.map((entry) => (
             <div 
               key={entry.id} 
               className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-600 transition-colors group relative overflow-hidden flex flex-col"
             >
                {/* Dossier Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
                         {getRoleIcon(entry.role)}
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-200 text-lg leading-none">{entry.name}</h3>
                         <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-xs font-mono text-slate-500 uppercase">{entry.role}</span>
                             {entry.currentTeam && (
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-900/20 px-1.5 rounded flex items-center">
                                    <MapPin className="w-2.5 h-2.5 mr-0.5" />
                                    {entry.currentTeam}
                                </span>
                             )}
                         </div>
                      </div>
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(entry.status)}`}>
                      {entry.status}
                   </span>
                </div>

                {/* Relationship Meter */}
                <div className="relative z-10 mb-4 bg-slate-950 p-2 rounded border border-slate-800">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Relationship</span>
                        <span className={`text-[10px] font-bold uppercase ${getRelationshipColor(entry.relationshipScore).replace('bg-', 'text-')}`}>
                            {getRelationshipLabel(entry.relationshipScore)}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${getRelationshipColor(entry.relationshipScore)}`}
                            style={{ width: `${entry.relationshipScore}%` }}
                        ></div>
                    </div>
                </div>

                {/* History Text */}
                <div className="relative z-10 mb-4 bg-black/20 p-3 rounded border border-white/5 flex-grow">
                   <p className="text-sm text-slate-400 font-serif leading-relaxed">
                      "{entry.history}"
                   </p>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 relative z-10 mt-auto">
                   <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>Last Seen: {entry.lastSeenYear}</span>
                   </div>
                   <span className="text-[10px] text-slate-700 font-mono uppercase tracking-widest">ID: {entry.id.split('-')[0]}</span>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-800/10 to-transparent rounded-bl-full pointer-events-none"></div>
             </div>
           ))}

           {filteredEntries.length === 0 && (
             <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
                <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                <p className="text-slate-500 font-mono text-sm">No records found in the Black Book.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default BlackBookViewer;
