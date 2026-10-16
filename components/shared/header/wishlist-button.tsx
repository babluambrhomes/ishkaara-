'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import useIsMounted from '@/hooks/use-is-mounted'
import useWishlistStore from '@/hooks/use-wishlist-store'
import { cn } from '@/lib/utils'

export default function WishlistButton() {
  const isMounted = useIsMounted()
  const items = useWishlistStore((state) => state.items)
  const count = items.length

  return (
    <Link
      href='/wishlist'
      aria-label='Wishlist'
      className='self-center rounded-full p-2 transition-colors hover:bg-muted'
    >
      <div className='relative flex items-center'>
        <Heart className='h-7 w-7' />

        {isMounted && count > 0 && (
          <span
            className={cn(
              `bg-primary px-1 rounded-circle text-primary-foreground text-sm font-bold absolute left-[10px] top-[-4px] z-10`,
              count >= 10 && 'text-xs px-[2px]'
            )}
          >
            {count}
          </span>
        )}
      </div>
    </Link>
  )
}
