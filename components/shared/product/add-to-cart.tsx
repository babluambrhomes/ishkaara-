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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CartItem } from '@/types'
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

  //PROMPT: add quantity state
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
      await addItem(itemToAdd(), 1)
      router.push('/checkout')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.message,
      })
    }
  }

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
          className='flex-1 rounded-full'
        >
          Add to Cart
        </Button>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={buyNow}
          className='flex-1 rounded-full border-gold/60 text-primary hover:bg-gold hover:text-[#3d1a00]'
        >
          Buy Now
        </Button>
      </div>
      <SizePrompt />
    </>
  ) : minimal ? (
    <>
      <Button
        className='rounded-full w-auto'
        onClick={addToCart}
      >
        Add to Cart
      </Button>
      <SizePrompt />
    </>
  ) : (
    <>
      <div className='w-full space-y-2'>
        <Select
          value={quantity.toString()}
          onValueChange={(i) => setQuantity(Number(i))}
        >
          <SelectTrigger className=''>
            <SelectValue>
              Quantity: {quantity}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position='popper'>
            {Array.from({ length: item.countInStock }).map((_, i) => (
              <SelectItem key={i + 1} value={`${i + 1}`}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          className='rounded-full w-full'
          type='button'
          onClick={async () => {
            if (!resolveSize('add')) return
            try {
              await addItem(itemToAdd(), quantity)
              router.push('/cart')
            } catch (error: any) {
              toast({
                variant: 'destructive',
                description: error.message,
              })
            }
          }}
        >
          Add to Cart
        </Button>
        <Button
          variant='secondary'
          onClick={buyNow}
          className='w-full rounded-full '
        >
          Buy Now
        </Button>
      </div>
      <SizePrompt />
    </>
  )
}