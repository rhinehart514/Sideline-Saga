
import React, { useState } from 'react';
import { SaveHeader, EarnedTrait } from '../types';
import { 
  Users, Target, Shield, Swords, 
  Brain, Activity, BarChart3, AlertTriangle, 
  UserCheck, UserX, Briefcase, DollarSign, Wallet,
  Landmark, Clock, FileText,
  Plane, Crown, Zap, Scale, Award, Medal, Fingerprint
} from 'lucide-react';

interface Props {
  header: SaveHeader;
  staffNotes: string;
}

const StrategyRoom: React.FC<Props> = ({ header, staffNotes }) => {
  const { rosterDNA, stats, schemeOffense, schemeDefense, financials, activePromises, staff, philosophy, capital, traits } = header;
  const [activeTab, setActiveTab] = useState<'overview' | 'philosophy'>('overview');

  const getScoreColor = (score: number) => {
    if (score < 30) return 'bg-slate-600';
    if (score < 60) return 'bg-amber-500';
    if (score < 80) return 'bg-emerald-500';
    return 'bg-purple-500';
  };

  const getRatingColor = (score: number) => {
    if (score >= 90) return 'text-purple-400';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getRankColor = (rankStr: string) => {
    const rank = parseInt(rankStr.replace('#', ''));
    if (isNaN(rank)) return 'text-slate-500'; // Unranked
    if (rank <= 10) return 'text-emerald-400';
    if (rank <= 25) return 'text-amber-400';
    return 'text-slate-300';
  };

  const getPromiseStatusColor = (status: string) => {
      switch(status) {
          case 'Active': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
          case 'Fulfilled': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
          case 'Broken': return 'text-red-400 border-red-500/30 bg-red-500/10';
          default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
      }
  };

  const getFlightRisk = (coach: any) => {
     if (coach.ambition === 'High' && coach.playcalling > 80) return { label: 'HIGH FLIGHT RISK', color: 'text-red-500 animate-pulse' };
     if (coach.ambition === 'High') return { label: 'Ambitious', color: 'text-amber-500' };
     if (coach.loyalty === 'High') return { label: 'Locked In', color: 'text-emerald-500' };
     return { label: 'Stable', color: 'text-slate-500' };
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                    <Brain className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">War Room</h1>
                    <p className="text-slate-400 text-sm font-mono">Tactical Overview & Coaching Profile</p>
                </div>
            </div>
            
            <div className="flex space-x-2">
                <button 
                   onClick={() => setActiveTab('overview')}
                   className={`px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                >
                   Overview
                </button>
                <button 
                   onClick={() => setActiveTab('philosophy')}
                   className={`px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'philosophy' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                >
                   <Fingerprint className="w-3 h-3" /> Profile
                </button>
            </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-6">
                {/* TOP ROW: DNA & SCHEME */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Roster DNA Card */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-4 h-4" /> Roster DNA
                        </h3>
                        <h2 className="text-3xl font-black text-white mt-1 uppercase">{rosterDNA.style}</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-500 font-mono block">IDENTITY SCORE</span>
                        <span className="text-2xl font-mono text-emerald-400">{rosterDNA.score}/100</span>
                    </div>
                    </div>

                    {/* DNA Progress Bar */}
                    <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden mb-4 border border-slate-700">
                    <div 
                        className={`h-full ${getScoreColor(rosterDNA.score)} transition-all duration-1000 relative`} 
                        style={{ width: `${rosterDNA.score}%` }}
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                    </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800">
                    <div>
                        <span className="block font-bold text-slate-300 mb-1">Philosophy</span>
                        {rosterDNA.style === 'Developer' && "We prioritize high school recruiting and player development over 3-4 years. High loyalty."}
                        {rosterDNA.style === 'Mercenary' && "We build through the portal. Instant impact, high turnover, low loyalty."}
                        {rosterDNA.style === 'Recruiter' && "Talent acquisition is priority #1. We stack stars and figure out scheme later."}
                        {rosterDNA.style === 'Tactician' && "Scheme fit over stars. We find undervalued players who fit the system perfectly."}
                    </div>
                    <div>
                        <span className="block font-bold text-slate-300 mb-1">Fan Perception</span>
                        {rosterDNA.score > 80 ? "Fans fully embrace this identity." : "Identity is still being established."}
                    </div>
                    </div>
                </div>

                {/* Scheme Card */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Target className="w-4 h-4" /> Schematics
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-4 rounded border border-slate-800 flex flex-col items-center text-center">
                        <Swords className="w-8 h-8 text-amber-500 mb-2" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Offense</span>
                        <span className="text-lg font-black text-white leading-tight">{schemeOffense}</span>
                        <span className={`text-xs font-mono font-bold mt-2 ${getRankColor(stats.offRank)}`}>
                            Rank: {stats.offRank}
                        </span>
                        </div>

                        <div className="bg-slate-900 p-4 rounded border border-slate-800 flex flex-col items-center text-center">
                        <Shield className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Defense</span>
                        <span className="text-lg font-black text-white leading-tight">{schemeDefense}</span>
                        <span className={`text-xs font-mono font-bold mt-2 ${getRankColor(stats.defRank)}`}>
                            Rank: {stats.defRank}
                        </span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between bg-slate-900/80 p-3 rounded border border-slate-700">
                        <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-300 uppercase">QB Situation</span>
                        </div>
                        <span className="text-sm font-mono text-white font-bold">{header.qbSituation}</span>
                    </div>
                </div>

                </div>

                {/* COACHING STAFF */}
                {staff && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {/* OC Card */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                            <div className="flex items-center space-x-2">
                                <Swords className="w-5 h-5 text-amber-500" />
                                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Offensive Coordinator</h3>
                            </div>
                            {staff.oc ? (
                                <div className="flex items-center gap-2">
                                    {getFlightRisk(staff.oc).label === 'HIGH FLIGHT RISK' && (
                                        <Plane className="w-3 h-3 text-red-500 animate-pulse" />
                                    )}
                                    <span className={`text-[10px] font-bold uppercase ${getFlightRisk(staff.oc).color}`}>
                                        {getFlightRisk(staff.oc).label}
                                    </span>
                                </div>
                            ) : <span className="text-xs text-red-500 font-bold uppercase">VACANT</span>}
                        </div>
                        {staff.oc ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="text-xl font-black text-white">{staff.oc.name}</h4>
                                        <span className="text-xs font-mono text-slate-400">{staff.oc.style} • Age {staff.oc.age}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-500 font-bold block">PLAYCALLING</span>
                                        <span className={`text-xl font-black ${getRatingColor(staff.oc.playcalling)}`}>{staff.oc.playcalling}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                        <span className="text-slate-500 font-bold">Recruiting</span>
                                        <span className={getRatingColor(staff.oc.recruiting)}>{staff.oc.recruiting}</span>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                        <span className="text-slate-500 font-bold">Status</span>
                                        <span className="text-white">{staff.oc.status}</span>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                        <span className="text-slate-500 font-bold">Ambition</span>
                                        <span className="text-slate-300">{staff.oc.ambition || 'Medium'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-500 text-sm">
                                Hiring required during Offseason.
                            </div>
                        )}
                    </div>

                    {/* DC Card */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-5 h-5 text-blue-500" />
                                <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Defensive Coordinator</h3>
                            </div>
                            {staff.dc ? (
                                <div className="flex items-center gap-2">
                                    {getFlightRisk(staff.dc).label === 'HIGH FLIGHT RISK' && (
                                        <Plane className="w-3 h-3 text-red-500 animate-pulse" />
                                    )}
                                    <span className={`text-[10px] font-bold uppercase ${getFlightRisk(staff.dc).color}`}>
                                        {getFlightRisk(staff.dc).label}
                                    </span>
                                </div>
                            ) : <span className="text-xs text-red-500 font-bold uppercase">VACANT</span>}
                        </div>
                        {staff.dc ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="text-xl font-black text-white">{staff.dc.name}</h4>
                                        <span className="text-xs font-mono text-slate-400">{staff.dc.style} • Age {staff.dc.age}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-500 font-bold block">PLAYCALLING</span>
                                        <span className={`text-xl font-black ${getRatingColor(staff.dc.playcalling)}`}>{staff.dc.playcalling}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                        <span className="text-slate-500 font-bold">Recruiting</span>
                                        <span className={getRatingColor(staff.dc.recruiting)}>{staff.dc.recruiting}</span>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                        <span className="text-slate-500 font-bold">Status</span>
                                        <span className="text-white">{staff.dc.status}</span>
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                        <span className="text-slate-500 font-bold">Ambition</span>
                                        <span className="text-slate-300">{staff.dc.ambition || 'Medium'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-500 text-sm">
                                Hiring required during Offseason.
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* ACTIVE MANDATES & PROMISES */}
                {activePromises && activePromises.length > 0 && (
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 animate-fade-in">
                        <div className="flex items-center space-x-2 mb-4 border-b border-slate-700 pb-2">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
                                Active Mandates & Promises
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activePromises.map((promise) => (
                                <div key={promise.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPromiseStatusColor(promise.status)}`}>
                                            {promise.status}
                                        </span>
                                        <span className="text-xs font-mono text-slate-500">{promise.type}</span>
                                    </div>
                                    <p className="text-slate-200 font-bold text-sm mb-2">"{promise.description}"</p>
                                    <div className="flex items-center text-xs text-red-400 font-mono mt-auto">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        <span>Risk: {promise.consequence}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* PROFILE TAB (REALISM OVERHAUL) */}
        {activeTab === 'philosophy' && (
            <div className="animate-fade-in space-y-6">
                
                {/* 1. Coaching Capital */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 rounded-xl border border-blue-500/30 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Landmark className="w-6 h-6 text-blue-400" />
                            <h3 className="text-lg font-black text-white uppercase">Political Capital</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 h-8">Influence within the University/Franchise. Used to survive scandals or demand budget.</p>
                        <div className="text-3xl font-black text-blue-400">{capital.political}/100</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 rounded-xl border border-purple-500/30 p-6">
                        <div className="flex items-center gap-3 mb-2">
                             <Crown className="w-6 h-6 text-purple-400" />
                             <h3 className="text-lg font-black text-white uppercase">Social Capital</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 h-8">Influence with Media and Recruits. Used to control narratives and flip prospects.</p>
                        <div className="text-3xl font-black text-purple-400">{capital.social}/100</div>
                    </div>
                </div>

                {/* 2. Philosophy Sliders */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase mb-6 border-b border-slate-800 pb-2">
                        <Scale className="w-4 h-4" /> Coaching Philosophy
                    </h4>
                    
                    <div className="space-y-6">
                        {/* Aggression */}
                        <div>
                             <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                                 <span>Conservative</span>
                                 <span className="text-white">Aggression ({philosophy.aggression})</span>
                                 <span>Risky</span>
                             </div>
                             <div className="relative h-2 bg-slate-800 rounded-full">
                                 <div className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_white]" style={{ left: `${philosophy.aggression}%`, transform: 'translateX(-50%)' }}></div>
                             </div>
                        </div>

                         {/* Discipline */}
                         <div>
                             <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                                 <span>Player's Coach</span>
                                 <span className="text-white">Discipline ({philosophy.discipline})</span>
                                 <span>Authoritarian</span>
                             </div>
                             <div className="relative h-2 bg-slate-800 rounded-full">
                                 <div className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_white]" style={{ left: `${philosophy.discipline}%`, transform: 'translateX(-50%)' }}></div>
                             </div>
                        </div>

                         {/* Adaptability */}
                         <div>
                             <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                                 <span>System Purist</span>
                                 <span className="text-white">Adaptability ({philosophy.adaptability})</span>
                                 <span>Chameleon</span>
                             </div>
                             <div className="relative h-2 bg-slate-800 rounded-full">
                                 <div className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_white]" style={{ left: `${philosophy.adaptability}%`, transform: 'translateX(-50%)' }}></div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 3. Earned Traits (Badges) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase mb-6 border-b border-slate-800 pb-2">
                        <Medal className="w-4 h-4" /> Earned Traits
                    </h4>
                    
                    {traits && traits.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {traits.map(trait => (
                                <div key={trait.id} className="bg-slate-950 p-4 rounded border border-slate-800 flex items-start space-x-3">
                                    <div className="bg-slate-900 p-2 rounded-full border border-slate-800">
                                        <Award className={`w-5 h-5 ${trait.type === 'Positive' ? 'text-emerald-500' : (trait.type === 'Negative' ? 'text-red-500' : 'text-slate-400')}`} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-200 text-sm">{trait.label}</h5>
                                        <p className="text-xs text-slate-500 leading-snug mt-1">{trait.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-sm italic">
                            No significant traits established yet. Continue your career to build a reputation.
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default StrategyRoom;
