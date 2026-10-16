import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowRight, CheckCircle2, CreditCard, ShoppingBag, Truck } from 'lucide-react'

import { auth } from '@/auth'
import OrderItemImages from '@/components/shared/order/order-item-images'
import ProductPrice from '@/components/shared/product/product-price'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getOrderById } from '@/lib/actions/order.actions'
import { formatDateTime, formatId } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Order Confirmed',
}

export default async function OrderSuccessPage(props: {
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

  const isCod = order.payment.method === 'Cash On Delivery'
  if (!isCod && order.payment.status !== 'paid')
    redirect(`/order-failed/${order._id}`)

  const itemCount = order.items.reduce(
    (count, item) => count + item.quantity,
    0
  )

  return (
    <div className='mx-auto max-w-2xl px-4 py-12 sm:px-6'>
      <Card className='overflow-hidden rounded-3xl border-border/60 bg-white '>
        <div className='h-2 bg-gradient-to-r from-primary via-[#344c35] to-gold' />
        <CardContent className='flex flex-col items-center px-6 py-10 text-center'>
          <span className='flex h-20 w-20 items-center justify-center rounded-circle bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60'>
            <CheckCircle2 className='h-11 w-11' />
          </span>
          <h1 className='mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {isCod ? 'Order Confirmed!' : 'Payment Successful!'}
          </h1>
          <p className='mt-2 max-w-md text-sm text-muted-foreground'>
            {isCod
              ? 'Thank you for your order. Please keep the exact amount ready for cash on delivery.'
              : 'Your payment was received and your order is confirmed. We are now processing it.'}
          </p>

          <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
            <span className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-sm font-semibold'>
              <ShoppingBag className='h-4 w-4 text-primary' />
              {formatId(order._id)}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-sm font-semibold'>
              <CreditCard className='h-4 w-4 text-primary' />
              {order.payment.method}
            </span>
          </div>
        </CardContent>

        <div className='border-t border-border/60 bg-muted/20 px-6 py-6'>
          <div className='flex items-center justify-between gap-4'>
            <OrderItemImages items={order.items} />
            <span className='text-sm text-muted-foreground'>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <dl className='mt-6 space-y-3 text-sm'>
            <div className='flex items-center justify-between'>
              <dt className='text-muted-foreground'>Order date</dt>
              <dd className='font-semibold'>
                {formatDateTime(order.createdAt!).dateTime}
              </dd>
            </div>
            <div className='flex items-center justify-between'>
              <dt className='flex items-center gap-1.5 text-muted-foreground'>
                <Truck className='h-4 w-4' />
                Expected delivery
              </dt>
              <dd className='font-semibold'>
                {formatDateTime(order.expectedDeliveryDate).dateOnly}
              </dd>
            </div>
            <div className='flex items-center justify-between border-t border-border/60 pt-3'>
              <dt className='font-bold'>Total</dt>
              <dd className='text-base font-bold text-primary'>
                <ProductPrice price={order.totalPrice} plain />
              </dd>
            </div>
          </dl>
        </div>

        <div className='flex flex-col gap-3 px-6 pb-8 sm:flex-row'>
          <Button asChild className='h-11 flex-1 rounded-full gap-2'>
            <Link href={`/account/orders/${order._id}`}>
              View your order
              <ArrowRight className='h-4 w-4' />
            </Link>
          </Button>
          <Button
            asChild
            variant='outline'
            className='h-11 flex-1 rounded-full gap-2'
          >
            <Link href='/search'>
              <ShoppingBag className='h-4 w-4' />
              Continue shopping
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
