import React, { useState } from 'react';
import type { CanvasItem, PersonaId } from '../../types';
import { PERSONAS } from '../../constants/personas';
import { useWorkspace } from '../../context/WorkspaceContext';
import { fireCuteConfetti } from '../../utils/confetti';
import { 
  GitBranch, 
  Trash2, 
  Plus, 
  Vote, 
  CheckCircle2, 
  Check 
} from 'lucide-react';

interface CanvasPollProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent, item: CanvasItem) => void;
}

export const CanvasPoll: React.FC<CanvasPollProps> = ({
  item,
  isSelected,
  onSelect,
  onDragStart,
}) => {
  const { updateItem, removeItem, branchItem, activePersonaId } = useWorkspace();
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);

  const options = item.pollOptions || [
    { id: 'opt-1', text: 'Option A: Biophilic Living Wall', votes: ['simon', 'david'] },
    { id: 'opt-2', text: 'Option B: Minimalist Japanese Concrete', votes: ['andrea'] },
    { id: 'opt-3', text: 'Option C: Post-Modern Colorful Retro', votes: [] },
  ];

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes.length, 0);

  const handleVoteOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedOptions = options.map((opt) => {
      const hasVoted = opt.votes.includes(activePersonaId);
      if (opt.id === optionId) {
        if (!hasVoted) {
          fireCuteConfetti(e.clientX, e.clientY);
          return { ...opt, votes: [...opt.votes, activePersonaId] };
        } else {
          return { ...opt, votes: opt.votes.filter((id) => id !== activePersonaId) };
        }
      }
      return opt;
    });

    updateItem(item.id, { pollOptions: updatedOptions });
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionText.trim()) return;
    const newOpt = {
      id: `opt-${Date.now()}`,
      text: newOptionText.trim(),
      votes: [],
    };
    updateItem(item.id, { pollOptions: [...options, newOpt] });
    setNewOptionText('');
    setShowAddOption(false);
  };

  const handleBranch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const topOption = [...options].sort((a, b) => b.votes.length - a.votes.length)[0];
    const branchLabel = window.prompt(
      'Enter branch theme or decision based on this poll:',
      topOption ? `Outcome: ${topOption.text.slice(0, 15)}...` : 'Poll Analysis'
    );
    if (branchLabel !== null) {
      branchItem(item.id, branchLabel.trim() || 'Poll Outcome');
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('button, input, textarea')) return;
        onDragStart(e, item);
      }}
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
        width: `${item.width || 320}px`,
      }}
      className={`absolute top-0 left-0 rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing select-none group ${
        isSelected ? 'ring-3 ring-purple-500 shadow-2xl' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Vote className="w-3.5 h-3.5" strokeWidth={1.75} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            Team Poll
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            • {totalVotes} vote{totalVotes === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleBranch}
            title="Branch idea or decision from this poll"
            className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => removeItem(item.id)}
            title="Delete poll"
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Question Title */}
      {isEditingQuestion ? (
        <input
          type="text"
          value={item.title}
          autoFocus
          onBlur={() => setIsEditingQuestion(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditingQuestion(false)}
          onChange={(e) => updateItem(item.id, { title: e.target.value })}
          className="w-full text-xs font-bold px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-purple-400 outline-none mb-3"
        />
      ) : (
        <h4
          onDoubleClick={() => setIsEditingQuestion(true)}
          title="Double click to edit question"
          className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-snug mb-3 cursor-text hover:text-purple-600 transition-colors"
        >
          {item.title || 'What direction should we move forward with?'}
        </h4>
      )}

      {/* Poll Options List */}
      <div className="space-y-2">
        {options.map((opt) => {
          const votePercent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
          const hasMyVote = opt.votes.includes(activePersonaId);

          return (
            <div
              key={opt.id}
              onClick={(e) => handleVoteOption(opt.id, e)}
              className={`relative overflow-hidden rounded-xl border p-2.5 transition-all cursor-pointer ${
                hasMyVote
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
              }`}
            >
              {/* Animated Progress Bar Fill */}
              <div
                style={{ width: `${votePercent}%` }}
                className={`absolute top-0 bottom-0 left-0 transition-all duration-500 pointer-events-none ${
                  hasMyVote ? 'bg-purple-200/70 dark:bg-purple-900/50' : 'bg-slate-200/50 dark:bg-slate-700/40'
                }`}
              />

              {/* Option Text and Stats */}
              <div className="relative z-10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 pr-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
                    hasMyVote
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-slate-400 bg-white dark:bg-slate-800'
                  }`}>
                    {hasMyVote && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>
                  <span>{opt.text}</span>
                </div>

                <span className="font-extrabold text-[11px] text-slate-600 dark:text-slate-400 shrink-0">
                  {votePercent}% ({opt.votes.length})
                </span>
              </div>

              {/* Voter Avatars */}
              {opt.votes.length > 0 && (
                <div className="relative z-10 flex items-center gap-1 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                  <div className="flex -space-x-1 overflow-hidden">
                    {opt.votes.map((voterId) => {
                      const p = PERSONAS[voterId];
                      if (!p) return null;
                      return (
                        <span
                          key={voterId}
                          title={p.name}
                          className="inline-block w-4 h-4 rounded-full border border-white dark:border-slate-900 text-[9px] text-center bg-white dark:bg-slate-800 shadow-2xs"
                        >
                          {p.avatar}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Option Form or Button */}
      {showAddOption ? (
        <form onSubmit={handleAddOption} className="mt-2.5 flex gap-1.5">
          <input
            type="text"
            placeholder="New option..."
            value={newOptionText}
            autoFocus
            onChange={(e) => setNewOptionText(e.target.value)}
            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-purple-400 outline-none text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Add
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowAddOption(true)}
          className="mt-2.5 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-dashed border-slate-200 dark:border-slate-800"
        >
          <Plus className="w-3 h-3" />
          <span>Add Option</span>
        </button>
      )}
    </div>
  );
};
