'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'

export type HelpTopic = {
  title: string
  description: string
  href: string
  keywords: string
}

export default function HelpSearch({ topics }: { topics: HelpTopic[] }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return topics
      .filter((topic) =>
        `${topic.title} ${topic.description} ${topic.keywords}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 6)
  }, [query, topics])

  const hasQuery = query.trim().length > 0

  return (
    <div className='relative mx-auto mt-7 w-full max-w-2xl'>
      <Search className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search help topics... e.g. order, shipping, return, payment'
        aria-label='Search help topics'
        className='h-14 border-border/70 bg-white pl-12 text-base shadow-soft focus-visible:ring-gold/60'
      />

      {hasQuery && (
        <div className='absolute inset-x-0 top-full z-20 mt-2 overflow-hidden border border-border/60 bg-white shadow-lift'>
          {results.length > 0 ? (
            <ul className='divide-y divide-border/60'>
              {results.map((topic) => (
                <li key={topic.href}>
                  <Link
                    href={topic.href}
                    className='flex items-start gap-3 px-4 py-3 transition-colors hover:bg-primary/5'
                  >
                    <ArrowRight className='mt-0.5 h-4 w-4 shrink-0 text-gold' />
                    <span>
                      <span className='block text-sm font-semibold'>
                        {topic.title}
                      </span>
                      <span className='mt-0.5 block text-xs text-muted-foreground'>
                        {topic.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className='px-4 py-6 text-center text-sm text-muted-foreground'>
              No topics found for &ldquo;{query}&rdquo;. Try a different keyword
              or{' '}
              <Link href='/contact-us' className='font-semibold text-primary'>
                contact support
              </Link>
              .
            </div>
          )}
        </div>
      )}
    </div>
  )
}
