'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CartItem } from '@/types'
import AddToCart from './add-to-cart'

export default function ProductBuyActions({
  item,
  sizes,
}: {
  item: CartItem
  sizes: string[]
}) {
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '')

  useEffect(() => {
    if (!sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0] ?? '')
    }
  }, [sizes, selectedSize])

  return (
    <div className='space-y-4'>
      {sizes.length > 0 && (
        <div className='space-y-2'>
          <p className='text-sm font-semibold text-foreground'>Size</p>
          <div className='flex flex-wrap gap-2'>
            {sizes.map((size) => (
              <button
                key={size}
                type='button'
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'inline-flex h-9 min-w-[44px] items-center justify-center rounded-full border-2 px-3.5 text-sm font-medium transition-all',
                  selectedSize === size
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className='rounded-3xl border border-gold/30 bg-gradient-to-br from-[#fff5dd] via-background to-[#ffe9bd] max-w-md p-4 sm:p-5'>
        <AddToCart item={{ ...item, size: selectedSize }} />
      </div>
    </div>
  )
}