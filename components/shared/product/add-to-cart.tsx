/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import { useToast } from '@/hooks/use-toast'
import { OrderItem } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AddToCart({
  item,
  minimal = false,
  compact = false,
}: {
  item: OrderItem
  minimal?: boolean
  compact?: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()

  const { addItem } = useCartStore()

  //PROMPT: add quantity state
  const [quantity, setQuantity] = useState(1)

  const addToCart = () => {
    try {
      addItem(item, 1)
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

  const buyNow = () => {
    try {
      addItem(item, 1)
      router.push('/checkout')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.message,
      })
    }
  }

  return compact ? (
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
  ) : minimal ? (
    <Button
      className='rounded-full w-auto'
      onClick={addToCart}
    >
      Add to Cart
    </Button>
  ) : (
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
          try {
            const itemId = await addItem(item, quantity)
            router.push(`/cart/${itemId}`)
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
        onClick={() => {
          try {
            addItem(item, quantity)
            router.push(`/checkout`)
          } catch (error: any) {
            toast({
              variant: 'destructive',
              description: error.message,
            })
          }
        }}
        className='w-full rounded-full '
      >
        Buy Now
      </Button>
    </div>
  )
}
