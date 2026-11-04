import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PERSONAS, PERSONA_LIST } from '../constants/personas';
import { ViewFilter, PersonaId } from '../types';
import { 
  Sun, 
  Moon, 
  Users, 
  Clock, 
  Star, 
  CheckCircle2, 
  Layers, 
  Download, 
  RotateCcw, 
  Search,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    activePersonaId,
    setActivePersonaId,
    activePersona,
    votingSession,
    startVotingSession,
    endVotingSession,
    items,
    viewFilter,
    setViewFilter,
    searchQuery,
    setSearchQuery,
    setIsDecisionMatrixOpen,
    setIsSummaryModalOpen,
    simulatePeers,
    setSimulatePeers,
    resetAllProjects,
  } = useWorkspace();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Calculate my dots used
  const myDotsUsed = items.reduce((sum, item) => {
    return sum + (item.votes?.filter((v) => v === activePersonaId).length || 0);
  }, 0);
  const dotsRemaining = Math.max(0, votingSession.dotsPerPerson - myDotsUsed);

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
    <header className="h-16 px-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-30 select-none">
      {/* Left: Branding & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">🦊</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                Kitsune
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Workspace
              </span>
            </div>
            <h1 className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px] md:max-w-[280px]">
              Project Bloom: Botanical Cafe
            </h1>
          </div>
        </div>

        {/* View Filter Pills */}
        <div className="hidden lg:flex items-center gap-1 ml-4 pl-3 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setViewFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
              viewFilter === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Ideas
          </button>
          <button
            onClick={() => setViewFilter('top-voted')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
              viewFilter === 'top-voted'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Top Voted</span>
          </button>
          <button
            onClick={() => setViewFilter('decisions')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
              viewFilter === 'decisions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Decisions</span>
          </button>
        </div>
      </div>

      {/* Center: Search & Voting Session Widget */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ideas, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-36 lg:w-48 pl-8 pr-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 focus:w-60 transition-all"
          />
        </div>

        {/* Voting Session Banner */}
        {votingSession.isActive ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold tracking-wider">{timeLeft}</span>
            <span className="text-xs font-medium border-l border-amber-300 dark:border-amber-700 pl-2">
              Dots: {dotsRemaining}/{votingSession.dotsPerPerson}
            </span>
            <button
              onClick={endVotingSession}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              End
            </button>
          </div>
        ) : (
          <button
            onClick={() => startVotingSession(5)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 hover:bg-amber-200/80 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 rounded-full border border-amber-200 dark:border-amber-800 transition-all hover:scale-105 active:scale-95"
            title="Start a 5-minute timeboxed dot-voting round"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Vote Session</span>
          </button>
        )}

        {/* Shared Decisions Matrix Button */}
        <button
          onClick={() => setIsDecisionMatrixOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/70 hover:bg-emerald-200/80 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 rounded-full border border-emerald-200 dark:border-emerald-800 transition-all hover:scale-105 active:scale-95"
          title="Open Shared Decisions Board"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Decisions</span>
        </button>

        {/* Creative Project Summary Button */}
        <button
          onClick={() => setIsSummaryModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-purple-800 dark:text-purple-200 bg-purple-100/70 hover:bg-purple-200/80 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 rounded-full border border-purple-200 dark:border-purple-800 transition-all hover:scale-105 active:scale-95"
          title="Generate Project Summary & Direction Brief"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Brief</span>
        </button>
      </div>

      {/* Right: Persona Switcher, Peer Simulation, Theme & Reset */}
      <div className="flex items-center gap-2">
        {/* Mock Peers Presence Toggle */}
        <button
          onClick={() => setSimulatePeers(!simulatePeers)}
          className={`hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
            simulatePeers
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
          }`}
          title="Toggle simulated teammate cursors and activity"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Peers {simulatePeers ? 'Live' : 'Off'}</span>
        </button>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all"
            title="Switch your active teammate avatar"
          >
            <span className="text-base leading-none">{activePersona.avatar}</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
              {activePersona.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div
              onClick={() => setShowPersonaMenu(false)}
              className="absolute right-0 top-full mt-2 w-56 p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-pop-in"
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
                    <span className="text-lg leading-none">{p.avatar}</span>
                    <div className="text-left">
                      <div className="leading-tight">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{p.role}</div>
                    </div>
                  </div>
                  {activePersonaId === p.id && (
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Reset Demo State */}
        <button
          onClick={resetAllProjects}
          className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title="Reset board to initial demo state"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
