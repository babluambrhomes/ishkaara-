import { Document, Model, model, models, Schema } from 'mongoose'

export interface ICartItem {
  clientId: string
  product: string
  variantId?: string
  size?: string
  name: string
  slug: string
  category: string
  quantity: number
  countInStock: number
  image: string
  price: number
}

export interface ICart extends Document {
  userId?: string
  guestId?: string
  items: ICartItem[]
  createdAt: Date
  updatedAt: Date
}

const cartItemSchema = new Schema<ICartItem>(
  {
    clientId: { type: String, required: true },
    product: { type: String, required: true },
    variantId: { type: String },
    size: { type: String },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    countInStock: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      unique: true,
    },
    guestId: { type: String, sparse: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
)

const Cart = (models.Cart as Model<ICart>) || model<ICart>('Cart', cartSchema)

export default Cart