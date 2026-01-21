import React, { useState, useCallback } from 'react';
import { INITIAL_PROMPT } from './constants';
import { initializeGame, sendDecision } from './services/geminiService';
import { TurnLog, Choice } from './types';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import SceneDisplay from './components/SceneDisplay';
import ActionPanel from './components/ActionPanel';
import CareerWikibox from './components/CareerWikibox';
import { Trophy, PlayCircle, Loader2, BookOpen, Skull, RotateCcw, TrendingUp, Sparkles, Zap } from 'lucide-react';

const App: React.FC = () => {
  // We store the full history of turns, the last item is the current state
  const [history, setHistory] = useState<TurnLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [showWiki, setShowWiki] = useState<boolean>(false);

  const currentTurn = history.length > 0 ? history[history.length - 1] : null;

  // Extract current year from the date string for use in Wiki
  // Format is typically "Month Year" e.g., "August 1995"
  const currentYear = currentTurn 
    ? parseInt(currentTurn.header.date.split(' ').pop() || '1995') 
    : 1995;

  const handleStartGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = customInput.trim()
        ? `${INITIAL_PROMPT}\n\nUser's Custom Background Context: "${customInput}". Ensure the starting options reflect this input.`
        : INITIAL_PROMPT;
        
      const initialTurn = await initializeGame(prompt);
      setHistory([initialTurn]);
      setGameStarted(true);
    } catch (err: any) {
      setError("Failed to initialize game. Please check your connection or API key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [customInput]);

  const handleRestart = () => {
    setHistory([]);
    setGameStarted(false);
    setCustomInput('');
  };

  const handleDecision = useCallback(async (choice: Choice, customText?: string) => {
    if (loading || !currentTurn) return;
    
    setLoading(true);
    try {
      // Pass the full currentTurn object to allow state persistence in offline mode
      const nextTurn = await sendDecision(choice.id, choice.text, currentTurn, customText);
      setHistory(prev => [...prev, nextTurn]);
    } catch (err: any) {
      setError("Failed to process decision. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loading, currentTurn]);

  // Handler for Quick Actions from Sidebar
  const handleQuickAction = useCallback(async (actionId: string, actionText: string, context: string) => {
      if (loading || !currentTurn) return;
      
      const syntheticChoice: Choice = {
          id: actionId,
          text: actionText,
          type: 'strategy'
      };

      await handleDecision(syntheticChoice, context);
  }, [loading, currentTurn, handleDecision]);

  // New Handler for Interactive Job Offer Actions
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

      const syntheticChoice: Choice = {
          id: `offer_${actionType}_${offerId}`,
          text: choiceText,
          type: 'action'
      };

      await handleDecision(syntheticChoice, context);
  }, [loading, currentTurn, handleDecision]);

  // Special handler for "Rock Bottom" continuation
  const handleRockBottomContinue = useCallback(async () => {
    if (loading || !currentTurn) return;
    setLoading(true);
    try {
        // We forcefully inject a recovery choice
        const nextTurn = await sendDecision(
            "rock_bottom_recovery", 
            "I will take any job available. Even if it's High School or Division 3. I am not done coaching.", 
            currentTurn, 
            "Simulate a time jump if necessary (The Wilderness Years). Find me a low-level job to restart my career."
        );
        // Force gameOver to false in the local state update to resume UI
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-500/10 rounded-full">
              <Trophy className="w-16 h-16 text-emerald-500" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              SIDELINE <span className="text-emerald-500">SAGA</span>
            </h1>
            <p className="mt-2 text-slate-400">
              Immersive Football Career Simulator
            </p>
            <div className="mt-4 text-sm text-slate-500 font-mono bg-slate-900 p-3 rounded flex items-center justify-center space-x-2">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Flash Model (Production): Maximum Daily Request Limits</span>
            </div>
          </div>

          <div className="space-y-2 text-left animate-fade-in">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Custom Background (Optional)
            </label>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="E.g., I was a walk-on safety at Wisconsin who got injured senior year and started breaking down film..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none resize-none h-24 placeholder-slate-600 transition-colors"
            />
          </div>
          
          <button
            onClick={handleStartGame}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Building World...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Start New Career</span>
              </>
            )}
          </button>
          
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/50">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* 1. Permanent Sidebar (Left) */}
      <div className="flex-shrink-0 h-full hidden md:block z-20">
         {currentTurn && (
           <Sidebar 
             header={currentTurn.header} 
             onAction={handleQuickAction}
             loading={loading}
           />
         )}
      </div>

      {/* Mobile Top Bar (Only visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 p-2 z-50 flex justify-between items-center">
        <span className="font-bold text-slate-200 text-sm">Sideline Saga</span>
        <button onClick={() => setShowWiki(true)} className="text-xs text-slate-400 border border-slate-700 px-2 py-1 rounded">Stats</button>
      </div>

      {/* 2. Main Game Content (Right) */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden pt-10 md:pt-0">
         
         {/* Navbar Actions (Top Right Overlay) */}
         <div className="absolute top-0 right-0 p-4 z-10 flex space-x-2 pointer-events-none">
            <div className="pointer-events-auto flex space-x-2">
              <button 
                onClick={() => setShowWiki(true)}
                className="bg-slate-900/80 backdrop-blur text-xs flex items-center space-x-1 text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-full shadow-lg"
              >
                <BookOpen className="w-3 h-3" />
                <span>Career Wiki</span>
              </button>
              <button 
                onClick={handleRestart}
                className="bg-slate-900/80 backdrop-blur text-xs flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors border border-slate-700 hover:border-red-900 px-3 py-1.5 rounded-full shadow-lg"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retire</span>
              </button>
            </div>
         </div>

         {/* Timeline Progress */}
         {currentTurn && <Timeline currentPhase={currentTurn.header.timelinePhase} />}
         
         {/* Narrative Scroll Area */}
         <SceneDisplay 
            history={history} 
            loading={loading} 
            onOfferAction={handleOfferAction} 
         />

         {/* Action Area (Bottom Fixed) */}
         {currentTurn && !currentTurn.gameOver && (
           <ActionPanel 
             choices={currentTurn.choices} 
             onChoose={handleDecision}
             disabled={loading}
           />
         )}

         {/* Game Over Area */}
         {currentTurn && currentTurn.gameOver && (
            <div className="bg-slate-900 border-t border-slate-800 p-8 text-center animate-fade-in">
               <Skull className="w-12 h-12 text-slate-600 mx-auto mb-4" />
               <h2 className="text-2xl font-bold text-slate-400 mb-2">Career Ended</h2>
               <p className="text-slate-500 mb-6">The coaching carousel has stopped spinning for you.</p>
               
               <div className="flex justify-center space-x-4">
                   <button 
                     onClick={handleRockBottomContinue}
                     disabled={loading}
                     className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-emerald-500 px-6 py-3 rounded-lg transition-all"
                   >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                     <span>Simulate "The Wilderness Years" (Force Continue)</span>
                   </button>
 
                   <button 
                     onClick={handleRestart}
                     className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg transition-all"
                   >
                     <RotateCcw className="w-4 h-4" />
                     <span>Start New Career</span>
                   </button>
               </div>
            </div>
         )}
      </div>

      {/* Career Wiki Modal */}
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