import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { sendPurchaseReceipt } from '@/emails'
import Order from '@/lib/db/models/order.model'

let stripe: Stripe | undefined

const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to your environment to use Stripe.'
    )
  }
  stripe ??= new Stripe(apiKey)
  return stripe
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new NextResponse('STRIPE_WEBHOOK_SECRET is not set', {
      status: 500,
    })
  }

  const event = await getStripe().webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature') as string,
    webhookSecret
  )

  if (event.type === 'charge.succeeded') {
    const charge = event.data.object
    const orderId = charge.metadata.orderId
    const email = charge.billing_details.email
    const pricePaidInCents = charge.amount
    const order = await Order.findById(orderId).populate('user', 'email')
    if (order == null) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      id: event.id,
      status: 'COMPLETED',
      email_address: email!,
      pricePaid: Math.round(pricePaidInCents / 100).toString(),
    }
    await order.save()
    try {
      await sendPurchaseReceipt({ order })
    } catch (err) {
      console.log('email error', err)
    }
    return NextResponse.json({
      message: 'updateOrderToPaid was successful',
    })
  }
  return new NextResponse()
}
