'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  useEditor,
  EditorContent,
  useEditorState,
  type Editor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { Placeholder, CharacterCount } from '@tiptap/extensions'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image as ImageIcon,
  Palette,
  Highlighter,
  Code,
  SquareCode,
  RemoveFormatting,
  CornerDownLeft,
  Undo2,
  Redo2,
  Table,
  Rows3,
  Columns3,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getImageUrl } from '@/lib/image-url'
import { uploadImageFile, type UploadEntity } from '@/lib/upload-client'
import { useToast } from '@/hooks/use-toast'

interface TiptapEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  entity?: UploadEntity
}

const TOOLBAR_BUTTON_CLASS =
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:pointer-events-none'

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      data-tooltip={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        TOOLBAR_BUTTON_CLASS,
        active && 'bg-accent text-accent-foreground'
      )}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <span className='mx-1 h-5 w-px shrink-0 bg-border' aria-hidden />
}

function RowDeleteIcon() {
  return (
    <span className='relative inline-flex'>
      <Rows3 className='h-4 w-4' />
      <X className='absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-background text-destructive' />
    </span>
  )
}

function ColumnDeleteIcon() {
  return (
    <span className='relative inline-flex'>
      <Columns3 className='h-4 w-4' />
      <X className='absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-background text-destructive' />
    </span>
  )
}

type EditorStateSnapshot = {
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  h1: boolean
  h2: boolean
  h3: boolean
  bulletList: boolean
  orderedList: boolean
  blockquote: boolean
  align: 'left' | 'center' | 'right'
  link: boolean
  highlight: boolean
  code: boolean
  codeBlock: boolean
  inTable: boolean
  color: string
  characters: number
  words: number
  canUndo: boolean
  canRedo: boolean
}

const EMPTY_STATE: EditorStateSnapshot = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  h1: false,
  h2: false,
  h3: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  align: 'left',
  link: false,
  highlight: false,
  code: false,
  codeBlock: false,
  inTable: false,
  color: '#000000',
  characters: 0,
  words: 0,
  canUndo: false,
  canRedo: false,
}

const createHeadingId = (): string =>
  `h-${Math.random().toString(36).slice(2, 8)}`

const assignHeadingIds = (editor: Editor) => {
  const tr = editor.state.tr
  let changed = false
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading' && !node.attrs.id) {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        id: createHeadingId(),
      })
      changed = true
    }
  })
  if (changed) editor.view.dispatch(tr)
}

const HeadingWithId = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('id'),
        renderHTML: (attributes) => {
          if (!attributes.id) return {}
          return { id: attributes.id }
        },
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() ?? []),
      new Plugin({
        key: new PluginKey('headingId'),
        appendTransaction: (_transactions, _oldState, newState) => {
          const tr = newState.tr
          let changed = false
          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'heading' && !node.attrs.id) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                id: createHeadingId(),
              })
              changed = true
            }
          })
          return changed ? tr : null
        },
      }),
    ]
  },
})

export function TiptapEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  className,
  disabled = false,
  entity = 'blog',
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        link: { openOnClick: false, autolink: true },
      }),
      HeadingWithId.configure({ levels: [1, 2, 3] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: false }),
      TableKit,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onCreate: ({ editor }) => {
      assignHeadingIds(editor)
    },
    editorProps: {
      attributes: {
        class: cn(
          'tiptap min-h-[320px] px-3 py-2 focus:outline-none',
          className
        ),
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current && !(value === '' && editor.isEmpty)) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  const state = useEditorState<EditorStateSnapshot>({
    editor: editor as Editor,
    selector: ({ editor }) => {
      if (!editor) return EMPTY_STATE
      const align = (['left', 'center', 'right'] as const).find((a) =>
        editor.isActive({ textAlign: a })
      )
      return {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        strike: editor.isActive('strike'),
        h1: editor.isActive('heading', { level: 1 }),
        h2: editor.isActive('heading', { level: 2 }),
        h3: editor.isActive('heading', { level: 3 }),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
        blockquote: editor.isActive('blockquote'),
        align: align ?? 'left',
        link: editor.isActive('link'),
        highlight: editor.isActive('highlight'),
        code: editor.isActive('code'),
        codeBlock: editor.isActive('codeBlock'),
        inTable: editor.isActive('table'),
        color: (editor.getAttributes('textStyle').color as string) || '#000000',
        characters: editor.storage.characterCount?.characters() ?? 0,
        words: editor.storage.characterCount?.words() ?? 0,
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      }
    },
  })

  const colorInputId = useMemo(
    () => `tiptap-color-${Math.random().toString(36).slice(2, 8)}`,
    []
  )

  const handleImageUpload = async (file: File) => {
    if (!editor) return
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', description: 'Only images are allowed' })
      return
    }
    setUploading(true)
    try {
      const key = await uploadImageFile(file, entity)
      editor.chain().focus().setImage({ src: getImageUrl(key) }).run()
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Upload failed',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!editor) {
    return (
      <div className='overflow-hidden rounded-md border border-input bg-background'>
        <div className='min-h-[320px] animate-pulse bg-muted/30' />
      </div>
    )
  }

  if (disabled) {
    return (
      <div className='overflow-hidden rounded-md border border-input bg-background/50'>
        <div
          className='tiptap min-h-[320px] px-3 py-2 opacity-70'
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring'>
      {/* Toolbar */}
      <div
        className='flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 p-1'
        role='toolbar'
        aria-label='Editor toolbar'
      >
        {/* Text format */}
        <ToolbarButton
          title='Bold (Ctrl+B)'
          active={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Italic (Ctrl+I)'
          active={state.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Underline (Ctrl+U)'
          active={state.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Strikethrough'
          active={state.strike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          title='Heading 1'
          active={state.h1}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Heading 2'
          active={state.h2}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Heading 3'
          active={state.h3}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          title='Bullet list'
          active={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Ordered list'
          active={state.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Blockquote'
          active={state.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Horizontal rule'
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          title='Align left'
          active={state.align === 'left'}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Align center'
          active={state.align === 'center'}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Align right'
          active={state.align === 'right'}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Insert */}
        <ToolbarButton
          title='Insert table'
          active={state.inTable}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Table className='h-4 w-4' />
        </ToolbarButton>
        {state.inTable && (
          <>
            <ToolbarButton
              title='Add row below'
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <Rows3 className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
              title='Add column right'
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <Columns3 className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
              title='Delete row'
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <RowDeleteIcon />
            </ToolbarButton>
            <ToolbarButton
              title='Delete column'
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <ColumnDeleteIcon />
            </ToolbarButton>
            <ToolbarButton
              title='Delete table'
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <Trash2 className='h-4 w-4' />
            </ToolbarButton>
          </>
        )}
        <ToolbarButton
          title={state.link ? 'Remove link' : 'Insert link'}
          active={state.link}
          onClick={() => {
            if (state.link) {
              editor.chain().focus().unsetLink().run()
              return
            }
            const url = window.prompt('Enter URL', 'https://')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
        >
          <Link2 className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title={uploading ? 'Uploading image...' : 'Insert image'}
          active={uploading}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
          ) : (
            <ImageIcon className='h-4 w-4' />
          )}
        </ToolbarButton>
        <ToolbarButton
          title='Hard break (Shift+Enter)'
          onClick={() => editor.chain().focus().setHardBreak().run()}
        >
          <CornerDownLeft className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Style */}
        <label
          htmlFor={colorInputId}
          data-tooltip='Text color'
          className={cn(
            TOOLBAR_BUTTON_CLASS,
            'cursor-pointer relative',
            state.color !== '#000000' && 'text-foreground'
          )}
        >
          <Palette className='h-4 w-4' />
          <span
            className='absolute bottom-0.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-sm border border-border'
            style={{ backgroundColor: state.color }}
          />
          <input
            id={colorInputId}
            type='color'
            value={state.color}
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            className='absolute h-0 w-0 opacity-0'
            aria-label='Text color'
          />
        </label>
        <ToolbarButton
          title='Highlight'
          active={state.highlight}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Code */}
        <ToolbarButton
          title='Inline code'
          active={state.code}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Code block'
          active={state.codeBlock}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <SquareCode className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Clear formatting'
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <RemoveFormatting className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarDivider />

        {/* History */}
        <ToolbarButton
          title='Undo (Ctrl+Z)'
          disabled={!state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className='h-4 w-4' />
        </ToolbarButton>
        <ToolbarButton
          title='Redo (Ctrl+Shift+Z)'
          disabled={!state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className='h-4 w-4' />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className='max-h-[560px] overflow-y-auto bg-background'>
        <EditorContent editor={editor} />
      </div>

      {/* Footer - character / word count */}
      <div className='flex items-center justify-end gap-3 border-t border-input bg-muted/40 px-3 py-1 text-xs text-muted-foreground'>
        <span>{state.words} words</span>
        <span>{state.characters} characters</span>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file)
        }}
      />
    </div>
  )
}
