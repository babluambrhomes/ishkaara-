import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { auth } from '@/auth'
import { getOrderById } from '@/lib/actions/order.actions'
import OrderDetailsForm from '@/components/shared/order/order-details-form'
import { formatId } from '@/lib/utils'

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params

  return {
    title: `Order ${formatId(params.id)}`,
  }
}

export default async function OrderDetailsPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const params = await props.params

  const { id } = params

  const order = await getOrderById(id)
  if (!order) notFound()

  const session = await auth()

  if (
    order.user !== session?.user?.id &&
    session?.user?.role !== 'Admin'
  ) {
    notFound()
  }

  return (
    <div>
      <nav className='mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground'>
        <Link href='/account' className='transition-colors hover:text-primary'>
          Your Account
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <Link
          href='/account/orders'
          className='transition-colors hover:text-primary'
        >
          Your Orders
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <span className='font-medium text-foreground'>
          Order {formatId(order._id)}
        </span>
      </nav>
      <OrderDetailsForm order={order} variant='customer' />
    </div>
  )
}
