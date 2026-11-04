import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { PERSONA_LIST } from '../../constants/personas';
import { 
  ArrowLeft, 
  Timer, 
  CheckSquare, 
  EyeOff, 
  MousePointer, 
  Briefcase, 
  Sun, 
  Moon, 
  ChevronDown,
  Sparkles,
  Share2,
  Cloud
} from 'lucide-react';

export const WhiteboardHeader: React.FC = () => {
  const {
    activeProject,
    backToProjects,
    votingSession,
    startVotingSession,
    endVotingSession,
    isStagingOpen,
    setIsStagingOpen,
    stagedItems,
    simulatePeers,
    setSimulatePeers,
    setIsDecisionMatrixOpen,
    setIsSummaryModalOpen,
    setIsShareModalOpen,
    activePersona,
    activePersonaId,
    setActivePersonaId,
    theme,
    toggleTheme,
    livePeersCount,
    isLiveConnected,
  } = useWorkspace();

  const { currentUser, setIsAuthModalOpen, syncStatus } = useAuth();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Voting countdown timer effect
  useEffect(() => {
    if (!votingSession.isActive || !votingSession.endsAt) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((votingSession.endsAt! - now) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
      if (diff <= 0) {
        endVotingSession();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [votingSession, endVotingSession]);

  return (
    <div className="absolute top-2.5 sm:top-5 inset-x-2 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none select-none pt-[env(safe-area-inset-top,0px)]">
      {/* Top Left: Back button + Share Button + Black Voting in Progress Pill */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        {/* Back to Projects */}
        <button
          onClick={backToProjects}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-lg border border-slate-200/80 dark:border-slate-800 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          title="Back to project selection"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Projects</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          title="Share this whiteboard link with others"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Voting in Progress Black Pill or Project Title */}
        {votingSession.isActive ? (
          <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-black text-white shadow-xl backdrop-blur-md border border-white/10 animate-pop-in">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white text-black flex items-center justify-center text-xs font-black shadow-xs">
              ✓
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                Voting
              </span>
              {timeLeft && (
                <span className="text-xs font-mono text-amber-300">
                  ({timeLeft})
                </span>
              )}
            </div>
            <span className="hidden md:inline text-xs text-slate-400 font-medium border-l border-neutral-700 pl-3">
              {votingSession.statusText || '3 participants still voting'}
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-md border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
            <span className="text-base">{activeProject?.emoji || '🎯'}</span>
            <span className="text-xs font-bold truncate max-w-[120px] md:max-w-xs">{activeProject?.title}</span>
          </div>
        )}

        {/* Live Server Indicator */}
        <div 
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs font-bold shadow-md backdrop-blur-md"
          title="Cloud Live Server Active • Instant updates between devices"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-slate-700 dark:text-slate-200">Live Sync</span>
          {livePeersCount > 1 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">
              {livePeersCount}
            </span>
          )}
        </div>
      </div>

      {/* Top Right: White Action Strip matching screenshot [ ⏱️  ☑️  🕵️  👆  💼 ] */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
          {/* 1. Timer button */}
          <button
            onClick={() => {
              if (votingSession.isActive) {
                endVotingSession();
              } else {
                startVotingSession(5);
              }
            }}
            title={votingSession.isActive ? 'Stop timer' : 'Start 5m timer'}
            className={`p-2 rounded-xl transition-all ${
              votingSession.isActive
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* 2. Voting Checkbox (Matching the active black rounded icon in screenshot) */}
          <button
            onClick={() => {
              if (votingSession.isActive) {
                endVotingSession();
              } else {
                startVotingSession(5);
              }
            }}
            title="Toggle Dot Voting Mode"
            className={`p-2 rounded-xl transition-all ${
              votingSession.isActive
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          {/* 3. Incognito / Silent Brainstorming Tray */}
          <button
            onClick={() => setIsStagingOpen(!isStagingOpen)}
            title="Silent Ideation Mode (Private Stash Tray)"
            className={`relative p-2 rounded-xl transition-all ${
              isStagingOpen
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <EyeOff className="w-4 h-4" strokeWidth={1.75} />
            {stagedItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center">
                {stagedItems.length}
              </span>
            )}
          </button>

          {/* 4. Live Cursors Pointer toggle */}
          <button
            onClick={() => setSimulatePeers(!simulatePeers)}
            title={`Toggle Multi-User Cursors (${simulatePeers ? 'Visible' : 'Hidden'})`}
            className={`p-2 rounded-xl transition-all ${
              simulatePeers
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          {/* 5. Briefcase / Decisions & Brief Toolbox */}
          <div className="relative">
            <button
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              title="Project Decisions & Briefs"
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
            </button>

            {showToolsMenu && (
              <div
                onClick={() => setShowToolsMenu(false)}
                className="absolute right-0 top-full mt-2 w-48 p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-pop-in"
              >
                <button
                  onClick={() => setIsDecisionMatrixOpen(true)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <span>🎯</span>
                  <span>Decision Matrix</span>
                </button>
                <button
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <span>📋</span>
                  <span>Project Direction Brief</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Persona Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            title="Switch active persona"
          >
            <span className="text-base leading-none">{activePersona.avatar}</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activePersona.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div
              onClick={() => setShowPersonaMenu(false)}
              className="absolute right-0 top-full mt-2 w-52 p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-pop-in"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Switch Teammate Persona
              </div>
              {PERSONA_LIST.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePersonaId(p.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors ${
                    activePersonaId === p.id
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.avatar}</span>
                    <span>{p.name}</span>
                  </div>
                  {activePersonaId === p.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account / Cloud Sync Pill */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all hover:scale-105 active:scale-95"
          title={currentUser && !currentUser.isGuest ? `Account: ${currentUser.displayName} • Synced to Cloud` : 'Sign In to Save to Cloud'}
        >
          <span className="text-sm leading-none">{currentUser?.avatar || '👤'}</span>
          <span className="hidden md:inline max-w-[80px] truncate">
            {currentUser && !currentUser.isGuest ? currentUser.displayName : 'Sign In'}
          </span>
          <span 
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-emerald-500' : syncStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-slate-400'
            }`} 
          />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-105"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </div>
  );
};
