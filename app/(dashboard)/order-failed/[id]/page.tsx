import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react'

import { auth } from '@/auth'
import OrderItemImages from '@/components/shared/order/order-item-images'
import PayNowButton from '@/components/shared/order/pay-now-button'
import ProductPrice from '@/components/shared/product/product-price'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getOrderById } from '@/lib/actions/order.actions'
import { formatId } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Payment Failed',
}

export default async function OrderFailedPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const session = await auth()
  const order = await getOrderById(id)
  if (!order) notFound()

  const orderUserId =
    typeof order.user === 'object' ? order.user?._id : order.user
  const isOwner = !!orderUserId && orderUserId === session?.user?.id
  if (session?.user?.role !== 'Admin' && !isOwner) notFound()

  if (order.payment.status === 'paid') redirect(`/order-success/${order._id}`)

  const itemCount = order.items.reduce(
    (count, item) => count + item.quantity,
    0
  )

  return (
    <div className='mx-auto max-w-2xl px-4 py-12 sm:px-6'>
      <Card className='overflow-hidden rounded-3xl border-border/60 bg-white '>
        <div className='h-2 bg-gradient-to-r from-destructive via-[#b91c1c] to-gold' />
        <CardContent className='flex flex-col items-center px-6 py-10 text-center'>
          <span className='flex h-20 w-20 items-center justify-center rounded-circle bg-red-50 text-destructive ring-8 ring-red-50/60'>
            <AlertTriangle className='h-11 w-11' />
          </span>
          <h1 className='mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl'>
            Payment Failed
          </h1>
          <p className='mt-2 max-w-md text-sm text-muted-foreground'>
            Your order is saved but the payment could not be completed. No
            amount was charged. You can pay again for this order.
          </p>

          <span className='mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-sm font-semibold'>
            <ShoppingBag className='h-4 w-4 text-primary' />
            {formatId(order._id)}
          </span>
        </CardContent>

        <div className='border-t border-border/60 bg-muted/20 px-6 py-6'>
          <div className='flex items-center justify-between gap-4'>
            <OrderItemImages items={order.items} />
            <span className='text-sm text-muted-foreground'>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className='mt-6 flex items-center justify-between border-t border-border/60 pt-3'>
            <span className='font-bold'>Amount due</span>
            <span className='text-base font-bold text-primary'>
              <ProductPrice price={order.totalPrice} plain />
            </span>
          </div>
        </div>

        <div className='flex flex-col gap-3 px-6 pb-8 sm:flex-row'>
          <PayNowButton
            orderId={order._id}
            label='Pay Again'
            successRedirect={`/order-success/${order._id}`}
            className='h-11 flex-1 rounded-full gap-2 font-bold'
          />
          <Button
            asChild
            variant='outline'
            className='h-11 flex-1 rounded-full gap-2'
          >
            <Link href={`/account/orders/${order._id}`}>
              View Order
              <ArrowRight className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
