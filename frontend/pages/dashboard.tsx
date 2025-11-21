import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '../components/sidebar/Sidebar'
import { useStore } from '../src/stores/useStore'
import { supabase } from '../src/lib/supabase'
import { Plus, X, FileText } from 'lucide-react' 

export default function Dashboard() {
  const router = useRouter()
  const user = useStore((state) => state.user)
  const addDocument = useStore((state) => state.addDocument)
  const currentWorkspace = useStore((state) => state.currentWorkspace)
  const [isLoading, setIsLoading] = useState(true)

  // 1. Auth Check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      } else {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [router])

  // 2. Create Note Logic
  const handleCreateNote = async () => {
     if (!currentWorkspace || !user) return
     
     const newDoc = {
       title: 'Untitled',
       workspace_id: currentWorkspace.id,
       parent_id: null,
       content: {},
       created_by: user.id
     }

     // Insert into Supabase
     const { data } = await supabase.from('documents').insert(newDoc).select().single()
     
     // Update State & Redirect
     if (data) {
        addDocument(data)
        router.push(`/workspace/${data.id}`)
     }
  }

  if (isLoading) return <div className="min-h-screen bg-[#161616]" />

  return (
    <div className="flex h-screen bg-[#161616] text-gray-300 font-sans overflow-hidden">
      
      {/* Sidebar (Left Panel) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        
        {/* --- Top Tab Bar (Obsidian Style) --- */}
        <div className="h-9 flex items-center bg-[#111] border-b border-[#222] px-2 gap-1 pt-1 select-none">
            {/* Active Tab "New tab" */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] text-gray-300 rounded-t-md border-t border-l border-r border-[#333] text-xs min-w-[140px] group relative">
                <FileText size={12} className="text-gray-500"/>
                <span className="truncate font-medium">New tab</span>
                <X size={12} className="ml-auto opacity-0 group-hover:opacity-100 cursor-pointer hover:text-gray-100" />
                
                {/* Purple Active Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#a882ff] rounded-t-md"></div>
            </div>
            
            {/* New Tab Plus Button */}
            <div className="flex items-center justify-center w-8 h-8 text-gray-500 hover:bg-[#222] rounded-md cursor-pointer transition-colors" title="New tab">
                <Plus size={14} />
            </div>
        </div>

        {/* --- Central "New Tab" Content --- */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[#1e1e1e]">
            <div className="flex flex-col items-center gap-6 text-sm">
                
                {/* Obsidian Purple Links */}
                <div className="flex flex-col items-center gap-3 font-medium">
                    
                    <button 
                        onClick={handleCreateNote}
                        className="text-[#a882ff] hover:text-[#bf9eff] hover:underline transition-colors cursor-pointer"
                    >
                        Create new note <span className="text-gray-600 font-normal ml-1 text-xs">(Ctrl + N)</span>
                    </button>

                    <button className="text-[#a882ff] hover:text-[#bf9eff] hover:underline transition-colors cursor-pointer">
                        Go to file <span className="text-gray-600 font-normal ml-1 text-xs">(Ctrl + O)</span>
                    </button>

                    <button className="text-[#a882ff] hover:text-[#bf9eff] hover:underline transition-colors cursor-pointer">
                        See recent files <span className="text-gray-600 font-normal ml-1 text-xs">(Ctrl + P)</span>
                    </button>

                    <button className="text-[#a882ff] hover:text-[#bf9eff] hover:underline transition-colors cursor-pointer">
                        Close
                    </button>
                </div>

            </div>
        </main>
      </div>
    </div>
  )
}