import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/stores/useStore'
import { useAuth } from './useAuth'
import type { Document, DocumentInsert, DocumentUpdate } from '@/lib/database.types'

export function useDocuments(workspaceId?: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const setDocuments = useStore((state) => state.setDocuments)
  const setCurrentDocument = useStore((state) => state.setCurrentDocument)

  const getDocuments = async (): Promise<Document[]> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        created_by_user:profiles(*),
        collaborators:document_collaborators(*)
      `)
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  }

  const getDocument = async (documentId: string): Promise<Document> => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        created_by_user:profiles(*),
        collaborators:document_collaborators(*)
      `)
      .eq('id', documentId)
      .single()

    if (error) throw error
    
    // Check if user has access to this document
    const { data: workspaceAccess } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', data.workspace_id)
      .eq('user_id', user.id)
      .single()

    if (!workspaceAccess) {
      throw new Error('You do not have access to this document')
    }

    return data
  }

  const createDocument = async (document: Omit<DocumentInsert, 'created_by'>): Promise<Document> => {
    if (!user) throw new Error('User not authenticated')
    if (!workspaceId) throw new Error('Workspace ID is required')

    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...document,
        workspace_id: workspaceId,
        created_by: user.id,
      })
      .select(`
        *,
        created_by_user:profiles(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  const updateDocument = async (documentId: string, updates: DocumentUpdate): Promise<Document> => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select(`
        *,
        created_by_user:profiles(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  const deleteDocument = async (documentId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) throw error
  }

  const addCollaborator = async (documentId: string, userId: string) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('document_collaborators')
      .insert({
        document_id: documentId,
        user_id: userId,
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  const removeCollaborator = async (documentId: string, userId: string) => {
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('document_collaborators')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', userId)

    if (error) throw error
  }

  const getCollaborators = async (documentId: string) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('document_collaborators')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('document_id', documentId)
      .order('joined_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Queries
  const documentsQuery = useQuery({
    queryKey: ['documents', workspaceId],
    queryFn: getDocuments,
    enabled: !!workspaceId && !!user,
    onSuccess: (data) => {
      setDocuments(data)
    },
  })

  const documentQuery = (documentId: string) => useQuery({
    queryKey: ['document', documentId],
    queryFn: () => getDocument(documentId),
    enabled: !!documentId && !!user,
    onSuccess: (data) => {
      setCurrentDocument(data)
    },
  })

  // Mutations
  const createDocumentMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: (newDocument) => {
      // Update the documents list
      queryClient.setQueryData(['documents', workspaceId], (old: Document[] = []) => [
        newDocument,
        ...old,
      ])
      setCurrentDocument(newDocument)
    },
    onError: (error) => {
      console.error('Error creating document:', error)
    },
  })

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & DocumentUpdate) => updateDocument(id, updates),
    onSuccess: (updatedDocument) => {
      // Update the documents list
      queryClient.setQueryData(['documents', workspaceId], (old: Document[] = []) =>
        old.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc))
      )
      
      // Update current document if it's the one being edited
      setCurrentDocument(updatedDocument)
    },
    onError: (error) => {
      console.error('Error updating document:', error)
    },
  })

  const deleteDocumentMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: (_, documentId) => {
      // Remove from documents list
      queryClient.setQueryData(['documents', workspaceId], (old: Document[] = []) =>
        old.filter((doc) => doc.id !== documentId)
      )
      
      // Clear current document if it's the one being deleted
      const currentDocument = useStore.getState().currentDocument
      if (currentDocument?.id === documentId) {
        setCurrentDocument(null)
      }
    },
    onError: (error) => {
      console.error('Error deleting document:', error)
    },
  })

  const addCollaboratorMutation = useMutation({
    mutationFn: ({ documentId, userId }: { documentId: string; userId: string }) =>
      addCollaborator(documentId, userId),
    onError: (error) => {
      console.error('Error adding collaborator:', error)
    },
  })

  const removeCollaboratorMutation = useMutation({
    mutationFn: ({ documentId, userId }: { documentId: string; userId: string }) =>
      removeCollaborator(documentId, userId),
    onError: (error) => {
      console.error('Error removing collaborator:', error)
    },
  })

  // Real-time subscription
  const subscribeToDocumentChanges = (documentId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('document-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`,
        },
        callback
      )
      .subscribe()
  }

  const subscribeToWorkspaceDocuments = (workspaceId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('workspace-documents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        callback
      )
      .subscribe()
  }

  return {
    // Queries
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    refetch: documentsQuery.refetch,
    
    // Document operations
    getDocument: documentQuery,
    createDocument: createDocumentMutation.mutateAsync,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    
    // Collaborator operations
    addCollaborator: addCollaboratorMutation.mutateAsync,
    removeCollaborator: removeCollaboratorMutation.mutateAsync,
    getCollaborators,
    
    // Real-time
    subscribeToDocumentChanges,
    subscribeToWorkspaceDocuments,
    
    // Mutation states
    isCreating: createDocumentMutation.isPending,
    isUpdating: updateDocumentMutation.isPending,
    isDeleting: deleteDocumentMutation.isPending,
  }
}