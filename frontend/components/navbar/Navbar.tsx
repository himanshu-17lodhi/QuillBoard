import { useStore } from '../../src/stores/useStore'
import { Menu, Bell, Share2, MoreHorizontal } from 'lucide-react'

export default function Navbar() {
  const currentWorkspace = useStore((state) => state.currentWorkspace)

  return (
    <nav className="h-12 bg-[#111111] border-b border-[#222] flex items-center justify-between px-4 text-gray-300 shrink-0 font-sans">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 overflow-hidden">
        <button className="lg:hidden p-1 hover:bg-[#222] rounded text-gray-400">
             <Menu size={18} />
        </button>
        
        <div className="flex items-center gap-2 text-sm">
            {currentWorkspace ? (
               <>
                 <span className="flex items-center gap-2 px-1.5 py-0.5 rounded hover:bg-[#222] cursor-pointer transition-colors truncate">
                    <span className="w-4 h-4 bg-green-600 rounded text-[10px] flex items-center justify-center text-white font-bold">
                        {currentWorkspace.name[0].toUpperCase()}
                    </span>
                    {currentWorkspace.name}
                 </span>
                 <span className="text-gray-600">/</span>
                 <span className="px-1.5 py-0.5 rounded text-gray-500">Dashboard</span>
               </>
            ) : (
               <span>Select a Workspace</span>
            )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 hover:bg-[#222] rounded text-gray-400 transition-colors">
             <Share2 size={16} />
        </button>
        <button className="p-1.5 hover:bg-[#222] rounded text-gray-400 transition-colors">
             <Bell size={16} />
        </button>
        <button className="p-1.5 hover:bg-[#222] rounded text-gray-400 transition-colors">
             <MoreHorizontal size={16} />
        </button>
      </div>
    </nav>
  )
}