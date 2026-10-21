'use client'

import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { FormLabel } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toSlug } from '@/lib/utils'

export type BuilderState = {
  category: string
  price: string
  rating: string
  tag: string
}

export const emptyBuilder: BuilderState = {
  category: 'all',
  price: 'all',
  rating: 'all',
  tag: 'all',
}

const PRICE_OPTIONS = [
  { value: 'all', label: 'Any price' },
  { value: '1-20', label: '$1 to $20' },
  { value: '21-50', label: '$21 to $50' },
  { value: '51-1000', label: '$51 to $1000' },
]

const RATING_OPTIONS = [
  { value: 'all', label: 'Any rating' },
  { value: '4', label: '4 & Up' },
  { value: '3', label: '3 & Up' },
  { value: '2', label: '2 & Up' },
  { value: '1', label: '1 & Up' },
]

export const buildSearchUrl = (b: BuilderState) => {
  const params = new URLSearchParams()
  if (b.category !== 'all') params.set('category', b.category)
  if (b.price !== 'all') params.set('price', b.price)
  if (b.rating !== 'all') params.set('rating', b.rating)
  if (b.tag !== 'all') params.set('tag', b.tag)
  const qs = params.toString()
  return qs ? `/search?${qs}` : '/search'
}

export const parseSearchUrl = (url: string): BuilderState => {
  const state = { ...emptyBuilder }
  if (!url || !url.startsWith('/search')) return state
  try {
    const u = new URL(url, 'http://local')
    state.category = u.searchParams.get('category') ?? 'all'
    state.price = u.searchParams.get('price') ?? 'all'
    state.rating = u.searchParams.get('rating') ?? 'all'
    state.tag = u.searchParams.get('tag') ?? 'all'
  } catch {
    return state
  }
  return state
}

export function RedirectFilterBuilder({
  categories,
  tags,
  value,
  onChange,
  label = 'Redirect URL',
}: {
  categories: string[]
  tags: string[]
  value: string
  onChange: (url: string) => void
  label?: string
}) {
  const [builder, setBuilder] = useState<BuilderState>(parseSearchUrl(value))

  useEffect(() => {
    setBuilder(parseSearchUrl(value))
  }, [value])

  const update = (key: keyof BuilderState, v: string) => {
    const next = { ...builder, [key]: v }
    setBuilder(next)
    onChange(buildSearchUrl(next))
  }

  const onManualChange = (url: string) => {
    setBuilder(parseSearchUrl(url))
    onChange(url)
  }

  return (
    <div className='space-y-2'>
      <FormLabel>{label}</FormLabel>
      <div className='grid grid-cols-2 gap-2 lg:grid-cols-4'>
        <Select
          value={builder.category}
          onValueChange={(v) => update('category', v)}
        >
          <SelectTrigger className='h-9'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Any category</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={builder.price}
          onValueChange={(v) => update('price', v)}
        >
          <SelectTrigger className='h-9'>
            <SelectValue placeholder='Price' />
          </SelectTrigger>
          <SelectContent>
            {PRICE_OPTIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={builder.rating}
          onValueChange={(v) => update('rating', v)}
        >
          <SelectTrigger className='h-9'>
            <SelectValue placeholder='Rating' />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={builder.tag} onValueChange={(v) => update('tag', v)}>
          <SelectTrigger className='h-9'>
            <SelectValue placeholder='Tag' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Any tag</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t} value={toSlug(t)}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        placeholder='e.g. /search?category=Shirts'
        value={value}
        onChange={(e) => onManualChange(e.target.value)}
      />
      {value && (
        <a
          href={value}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 text-xs text-primary hover:underline'
        >
          <ExternalLink className='h-3 w-3' />
          Preview: {value}
        </a>
      )}
    </div>
  )
}
