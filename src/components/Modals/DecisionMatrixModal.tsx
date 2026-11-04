import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CanvasItem, DecisionCategory } from '../../types';
import { PERSONAS } from '../../constants/personas';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Archive, 
  Compass, 
  FileText 
} from 'lucide-react';

export const DecisionMatrixModal: React.FC = () => {
  const {
    isDecisionMatrixOpen,
    setIsDecisionMatrixOpen,
    setIsSummaryModalOpen,
    items,
    setDecision,
  } = useWorkspace();

  if (!isDecisionMatrixOpen) return null;

  // Filter items into categories
  const coreDecisions = items.filter((i) => i.isDecision && i.decisionCategory === 'core');
  const secondaryDecisions = items.filter((i) => i.isDecision && i.decisionCategory === 'secondary');
  const backlogDecisions = items.filter((i) => i.isDecision && i.decisionCategory === 'backlog');
  
  // Uncategorized shortlisted ideas or high voted ideas
  const candidates = items.filter(
    (i) => !i.isDecision && (i.isShortlisted || (i.votes?.length || 0) >= 2)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-pop-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Shared Creative Decision Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transform team contributions into agreed creative pillars and locked directions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsDecisionMatrixOpen(false);
                setIsSummaryModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Direction Brief</span>
            </button>

            <button
              onClick={() => setIsDecisionMatrixOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto flex-1">
          {/* Pillar 1: Core Creative Direction */}
          <div className="flex flex-col rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                  Core Direction ({coreDecisions.length})
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                Locked Decisions
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {coreDecisions.length === 0 ? (
                <div className="p-6 text-center text-xs text-emerald-700/60 dark:text-emerald-400/60 border border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl">
                  No locked core decisions yet. Move candidates here from the right or click "Lock Decision" on any card.
                </div>
              ) : (
                coreDecisions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300/80 dark:border-emerald-700 shadow-sm flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h5>
                        <span className="text-xs">{item.authorAvatar}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {item.content || item.tags.join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        💜 {item.votes?.length || 0} votes
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDecision(item.id, 'secondary')}
                          className="px-2 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        >
                          → Secondary
                        </button>
                        <button
                          onClick={() => setDecision(item.id, null)}
                          className="px-2 py-0.5 text-[10px] rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          Unlock
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pillar 2: Secondary Exploration */}
          <div className="flex flex-col rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-800/50 p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-200 dark:border-sky-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200">
                  Secondary Exploration ({secondaryDecisions.length})
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
                To Prototype
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {secondaryDecisions.length === 0 ? (
                <div className="p-6 text-center text-xs text-sky-700/60 dark:text-sky-400/60 border border-dashed border-sky-300 dark:border-sky-800 rounded-xl">
                  Secondary avenues to test in parallel.
                </div>
              ) : (
                secondaryDecisions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-300/80 dark:border-sky-700 shadow-sm flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h5>
                        <span className="text-xs">{item.authorAvatar}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {item.content || item.tags.join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        💜 {item.votes?.length || 0} votes
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDecision(item.id, 'core')}
                          className="px-2 py-0.5 text-[10px] rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                        >
                          → Core
                        </button>
                        <button
                          onClick={() => setDecision(item.id, 'backlog')}
                          className="px-2 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        >
                          → Park
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pillar 3: Candidate & Shortlisted Pool */}
          <div className="flex flex-col rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  Deliberation Pool ({candidates.length})
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                Shortlisted
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {candidates.length === 0 ? (
                <div className="p-6 text-center text-xs text-amber-700/60 dark:text-amber-400/60 border border-dashed border-amber-300 dark:border-amber-800 rounded-xl">
                  Star/shortlist or vote on ideas on the whiteboard to pull them into this deliberation pool.
                </div>
              ) : (
                candidates.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300/80 dark:border-amber-700 shadow-sm flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h5>
                        <span className="text-xs">{item.authorAvatar}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {item.content || item.tags.join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        💜 {item.votes?.length || 0} votes
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDecision(item.id, 'core')}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Lock Core
                        </button>
                        <button
                          onClick={() => setDecision(item.id, 'secondary')}
                          className="px-2 py-0.5 text-[10px] rounded bg-sky-600 text-white hover:bg-sky-700"
                        >
                          Secondary
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
