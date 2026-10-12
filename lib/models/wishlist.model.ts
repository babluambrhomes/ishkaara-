import { Document, Model, model, models, Schema, Types } from 'mongoose'

export interface IWishlist extends Document {
  userId: string
  products: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId as unknown as typeof String,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
)

const Wishlist =
  (models.Wishlist as Model<IWishlist>) ||
  model<IWishlist>('Wishlist', wishlistSchema)

export default Wishlist