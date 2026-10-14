'use server'

import { Cart, IOrderList, OrderItem, OrderStatus, ShippingAddress } from '@/types'
import { FREE_SHIPPING_MIN_PRICE, SHIPPING_PRICE, TAX_RATE } from '@/config/data'
import { formatError, round2 } from '../utils'
import { connectToDatabase } from '@/config/db'
import { auth } from '@/auth'
import { OrderInputSchema } from '../validator'
import Order, { IOrder } from '../models/order.model'
import Coupon from '../models/coupon.model'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { sendAskReviewOrderItems, sendPurchaseReceipt } from '@/emails'
import { DateRange } from 'react-day-picker'
import Product from '../models/product.model'
import User from '../models/user.model'
import mongoose from 'mongoose'
import { getSetting } from './setting.actions'
import { ORDER_STATUS_FLOW } from '../order-status'
import { isStaffRole } from '../roles'
import { assertRateLimit, getClientIpFromHeaders } from '../ratelimit'

// CREATE
export const createOrder = async (clientSideCart: Cart) => {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('User not authenticated')
    // recalculate price and delivery date on the server
    const createdOrder = await createOrderFromCart(
      clientSideCart,
      session.user.id!
    )
    return {
      success: true,
      message: 'Order placed successfully',
      data: { orderId: createdOrder._id.toString() },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// Validate the coupon server-side (security) and return a snapshot + discount.
async function resolveCoupon(
  snapshot: Cart['coupon'],
  itemsPrice: number
): Promise<{ coupon?: { code: string; value: number; minAmount: number }; discount: number }> {
  if (!snapshot?.code) return { discount: 0 }
  const existing = await Coupon.findOne({ code: snapshot.code.toUpperCase() })
  if (
    !existing ||
    existing.status !== 'Active' ||
    existing.expiresAt < new Date() ||
    existing.minAmount > itemsPrice
  ) {
    return { discount: 0 }
  }
  return {
    coupon: {
      code: existing.code,
      value: existing.value,
      minAmount: existing.minAmount,
    },
    discount: Math.min(existing.value, itemsPrice),
  }
}

export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string
) => {
  await connectToDatabase()
  await assertRateLimit('payment', `user:${userId}`)

  // Recalculate everything on the server so client-supplied prices/coupons
  // cannot be tampered with.
  const itemsPrice = round2(
    clientSideCart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    )
  )
  const shippingPrice =
    itemsPrice >= FREE_SHIPPING_MIN_PRICE ? 0 : SHIPPING_PRICE
  const taxPrice = round2(itemsPrice * TAX_RATE)

  const { coupon, discount } = await resolveCoupon(
    clientSideCart.coupon,
    itemsPrice
  )
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice - discount)

  const order = OrderInputSchema.parse({
    user: userId,
    items: clientSideCart.items,
    shippingAddress: clientSideCart.shippingAddress,
    payment: {
      method: clientSideCart.paymentMethod,
      status: 'pending',
    },
    coupon,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    expectedDeliveryDate: clientSideCart.expectedDeliveryDate,
    status: 'success',
    statusHistory: [
      {
        status: 'success',
        at: new Date(),
        note: 'Order placed',
        by: 'system',
      },
    ],
  })
  return await Order.create(order)
}

export async function updateOrderToPaid(orderId: string) {
  try {
    const ip = getClientIpFromHeaders(await headers())
    await assertRateLimit('payment', `ip:${ip}`)

    await connectToDatabase()
    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string }
    }>('user', 'name email')
    if (!order) throw new Error('Order not found')
    if (order.payment.status === 'paid')
      throw new Error('Order is already paid')
    order.payment.status = 'paid'
    order.payment.paidAt = new Date()
    order.markModified('payment')
    await order.save()
    if (!process.env.MONGODB_URI?.startsWith('mongodb://localhost'))
      await updateProductStock(order._id)
    if (order.user.email) await sendPurchaseReceipt({ order })
    revalidatePath(`/account/orders/${orderId}`)
    return { success: true, message: 'Order paid successfully' }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}
const updateProductStock = async (orderId: string) => {
  const session = await mongoose.connection.startSession()

  try {
    session.startTransaction()

    const order = await Order.findById(orderId).session(session)
    if (!order) throw new Error('Order not found')

    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session)
      if (!product) throw new Error('Product not found')

      const variants = product.variants ?? []
      const variant =
        (item.variantId &&
          variants.find(
            (v) =>
              (v as { _id?: { toString(): string } })._id?.toString() ===
              item.variantId
          )) ||
        variants[0]
      if (!variant) throw new Error('Product variant not found')

      variant.countInStock = Math.max(0, variant.countInStock - item.quantity)
      await product.save({ session })
    }
    await session.commitTransaction()
    session.endSession()
    return true
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}
// Admin only: change order status and record it in the history timeline
export async function updateOrderStatus({
  orderId,
  status,
  note,
}: {
  orderId: string
  status: OrderStatus
  note?: string
}) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role))
      throw new Error('Staff permission required')
    await connectToDatabase()

    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string }
    }>('user', 'name email')
    if (!order) throw new Error('Order not found')
    if (order.status === status) throw new Error(`Order is already ${status}`)

    const allowed = ORDER_STATUS_FLOW[order.status as OrderStatus] ?? []
    if (!allowed.includes(status))
      throw new Error(`Cannot change status from ${order.status} to ${status}`)

    order.status = status
    order.statusHistory.push({
      status,
      at: new Date(),
      note: note?.trim() || undefined,
      by: session?.user?.name || session?.user?.email || 'admin',
    })
    await order.save()

    if (status === 'delivered' && order.user?.email) {
      try {
        await sendAskReviewOrderItems({ order })
      } catch {
        // email failure should not fail the status update
      }
    }

    revalidatePath(`/workspace/orders/${orderId}`)
    revalidatePath(`/account/orders/${orderId}`)
    return { success: true, message: `Order status updated to ${status}` }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

// DELETE
export async function deleteOrder(id: string) {
  try {
    await connectToDatabase()
    const res = await Order.findByIdAndDelete(id)
    if (!res) throw new Error('Order not found')
    revalidatePath('/workspace/orders')
    return {
      success: true,
      message: 'Order deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ALL ORDERS

export async function getAllOrders({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()
  const skipAmount = (Number(page) - 1) * limit
  const orders = await Order.find()
    .populate('user', 'name')
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const ordersCount = await Order.countDocuments()
  return {
    data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
    totalPages: Math.ceil(ordersCount / limit),
  }
}
export async function getMyOrders({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()
  const session = await auth()
  if (!session) {
    throw new Error('User is not authenticated')
  }
  const skipAmount = (Number(page) - 1) * limit
  const orders = await Order.find({
    user: session?.user?.id,
  })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const ordersCount = await Order.countDocuments({ user: session?.user?.id })

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(ordersCount / limit),
  }
}
export async function getOrderById(orderId: string): Promise<IOrder> {
  await connectToDatabase()
  const order = await Order.findById(orderId)
  return JSON.parse(JSON.stringify(order))
}

export async function createRazorpayOrder(orderId: string) {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('User not authenticated')
    await assertRateLimit('payment', `user:${session.user.id}`)

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret)
      throw new Error('Razorpay keys are not configured')

    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    const isOwner =
      typeof order.user === 'string' && order.user === session.user.id
    if (session.user.role !== 'Admin' && !isOwner)
      throw new Error('Not authorized')
    if (order.payment.status === 'paid')
      throw new Error('Order is already paid')

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const razorpayOrder = await instance.orders.create({
      amount: Math.round(order.totalPrice * 100),
      currency: 'INR',
      receipt: order._id.toString(),
      notes: { orderId: order._id.toString() },
    })

    return {
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId,
      },
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export async function verifyRazorpayPayment({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  orderId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('User not authenticated')
    await assertRateLimit('payment', `user:${session.user.id}`)

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) throw new Error('Razorpay keys are not configured')

    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    const isOwner =
      typeof order.user === 'string' && order.user === session.user.id
    if (session.user.role !== 'Admin' && !isOwner)
      throw new Error('Not authorized')
    if (order.payment.status === 'paid')
      return { success: true, message: 'Order is already paid' }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')
    if (expectedSignature !== razorpay_signature)
      throw new Error('Payment verification failed')

    order.payment.result = {
      id: razorpay_payment_id,
      status: 'paid',
      email_address: session.user.email ?? '',
      pricePaid: order.totalPrice.toString(),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }
    order.markModified('payment')
    await order.save()

    return await updateOrderToPaid(orderId)
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export const calcDeliveryDateAndPrice = async ({
  items,
  shippingAddress,
}: {
  items: OrderItem[]
  shippingAddress?: ShippingAddress
}) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )

  const shippingPrice = !shippingAddress
    ? undefined
    : itemsPrice >= FREE_SHIPPING_MIN_PRICE
      ? 0
      : SHIPPING_PRICE

  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * TAX_RATE)
  const totalPrice = round2(
    itemsPrice + (shippingPrice ?? 0) + (taxPrice ?? 0)
  )
  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  }
}

// GET ORDERS BY USER
export async function getOrderSummary(date: DateRange) {
  await connectToDatabase()

  const ordersCount = await Order.countDocuments({
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  })
  const productsCount = await Product.countDocuments({
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  })
  const usersCount = await User.countDocuments({
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  })

  const totalSalesResult = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    {
      $group: {
        _id: null,
        sales: { $sum: '$totalPrice' },
      },
    },
    { $project: { totalSales: { $ifNull: ['$sales', 0] } } },
  ])
  const totalSales = totalSalesResult[0] ? totalSalesResult[0].totalSales : 0

  const today = new Date()
  const sixMonthEarlierDate = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1
  )
  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: sixMonthEarlierDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
    {
      $project: {
        _id: 0,
        label: '$_id',
        value: '$totalSales',
      },
    },

    { $sort: { label: -1 } },
  ])
  const topSalesCategories = await getTopSalesCategories(date)
  const topSalesProducts = await getTopSalesProducts(date)

  const {
    common: { pageSize },
  } = await getSetting()
  const limit = pageSize
  const latestOrders = await Order.find()
    .populate('user', 'name')
    .sort({ createdAt: 'desc' })
    .limit(limit)
  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    monthlySales: JSON.parse(JSON.stringify(monthlySales)),
    salesChartData: JSON.parse(JSON.stringify(await getSalesChartData(date))),
    topSalesCategories: JSON.parse(JSON.stringify(topSalesCategories)),
    topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)),
    latestOrders: JSON.parse(JSON.stringify(latestOrders)) as IOrderList[],
  }
}

async function getSalesChartData(date: DateRange) {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        totalSales: { $sum: '$totalPrice' },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $concat: [
            { $toString: '$_id.year' },
            '/',
            { $toString: '$_id.month' },
            '/',
            { $toString: '$_id.day' },
          ],
        },
        totalSales: 1,
      },
    },
    { $sort: { date: 1 } },
  ])

  return result
}

async function getTopSalesProducts(date: DateRange) {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    // Step 1: Unwind orderItems array
    { $unwind: '$items' },

    // Step 2: Group by productId to calculate total sales per product
    {
      $group: {
        _id: {
          name: '$items.name',
          image: '$items.image',
          _id: '$items.product',
        },
        totalSales: {
          $sum: { $multiply: ['$items.quantity', '$items.price'] },
        }, // Assume quantity field in orderItems represents units sold
      },
    },
    {
      $sort: {
        totalSales: -1,
      },
    },
    { $limit: 6 },

    // Step 3: Replace productInfo array with product name and format the output
    {
      $project: {
        _id: 0,
        id: '$_id._id',
        label: '$_id.name',
        image: '$_id.image',
        value: '$totalSales',
      },
    },

    // Step 4: Sort by totalSales in descending order
    { $sort: { _id: 1 } },
  ])

  return result
}

async function getTopSalesCategories(date: DateRange, limit = 5) {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    // Step 1: Unwind orderItems array
    { $unwind: '$items' },
    // Step 2: Group by productId to calculate total sales per product
    {
      $group: {
        _id: '$items.category',
        totalSales: { $sum: '$items.quantity' }, // Assume quantity field in orderItems represents units sold
      },
    },
    // Step 3: Sort by totalSales in descending order
    { $sort: { totalSales: -1 } },
    // Step 4: Limit to top N products
    { $limit: limit },
  ])

  return result
}
