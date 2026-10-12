import { Document, Model, model, models, Schema } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  value: number
  status: 'Active' | 'Inactive'
  expiresAt: Date
  minAmount: number
  createdAt: Date
  updatedAt: Date
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    value: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    minAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Coupon =
  (models.Coupon as Model<ICoupon>) || model<ICoupon>('Coupon', couponSchema)

export default Coupon