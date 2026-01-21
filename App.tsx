import React, { useState, useCallback, useEffect } from 'react';
import { INITIAL_PROMPT } from './constants';
import {
  initializeGame,
  initializeGameLocal,
  sendDecision,
  isLocalFirstMode,
  setLocalFirstMode,
  SendDecisionOptions,
} from './services/geminiService';
import { TurnLog, Choice } from './types';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import SceneDisplay from './components/SceneDisplay';
import ActionPanel from './components/ActionPanel';
import CareerWikibox from './components/CareerWikibox';
import TickerBar from './components/TickerBar';
import {
  Trophy,
  PlayCircle,
  Loader2,
  BookOpen,
  Skull,
  RotateCcw,
  TrendingUp,
  Tv,
  Zap,
  Save,
  FolderOpen,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  allTeams,
  getTeamById,
  Team,
  NFLTeam,
  PRESTIGE_NAMES,
  saveGame,
  loadGame,
  listSaves,
  deleteSave,
  quickSave,
  createSaveData,
  initializeEngine,
} from './engine';

const App: React.FC = () => {
  const [history, setHistory] = useState<TurnLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [showWiki, setShowWiki] = useState<boolean>(false);

  // New state for local-first mode
  const [coachFirstName, setCoachFirstName] = useState<string>('');
  const [coachLastName, setCoachLastName] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [startYear, setStartYear] = useState<number>(1995);
  const [currentTeamData, setCurrentTeamData] = useState<Team | NFLTeam | undefined>(undefined);
  const [gameSeed, setGameSeed] = useState<number>(Date.now());
  const [useLocalMode, setUseLocalMode] = useState<boolean>(true);

  // Save/Load state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false);
  const [savesList, setSavesList] = useState<Array<{ id: string; name: string; timestamp: number }>>([]);
  const [saveName, setSaveName] = useState<string>('');

  // Engine initialization
  useEffect(() => {
    initializeEngine().catch(console.error);
    setLocalFirstMode(true); // Default to local-first
  }, []);

  const currentTurn = history.length > 0 ? history[history.length - 1] : null;
  const currentYear = currentTurn
    ? parseInt(currentTurn.header.date.split(' ').pop() || '1995')
    : 1995;

  // Get available teams grouped by level
  const teamsByLevel = {
    'fbs-p5': allTeams.filter(t => t.level === 'fbs-p5').sort((a, b) => b.prestige - a.prestige),
    'fbs-g5': allTeams.filter(t => t.level === 'fbs-g5').sort((a, b) => b.prestige - a.prestige),
    'fcs': allTeams.filter(t => t.level === 'fcs').sort((a, b) => b.prestige - a.prestige),
  };

  const handleStartGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Generate a new seed for this game
      const seed = Date.now();
      setGameSeed(seed);

      if (useLocalMode && selectedTeamId && coachFirstName && coachLastName) {
        // Use local-first initialization
        const teamData = getTeamById(selectedTeamId);
        setCurrentTeamData(teamData || undefined);

        const initialTurn = await initializeGameLocal({
          coachFirstName,
          coachLastName,
          teamId: selectedTeamId,
          startYear,
          startingRole: 'Head Coach',
          seed,
        });
        setHistory([initialTurn]);
        setGameStarted(true);
      } else {
        // Fall back to AI initialization
        const prompt = customInput.trim()
          ? `${INITIAL_PROMPT}\n\nUser's Custom Background Context: "${customInput}". Ensure the starting options reflect this input.`
          : INITIAL_PROMPT;

        const initialTurn = await initializeGame(prompt);
        setHistory([initialTurn]);
        setGameStarted(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to initialize game: ${message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [customInput, useLocalMode, selectedTeamId, coachFirstName, coachLastName, startYear]);

  const handleRestart = () => {
    setHistory([]);
    setGameStarted(false);
    setCustomInput('');
  };

  const handleDecision = useCallback(async (choice: Choice, customText?: string) => {
    if (loading || !currentTurn) return;

    setLoading(true);
    try {
      // Pass team context for better simulation
      const options: SendDecisionOptions = {
        teamId: selectedTeamId || undefined,
        teamData: currentTeamData,
        seed: gameSeed + history.length, // Vary seed by turn for variety
      };

      const nextTurn = await sendDecision(choice.id, choice.text, currentTurn, customText, options);
      setHistory(prev => [...prev, nextTurn]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to process decision: ${message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loading, currentTurn, selectedTeamId, currentTeamData, gameSeed, history.length]);

  // Save/Load handlers
  const handleSaveGame = useCallback(async () => {
    if (!currentTurn || !currentTeamData) return;

    const name = saveName.trim() || `${currentTurn.header.team} - ${currentTurn.header.date}`;
    const saveData = createSaveData(currentTurn.header, currentTeamData, '');

    try {
      await saveGame(name, saveData, { history });
      setShowSaveModal(false);
      setSaveName('');
    } catch (err) {
      console.error('Failed to save:', err);
      setError('Failed to save game');
    }
  }, [currentTurn, currentTeamData, saveName, history]);

  const handleLoadGame = useCallback(async (saveId: string) => {
    try {
      const save = await loadGame(saveId);
      if (save && save.metadata?.history) {
        setHistory(save.metadata.history as TurnLog[]);
        const team = getTeamById(save.data.currentTeam.id);
        setCurrentTeamData(team || undefined);
        setSelectedTeamId(save.data.currentTeam.id);
        setGameSeed(save.data.seed);
        setGameStarted(true);
        setShowLoadModal(false);
      }
    } catch (err) {
      console.error('Failed to load:', err);
      setError('Failed to load game');
    }
  }, []);

  const handleQuickSave = useCallback(async () => {
    if (!currentTurn || !currentTeamData) return;
    const saveData = createSaveData(currentTurn.header, currentTeamData, '');
    try {
      await quickSave(saveData, { history });
    } catch (err) {
      console.error('Quick save failed:', err);
    }
  }, [currentTurn, currentTeamData, history]);

  const openLoadModal = useCallback(async () => {
    const saves = await listSaves();
    setSavesList(saves);
    setShowLoadModal(true);
  }, []);

  const handleQuickAction = useCallback(async (actionId: string, actionText: string, context: string) => {
    if (loading || !currentTurn) return;
    
    const syntheticChoice: Choice = {
      id: actionId,
      text: actionText,
      type: 'strategy'
    };

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

    const syntheticChoice: Choice = {
      id: `offer_${actionType}_${offerId}`,
      text: choiceText,
      type: 'action'
    };

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

  // ==========================================
  // START SCREEN - Compact & Scrollable
  // ==========================================
  if (!gameStarted) {
    return (
      <div className="h-screen bg-black flex flex-col overflow-hidden">
        {/* Broadcast Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-red-700 to-red-600 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Tv className="w-4 h-4 text-white" />
            <span className="font-headline text-white text-base tracking-tight">
              SIDELINE<span className="text-yellow-400">SAGA</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-broadcast text-xs text-red-200 uppercase">New Career</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-md w-full mx-auto">
            {/* Title Card */}
            <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/50">
              {/* Compact Hero */}
              <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 px-6 py-8 text-center">
                <div className="flex items-center justify-center space-x-4">
                  <div className="p-3 bg-red-600 rounded-xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h1 className="font-headline text-3xl text-white uppercase tracking-tight">
                      Sideline <span className="text-red-500">Saga</span>
                    </h1>
                    <p className="font-broadcast text-zinc-500 text-sm">
                      College Football Career Simulator
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Section - Compact */}
              <div className="px-6 py-6 space-y-4">
                {/* Mode Toggle */}
                <div className="flex items-center justify-between bg-zinc-800/30 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    {useLocalMode ? (
                      <WifiOff className="w-4 h-4 text-green-400" />
                    ) : (
                      <Wifi className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="font-broadcast text-xs text-zinc-400">
                      {useLocalMode ? 'Offline Mode' : 'AI Mode'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setUseLocalMode(!useLocalMode);
                      setLocalFirstMode(!useLocalMode);
                    }}
                    className="font-broadcast text-xs text-zinc-500 hover:text-zinc-300 underline"
                  >
                    Switch
                  </button>
                </div>

                {/* Coach Name Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-headline text-xs text-zinc-500 uppercase">First Name</label>
                    <input
                      type="text"
                      value={coachFirstName}
                      onChange={(e) => setCoachFirstName(e.target.value)}
                      placeholder="Nick"
                      className="w-full mt-1 bg-zinc-800/50 border border-zinc-700/50 focus:border-red-600 rounded-lg px-3 py-2 font-broadcast text-sm text-zinc-200 placeholder-zinc-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-headline text-xs text-zinc-500 uppercase">Last Name</label>
                    <input
                      type="text"
                      value={coachLastName}
                      onChange={(e) => setCoachLastName(e.target.value)}
                      placeholder="Saban"
                      className="w-full mt-1 bg-zinc-800/50 border border-zinc-700/50 focus:border-red-600 rounded-lg px-3 py-2 font-broadcast text-sm text-zinc-200 placeholder-zinc-600 outline-none"
                    />
                  </div>
                </div>

                {/* Year & Team in a row on larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-headline text-xs text-zinc-500 uppercase">Start Year</label>
                    <select
                      value={startYear}
                      onChange={(e) => setStartYear(parseInt(e.target.value))}
                      className="w-full mt-1 bg-zinc-800/50 border border-zinc-700/50 focus:border-red-600 rounded-lg px-3 py-2 font-broadcast text-sm text-zinc-200 outline-none"
                    >
                      <option value={1995}>1995</option>
                      <option value={2000}>2000</option>
                      <option value={2014}>2014</option>
                      <option value={2024}>2024</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-headline text-xs text-zinc-500 uppercase">Team</label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full mt-1 bg-zinc-800/50 border border-zinc-700/50 focus:border-red-600 rounded-lg px-3 py-2 font-broadcast text-sm text-zinc-200 outline-none"
                    >
                      <option value="">Select Team</option>
                      <optgroup label="Power 5 (FBS)">
                        {teamsByLevel['fbs-p5'].map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name} {team.nickname}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Group of 5 (FBS)">
                        {teamsByLevel['fbs-g5'].map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name} {team.nickname}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="FCS">
                        {teamsByLevel['fcs'].map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name} {team.nickname}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleStartGame}
                    disabled={loading || (useLocalMode && (!selectedTeamId || !coachFirstName || !coachLastName))}
                    className="w-full flex items-center justify-center space-x-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 text-white font-headline py-3 px-6 rounded-lg text-base uppercase tracking-wider transition-all disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Building...</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-5 h-5" />
                        <span>Start Career</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={openLoadModal}
                    className="w-full flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-400 font-headline py-2.5 px-4 rounded-lg text-sm uppercase transition-all"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Load Game</span>
                  </button>
                </div>

                {/* Validation hint */}
                {useLocalMode && (!selectedTeamId || !coachFirstName || !coachLastName) && (
                  <p className="font-broadcast text-xs text-zinc-600 text-center">
                    Enter name and select team to begin
                  </p>
                )}

                {/* Error Display */}
                {error && (
                  <div className="bg-red-900/30 border border-red-800/50 rounded-lg px-4 py-3">
                    <span className="font-broadcast text-sm text-red-300">{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // GAME SCREEN - ESPN + APPLE SPACING
  // ==========================================
  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden">
      
      {/* Main Game Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar (Left) */}
        <div className="flex-shrink-0 h-full hidden md:block">
          {currentTurn && (
            <Sidebar 
              header={currentTurn.header} 
              onAction={handleQuickAction}
              loading={loading}
            />
          )}
        </div>

        {/* Main Content (Right) */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          
          {/* Top Bar - Compact */}
          <div className="flex-shrink-0 bg-black border-b border-zinc-800/50 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Tv className="w-4 h-4 text-red-500" />
              <span className="font-headline text-white text-sm uppercase tracking-wide">
                SIDELINE<span className="text-yellow-400">SAGA</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Mode indicator */}
              <div className="flex items-center space-x-1 px-3 py-1.5 rounded bg-zinc-900/50">
                {isLocalFirstMode() ? (
                  <WifiOff className="w-3 h-3 text-green-400" />
                ) : (
                  <Wifi className="w-3 h-3 text-blue-400" />
                )}
                <span className="font-broadcast text-xs text-zinc-500">
                  {isLocalFirstMode() ? 'Local' : 'AI'}
                </span>
              </div>

              <button
                onClick={handleQuickSave}
                className="flex items-center space-x-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/50 hover:border-green-600/50 px-3 py-2 rounded-lg transition-all duration-200"
                title="Quick Save"
              >
                <Save className="w-4 h-4 text-green-400" />
              </button>

              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center space-x-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/50 hover:border-blue-600/50 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Save className="w-4 h-4 text-blue-400" />
                <span className="font-broadcast text-sm text-zinc-400 hidden lg:inline">Save</span>
              </button>

              <button
                onClick={() => setShowWiki(true)}
                className="flex items-center space-x-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/50 hover:border-red-600/50 px-4 py-2.5 rounded-lg transition-all duration-200"
              >
                <BookOpen className="w-4 h-4 text-zinc-400" />
                <span className="font-broadcast text-sm text-zinc-400 hidden lg:inline">Career Wiki</span>
              </button>

              <button
                onClick={handleRestart}
                className="flex items-center space-x-2 bg-zinc-900/80 hover:bg-red-900/30 border border-zinc-700/50 hover:border-red-600/50 px-4 py-2.5 rounded-lg transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4 text-red-500" />
                <span className="font-broadcast text-sm text-red-500 hidden lg:inline">Retire</span>
              </button>
            </div>
          </div>

          {/* Timeline Progress */}
          {currentTurn && <Timeline currentPhase={currentTurn.header.timelinePhase} />}
          
          {/* Mobile Header - Apple: more padding */}
          <div className="md:hidden bg-zinc-900 border-b border-zinc-800/50 px-5 py-4 flex items-center justify-between">
            <div>
              <span className="font-headline text-white text-base uppercase">{currentTurn?.header.team}</span>
              <span className="font-score text-zinc-400 text-base ml-3">{currentTurn?.header.seasonRecord}</span>
            </div>
            <button 
              onClick={() => setShowWiki(true)} 
              className="font-broadcast text-sm text-zinc-400 border border-zinc-700/50 px-4 py-2 rounded-lg"
            >
              Stats
            </button>
          </div>
          
          {/* Scene Display */}
          <SceneDisplay 
            history={history} 
            loading={loading} 
            onOfferAction={handleOfferAction} 
          />

          {/* Action Panel (Bottom) */}
          {currentTurn && !currentTurn.gameOver && (
            <ActionPanel 
              choices={currentTurn.choices} 
              onChoose={handleDecision}
              disabled={loading}
            />
          )}

          {/* Game Over Screen - Apple: generous padding */}
          {currentTurn && currentTurn.gameOver && (
            <div className="bg-zinc-950 border-t-2 border-red-600 px-10 py-12 text-center animate-slide-up">
              <Skull className="w-20 h-20 text-zinc-700 mx-auto mb-6" />
              
              <h2 className="font-headline text-4xl text-zinc-400 uppercase mb-3">Career Ended</h2>
              <p className="font-broadcast text-lg text-zinc-600 mb-10">
                The coaching carousel has stopped spinning for you.
              </p>
              
              <div className="flex justify-center space-x-5">
                <button 
                  onClick={handleRockBottomContinue}
                  disabled={loading}
                  className="flex items-center space-x-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/50 hover:border-yellow-600/50 text-yellow-500 px-8 py-4 rounded-xl font-headline text-lg uppercase tracking-wider transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                  <span>The Wilderness Years</span>
                </button>

                <button 
                  onClick={handleRestart}
                  className="flex items-center space-x-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-headline text-lg uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-red-600/25"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>New Career</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Ticker */}
      {currentTurn && (
        <TickerBar 
          items={[]}
          mediaHeadline={currentTurn.mediaHeadline}
          mediaBuzz={currentTurn.mediaBuzz}
        />
      )}

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

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-700/50 max-w-md w-full p-6 space-y-4">
            <h2 className="font-headline text-xl text-white uppercase">Save Game</h2>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={`${currentTurn?.header.team || 'Career'} - ${currentTurn?.header.date || ''}`}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 font-broadcast text-zinc-200 placeholder-zinc-500 outline-none focus:border-red-600"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleSaveGame}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-headline py-3 rounded-lg uppercase"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-headline py-3 rounded-lg uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-700/50 max-w-md w-full p-6 space-y-4 max-h-[80vh] overflow-hidden flex flex-col">
            <h2 className="font-headline text-xl text-white uppercase">Load Game</h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {savesList.length === 0 ? (
                <p className="font-broadcast text-zinc-500 text-center py-8">No saved games found</p>
              ) : (
                savesList.map(save => (
                  <button
                    key={save.id}
                    onClick={() => handleLoadGame(save.id)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg px-4 py-3 text-left transition-all"
                  >
                    <p className="font-headline text-white">{save.name}</p>
                    <p className="font-broadcast text-xs text-zinc-500">
                      {new Date(save.timestamp).toLocaleDateString()} {new Date(save.timestamp).toLocaleTimeString()}
                    </p>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowLoadModal(false)}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-headline py-3 rounded-lg uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
