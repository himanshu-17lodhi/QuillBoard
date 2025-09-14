// frontend/components/navbar/Navbar.tsx
import { useState } from 'react'
import { useStore } from '../../stores/useStore'

export default function Navbar() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const user = useStore((state) => state.user)
  const currentDocument = useStore((state) => state.currentDocument)

  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
      {/* Document title */}
      <div className="flex items-center space-x-2">
        <button className="p-1 rounded hover:bg-gray-700">
          {/* Menu icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {currentDocument && (
          <h1 className="text-lg font-medium">{currentDocument.title}</h1>
        )}
      </div>

      {/* Collaboration status and user menu */}
      <div className="flex items-center space-x-4">
        {/* Collaboration status */}
        <div className="flex items-center space-x-1 text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Connected</span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700 z-10">
              <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-700">Profile</a>
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-700">Settings</a>
              <a href="/api/auth/logout" className="block px-4 py-2 text-sm hover:bg-gray-700">Sign out</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}