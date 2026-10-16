import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ChevronRight, PackageSearch, ShoppingBag } from 'lucide-react'

import BrowsingHistory from '@/components/shared/browsing-history'
import Pagination from '@/components/shared/pagination'
import OrderItemImages from '@/components/shared/order/order-item-images'
import OrderStatusBadge from '@/components/shared/order/order-status-badge'
import ProductPrice from '@/components/shared/product/product-price'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getMyOrders } from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/models/order.model'
import { formatDateTime, formatId } from '@/lib/utils'

const PAGE_TITLE = 'Your Orders'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}

function EmptyOrders() {
  return (
    <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center '>
      <span className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-gold text-white '>
        <PackageSearch className='h-8 w-8' />
      </span>
      <h2 className='mt-5 text-xl font-bold tracking-tight'>No orders yet</h2>
      <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
        Looks like you haven&apos;t placed any orders. Explore our collection and
        make your first purchase.
      </p>
      <Button asChild className='mt-6 h-11 rounded-full px-6'>
        <Link href='/search'>
          <ShoppingBag className='h-4 w-4' />
          Start shopping
        </Link>
      </Button>
    </div>
  )
}

export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const orders = await getMyOrders({ page })

  return (
    <div>
      <nav className='mb-3 flex items-center gap-1.5 text-sm text-muted-foreground'>
        <Link href='/account' className='transition-colors hover:text-primary'>
          Your Account
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <span className='font-medium text-foreground'>{PAGE_TITLE}</span>
      </nav>

      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>{PAGE_TITLE}</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Track and manage your recent purchases
        </p>
      </div>

      {orders.data.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className='space-y-4'>
          {orders.data.map((order: IOrder) => {
            const itemCount = order.items.reduce(
              (count, item) => count + item.quantity,
              0
            )
            return (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                className='group block'
              >
                <Card className='overflow-hidden rounded-3xl border-border/60 bg-white transition-all group-hover:-translate-y-0.5 group-hover:border-primary/30 '>
                  <CardContent className='p-5 sm:p-6'>
                    <div className='flex flex-wrap items-start justify-between gap-4'>
                      <div className='flex items-start gap-4'>
                        <OrderItemImages items={order.items} />
                        <div className='min-w-0'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <h2 className='text-base font-bold tracking-tight'>
                              Order {formatId(order._id)}
                            </h2>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p className='mt-1 text-sm text-muted-foreground'>
                            Placed on{' '}
                            {formatDateTime(order.createdAt!).dateOnly} ·{' '}
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                          Total
                        </p>
                        <div className='text-lg font-bold text-primary'>
                          <ProductPrice price={order.totalPrice} plain />
                        </div>
                      </div>
                    </div>
                    <div className='mt-4 flex items-center justify-between border-t border-border/60 pt-4'>
                      <span className='text-sm text-muted-foreground'>
                        {order.payment.status === 'paid' && order.payment.paidAt
                          ? `Paid on ${formatDateTime(order.payment.paidAt).dateOnly}`
                          : 'Payment pending'}
                      </span>
                      <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-primary'>
                        View details
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}

          {orders.totalPages > 1 && (
            <div className='flex justify-center pt-4'>
              <Pagination page={page} totalPages={orders.totalPages} />
            </div>
          )}
        </div>
      )}

      <BrowsingHistory className='mt-16' />
    </div>
  )
}
