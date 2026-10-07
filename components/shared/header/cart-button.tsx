'use client'

import { ShoppingCartIcon } from 'lucide-react'
import Link from 'next/link'
import useIsMounted from '@/hooks/use-is-mounted'
import { cn } from '@/lib/utils'
import useCartStore from '@/hooks/use-cart-store'

export default function CartButton() {
  const isMounted = useIsMounted()
  const {
    cart: { items },
  } = useCartStore()
  const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0)

  return (
    <Link
      href='/cart'
      aria-label='Cart'
      className='self-center rounded-full p-2 transition-colors hover:bg-white/10'
    >
      <div className='relative flex items-center'>
        <ShoppingCartIcon className='h-7 w-7' />

        {isMounted && (
          <span
            className={cn(
              `bg-white px-1 rounded-full text-primary text-sm font-bold absolute left-[10px] top-[-4px] z-10`,
              cartItemsCount >= 10 && 'text-xs px-[2px]'
            )}
          >
            {cartItemsCount}
          </span>
        )}
      </div>
    </Link>
  )
}
