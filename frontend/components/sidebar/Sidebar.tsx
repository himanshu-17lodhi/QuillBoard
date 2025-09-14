// frontend/components/sidebar/Sidebar.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../../stores/useStore'
import WorkspaceList from './WorkspaceList'
import DocumentList from './DocumentList'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const user = useStore((state) => state.user)
  const workspaces = useStore((state) => state.workspaces)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    useStore.getState().setUser(null)
    useStore.getState().setWorkspaces([])
    router.push('/auth/login')
  }

  return (
    <div className={`flex flex-col h-screen bg-gray-800 text-white ${isCollapsed ? 'w-16' : 'w-64'} transition-width duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-green-600 flex items-center justify-center">
              <span className="font-bold">N</span>
            </div>
            <span className="font-semibold">Notion Clone</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-gray-700"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* User info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              {user.name?.charAt(0) || user.email.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name || 'User'}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Workspaces and documents */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <>
            <WorkspaceList workspaces={workspaces} />
            <DocumentList />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign out</span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}