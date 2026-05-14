import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, ListOrdered, Link2, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function WysiwygEditor({ value, onChange, placeholder }: WysiwygEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-neutral max-w-none min-h-[180px] p-4 focus:outline-none',
        'data-placeholder': placeholder ?? 'Escribe la descripción del evento...',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  function addLink() {
    const previousUrl = editor!.getAttributes('link').href
    const url = window.prompt('URL del enlace', previousUrl ?? '')
    if (url === null) return
    if (url === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="rounded-xl border border-neutral-300 bg-white overflow-hidden">
      <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 p-1">
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('link')}
          onClick={addLink}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

interface ToolbarButtonProps {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToolbarButton({ active, onClick, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={active ? 'bg-blue-50 text-blue-700' : ''}
    >
      {children}
    </Button>
  )
}
