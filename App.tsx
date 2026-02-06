
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { INITIAL_PROMPT, ARCHETYPES } from './constants';
import { initializeGame, sendDecision } from './services/geminiService';
import { TurnLog, Choice } from './types';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import SaveHeader from './components/SaveHeader';
import SceneDisplay from './components/SceneDisplay';
import ActionPanel from './components/ActionPanel';
import CareerWikibox from './components/CareerWikibox';
import StrategyRoom from './components/StrategyRoom';
import BlackBookViewer from './components/BlackBookViewer';
import { Trophy, PlayCircle, Loader2, BookOpen, Skull, RotateCcw, TrendingUp, Zap, User, Check, Maximize, Minimize, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<TurnLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // VIEW STATE
  const [currentView, setCurrentView] = useState<'story' | 'strategy' | 'blackbook'>('story');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>([ARCHETYPES[0].id]);
  const [customInput, setCustomInput] = useState<string>('');
  const [showWiki, setShowWiki] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // SCROLL REF
  const viewportRef = useRef<HTMLDivElement>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedData = localStorage.getItem('sideline_saga_save');
    if (savedData) {
        try {
            const parsedHistory = JSON.parse(savedData);
            if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                setHistory(parsedHistory);
                setGameStarted(true);
            }
        } catch (e) {
            console.error("Failed to load save game:", e);
        }
    }
  }, []);

  useEffect(() => {
    if (gameStarted && history.length > 0) {
        localStorage.setItem('sideline_saga_save', JSON.stringify(history));
    }
  }, [history, gameStarted]);

  // --- FULL SCREEN ---
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const currentTurn = history.length > 0 ? history[history.length - 1] : null;
  const currentYear = currentTurn 
    ? parseInt(currentTurn.header.date.split(' ').pop() || '1995') 
    : 1995;

  const handleArchetypeToggle = (id: string) => {
    setSelectedArchetypes(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; 
        return prev.filter(pid => pid !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleStartGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const selectedDefs = ARCHETYPES.filter(a => selectedArchetypes.includes(a.id));
      const combinedLabel = selectedDefs.map(a => a.label).join(' + ');
      const combinedContext = selectedDefs.map(a => a.promptContext).join(' ');
      
      let prompt = `${INITIAL_PROMPT}\n\nUser Archetype (HYBRID): ${combinedLabel}.\n`;
      prompt += `Merge the following backgrounds into a complex, high-potential persona:\n${combinedContext}\n`;
      
      if (customInput.trim()) {
        prompt += `User Custom Notes: "${customInput}". \n`;
      }
      prompt += `\nEnsure the starting options reflect this specific, multifaceted background.`;

      const initialTurn = await initializeGame(prompt);
      setHistory([initialTurn]);
      setGameStarted(true);
    } catch (err: any) {
      setError("Failed to initialize game. Please check your connection or API key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [customInput, selectedArchetypes]);

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to retire? This will delete your current save.")) {
        localStorage.removeItem('sideline_saga_save');
        setHistory([]);
        setGameStarted(false);
        setCustomInput('');
        setSelectedArchetypes([ARCHETYPES[0].id]);
        setCurrentView('story');
    }
  };

  const handleDecision = useCallback(async (choice: Choice, customText?: string) => {
    if (loading || !currentTurn) return;
    
    setCurrentView('story');
    setMobileMenuOpen(false); 
    setLoading(true);
    try {
      const nextTurn = await sendDecision(choice.id, choice.text, currentTurn, customText);
      setHistory(prev => [...prev, nextTurn]);
    } catch (err: any) {
      setError("Failed to process decision. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loading, currentTurn]);

  const handleQuickAction = useCallback(async (actionId: string, actionText: string, context: string) => {
      if (loading || !currentTurn) return;
      const syntheticChoice: Choice = { id: actionId, text: actionText, type: 'strategy' };
      await handleDecision(syntheticChoice, context);
  }, [loading, currentTurn, handleDecision]);

  const handleOfferAction = useCallback(async (offerId: string, actionType: 'accept' | 'negotiate' | 'decline', detail?: string) => {
      if (loading || !currentTurn) return;
      const offer = currentTurn.jobOffers?.find(o => o.id === offerId);
      const teamName = offer ? offer.team : 'Unknown Team';
      let choiceText = '';
      let context = '';

      if (actionType === 'accept') {
          choiceText = `Accept Job Offer from ${teamName}`;
          context = `I am accepting the position at ${teamName}. Proceed with the hiring process.`;
      } else if (actionType === 'decline') {
          choiceText = `Decline Job Offer from ${teamName}`;
          context = `I am declining the interest from ${teamName}. Remove them from my options.`;
      } else if (actionType === 'negotiate') {
          choiceText = `Negotiate with ${teamName}`;
          context = `I want to negotiate the terms of the contract with ${teamName}. Specific Request: ${detail}. Please respond with their counter-offer or updated terms.`;
      }

      const syntheticChoice: Choice = { id: `offer_${actionType}_${offerId}`, text: choiceText, type: 'action' };
      await handleDecision(syntheticChoice, context);
  }, [loading, currentTurn, handleDecision]);

  const handleRockBottomContinue = useCallback(async () => {
    if (loading || !currentTurn) return;
    setLoading(true);
    try {
        const nextTurn = await sendDecision(
            "rock_bottom_recovery", 
            "I will take any job available. Even if it's High School or Division 3. I am not done coaching.", 
            currentTurn, 
            "Simulate a time jump if necessary (The Wilderness Years). Find me a low-level job to restart my career."
        );
        nextTurn.gameOver = false;
        setHistory(prev => [...prev, nextTurn]);
    } catch (err: any) {
        setError("Failed to recover career.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  }, [loading, currentTurn]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center overflow-y-auto">
        <div className="max-w-4xl w-full space-y-8 bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 my-8">
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-500/10 rounded-full">
              <Trophy className="w-16 h-16 text-emerald-500" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              SIDELINE <span className="text-emerald-500">SAGA</span>
            </h1>
            <p className="mt-2 text-slate-400">Immersive Football Career Simulator</p>
            <div className="mt-4 text-sm text-slate-500 font-mono bg-slate-900 p-3 rounded flex items-center justify-center space-x-2 w-max mx-auto">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Production Model: Maximum Performance</span>
            </div>
          </div>

          <div className="text-left animate-fade-in space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Select Origin Story
                </label>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${selectedArchetypes.length === 2 ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' : 'text-slate-500 border-slate-700'}`}>
                  {selectedArchetypes.length}/2 Selected
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ARCHETYPES.map((arch) => {
                  const isSelected = selectedArchetypes.includes(arch.id);
                  const isDisabled = !isSelected && selectedArchetypes.length >= 2;
                  return (
                    <button
                      key={arch.id}
                      onClick={() => handleArchetypeToggle(arch.id)}
                      disabled={isDisabled}
                      className={`text-left p-4 rounded-lg border transition-all duration-200 relative overflow-hidden group ${isSelected ? 'bg-slate-700 border-emerald-500 ring-1 ring-emerald-500 shadow-lg' : (isDisabled ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-900 border-slate-700 hover:border-slate-500')}`}
                    >
                       {isSelected && <div className="absolute top-0 right-0 p-1.5 bg-emerald-500 text-white rounded-bl shadow-md z-10"><Check className="w-3 h-3" /></div>}
                       <h3 className={`font-bold text-sm mb-1 flex items-center space-x-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}><span>{arch.label}</span></h3>
                       <p className="text-xs text-slate-500 leading-relaxed">{arch.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Additional Notes (Optional)</label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="E.g., I want to focus on recruiting Florida heavily, or I have a vendetta against Ohio State..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none resize-none h-20 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>
          
          <button onClick={handleStartGame} disabled={loading} className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Building World...</span></> : <><PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /><span>Start New Career as Jacob Rhinehart</span></>}
          </button>
          
          {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/50">{error}</div>}
          
          {localStorage.getItem('sideline_saga_save') && (
              <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">Previous save found</p>
                  <button onClick={() => {
                        const saved = localStorage.getItem('sideline_saga_save');
                        if (saved) {
                             const parsed = JSON.parse(saved);
                             setHistory(parsed);
                             setGameStarted(true);
                        }
                     }} className="text-emerald-500 hover:text-emerald-400 text-sm font-mono underline decoration-dotted">
                      Resume Career
                  </button>
              </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-40 bg-slate-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block border-r border-slate-800 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
         {currentTurn && (
           <Sidebar 
             header={currentTurn.header} 
             onAction={handleQuickAction}
             loading={loading}
             currentView={currentView}
             onViewChange={(view) => {
               setCurrentView(view);
               setMobileMenuOpen(false);
             }}
           />
         )}
      </div>
      
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>}

      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 p-2 z-50 flex justify-between items-center h-12">
        <div className="flex items-center space-x-3">
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-400"><Menu className="w-5 h-5" /></button>
          <span className="font-bold text-slate-200 text-sm">Sideline Saga</span>
        </div>
        <button onClick={() => setShowWiki(true)} className="text-xs text-slate-400 border border-slate-700 px-2 py-1 rounded">Stats</button>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden pt-12 md:pt-0">
         
         {/* TOP NAV OVERLAY */}
         <div className="hidden md:flex absolute top-0 right-0 p-4 z-10 space-x-2 pointer-events-none">
            <div className="pointer-events-auto flex space-x-2">
              <button onClick={toggleFullScreen} className="bg-slate-900/80 backdrop-blur text-xs flex items-center space-x-1 text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-full shadow-lg">
                {isFullScreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
                <span>{isFullScreen ? 'Exit' : 'Full Screen'}</span>
              </button>
              <button onClick={() => setShowWiki(true)} className="bg-slate-900/80 backdrop-blur text-xs flex items-center space-x-1 text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-full shadow-lg">
                <BookOpen className="w-3 h-3" />
                <span>Career Wiki</span>
              </button>
              <button onClick={handleRestart} className="bg-slate-900/80 backdrop-blur text-xs flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors border border-slate-700 hover:border-red-900 px-3 py-1.5 rounded-full shadow-lg">
                <RotateCcw className="w-3 h-3" />
                <span>Retire</span>
              </button>
            </div>
         </div>

         {/* PERSISTENT HUD */}
         {currentTurn && (
             <>
               <SaveHeader header={currentTurn.header} />
               <Timeline currentPhase={currentTurn.header.timelinePhase} />
               
               {/* SCROLLABLE CONTENT AREA */}
               {/* This is the SINGLE scroll container for the app content */}
               <div 
                 ref={viewportRef}
                 className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-900"
               >
                  {currentView === 'story' && (
                    <SceneDisplay 
                        history={history} 
                        loading={loading} 
                        onOfferAction={handleOfferAction}
                        viewportRef={viewportRef} // Pass ref for auto-scrolling
                    />
                  )}
                  
                  {currentView === 'strategy' && (
                    <StrategyRoom 
                      header={currentTurn.header} 
                      staffNotes={currentTurn.staffNotes} 
                    />
                  )}

                  {currentView === 'blackbook' && (
                    <BlackBookViewer entries={currentTurn.header.blackBook} />
                  )}

                  {/* BOTTOM SPACER FOR ACTION PANEL */}
                  {currentView === 'story' && !currentTurn.gameOver && <div className="h-24 md:h-32"></div>}
               </div>
             </>
         )}

         {/* ACTION PANEL (Fixed) */}
         {currentView === 'story' && currentTurn && !currentTurn.gameOver && (
           <ActionPanel 
             choices={currentTurn.choices} 
             onChoose={handleDecision}
             disabled={loading}
           />
         )}

         {/* GAME OVER (Fixed) */}
         {currentView === 'story' && currentTurn && currentTurn.gameOver && (
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-8 text-center animate-fade-in z-20">
               <Skull className="w-12 h-12 text-slate-600 mx-auto mb-4" />
               <h2 className="text-2xl font-bold text-slate-400 mb-2">Career Ended</h2>
               <p className="text-slate-500 mb-6">The coaching carousel has stopped spinning for you.</p>
               <div className="flex justify-center space-x-4">
                   <button onClick={handleRockBottomContinue} disabled={loading} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-emerald-500 px-6 py-3 rounded-lg transition-all">
                     {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                     <span>Simulate "The Wilderness Years"</span>
                   </button>
                   <button onClick={handleRestart} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg transition-all">
                     <RotateCcw className="w-4 h-4" />
                     <span>Start New Career</span>
                   </button>
               </div>
            </div>
         )}
      </div>

      {showWiki && currentTurn && (
        <CareerWikibox 
            history={currentTurn.header.careerHistory} 
            network={currentTurn.header.network}
            currentRole={currentTurn.header.role}
            currentTeam={currentTurn.header.team}
            age={currentTurn.header.age}
            currentYear={currentYear}
            onClose={() => setShowWiki(false)} 
        />
      )}
    </div>
  );
};

export default App;
