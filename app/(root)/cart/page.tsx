'use client'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { CartItemRow } from '@/components/shared/product/product-card'
import ProductPrice from '@/components/shared/product/product-price'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const {
    cart: { items, itemsPrice },
  } = useCartStore()
  const router = useRouter()
  const {
    setting: {
      common: { freeShippingMinPrice },
    },
  } = useSettingStore()

  return (
    <div className='px-3 py-8 '>
      <div className='grid grid-cols-1 md:grid-cols-4  md:gap-4'>
        {items.length === 0 ? (
          <div className='col-span-4 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center shadow-inner-soft sm:py-20'>
            <span className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-lift'>
              <ShoppingBag className='h-9 w-9' />
            </span>
            <h1 className='mt-6 text-2xl font-bold tracking-tight sm:text-3xl'>
              Your Shopping Cart is empty
            </h1>
            <p className='mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base'>
              Looks like you haven&apos;t added anything yet. Explore our
              latest collection and find something you love.
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
                className='h-11 rounded-full border-gold/60 px-7 text-primary hover:bg-gold hover:text-[#3d1a00]'
              >
                <Link href='/'>Continue shopping</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className='col-span-3'>
              <Card className='shadow-md'>
                <CardHeader className='text-3xl pb-0'>
                  Shopping Cart
                </CardHeader>
                <CardContent className='p-4'>
                  <div className='flex justify-end border-b mb-4'>
                    Price
                  </div>

                  {items.map((item) => (
                    <CartItemRow key={item.clientId} item={item} />
                  ))}

                  <div className='flex justify-end text-lg my-2'>
                    Subtotal (
                    {items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                    Items):{' '}
                    <span className='font-bold ml-1'>
                      <ProductPrice price={itemsPrice} plain />
                    </span>{' '}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className='py-4 space-y-4'>
                  {itemsPrice < freeShippingMinPrice ? (
                    <div className='flex-1'>
                      Add{' '}
                      <span className='text-green-700'>
                        <ProductPrice
                          price={freeShippingMinPrice - itemsPrice}
                          plain
                        />
                      </span>{' '}
                      of eligible items to your order to qualify for FREE
                      Shipping.
                    </div>
                  ) : (
                    <div className='flex-1'>
                      <span className='text-green-700'>
                        Your order qualifies for FREE Shipping.
                      </span>{' '}
                      Choose this option at checkout.
                    </div>
                  )}
                  <div className='text-lg'>
                    Subtotal (
                    {items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                    items):{' '}
                    <span className='font-bold'>
                      <ProductPrice price={itemsPrice} plain />
                    </span>{' '}
                  </div>
                  <Button
                    onClick={() => router.push('/checkout')}
                    className='rounded-full w-full'
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      <div className='my-6' />
      <BrowsingHistoryList className='mt-10' />
    </div>
  )
}
