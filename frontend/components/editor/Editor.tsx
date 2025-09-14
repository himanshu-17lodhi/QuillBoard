// frontend/components/editor/Editor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { useStore } from '../../stores/useStore'
import { useEffect, useState } from 'react'

interface EditorProps {
  documentId: string
}

export default function Editor({ documentId }: EditorProps) {
  const user = useStore((state) => state.user)
  const currentDocument = useStore((state) => state.currentDocument)
  const updateDocument = useStore((state) => state.updateDocument)
  const [provider, setProvider] = useState<WebrtcProvider | null>(null)
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null)

  // Set up Y.js for collaborative editing
  useEffect(() => {
    const yDoc = new Y.Doc()
    const yProvider = new WebrtcProvider(documentId, yDoc)
    
    setYdoc(yDoc)
    setProvider(yProvider)

    return () => {
      yProvider.destroy()
      yDoc.destroy()
    }
  }, [documentId])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Collaboration.configure({
        document: ydoc!,
      }),
      CollaborationCursor.configure({
        provider: provider!,
        user: {
          name: user?.name || 'Anonymous',
          color: '#f56565',
        },
      }),
    ],
    content: currentDocument?.content || '<p>Start collaborating!</p>',
    onUpdate: ({ editor }) => {
      // Debounce content updates to avoid too many API calls
      const content = editor.getJSON()
      updateDocument(documentId, { content })
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (editor && currentDocument) {
      editor.commands.setContent(currentDocument.content || '')
    }
  }, [editor, currentDocument])

  if (!editor) {
    return (
      <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
        <div className="animate-pulse">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Toolbar */}
      <div className="border-b border-gray-700 p-4 bg-gray-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-md ${editor.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M6 12h12M3 18h18" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-md ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-md ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-md ${editor.isActive('bulletList') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} className="min-h-screen p-8" />
    </div>
  )
}