import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '../../components/sidebar/Sidebar'
import StatusBar from '../../components/layout/StatusBar'
import Editor from '../../components/editor/Editor'
import { useStore } from '../../src/stores/useStore'
import { supabase } from '../../src/lib/supabase'
import { FileText, X, MoreVertical, Columns } from 'lucide-react'
import { debounce } from 'lodash'

export default function DocumentPage() {
  const router = useRouter()
  const { id } = router.query
  const user = useStore((state) => state.user)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch Data
  useEffect(() => {
    if (!id || !user) return
    const fetchDoc = async () => {
      setIsLoading(true)
      const { data } = await supabase.from('documents').select('*').eq('id', id).single()
      if (data) {
        setTitle(data.title || 'Untitled')
        setContent(data.content)
      }
      setIsLoading(false)
    }
    fetchDoc()
  }, [id, user])

  // Auto-save
  const saveDocument = async (newTitle: string, newContent: any) => {
      await supabase.from('documents').update({ title: newTitle, content: newContent }).eq('id', id)
  }
  const debouncedSave = useCallback(debounce(saveDocument, 1000), [id])

  const handleContentChange = (newContent: any) => debouncedSave(title, newContent)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    debouncedSave(e.target.value, content)
  }

  if (isLoading) return <div className="flex h-screen bg-[#111] text-gray-500 items-center justify-center">Loading...</div>

  return (
    <div className="flex h-screen bg-[#111] text-gray-300 font-mono text-sm overflow-hidden">
      
      {/* 1. Left Sidebar (Ribbon + Explorer) */}
      <Sidebar />

      {/* 2. Main Pane Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        
        {/* --- Tab Bar --- */}
        <div className="h-9 flex items-center bg-[#111] border-b border-[#222] px-2 gap-1 pt-1">
            {/* Active Tab */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] text-white rounded-t-md border-t border-l border-r border-[#333] text-xs min-w-[120px] group relative">
                <FileText size={12} className="text-gray-400" />
                <span className="truncate">{title || 'Untitled'}</span>
                <X size={12} className="ml-auto opacity-0 group-hover:opacity-100 cursor-pointer hover:text-red-400" />
                
                {/* Active Tab Highlight Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500 rounded-t-md"></div>
            </div>

            {/* Inactive Tab Example */}
            <div className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:bg-[#1a1a1a] rounded-t-md cursor-pointer text-xs min-w-[120px]">
                <FileText size={12} />
                <span className="truncate">Instruction</span>
            </div>
            
            <div className="ml-auto flex items-center gap-2 text-gray-500">
                <Columns size={14} className="hover:text-white cursor-pointer"/>
                <MoreVertical size={14} className="hover:text-white cursor-pointer"/>
            </div>
        </div>

        {/* --- Breadcrumbs / Header --- */}
        <div className="h-10 flex items-center px-8 border-b border-[#222] bg-[#1e1e1e]">
            <span className="text-gray-500">QuillBoard</span>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-gray-300">{title}</span>
        </div>

        {/* --- Editor Area --- */}
        <div className="flex-1 overflow-y-auto relative">
            <div className="max-w-3xl mx-auto pt-12 px-12 pb-32">
                
                {/* Title Input (Obsidian Style: Clean, H1) */}
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-600 outline-none border-none mb-8 font-sans"
                  placeholder="Untitled"
                />

                {/* The Editor */}
                <div className="obsidian-editor">
                    <Editor 
                        documentId={id as string} 
                        content={content} 
                        onChange={handleContentChange} 
                    />
                </div>
            </div>
        </div>

        {/* --- Status Bar --- */}
        <StatusBar wordCount={120} />
      </div>
    </div>
  )
}