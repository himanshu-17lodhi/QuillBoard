import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { all, createLowlight } from 'lowlight'
import { useEffect } from 'react'
import { Bold, Italic, Strikethrough, Code, List, CheckSquare, Highlighter } from 'lucide-react'

// Setup syntax highlighting
const lowlight = createLowlight(all)

interface EditorProps {
  documentId: string
  content?: any
  onChange?: (content: any) => void
  editable?: boolean
}

export default function Editor({ documentId, content, onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default codeBlock to use Lowlight
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content || '',
    editable: editable,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none text-[#D4D4D4] leading-7',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getJSON())
    },
  })

  // Sync content when documentId changes
  useEffect(() => {
    if (editor && content) {
        const currentContent = JSON.stringify(editor.getJSON())
        const newContent = JSON.stringify(content)
        if (currentContent !== newContent) {
             editor.commands.setContent(content)
        }
    }
  }, [content, documentId, editor])

  if (!editor) return null

  return (
    <div className="relative w-full">
      {/* --- FLOATING BUBBLE MENU (The Notion Way) --- */}
      {editor && (
        <BubbleMenu className="flex bg-[#252525] border border-[#333] shadow-xl rounded-md overflow-hidden divide-x divide-[#333]" tippyOptions={{ duration: 100 }} editor={editor}>
          
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 hover:bg-[#333] text-white ${editor.isActive('bold') ? 'text-blue-400' : ''}`}><Bold size={14} /></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 hover:bg-[#333] text-white ${editor.isActive('italic') ? 'text-blue-400' : ''}`}><Italic size={14} /></button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 hover:bg-[#333] text-white ${editor.isActive('strike') ? 'text-blue-400' : ''}`}><Strikethrough size={14} /></button>
          <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 hover:bg-[#333] text-white ${editor.isActive('code') ? 'text-blue-400' : ''}`}><Code size={14} /></button>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 hover:bg-[#333] text-white ${editor.isActive('bulletList') ? 'text-blue-400' : ''}`}><List size={14} /></button>
          <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`p-2 hover:bg-[#333] text-white ${editor.isActive('taskList') ? 'text-blue-400' : ''}`}><CheckSquare size={14} /></button>
          <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`p-2 hover:bg-[#333] text-white ${editor.isActive('highlight') ? 'text-yellow-400' : ''}`}><Highlighter size={14} /></button>

        </BubbleMenu>
      )}

      {/* --- Editor Styles --- */}
      <style jsx global>{`
        .is-editor-empty:first-child::before {
          color: #3F3F3F;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        /* Headings */
        .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; color: white; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.4em; margin-bottom: 0.5em; color: white; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.2em; margin-bottom: 0.5em; color: white; }
        /* Lists */
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
        /* Tasks */
        ul[data-type="taskList"] { list-style: none; padding: 0; }
        li[data-type="taskItem"] { display: flex; align-items: flex-start; margin-bottom: 0.5rem; }
        li[data-type="taskItem"] input[type="checkbox"] { margin-right: 0.5rem; margin-top: 0.3rem; }
        /* Code Blocks */
        .ProseMirror pre { background: #1E1E1E; color: #D4D4D4; padding: 0.75rem 1rem; border-radius: 0.5rem; font-family: 'JetBrains Mono', monospace; margin: 1rem 0; }
        .ProseMirror code { background-color: #2C2C2C; color: #EB5757; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.85em; }
        .ProseMirror pre code { background: none; color: inherit; padding: 0; font-size: 0.9em; }
        /* Blockquote */
        .ProseMirror blockquote { border-left: 3px solid #444; padding-left: 1em; color: #9B9B9B; font-style: italic; }
      `}</style>

      <EditorContent editor={editor} />
    </div>
  )
}