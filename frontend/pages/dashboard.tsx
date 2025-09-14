// frontend/pages/dashboard.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '../components/sidebar/Sidebar'
import Navbar from '../components/navbar/Navbar'
import { useStore } from '../stores/useStore'

export default function Dashboard() {
  const router = useRouter()
  const user = useStore((state) => state.user)
  const workspaces = useStore((state) => state.workspaces)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  if (!user) {
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
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
            
            {workspaces.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Welcome to Notion Clone!</h2>
                <p className="text-gray-400 mb-6">
                  Get started by creating your first workspace.
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md">
                  Create Workspace
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer transition-colors"
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                  >
                    <h3 className="font-semibold text-lg mb-2">{workspace.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {workspace.members.length} member
                      {workspace.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}