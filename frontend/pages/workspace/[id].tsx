// frontend/pages/workspace/[id].tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '../../components/sidebar/Sidebar'
import Navbar from '../../components/navbar/Navbar'
import Editor from '../../components/editor/Editor'
import { useStore } from '../../stores/useStore'
import { Document } from '../../types'

export default function Workspace() {
  const router = useRouter()
  const { id } = router.query
  const user = useStore((state) => state.user)
  const workspaces = useStore((state) => state.workspaces)
  const documents = useStore((state) => state.documents)
  const setDocuments = useStore((state) => state.setDocuments)
  const setCurrentDocument = useStore((state) => state.setCurrentDocument)
  const [loading, setLoading] = useState(true)

  const currentWorkspace = workspaces.find((w) => w.id === id)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (id && user) {
      fetchDocuments()
    }
  }, [id, user, router])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/workspaces/${id}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDocument = async () => {
    try {
      const response = await fetch(`/api/workspaces/${id}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled',
          content: { type: 'doc', content: [] },
        }),
      })

      if (response.ok) {
        const newDocument = await response.json()
        setDocuments([...documents, newDocument])
        setCurrentDocument(newDocument)
      }
    } catch (error) {
      console.error('Error creating document:', error)
    }
  }

  if (!user || !currentWorkspace) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 flex">
          {/* Document list sidebar */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">Documents</h2>
              <button
                onClick={createDocument}
                className="p-2 rounded-md bg-green-600 hover:bg-green-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No documents yet</p>
                <button
                  onClick={createDocument}
                  className="mt-2 text-green-500 hover:text-green-400"
                >
                  Create your first document
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="p-3 rounded-md hover:bg-gray-700 cursor-pointer"
                    onClick={() => setCurrentDocument(document)}
                  >
                    <h3 className="font-medium truncate">{document.title}</h3>
                    <p className="text-xs text-gray-400">
                      {new Date(document.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editor area */}
          <div className="flex-1">
            {useStore((state) => state.currentDocument) ? (
              <Editor documentId={useStore((state) => state.currentDocument)!.id} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Select a document</h3>
                  <p className="text-gray-400">Choose a document from the sidebar or create a new one to start editing.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}