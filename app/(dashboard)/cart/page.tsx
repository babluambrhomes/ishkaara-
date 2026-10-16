'use client'
import { ReactNode } from 'react'
import BrowsingHistory from '@/components/shared/browsing-history'
import { CartItemRow } from '@/components/shared/product/product-card'
import ProductPrice from '@/components/shared/product/product-price'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import useCartStore from '@/hooks/use-cart-store'
import useIsMounted from '@/hooks/use-is-mounted'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { FREE_SHIPPING_MIN_PRICE } from '@/config/data'

const SummaryRow = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className='flex items-center justify-between gap-3 text-sm'>
    <span className='text-muted-foreground'>{label}</span>
    <span className='font-medium text-foreground'>{children}</span>
  </div>
)

export default function CartPage() {
  const {
    cart: { items, itemsPrice, shippingPrice, taxPrice, totalPrice },
  } = useCartStore()
  const isMounted = useIsMounted()
  const router = useRouter()

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const hasFreeShipping = itemsPrice >= FREE_SHIPPING_MIN_PRICE
  const freeShippingGap = Math.max(0, FREE_SHIPPING_MIN_PRICE - itemsPrice)
  const shippingProgress = Math.min(
    100,
    Math.round((itemsPrice / FREE_SHIPPING_MIN_PRICE) * 100)
  )

  return (
    <div className='px-4 py-8 md:px-8 lg:px-12'>
      <div className='mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
        <div>
          <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold'>
            Your bag
          </p>
          <h1 className='premium-title text-3xl font-bold tracking-tight lg:text-4xl'>
            Shopping Cart
          </h1>
          {isMounted && totalItems > 0 && (
            <p className='mt-2 text-sm text-muted-foreground'>
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>
        <Button
          asChild
          variant='outline'
          className='rounded-full border-border'
        >
          <Link href='/search'>Continue shopping</Link>
        </Button>
      </div>

      {!isMounted ? null : items.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center  sm:py-20'>
          <span className='flex h-20 w-20 items-center justify-center rounded-circle bg-gradient-to-br from-primary to-gold text-white '>
            <ShoppingBag className='h-9 w-9' />
          </span>
          <h2 className='mt-6 text-2xl font-bold tracking-tight sm:text-3xl'>
            Your Shopping Cart is empty
          </h2>
          <p className='mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base'>
            Looks like you haven&apos;t added anything yet. Explore our latest
            collection and find something you love.
          </p>
          <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
            <Button
              onClick={() => router.push('/search')}
              className='h-11 rounded-full px-7'
            >
              Browse all products
            </Button>
            <Button
              asChild
              variant='outline'
              className='h-11 rounded-full border-gold/60 px-7 text-primary hover:bg-gold hover:text-[#0f0d0d]'
            >
              <Link href='/'>Continue shopping</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start'>
          <div className='space-y-4 lg:col-span-2'>
            {!hasFreeShipping && (
              <div className='rounded-2xl border border-border/60 bg-white p-4 '>
                <div className='flex items-center gap-3'>
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-circle bg-gold/15 text-gold'>
                    <Truck className='h-5 w-5' />
                  </span>
                  <p className='text-sm leading-6'>
                    Add{' '}
                    <span className='font-semibold text-gold'>
                      <ProductPrice price={freeShippingGap} plain />
                    </span>{' '}
                    more to qualify for{' '}
                    <span className='font-semibold'>FREE Shipping</span>
                  </p>
                </div>
                <div className='mt-3 h-2 overflow-hidden rounded-full bg-muted'>
                  <div
                    className='h-full rounded-full bg-gradient-to-r from-gold to-primary transition-all duration-500'
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className='space-y-4'>
              {items.map((item) => (
                <CartItemRow key={item.clientId} item={item} />
              ))}
            </div>
          </div>

          <div className='lg:sticky lg:top-24'>
            <Card className='rounded-2xl border-border/60 '>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg'>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {hasFreeShipping && (
                  <div className='flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700'>
                    <Truck className='h-4 w-4 shrink-0' />
                    Your order qualifies for FREE Shipping
                  </div>
                )}
                <SummaryRow label={`Subtotal (${totalItems} items)`}>
                  <ProductPrice price={itemsPrice} plain />
                </SummaryRow>
                <SummaryRow label='Shipping'>
                  {shippingPrice !== undefined ? (
                    <ProductPrice price={shippingPrice} plain />
                  ) : (
                    <span className='text-muted-foreground'>
                      Calculated at checkout
                    </span>
                  )}
                </SummaryRow>
                <SummaryRow label='Estimated Tax'>
                  {taxPrice !== undefined ? (
                    <ProductPrice price={taxPrice} plain />
                  ) : (
                    <span className='text-muted-foreground'>
                      Calculated at checkout
                    </span>
                  )}
                </SummaryRow>
                <Separator />
                <SummaryRow label='Total'>
                  <span className='text-lg font-bold'>
                    <ProductPrice price={totalPrice} plain />
                  </span>
                </SummaryRow>
                <Button
                  onClick={() => router.push('/checkout')}
                  className='h-12 w-full rounded-full bg-gradient-to-r from-primary to-gold text-base font-semibold hover:opacity-95'
                >
                  Proceed to Checkout
                </Button>
                <div className='flex items-center justify-center gap-4 pt-1 text-xs text-muted-foreground'>
                  <span className='inline-flex items-center gap-1'>
                    <Lock className='h-3.5 w-3.5' /> Secure checkout
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <ShieldCheck className='h-3.5 w-3.5' /> Easy returns
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className='my-6' />
      <BrowsingHistory className='mt-12' />
    </div>
  )
}
