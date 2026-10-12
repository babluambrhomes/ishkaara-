'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useIsMounted from '@/hooks/use-is-mounted'
import { useToast } from '@/hooks/use-toast'
import useWishlistStore, { WishlistItem } from '@/hooks/use-wishlist-store'
import { cn } from '@/lib/utils'

export default function AddToWishlist({
  item,
  variant = 'button',
  className,
}: {
  item: WishlistItem
  variant?: 'overlay' | 'button'
  className?: string
}) {
  const isMounted = useIsMounted()
  const router = useRouter()
  const { toast } = useToast()
  const items = useWishlistStore((state) => state.items)
  const toggleItem = useWishlistStore((state) => state.toggleItem)

  const active = isMounted && items.some((x) => x._id === item._id)

  const handleToggle = async () => {
    const result = await toggleItem(item._id)
    if (result === 'error') {
      toast({
        variant: 'destructive',
        description: 'Please sign in to save items to your wishlist.',
      })
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(
          typeof window !== 'undefined' ? window.location.pathname : '/'
        )}`
      )
      return
    }
    toast({
      description:
        result === 'added' ? 'Added to Wishlist' : 'Removed from Wishlist',
    })
  }

  if (variant === 'overlay') {
    return (
      <button
        type='button'
        aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={handleToggle}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-all duration-200 hover:scale-110',
          active && 'bg-primary text-white',
          className
        )}
      >
        <Heart className={cn('h-5 w-5', active && 'fill-current')} />
      </button>
    )
  }

  return (
    <button
      type='button'
      onClick={handleToggle}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200',
        active
          ? 'border-primary bg-primary text-white shadow-soft'
          : 'border-border bg-background text-foreground hover:border-primary/50 hover:text-primary',
        className
      )}
    >
      <Heart className={cn('h-4 w-4', active && 'fill-current')} />
      {active ? 'In Wishlist' : 'Add to Wishlist'}
    </button>
  )
}