/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useCartStore from '@/hooks/use-cart-store'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CartItem } from '@/types'
import { Minus, Plus, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AddToCart({
  item,
  sizes = [],
  minimal = false,
  compact = false,
}: {
  item: CartItem
  sizes?: string[]
  minimal?: boolean
  compact?: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()

  const { addItem } = useCartStore()

  const hasSizes = sizes.length > 0

  const [quantity, setQuantity] = useState(1)

  const [sizePromptOpen, setSizePromptOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<'add' | 'buy'>('add')
  const [selectedSize, setSelectedSize] = useState('')

  const resolveSize = (action: 'add' | 'buy') => {
    if (hasSizes && !selectedSize) {
      setPendingAction(action)
      setSizePromptOpen(true)
      return false
    }
    return true
  }

  const itemToAdd = () =>
    hasSizes && selectedSize ? { ...item, size: selectedSize } : item

  const addToCart = async () => {
    if (!resolveSize('add')) return
    try {
      await addItem(itemToAdd(), quantity)
      toast({
        description: 'Added to Cart',
        action: (
          <Button
            onClick={() => {
              router.push('/cart')
            }}
          >
            Go to Cart
          </Button>
        ),
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.message,
      })
    }
  }

  const buyNow = async () => {
    if (!resolveSize('buy')) return
    try {
      await addItem(itemToAdd(), quantity)
      router.push('/checkout')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.message,
      })
    }
  }

  const increaseQuantity = () =>
    setQuantity((q) => Math.min(item.countInStock, q + 1))

  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1))

  const confirmFromDialog = async () => {
    setSizePromptOpen(false)
    if (pendingAction === 'buy') await buyNow()
    else await addToCart()
  }

  const SizePrompt = () => (
    <Dialog open={sizePromptOpen} onOpenChange={setSizePromptOpen}>
      <DialogContent className='max-w-md rounded-3xl'>
        <DialogHeader>
          <DialogTitle>Select Size</DialogTitle>
          <DialogDescription>
            Please choose a size for {item.name}
          </DialogDescription>
        </DialogHeader>
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
        <Button
          className='w-full rounded-full'
          disabled={!selectedSize}
          onClick={confirmFromDialog}
        >
          {pendingAction === 'buy' ? 'Buy Now' : 'Add to Cart'}
        </Button>
      </DialogContent>
    </Dialog>
  )

  return compact ? (
    <>
      <div className='flex w-full items-center gap-1.5'>
        <Button
          size='sm'
          onClick={addToCart}
          className='flex-1 gap-1.5 rounded-full'
        >
          <ShoppingCart className='h-4 w-4' />
          Add to Cart
        </Button>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={buyNow}
          className='flex-1 gap-1.5 rounded-full border-gold/60 text-primary hover:bg-gold hover:text-[#0f0d0d]'
        >
          Buy Now
        </Button>
      </div>
      <SizePrompt />
    </>
  ) : minimal ? (
    <>
      <Button
        className='w-auto gap-1.5 rounded-full'
        onClick={addToCart}
      >
        <ShoppingCart className='h-4 w-4' />
        Add to Cart
      </Button>
      <SizePrompt />
    </>
  ) : (
    <>
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            aria-label='Decrease quantity'
            disabled={quantity <= 1}
            onClick={decreaseQuantity}
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-circle border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40'
          >
            <Minus className='h-4 w-4' />
          </button>
          <span className='w-8 text-center text-sm font-bold text-foreground'>
            {quantity}
          </span>
          <button
            type='button'
            aria-label='Increase quantity'
            disabled={quantity >= item.countInStock}
            onClick={increaseQuantity}
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-circle border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40'
          >
            <Plus className='h-4 w-4' />
          </button>
          <Button
            type='button'
            onClick={addToCart}
            disabled={item.countInStock <= 0}
            className='h-11 flex-1 gap-2 rounded-full'
          >
            <ShoppingCart className='h-4 w-4' />
            Add to Cart
          </Button>
        </div>
        <Button
          type='button'
          onClick={buyNow}
          disabled={item.countInStock <= 0}
          className='h-11 w-full gap-2 rounded-full bg-gradient-to-r from-gold to-[#344c35] font-bold text-[#0f0d0d]  transition-all hover:from-[#344c35] hover:to-gold '
        >
          <ShoppingBag className='h-4 w-4' />
          Buy Now
        </Button>
      </div>
      <SizePrompt />
    </>
  )
}
