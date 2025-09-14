// frontend/components/editor/EnhancedEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useStore } from '../../stores/useStore';
import { useEffect, useState } from 'react';

interface EnhancedEditorProps {
  documentId: string;
}

export default function EnhancedEditor({ documentId }: EnhancedEditorProps) {
  const user = useStore((state) => state.user);
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocument = useStore((state) => state.updateDocument);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);

  // Set up Y.js for collaborative editing
  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new WebrtcProvider(documentId, yDoc);
    
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
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      TaskList,
      TaskItem,
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
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
      const content = editor.getJSON();
      updateDocument(documentId, { content });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && currentDocument) {
      editor.commands.setContent(currentDocument.content || '');
    }
  }, [editor, currentDocument]);

  if (!editor) {
    return (
      <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
        <div className="animate-pulse">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Enhanced Toolbar */}
      <div className="border-b border-gray-700 p-4 bg-gray-800">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {/* Text formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-md ${editor.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-md ${editor.isActive('italic') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-md ${editor.isActive('underline') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Underline"
          >
            <span className="underline">U</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-md ${editor.isActive('strike') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Strikethrough"
          >
            <span className="line-through">S</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded-md ${editor.isActive('highlight') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Highlight"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.71 5.63l-2.34-2.34a1 1 0 00-1.42 0l-3 3-1.29-1.3a1 1 0 00-1.42 0l-4 4a1 1 0 000 1.41l1.3 1.29-5 5a1 1 0 000 1.41l2.34 2.34a1 1 0 001.41 0l5-5 1.29 1.3a1 1 0 001.41 0l4-4a1 1 0 000-1.42l-1.3-1.29 3-3a1 1 0 000-1.42zM9 18.17l-4-4 1.41-1.41 4 4zM16 11.17l-4-4 1.41-1.41 4 4z"/>
            </svg>
          </button>

          {/* Headings */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-md ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-md ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-md ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Heading 3"
          >
            H3
          </button>

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-md ${editor.isActive('bulletList') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-md ${editor.isActive('orderedList') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Numbered List"
          >
            1.
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-2 rounded-md ${editor.isActive('taskList') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Task List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded-md ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18M3 6h18" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded-md ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded-md ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H3M21 14H3M21 18H3M21 6H3" />
            </svg>
          </button>

          {/* Code */}
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded-md ${editor.isActive('code') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Inline Code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded-md ${editor.isActive('codeBlock') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Code Block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Blockquote */}
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-md ${editor.isActive('blockquote') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Blockquote"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} className="min-h-screen p-8" />
    </div>
  );
}