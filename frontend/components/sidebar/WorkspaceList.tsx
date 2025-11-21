import { useState } from 'react'
import { useStore } from '../../src/stores/useStore'
import { ChevronDown, Box, Plus } from 'lucide-react'

export default function WorkspaceList() {
  const workspaces = useStore((state) => state.workspaces)
  const currentWorkspace = useStore((state) => state.currentWorkspace)
  const setCurrentWorkspace = useStore((state) => state.setCurrentWorkspace)
  const [isOpen, setIsOpen] = useState(false)

  if (!currentWorkspace) return <div className="p-2 text-xs text-gray-500">Loading...</div>

  return (
    <div className="relative mb-2">
      {/* Current Workspace Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 hover:bg-[#2C2C2C] rounded-md transition-colors group"
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-green-600 rounded text-[10px] flex items-center justify-center text-white font-bold shadow-sm">
            {currentWorkspace.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-sm text-gray-200 truncate max-w-[120px]">
            {currentWorkspace.name}
          </span>
        </div>
        <ChevronDown size={14} className="text-gray-500 group-hover:text-white" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 w-full mt-1 bg-[#252525] border border-[#333] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-1">
              <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm flex items-center gap-2 rounded-md hover:bg-[#333] text-gray-300"
                >
                  <Box size={14} />
                  <span className="truncate">{ws.name}</span>
                </button>
              ))}
              <div className="h-px bg-[#333] my-1"></div>
              <button className="w-full text-left px-2 py-1.5 text-sm text-gray-400 hover:bg-[#333] hover:text-white rounded-md flex items-center gap-2">
                <Plus size={14} />
                Create Workspace
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}