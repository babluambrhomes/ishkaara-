'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ListOrdered } from 'lucide-react'
import { toSlug } from '@/lib/utils'
import { cn } from '@/lib/utils'

type HeadingItem = { level: number; text: string; slug: string }

const headingRegex = /<h([2-6])([^>]*)>([\s\S]*?)<\/h\1>/gi

function extractHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = []
  for (const match of content.matchAll(headingRegex)) {
    const level = parseInt(match[1], 10)
    const attrs = match[2] ?? ''
    const id = attrs.match(/\bid=["']([^"']+)["']/)?.[1]
    const text = match[3]
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim()
    if (!text) continue
    headings.push({ level, text, slug: id ?? toSlug(text) })
  }
  return headings
}

function TableOfContents({
  content,
  className,
  title = 'On this page',
}: {
  content: string
  className?: string
  title?: string
}) {
  const headings = useMemo(
    () => extractHeadings(content).filter((h) => h.level >= 2),
    [content]
  )
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length === 0) return
    const ids = headings.map((h) => h.slug)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveSlug(visible[0].target.id)
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )
    elements.forEach((el) => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav
      aria-label='Table of contents'
      className={cn('rounded-2xl border border-border/60 bg-background p-4 shadow-soft', className)}
    >
      <div className='mb-3 flex items-center gap-2 border-b border-border/50 pb-3'>
        <ListOrdered className='h-4 w-4 text-gold' />
        <span className='text-xs font-bold uppercase tracking-[0.16em] text-primary'>
          {title}
        </span>
      </div>
      <ul className='max-h-[60vh] space-y-0.5 overflow-y-auto pr-1 text-sm'>
        {headings.map((heading) => (
          <li key={heading.slug}>
            <a
              href={`#${heading.slug}`}
              className={cn(
                'block border-l-2 py-1 pr-2 transition-colors',
                heading.level === 2 && 'pl-2',
                heading.level === 3 && 'pl-5',
                heading.level >= 4 && 'pl-8',
                activeSlug === heading.slug
                  ? 'border-gold font-semibold text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-primary'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents