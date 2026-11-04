import React, { Component, ErrorInfo, ReactNode } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { ProjectSelectionPage } from './components/Projects/ProjectSelectionPage';
import { Canvas } from './components/Canvas/Canvas';
import { StagingTray } from './components/Staging/StagingTray';
import { NewItemModal } from './components/Modals/NewItemModal';
import { DecisionMatrixModal } from './components/Modals/DecisionMatrixModal';
import { ProjectSummaryModal } from './components/Modals/ProjectSummaryModal';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-4xl mb-4 block">🦊</span>
            <h2 className="text-xl font-bold mb-2">Something unexpected happened</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {this.state.error?.message || 'A visual component encountered an issue.'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg transition-all"
            >
              Reset App Data & Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AppRouter() {
  const { currentView } = useWorkspace();

  if (currentView === 'projects') {
    return <ProjectSelectionPage />;
  }

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <main className="flex-1 relative overflow-hidden">
        <Canvas />
        <StagingTray />
      </main>
      <NewItemModal />
      <DecisionMatrixModal />
      <ProjectSummaryModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WorkspaceProvider>
        <AppRouter />
      </WorkspaceProvider>
    </ErrorBoundary>
  );
}
