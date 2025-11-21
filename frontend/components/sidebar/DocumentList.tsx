import { useState } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../../src/stores/useStore'
import { supabase } from '../../src/lib/supabase'
import { ChevronRight, FileText, Plus, MoreHorizontal } from 'lucide-react'
import { Document } from '../../src/lib/database.types'

interface DocumentItemProps {
  doc: Document
  level?: number
}

const DocumentItem = ({ doc, level = 0 }: DocumentItemProps) => {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const documents = useStore((state) => state.documents)
  const addDocument = useStore((state) => state.addDocument)
  const user = useStore((state) => state.user)

  const childDocs = documents.filter((d) => d.parent_id === doc.id)
  const hasChildren = childDocs.length > 0
  const isActive = router.query.id === doc.id

  // --- CREATE SUB-PAGE ---
  const createSubPage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return

    const newDoc = {
      title: 'Untitled',
      workspace_id: doc.workspace_id,
      parent_id: doc.id,
      content: {},
      created_by: user.id
    }

    const { data } = await supabase.from('documents').insert(newDoc).select().single()
    if (data) {
      addDocument(data)
      setIsExpanded(true)
      router.push(`/workspace/${data.id}`)
    }
  }

  return (
    <div>
      <div 
        className={`group flex items-center gap-1 py-[2px] px-2 text-xs rounded-sm cursor-pointer select-none transition-colors
          ${isActive ? 'bg-[#373737] text-white font-medium' : 'text-[#999] hover:bg-[#222] hover:text-gray-200'}
        `}
        style={{ paddingLeft: `${level * 10 + 8}px` }}
        onClick={() => router.push(`/workspace/${doc.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
          className={`p-0.5 rounded hover:bg-[#333] text-gray-500 flex items-center justify-center w-4 h-4 transition-opacity ${hasChildren ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <ChevronRight size={10} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={12} className={isActive ? 'text-purple-400' : 'text-gray-500'} />
            <span className="truncate">{doc.title || 'Untitled'}</span>
        </div>

        {/* Hover Actions (Obsidian style: minimalist) */}
        {isHovered && (
          <div className="flex items-center">
             <button 
                className="p-0.5 rounded hover:bg-[#444] text-gray-400"
                onClick={createSubPage}
                title="Add note inside"
             >
                <Plus size={12} />
             </button>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {childDocs.map((child) => (
            <DocumentItem key={child.id} doc={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocumentList() {
  const documents = useStore((state) => state.documents)
  const currentWorkspace = useStore((state) => state.currentWorkspace)
  const addDocument = useStore((state) => state.addDocument)
  const user = useStore((state) => state.user)
  const router = useRouter()

  const rootDocs = documents.filter(
    (doc) => doc.workspace_id === currentWorkspace?.id && !doc.parent_id
  )

  const createRootPage = async () => {
     if (!currentWorkspace || !user) return
     const newDoc = {
       title: 'Untitled',
       workspace_id: currentWorkspace.id,
       parent_id: null,
       content: {},
       created_by: user.id
     }
     const { data } = await supabase.from('documents').insert(newDoc).select().single()
     if (data) {
        addDocument(data)
        router.push(`/workspace/${data.id}`)
     }
  }

  if (!currentWorkspace) return null

  return (
    <div className="mt-2">
      <div className="px-3 mb-1 flex justify-between items-center group h-6">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Files</span>
        <button 
            onClick={createRootPage}
            className="opacity-0 group-hover:opacity-100 hover:bg-[#333] p-1 rounded text-gray-400 hover:text-white transition-all"
            title="New File"
        >
          <Plus size={12} />
        </button>
      </div>
      
      <div className="space-y-0.5">
        {rootDocs.length === 0 ? (
          <div className="px-4 py-2 text-[10px] text-gray-600 italic">No files found.</div>
        ) : (
          rootDocs.map((doc) => (
            <DocumentItem key={doc.id} doc={doc} />
          ))
        )}
      </div>
    </div>
  )
}