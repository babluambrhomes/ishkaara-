import { IOrderInput } from '@/types'
import { Document, Model, model, models, Schema } from 'mongoose'

export interface IOrder extends Omit<Document, '_id'>, IOrderInput {
  _id: string
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: { type: String },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    listPrice: { type: Number },
    countInStock: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
  },
  { _id: false }
)

const couponSchema = new Schema(
  {
    code: { type: String, required: true },
    value: { type: Number, required: true },
    minAmount: { type: Number, required: true },
  },
  { _id: false }
)

const paymentResultSchema = new Schema(
  {
    id: { type: String },
    status: { type: String },
    email_address: { type: String },
    pricePaid: { type: String },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
  },
  { _id: false }
)

const paymentSchema = new Schema(
  {
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    result: { type: paymentResultSchema },
    paidAt: { type: Date },
  },
  { _id: false }
)

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        'success',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
      ],
      required: true,
    },
    at: { type: Date, required: true },
    note: { type: String },
    by: { type: String },
  },
  { _id: false }
)

const cancellationSchema = new Schema(
  {
    reason: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
)

const returnRequestSchema = new Schema(
  {
    reason: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
)

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId as unknown as typeof String,
      ref: 'User',
      required: true,
    },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      province: { type: String, required: true },
      phone: { type: String, required: true },
    },
    expectedDeliveryDate: { type: Date, required: true },
    coupon: { type: couponSchema },
    payment: { type: paymentSchema, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'success',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'success',
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    cancellation: { type: cancellationSchema },
    returnRequest: { type: returnRequestSchema },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

const Order =
  (models.Order as Model<IOrder>) || model<IOrder>('Order', orderSchema)

export default Order
