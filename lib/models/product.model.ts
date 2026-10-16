
import { Document, Model, model, models, Schema } from 'mongoose'
import { IProductInput } from '@/types'

export type ProductStatus = 'public' | 'draft' | 'delete'

export interface IProductVariant {
  price: number
  listPrice: number
  images: string[]
  size?: string[]
  countInStock: number
}

export interface IProduct extends Omit<Document, '_id'>, IProductInput {
  _id: string
  categoryName: string
  variants: IProductVariant[]
  createdAt: Date
  updatedAt: Date
}

const variantSchema = new Schema<IProductVariant>(
  {
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    listPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    size: {
      type: [String],
      default: undefined,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  }
)

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId as unknown as typeof String,
      ref: 'Category',
      required: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // Each variant has its own price, images and stock.
    variants: {
      type: [variantSchema],
      required: true,
      default: undefined,
      validate: {
        validator: (variants: IProductVariant[]) =>
          Array.isArray(variants) && variants.length > 0,
        message: 'A product must have at least one variant.',
      },
    },

    tags: {
      type: [String],
      default: [],
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingDistribution: [
      {
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        count: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    numSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['public', 'draft', 'delete'],
      default: 'draft',
      index: true,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Product =
  (models.Product as Model<IProduct>) ||
  model<IProduct>('Product', productSchema)

export default Product
