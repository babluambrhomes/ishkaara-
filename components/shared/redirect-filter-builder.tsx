'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { formatCurrency, toSlug } from '@/lib/utils'
import {
  buildSearchUrl,
  emptySearchFilterState,
  isSearchUrl,
  parseSearchUrl,
  SEARCH_RATING_OPTIONS,
  SEARCH_SORT_ORDERS,
  type SearchFilterState,
} from '@/lib/search-filters'
import { useSearchFilterOptions } from '@/hooks/use-search-filter-options'

export type BuilderState = SearchFilterState

export const emptyBuilder: BuilderState = emptySearchFilterState

export { buildSearchUrl, parseSearchUrl }

const ALL = 'all'

export function RedirectFilterBuilder({
  value,
  onChange,
  label = 'Redirect URL',
}: {
  value: string
  onChange: (url: string) => void
  label?: string
}) {
  const [builder, setBuilder] = useState<BuilderState>(() =>
    parseSearchUrl(value)
  )
  const [isCustom, setIsCustom] = useState(() => !isSearchUrl(value))
  const lastEmitted = useRef<string | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const { categories, brands, tags, sizes, priceBounds, loading } =
    useSearchFilterOptions(builder.category)

  const rangeMax =
    priceBounds.max > priceBounds.min
      ? priceBounds.max
      : priceBounds.min + 100

  // Price is stored as the "lo-hi" string the search page parses. A range that
  // spans the whole catalogue means the same as no price filter at all.
  const priceRange = useMemo(() => {
    const clamp = (n: number) =>
      Math.min(Math.max(n, priceBounds.min), rangeMax)
    if (!builder.price || builder.price === ALL) {
      return { lo: priceBounds.min, hi: rangeMax }
    }
    const [lo, hi] = builder.price.split('-').map(Number)
    return {
      lo: Number.isNaN(lo) ? priceBounds.min : clamp(lo),
      hi: Number.isNaN(hi) ? rangeMax : clamp(hi),
    }
  }, [builder.price, priceBounds.min, rangeMax])

  const emit = useCallback((url: string) => {
    lastEmitted.current = url
    onChangeRef.current(url)
  }, [])

  useEffect(() => {
    // Ignore the value we just emitted, otherwise re-parsing it would strip
    // the text the admin is currently typing.
    if (lastEmitted.current !== null && lastEmitted.current === value) {
      lastEmitted.current = null
      return
    }
    lastEmitted.current = null
    setBuilder(parseSearchUrl(value))
    setIsCustom(!isSearchUrl(value))
  }, [value])

  // Brands, sizes and tags are scoped to the chosen category, so a value that
  // no longer exists in that category would produce a dead link.
  useEffect(() => {
    if (loading) return
    const invalidBrand = builder.brand !== ALL && !brands.includes(builder.brand)
    const invalidSize = builder.size !== ALL && !sizes.includes(builder.size)
    const invalidTag =
      builder.tag !== ALL && !tags.some((t) => toSlug(t) === builder.tag)
    if (!invalidBrand && !invalidSize && !invalidTag) return
    const next = {
      ...builder,
      brand: invalidBrand ? ALL : builder.brand,
      size: invalidSize ? ALL : builder.size,
      tag: invalidTag ? ALL : builder.tag,
    }
    setBuilder(next)
    emit(buildSearchUrl(next))
  }, [brands, sizes, tags, loading, builder, emit])

  const update = (key: keyof BuilderState, v: string) => {
    let next = { ...builder, [key]: v }
    if (key === 'category' && v !== builder.category) {
      next = { ...next, brand: ALL, size: ALL, tag: ALL }
    }
    setBuilder(next)
    setIsCustom(false)
    emit(buildSearchUrl(next))
  }

  const onManualChange = (url: string) => {
    setBuilder(parseSearchUrl(url))
    setIsCustom(!isSearchUrl(url))
    emit(url)
  }

  const commitPrice = (lo: number, hi: number) => {
    const clampedLo = Math.min(Math.max(lo, priceBounds.min), rangeMax)
    const clampedHi = Math.min(Math.max(hi, priceBounds.min), rangeMax)
    const price =
      clampedLo <= priceBounds.min && clampedHi >= rangeMax
        ? ALL
        : `${clampedLo}-${clampedHi}`
    update('price', price)
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
            <SelectItem value={ALL}>Any category</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={builder.brand}
          onValueChange={(v) => update('brand', v)}
        >
          <SelectTrigger className='h-9'>
            <SelectValue placeholder='Brand' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any brand</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
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
            <SelectItem value={ALL}>Any rating</SelectItem>
            {SEARCH_RATING_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={builder.size}
          onValueChange={(v) => update('size', v)}
        >
          <SelectTrigger className='h-9'>
            <SelectValue placeholder='Size' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any size</SelectItem>
            {sizes.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={builder.tag} onValueChange={(v) => update('tag', v)}>
          <SelectTrigger className='h-9'>
            <SelectValue placeholder='Tag' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any tag</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t} value={toSlug(t)}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={builder.sort} onValueChange={(v) => update('sort', v)}>
          <SelectTrigger className='h-9'>
            <SelectValue placeholder='Sort' />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_SORT_ORDERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
        <Input
          placeholder='Search text (optional)'
          value={builder.q}
          onChange={(e) => update('q', e.target.value)}
        />
        <div className='flex items-center gap-2'>
          <Input
            type='number'
            min={priceBounds.min}
            max={rangeMax}
            value={priceRange.lo}
            aria-label='Minimum price'
            onChange={(e) => {
              const lo = Number(e.target.value)
              setBuilder((prev) => ({
                ...prev,
                price: `${lo}-${priceRange.hi}`,
              }))
            }}
            onBlur={(e) => commitPrice(Number(e.target.value), priceRange.hi)}
          />
          <span className='text-sm text-muted-foreground'>to</span>
          <Input
            type='number'
            min={priceBounds.min}
            max={rangeMax}
            value={priceRange.hi}
            aria-label='Maximum price'
            onChange={(e) => {
              const hi = Number(e.target.value)
              setBuilder((prev) => ({
                ...prev,
                price: `${priceRange.lo}-${hi}`,
              }))
            }}
            onBlur={(e) => commitPrice(priceRange.lo, Number(e.target.value))}
          />
          <span className='shrink-0 text-xs text-muted-foreground'>
            {formatCurrency(priceBounds.min)} – {formatCurrency(rangeMax)}
          </span>
        </div>
      </div>

      <Input
        placeholder='e.g. /search?category=Shirts'
        value={value}
        onChange={(e) => onManualChange(e.target.value)}
      />

      <div className='flex flex-wrap items-center gap-2'>
        {isCustom && value && <Badge variant='outline'>Custom URL</Badge>}
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
    </div>
  )
}
