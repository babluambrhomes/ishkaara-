'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import useIsMounted from '@/hooks/use-is-mounted'
import useWishlistStore from '@/hooks/use-wishlist-store'
import ProductCard from '@/components/shared/product/product-card'

export default function WishlistPage() {
  const isMounted = useIsMounted()
  const items = useWishlistStore((state) => state.items)
  const removeItem = useWishlistStore((state) => state.removeItem)

  return (
    <div>
      {/* Hero / header band */}
      <div className='border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-gold/[0.12]'>
        <div className='px-4 py-8 md:px-8 lg:px-12'>
          <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold'>
            Your favorites
          </p>
          <h1 className='premium-title text-3xl font-bold tracking-tight lg:text-4xl'>
            Wishlist
          </h1>
          {isMounted && items.length > 0 && (
            <p className='mt-3 text-muted-foreground'>
              {items.length} {items.length === 1 ? 'item' : 'items'} saved for
              later
            </p>
          )}
        </div>
      </div>

      <div className='px-4 py-8 md:px-8 lg:px-12'>
        {isMounted && items.length > 0 ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {items.map((item) => (
              <ProductCard
                key={item._id}
                product={item}
                isWishlist
                onRemove={removeItem}
              />
            ))}
          </div>
        ) : (
          <div className='rounded-2xl border border-dashed border-border/70 py-20 text-center'>
            <Heart className='mx-auto h-12 w-12 text-muted-foreground/40' />
            <h3 className='mt-4 text-lg font-semibold'>
              Your wishlist is empty
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Tap the heart on any product to save it here.
            </p>
            <Button asChild className='mt-6 rounded-full'>
              <Link href='/search'>Start shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}