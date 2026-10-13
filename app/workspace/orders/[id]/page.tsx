import { notFound } from 'next/navigation'
import React from 'react'

import { auth } from '@/auth'
import { getOrderById } from '@/lib/actions/order.actions'
import OrderDetailsForm from '@/components/shared/order/order-details-form'
import { isStaffRole } from '@/lib/roles'
import Link from 'next/link'

export const metadata = {
  title: 'Workspace Order Details',
}

const WorkspaceOrderDetailsPage = async (props: {
  params: Promise<{
    id: string
  }>
}) => {
  const params = await props.params

  const { id } = params

  const order = await getOrderById(id)
  if (!order) notFound()

  const session = await auth()

  if (!isStaffRole(session?.user?.role)) notFound()

  return (
    <main className='max-w-6xl mx-auto p-4'>
      <div className='flex mb-4'>
        <Link href='/workspace/orders'>Orders</Link> <span className='mx-1'>›</span>
        <Link href={`/workspace/orders/${order._id}`}>{order._id}</Link>
      </div>
      <OrderDetailsForm order={order} variant='admin' />
    </main>
  )
}

export default WorkspaceOrderDetailsPage
