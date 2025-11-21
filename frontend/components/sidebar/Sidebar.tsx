import { useRouter } from 'next/router'
import { useStore } from '../../src/stores/useStore'
import { supabase } from '../../src/lib/supabase'
import { 
  Settings, Search, FolderOpen,  
  Database, Activity, Command, LogOut 
} from 'lucide-react'
import WorkspaceList from './WorkspaceList'
import DocumentList from './DocumentList'

export default function Sidebar() {
  const router = useRouter()
  const user = useStore((state) => state.user)
  const setUser = useStore((state) => state.setUser)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen shrink-0">
      
      {/* --- 1. APP RIBBON (Far Left Strip) --- */}
      <div className="w-12 flex flex-col items-center py-4 bg-[#1e1e1e] border-r border-[#333] z-20">
        {/* Top Actions */}
        <div className="flex flex-col gap-4 mb-auto">
           <div className="p-2 rounded-md bg-[#333] text-white cursor-pointer hover:bg-[#444] transition-colors" title="Open Graph View">
              <Activity size={20} />
           </div>
           <div className="p-2 text-gray-400 cursor-pointer hover:text-white transition-colors" title="Command Palette">
              <Command size={20} />
           </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4">
           <div className="p-2 text-gray-400 cursor-pointer hover:text-white transition-colors" title="Settings">
              <Settings size={20} />
           </div>
           <div onClick={handleLogout} className="p-2 text-gray-400 cursor-pointer hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={20} />
           </div>
           {/* User Avatar (Tiny) */}
           <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white mt-2 border border-[#444]">
              {user?.name?.[0] || 'U'}
           </div>
        </div>
      </div>

      {/* --- 2. FILE EXPLORER (The Tree) --- */}
      <div className="w-64 bg-[#161616] border-r border-[#111] flex flex-col">
        
        {/* Explorer Header */}
        <div className="h-10 flex items-center justify-between px-4 border-b border-[#222] bg-[#161616]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Explorer</span>
            <div className="flex gap-2 text-gray-500">
                <FolderOpen size={14} className="hover:text-white cursor-pointer"/>
                <Search size={14} className="hover:text-white cursor-pointer"/>
            </div>
        </div>

        {/* Workspace Selector (Dense) */}
        <div className="p-2 border-b border-[#222]">
            <WorkspaceList />
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <DocumentList />
        </div>
      </div>

    </div>
  )
}