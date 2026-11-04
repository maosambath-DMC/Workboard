import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PERSONAS, PERSONA_LIST } from '../../constants/personas';
import { CreateProjectModal } from './CreateProjectModal';
import { 
  Plus, 
  Folder, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  ArrowRight, 
  Trash2, 
  Sun, 
  Moon, 
  RotateCcw,
  Layers,
  ChevronDown
} from 'lucide-react';

export const ProjectSelectionPage: React.FC = () => {
  const {
    projects,
    openProject,
    deleteProject,
    setIsCreateProjectModalOpen,
    activePersonaId,
    setActivePersonaId,
    activePersona,
    theme,
    toggleTheme,
    resetAllProjects,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'all' | 'voting' | 'decisions'>('all');
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'voting') return p.votingSession?.isActive;
    if (activeTab === 'decisions') return p.status === 'decisions' || p.items.some((i) => i.isDecision);
    return true;
  });

  return (
    <div className="w-full min-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar */}
      <header className="sticky top-0 h-16 px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">🦊</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                Kitsune
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Workspace Hub
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Creative Visual Collaboration
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Active Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all"
              title="Change your active team persona"
            >
              <span className="text-base leading-none">{activePersona.avatar}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {activePersona.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Reset Demo */}
          <button
            onClick={resetAllProjects}
            className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Reset all demo projects"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Collaborative Canvas Engine</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Select a Project Whiteboard
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Jump into an active collaborative workspace. Collect references, draft independently in the silent tray, dot-vote on ideas, and lock shared decisions together.
            </p>
          </div>

          <button
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project Canvas</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Workspaces ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('voting')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'voting'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Voting in Progress</span>
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'decisions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Decisions Locked</span>
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {filteredProjects.map((project) => {
            const isVotingActive = project.votingSession?.isActive;
            const decisionsCount = project.items?.filter((i) => i.isDecision).length || 0;
            const isTargetMoodProject = project.id === 'potential-projects';

            return (
              <div
                key={project.id}
                onClick={() => openProject(project.id)}
                className={`group rounded-3xl p-6 bg-white dark:bg-slate-900 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isTargetMoodProject
                    ? 'border-purple-300 dark:border-purple-800 shadow-lg ring-1 ring-purple-400/30'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-purple-400/60'
                }`}
              >
                {/* Accent top banner line */}
                <div
                  style={{ backgroundColor: project.accentColor }}
                  className="absolute top-0 left-0 right-0 h-1.5"
                />

                <div>
                  {/* Top row: Emoji Icon, Category & Delete */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
                        {project.emoji}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {project.category}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Updated {project.updatedAt}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      title="Delete project"
                      className="p-1.5 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1.5">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Live Status Pill (Matches screenshot black pill when voting) */}
                  {isVotingActive ? (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-bold shadow-md">
                      <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                      <span>Voting in progress</span>
                      <span className="text-slate-400 font-normal border-l border-slate-700 pl-2">
                        {project.votingSession?.statusText || '3 participants voting'}
                      </span>
                    </div>
                  ) : decisionsCount > 0 ? (
                    <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{decisionsCount} Shared Decisions Locked</span>
                    </div>
                  ) : (
                    <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>{project.statusLabel}</span>
                    </div>
                  )}

                  {/* Dynamic Whiteboard Sneak Peek Canvas */}
                  <div className="w-full h-28 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 mb-3 flex items-center justify-around relative overflow-hidden group-hover:border-purple-400 dark:group-hover:border-purple-600 transition-colors shadow-inner">
                    {/* Dotted background preview */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] [background-size:10px_10px] pointer-events-none" />

                    {/* Content Sneak Peek Elements */}
                    <div className="relative z-10 flex items-center gap-2 max-w-full overflow-hidden px-1">
                      {/* Image Thumbnail Preview if project has pictures */}
                      {project.items?.some((i) => i.imageUrl) && (
                        <div className="w-16 h-18 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xs shrink-0 group-hover:scale-105 transition-transform bg-white dark:bg-slate-800">
                          <img
                            src={project.items.find((i) => i.imageUrl)?.imageUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Sticky Notes & Polls Preview */}
                      {project.items?.slice(0, 3).map((item, idx) => {
                        const isPink = item.color === 'pink';
                        const isBlue = item.color === 'blue';
                        const isYellow = item.color === 'yellow';
                        const isGreen = item.color === 'green';
                        const isPurple = item.color === 'purple';

                        const colorBg = isPink
                          ? 'bg-[#fbcfe8] border-[#f472b6]'
                          : isBlue
                          ? 'bg-[#bae6fd] border-[#38bdf8]'
                          : isYellow
                          ? 'bg-[#fef08a] border-[#facc15]'
                          : isGreen
                          ? 'bg-[#bbf7d0] border-[#4ade80]'
                          : isPurple
                          ? 'bg-[#e9d5ff] border-[#c084fc]'
                          : 'bg-[#fed7aa] border-[#fb923c]';

                        return (
                          <div
                            key={item.id}
                            style={{
                              transform: `rotate(${idx === 0 ? -1.5 : idx === 1 ? 1 : -0.5}deg)`,
                            }}
                            className={`w-20 h-20 rounded-xl p-1.5 border ${colorBg} text-slate-900 shadow-sm flex flex-col justify-between shrink-0 relative group-hover:scale-105 transition-transform`}
                          >
                            {/* Vote badge */}
                            {item.votes && item.votes.length > 0 && (
                              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs border border-white">
                                {item.votes.length}
                              </div>
                            )}

                            <div className="text-[9px] font-bold leading-tight line-clamp-2">
                              {item.title}
                            </div>
                            <div className="flex items-center justify-between text-[8px] text-slate-700">
                              <span>{item.authorAvatar}</span>
                              {item.isDecision && <span className="font-extrabold text-emerald-800">✓ Core</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Highlights Snippet */}
                  <div className="mb-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0">✨ Highlights:</span>
                    <span className="truncate">
                      {project.items?.[0]?.title || 'Empty canvas ready for ideas'} 
                      {project.items?.length > 1 ? ` + ${project.items.length - 1} more` : ''}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Member Avatars & Open Whiteboard CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {project.members?.map((memberId) => {
                      const p = PERSONAS[memberId];
                      if (!p) return null;
                      return (
                        <span
                          key={memberId}
                          title={`${p.name} (${p.role})`}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 text-xs bg-slate-100 dark:bg-slate-800 shadow-xs"
                        >
                          {p.avatar}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                    <span>Open Whiteboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* New Project Card */}
          <div
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="rounded-3xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[300px] group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Start New Project
            </h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Create an open visual canvas for brainstorming, silent reference staging, or sprint retrospectives.
            </p>
          </div>
        </div>
      </main>

      <CreateProjectModal />
    </div>
  );
};
