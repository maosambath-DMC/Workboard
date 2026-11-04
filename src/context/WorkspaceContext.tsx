import React, { createContext, useContext } from 'react';
import { useWorkspaceStore, WorkspaceStore } from '../store/useWorkspaceStore';

const WorkspaceContext = createContext<WorkspaceStore | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useWorkspaceStore();
  return <WorkspaceContext.Provider value={store}>{children}</WorkspaceContext.Provider>;
};

export function useWorkspace(): WorkspaceStore {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
