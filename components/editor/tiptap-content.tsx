import { cn } from '@/lib/utils'

interface TiptapContentProps {
  html: string
  className?: string
}

export function TiptapContent({ html, className }: TiptapContentProps) {
  return (
    <div
      className={cn('tiptap-content', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
