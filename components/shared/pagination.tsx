'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import { cn, formUrlQuery } from '@/lib/utils'

import { Button } from '../ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

type PaginationProps = {
  page: number | string
  totalPages: number
  urlParamName?: string
}

const getPageNumbers = (current: number, totalPages: number): (number | '...')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - current) <= 1) {
      pages.push(i)
    }
  }
  const result: (number | '...')[] = []
  let prev = 0
  for (const p of pages) {
    if (prev && p - prev > 1) result.push('...')
    result.push(p)
    prev = p
  }
  return result
}

const Pagination = ({
  page,
  totalPages,
  urlParamName,
}: PaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const current = Math.min(
    Math.max(Number(page) || 1, 1),
    Math.max(totalPages, 1)
  )

  const buildUrl = (pageValue: number) =>
    formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || 'page',
      value: pageValue.toString(),
    })

  const goTo = (pageValue: number) => router.push(buildUrl(pageValue))

  const IconButton = ({
    label,
    disabled,
    onClick,
    children,
  }: {
    label: string
    disabled: boolean
    onClick: () => void
    children: React.ReactNode
  }) => (
    <Button
      size='icon'
      variant='outline'
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className='h-9 w-9 rounded-circle'
    >
      {children}
    </Button>
  )

  return (
    <nav className='flex items-center gap-1.5'>
      <IconButton
        label='First page'
        disabled={current <= 1}
        onClick={() => goTo(1)}
      >
        <ChevronsLeft />
      </IconButton>
      <IconButton
        label='Previous page'
        disabled={current <= 1}
        onClick={() => goTo(current - 1)}
      >
        <ChevronLeft />
      </IconButton>

      {getPageNumbers(current, totalPages).map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className='px-0.5 text-sm text-muted-foreground'>
            …
          </span>
        ) : (
          <Button
            key={p}
            size='icon'
            variant={p === current ? 'default' : 'outline'}
            onClick={() => goTo(p)}
            disabled={p === current}
            aria-label={`Page ${p}`}
            className={cn('h-9 w-9 rounded-circle', p === current && '')}
          >
            {p}
          </Button>
        )
      )}

      <IconButton
        label='Next page'
        disabled={current >= totalPages}
        onClick={() => goTo(current + 1)}
      >
        <ChevronRight />
      </IconButton>
      <IconButton
        label='Last page'
        disabled={current >= totalPages}
        onClick={() => goTo(totalPages)}
      >
        <ChevronsRight />
      </IconButton>

      <span className='ml-2 text-sm text-muted-foreground'>
        Page {current} of {totalPages}
      </span>
    </nav>
  )
}

export default Pagination
