'use client'

import ProductPrice from '@/components/shared/product/product-price'
import { getMonthName } from '@/lib/utils'
import { getImageUrl } from '@/lib/image-url'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type TableChartProps = {
  labelType: 'month' | 'product'
  data: {
    label: string
    image?: string
    value: number
    id?: string
  }[]
}

export default function TableChart({
  labelType = 'month',
  data = [],
}: TableChartProps) {
  const max = Math.max(...data.map((item) => item.value), 0)
  const rows = data.map((x) => ({
    ...x,
    label: labelType === 'month' ? getMonthName(x.label) : x.label,
    percentage: max ? Math.round((x.value / max) * 100) : 0,
  }))

  if (rows.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
        No data for this period
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {rows.map(({ label, id, value, image, percentage }) => (
        <div key={`${label}-${id ?? ''}`} className='space-y-1.5'>
          <div className='flex items-center justify-between gap-3 text-sm'>
            {image ? (
              <Link
                href={`/workspace/products/${id}`}
                className='flex min-w-0 items-center gap-2 hover:underline'
              >
                <Image
                  className='h-7 w-7 shrink-0 rounded-md border object-cover'
                  src={getImageUrl(image)}
                  alt={label}
                  width={28}
                  height={28}
                />
                <span className='truncate font-medium'>{label}</span>
              </Link>
            ) : (
              <span className='truncate font-medium'>{label}</span>
            )}

            <div className='shrink-0 font-semibold tabular-nums'>
              <ProductPrice price={value} plain />
            </div>
          </div>

          <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-500'
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
