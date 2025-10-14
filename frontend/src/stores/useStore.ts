// frontend/stores/useStore.ts
import create from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Workspace, Document } from '../types'

interface AppState {
  user: User | null
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  documents: Document[]
  currentDocument: Document | null
  setUser: (user: User | null) => void
  setWorkspaces: (workspaces: Workspace[]) => void
  setCurrentWorkspace: (workspace: Workspace | null) => void
  setDocuments: (documents: Document[]) => void
  setCurrentDocument: (document: Document | null) => void
  addDocument: (document: Document) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      workspaces: [],
      currentWorkspace: null,
      documents: [],
      currentDocument: null,
      
      setUser: (user) => set({ user }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      setCurrentWorkspace: (currentWorkspace) => set({ currentWorkspace }),
      setDocuments: (documents) => set({ documents }),
      setCurrentDocument: (currentDocument) => set({ currentDocument }),
      
      addDocument: (document) => 
        set((state) => ({ documents: [...state.documents, document] })),
      
      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
          ),
          currentDocument: 
            state.currentDocument?.id === id 
              ? { ...state.currentDocument, ...updates } 
              : state.currentDocument,
        })),
      
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
          currentDocument: 
            state.currentDocument?.id === id ? null : state.currentDocument,
        })),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        user: state.user, 
        workspaces: state.workspaces,
        currentWorkspace: state.currentWorkspace,
      }),
    }
  )
)