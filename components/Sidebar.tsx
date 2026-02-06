
import React from 'react';
import { SaveHeader } from '../types';
import { 
  Shield, Users, Building2, Mic2, 
  Brain, Handshake, Eye, Briefcase, 
  DollarSign, Clock, Calendar, Trophy,
  TrendingUp, Activity, Crown,
  GraduationCap, Smartphone, Newspaper,
  AlertOctagon, CheckCircle2, Phone, Search, Coffee,
  BookOpen, LayoutDashboard, ScrollText, Globe, Zap,
  Landmark, Megaphone
} from 'lucide-react';
import { getTeamDetails } from '../data/teams';

interface Props {
  header: SaveHeader;
  onAction: (actionId: string, actionText: string, context: string) => void;
  loading: boolean;
  currentView: 'story' | 'strategy' | 'blackbook';
  onViewChange: (view: 'story' | 'strategy' | 'blackbook') => void;
}

const Sidebar: React.FC<Props> = ({ header, onAction, loading, currentView, onViewChange }) => {
  const conf = header.conference.toUpperCase();
  const isNFL = conf.includes('NFL') || conf.includes('AFC') || conf.includes('NFC');
  
  const yearStr = header.date.match(/\d{4}/)?.[0] || "1995";
  const year = parseInt(yearStr);
  const isNIL_Era = year >= 2021;
  const isDigital_Era = year >= 2010;
  const isPortal_Era = year >= 2018;

  const isUnemployed = header.team === 'Free Agent' || header.team === 'Unemployed';
  const isCarousel = header.timelinePhase === 'Carousel';

  const salary = header.financials.salary;
  const contractYears = header.financials.contractYears;
  const security = header.jobSecurity;
  const sentiment = header.fanSentiment;
  const capital = header.capital; // Replaces Progression

  // Team Metadata
  const teamData = getTeamDetails(header.team);
  const primaryColor = teamData.colors.primary;
  const secondaryColor = teamData.colors.secondary;

  const getSentimentColor = (val: number) => {
    if (val < 40) return "text-red-500";
    if (val < 70) return "text-amber-500";
    return "text-emerald-500";
  };
  
  const adminRating = header.adminCompetence || 'Average';
  const getAdminColor = (rating: string) => {
      switch(rating) {
          case 'Inept': return 'text-red-400 bg-red-900/20 border-red-800';
          case 'Clever': return 'text-emerald-400 bg-emerald-900/20 border-emerald-800';
          case 'Ruthless': return 'text-purple-400 bg-purple-900/20 border-purple-800';
          default: return 'text-slate-400 bg-slate-800 border-slate-700';
      }
  };

  const standardActions = [
    {
      id: 'staff_meeting',
      label: 'Staff Meeting',
      desc: 'Gameplan',
      icon: <Users className="w-4 h-4 text-blue-400" />,
      context: `I'm calling a meeting with my coordinators. Focus: Fixing our weaknesses and staff alignment. Current Year: ${year}.`,
    },
    {
      id: 'talent_acquisition',
      label: isNFL ? 'Scouting' : 'Recruiting',
      desc: isNFL ? 'Draft Board' : (isPortal_Era ? 'Portal' : 'Visits'),
      icon: isNFL 
        ? <Eye className="w-4 h-4 text-emerald-400" /> 
        : <GraduationCap className="w-4 h-4 text-emerald-400" />,
      context: isNFL 
        ? "I'm reviewing the draft board and pro scouting reports." 
        : (isPortal_Era 
            ? "I'm checking the Transfer Portal and managing our high school commits." 
            : `I'm hitting the road to visit recruits. (${year < 2000 ? 'Landlines and Living Rooms' : 'Emails and Texting'}).`),
    },
    {
      id: 'admin_meeting',
      label: isNFL ? 'GM' : 'AD',
      desc: 'Goals',
      icon: <Building2 className="w-4 h-4 text-slate-400" />,
      context: isNFL
        ? "I'm meeting with the General Manager. Topic: Roster control and job security."
        : "I'm meeting with the Athletic Director. Topic: Facilities, budget, and expectations.",
    },
    {
      id: 'politics',
      label: isNFL ? "Owner" : (isNIL_Era ? 'NIL' : 'Boosters'),
      desc: isNFL ? 'Vision' : 'Fundraising',
      icon: isNFL ? <Crown className="w-4 h-4 text-amber-400" /> : <Handshake className="w-4 h-4 text-amber-400" />,
      context: isNFL
        ? "I'm meeting with the Team Owner. I need to sell them on my vision."
        : (isNIL_Era 
            ? "I'm meeting with the NIL Collective leaders. We need more money to buy a roster."
            : "I'm attending a booster dinner. Need to shake hands and secure donations for the new facility."),
    },
    {
      id: 'press_conference',
      label: 'Media',
      desc: 'Narrative',
      icon: <Mic2 className="w-4 h-4 text-purple-400" />,
      context: `I'm facing the media. (${year < 2005 ? 'Local papers and radio' : 'Twitter and 24/7 coverage'}). Goal: Control the narrative.`,
    },
    {
      id: 'scheme_lab',
      label: 'Scheming',
      desc: 'Playbook',
      icon: <Brain className="w-4 h-4 text-pink-400" />,
      context: "I'm spending late nights in the film room tweaking our scheme.",
    }
  ];

  const unemployedActions = [
      {
          id: 'network_call',
          label: 'Network',
          desc: 'Leads',
          icon: <Phone className="w-4 h-4 text-emerald-400" />,
          context: "I'm calling everyone I know in the industry. Looking for job leads or rumors about openings."
      },
      {
          id: 'study_film',
          label: 'Study',
          desc: 'Trends',
          icon: <Eye className="w-4 h-4 text-blue-400" />,
          context: "I'm spending my free time breaking down film of successful teams, keeping my schematic knowledge sharp for interviews."
      },
      {
          id: 'coffee_meeting',
          label: 'Meet',
          desc: 'Connect',
          icon: <Coffee className="w-4 h-4 text-amber-400" />,
          context: "I'm meeting up with a local high school or college coach for coffee. Just trying to stay relevant and in the loop."
      },
      {
          id: 'agent_check',
          label: 'Agent',
          desc: 'Status',
          icon: <Briefcase className="w-4 h-4 text-purple-400" />,
          context: "I'm checking in with my agent to see if any teams have reached out or if we need to lower our asking price."
      }
  ];

  const carouselActions = [
    {
      id: 'view_market',
      label: 'View Market',
      desc: 'Offers',
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      context: "I'm calling my agent to get a full update on the Coaching Carousel. Who is hiring? Who is firing? And where do I fit in?"
    },
    {
      id: 'leak_interest',
      label: 'Leak Info',
      desc: 'Leverage',
      icon: <Newspaper className="w-4 h-4 text-amber-400" />,
      context: "I'm leaking interest in other jobs to the press to gain leverage. Careful not to burn bridges."
    },
    {
      id: 'staff_retention',
      label: 'Retention',
      desc: 'Staff',
      icon: <Users className="w-4 h-4 text-blue-400" />,
      context: "I'm trying to lock down my current staff before other schools poach them during the carousel."
    },
    {
      id: 'contact_ad',
      label: 'AD Meeting',
      desc: 'Security',
      icon: <Shield className="w-4 h-4 text-red-400" />,
      context: "I need a face-to-face with my current AD to discuss my contract extension and buyout before I look elsewhere."
    }
  ];

  let actions = [...standardActions];
  if (isUnemployed) {
      actions = [...unemployedActions];
  } else if (isCarousel) {
      actions = [...carouselActions];
  }

  return (
    <div className="w-72 h-full bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto custom-scrollbar font-sans">
      
      {/* 1. Profile Header (Compacted) */}
      <div 
        className="p-3 bg-slate-950 border-b border-slate-800 relative overflow-hidden group"
        style={!isUnemployed ? { backgroundColor: `${primaryColor}20` } : {}}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        {!isUnemployed && (
            <div 
              className="absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none opacity-20"
              style={{ background: `linear-gradient(to bottom left, ${primaryColor}, transparent)` }}
            ></div>
        )}
        
        <div className="relative z-10 flex flex-row items-center space-x-3">
            <div 
              className={`
                w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center shadow-lg transition-colors duration-500
              `}
              style={!isUnemployed ? { borderColor: secondaryColor, backgroundColor: primaryColor } : { borderColor: '#334155', backgroundColor: '#1e293b' }}
            >
                {isUnemployed ? (
                    <Briefcase className="w-5 h-5 text-emerald-500" />
                ) : (
                    isNFL ? <Shield className="w-5 h-5 text-slate-100" /> : <Trophy className={`w-5 h-5 text-white`} />
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <h2 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-0.5 truncate">
                    {isUnemployed ? "Free Agent" : header.team}
                </h2>
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 truncate">{header.conference}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{header.role}</span>
                </div>
            </div>
        </div>
        
        {/* Capital Bar (Replaces XP) */}
        <div className="mt-3 relative z-10 grid grid-cols-2 gap-2">
            <div>
                 <div className="flex justify-between text-[8px] font-bold uppercase text-slate-500 mb-0.5">
                    <span className="flex items-center gap-1"><Landmark className="w-2.5 h-2.5" /> Political</span>
                    <span>{capital.political}</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${capital.political}%` }}
                    ></div>
                </div>
            </div>
            <div>
                 <div className="flex justify-between text-[8px] font-bold uppercase text-slate-500 mb-0.5">
                    <span className="flex items-center gap-1"><Megaphone className="w-2.5 h-2.5" /> Social</span>
                    <span>{capital.social}</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div 
                        className="h-full bg-purple-500 transition-all duration-500" 
                        style={{ width: `${capital.social}%` }}
                    ></div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Mode Switcher */}
      <div className="p-2 border-b border-slate-800 grid grid-cols-3 gap-1">
          <button 
             onClick={() => onViewChange('story')}
             className={`flex flex-col items-center justify-center p-2 rounded transition-colors ${currentView === 'story' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'}`}
          >
             <ScrollText className="w-4 h-4 mb-1" />
             <span className="text-[9px] font-bold uppercase">Feed</span>
          </button>
          <button 
             onClick={() => onViewChange('strategy')}
             className={`flex flex-col items-center justify-center p-2 rounded transition-colors ${currentView === 'strategy' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'}`}
          >
             <LayoutDashboard className="w-4 h-4 mb-1" />
             <span className="text-[9px] font-bold uppercase">Strategy</span>
          </button>
          <button 
             onClick={() => onViewChange('blackbook')}
             className={`flex flex-col items-center justify-center p-2 rounded transition-colors ${currentView === 'blackbook' ? 'bg-slate-800 text-purple-400 shadow-sm' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'}`}
          >
             <BookOpen className="w-4 h-4 mb-1" />
             <span className="text-[9px] font-bold uppercase">Memory</span>
          </button>
      </div>

      {/* 3. Contract & Admin Status (Grid Compact) */}
      {!isUnemployed && (
        <div className="p-2 border-b border-slate-800 bg-slate-900/50">
           <div className="grid grid-cols-2 gap-2">
               {/* Financials Block */}
               <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 space-y-0.5">
                   <div className="flex items-center justify-between text-[8px] text-slate-500 uppercase font-bold">
                       <span>Contract</span>
                       {contractYears <= 1 && <span className="text-red-400 animate-pulse">EXP</span>}
                   </div>
                   <div className="flex items-center justify-between">
                       <span className="text-emerald-400 font-mono text-[10px] font-bold truncate"><DollarSign className="w-2.5 h-2.5 inline -mt-0.5" />{salary.replace('$', '')}</span>
                       <span className="text-blue-400 font-mono text-[10px] font-bold"><Clock className="w-2.5 h-2.5 inline -mt-0.5" />{contractYears}y</span>
                   </div>
               </div>

               {/* Security Block */}
               <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 space-y-0.5">
                    <div className="flex items-center justify-between text-[8px] text-slate-500 uppercase font-bold">
                       <span>Approval</span>
                   </div>
                   <div className="flex items-center justify-between">
                       <span className={`text-[10px] font-bold ${getSentimentColor(sentiment)}`}>{security.split(' ')[0]}</span>
                       <span className={`text-[10px] font-mono font-bold ${getSentimentColor(sentiment)}`}>{sentiment}%</span>
                   </div>
               </div>
           </div>

           {/* Admin Competence Badge (Slim) */}
           <div className={`w-full mt-2 px-2 py-1 rounded border text-[9px] font-bold flex items-center justify-between ${getAdminColor(adminRating)}`}>
               <div className="flex items-center">
                   {adminRating === 'Inept' ? <AlertOctagon className="w-2.5 h-2.5 mr-1" /> : <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                   <span className="uppercase">Front Office:</span>
               </div>
               <span>{adminRating}</span>
           </div>
        </div>
      )}

      {/* 4. Coach's Desk Actions (Dense List) */}
      <div className="flex-1 p-2 bg-slate-900 overflow-y-auto">
         <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-1.5">
                {isDigital_Era ? <Smartphone className="w-3 h-3 text-amber-500" /> : <Newspaper className="w-3 h-3 text-amber-500" />}
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {isUnemployed ? "Job Hunt" : (isCarousel ? "Carousel Actions" : "Turn Actions")}
                </span>
            </div>
         </div>

         <div className="space-y-1.5">
             {actions.map((action) => (
                 <button
                    key={action.id}
                    onClick={() => {
                      onViewChange('story');
                      onAction(action.id, action.label, action.context);
                    }}
                    disabled={loading}
                    className="
                        w-full flex flex-row items-center text-left p-1.5 rounded border border-slate-800 bg-slate-800/40 
                        hover:bg-slate-800 hover:border-emerald-500/30 transition-all duration-200 group relative overflow-hidden disabled:opacity-50
                    "
                 >
                    <div className="mr-2.5 p-1 rounded bg-slate-900 border border-slate-700 group-hover:border-slate-600 transition-colors">
                        {action.icon}
                    </div>
                    <div>
                        <span className="block text-[11px] font-bold text-slate-300 group-hover:text-white leading-none">{action.label}</span>
                        <span className="block text-[9px] text-slate-500 mt-0.5 leading-none">{action.desc}</span>
                    </div>
                 </button>
             ))}
         </div>
      </div>

      {/* 5. Footer Info */}
      <div className="p-1.5 border-t border-slate-800 text-center bg-slate-950">
         <div className="flex items-center justify-center space-x-2 text-[9px] text-slate-600 font-mono">
            <Calendar className="w-2.5 h-2.5" />
            <span>{header.date}</span>
            <span className="text-slate-700">|</span>
            <TrendingUp className="w-2.5 h-2.5" />
            <span>Age: {header.age}</span>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
