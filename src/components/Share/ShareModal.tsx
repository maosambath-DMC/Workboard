import React, { useState, useRef } from 'react';
import type { Project } from '../../types';
import { generateShareUrl, exportProjectAsJson, importProjectFromJson } from '../../lib/share';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Smartphone, 
  Monitor, 
  Globe 
} from 'lucide-react';

interface ShareModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onImportProject?: (imported: Project) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  project,
  isOpen,
  onClose,
  onImportProject,
}) => {
  const [copied, setCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const shareUrl = generateShareUrl(project);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExport = () => {
    exportProjectAsJson(project);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const imported = await importProjectFromJson(file);
      if (onImportProject) {
        onImportProject(imported);
      }
      onClose();
    } catch (err) {
      alert('Failed to import whiteboard file. Please check file format.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 relative animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Share "{project.title}"
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anyone with this link can view this whiteboard on iPhone, iPad, or Mac
            </p>
          </div>
        </div>

        {/* Share Link Box */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Universal Share Link
          </label>
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-2 text-xs text-slate-700 dark:text-slate-300 font-mono outline-none truncate select-all"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:scale-105 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Compatible Device Highlights */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center mb-6">
          <div className="flex flex-col items-center gap-1">
            <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">iPhone</span>
            <span className="text-[9px] text-slate-500">Touch & gestures</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400 scale-125" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">iPad & Pencil</span>
            <span className="text-[9px] text-slate-500">Pinch-to-zoom</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Monitor className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Mac & Web</span>
            <span className="text-[9px] text-slate-500">Instant load</span>
          </div>
        </div>

        {/* Export / Backup Options */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Export Board (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isImporting ? 'Importing...' : 'Import Board'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
