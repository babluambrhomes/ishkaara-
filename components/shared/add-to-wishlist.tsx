'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useIsMounted from '@/hooks/use-is-mounted'
import { useToast } from '@/hooks/use-toast'
import useWishlistStore, { WishlistItem } from '@/hooks/use-wishlist-store'
import { cn } from '@/lib/utils'

export default function AddToWishlist({
  item,
  className,
}: {
  item: WishlistItem
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

  

  return (
   <button
        type='button'
        aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={handleToggle}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110',
          className
        )}
      >
        <Heart className={cn('h-5 w-5', active && 'fill-current')} />
      </button>
  )
}
