'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RotateCcw } from 'lucide-react'

import { formatCurrency, getFilterUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type FilterParams = {
  q?: string
  category?: string
  tag?: string
  brand?: string
  price?: string
  rating?: string
  sort?: string
  page?: string
}

const THUMB_CLASSES =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer'

export default function PriceRangeFilter({
  min,
  max,
  value,
  params,
}: {
  min: number
  max: number
  value: string
  params: FilterParams
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const rangeMax = max > min ? max : min + 100

  const parseValue = (val: string) => {
    if (!val || val === 'all') return null
    const [lo, hi] = val.split('-').map(Number)
    if (Number.isNaN(lo) || Number.isNaN(hi)) return null
    return {
      lo: Math.min(Math.max(lo, min), rangeMax),
      hi: Math.min(Math.max(hi, min), rangeMax),
    }
  }

  const parsed = parseValue(value)
  const [lo, setLo] = useState(parsed ? parsed.lo : min)
  const [hi, setHi] = useState(parsed ? parsed.hi : rangeMax)

  useEffect(() => {
    const next = parseValue(value)
    setLo(next ? next.lo : min)
    setHi(next ? next.hi : rangeMax)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max])

  const loPct = ((lo - min) / (rangeMax - min)) * 100
  const hiPct = ((hi - min) / (rangeMax - min)) * 100

  const commit = (nextLo: number, nextHi: number) => {
    const price =
      nextLo <= min && nextHi >= rangeMax ? 'all' : `${nextLo}-${nextHi}`
    if (price === (value || 'all')) return
    startTransition(() => router.push(getFilterUrl({ price, params })))
  }

  const onLoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLo(Math.min(Number(e.target.value), hi))
  }
  const onHiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHi(Math.max(Number(e.target.value), lo))
  }

  const reset = () => {
    setLo(min)
    setHi(rangeMax)
    startTransition(() => router.push(getFilterUrl({ price: 'all', params })))
  }

  return (
    <div>
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-sm font-medium text-foreground'>
          {formatCurrency(lo)} &ndash; {formatCurrency(hi)}
        </span>
        {value !== 'all' && (
          <Button
            variant='ghost'
            size='sm'
            onClick={reset}
            className='h-6 gap-1 px-2 text-xs text-muted-foreground'
          >
            {isPending ? (
              <Loader2 className='h-3 w-3 animate-spin' />
            ) : (
              <RotateCcw className='h-3 w-3' />
            )}
            Reset
          </Button>
        )}
      </div>

      <div className='relative h-8 select-none'>
        <div className='absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted' />
        <div
          className='absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary'
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type='range'
          min={min}
          max={rangeMax}
          step={1}
          value={lo}
          onChange={onLoChange}
          onPointerUp={() => commit(lo, hi)}
          onKeyUp={() => commit(lo, hi)}
          aria-label='Minimum price'
          className={`pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent ${THUMB_CLASSES}`}
        />
        <input
          type='range'
          min={min}
          max={rangeMax}
          step={1}
          value={hi}
          onChange={onHiChange}
          onPointerUp={() => commit(lo, hi)}
          onKeyUp={() => commit(lo, hi)}
          aria-label='Maximum price'
          className={`pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent ${THUMB_CLASSES}`}
        />
      </div>

      <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(rangeMax)}</span>
      </div>
    </div>
  )
}
