'use client'

import Link from 'next/link'
import { useState } from 'react'

import { cn, getFilterUrl, toSlug } from '@/lib/utils'

const TAGS_LIMIT = 10

const TagChip = ({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) => (
  <Link
    href={href}
    className={cn(
      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200',
      active
        ? 'border-primary bg-primary text-primary-foreground '
        : 'border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-foreground'
    )}
  >
    {children}
  </Link>
)

export default function TagFilter({
  tags,
  params,
  activeTag,
}: {
  tags: string[]
  params: {
    q?: string
    category?: string
    tag?: string
    brand?: string
    price?: string
    rating?: string
    sort?: string
    page?: string
  }
  activeTag: string
}) {
  const [showAll, setShowAll] = useState(false)

  const hasMore = tags.length > TAGS_LIMIT
  const visibleTags = showAll ? tags : tags.slice(0, TAGS_LIMIT)

  return (
    <div>
      <div className='flex flex-wrap gap-2'>
        <TagChip
          href={getFilterUrl({ tag: 'all', params })}
          active={activeTag === 'all' || activeTag === ''}
        >
          All
        </TagChip>
        {visibleTags.map((t) => (
          <TagChip
            key={t}
            href={getFilterUrl({ tag: t, params })}
            active={toSlug(t) === activeTag}
          >
            {t}
          </TagChip>
        ))}
      </div>

      {hasMore && (
        <button
          type='button'
          onClick={() => setShowAll((value) => !value)}
          className='mt-3 text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline'
        >
          {showAll ? 'Show less' : `Show more (${tags.length - TAGS_LIMIT})`}
        </button>
      )}
    </div>
  )
}
