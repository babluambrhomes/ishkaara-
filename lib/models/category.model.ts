import { Document, Model, model, models, Schema } from 'mongoose'

export type CategoryType = 'product' | 'blog'

export type CategoryStatus = 'public' | 'draft' | 'delete'

export interface ICategory extends Document {
  _id: string
  name: string
  slug: string
  type: CategoryType
  description: string
  imageUrl: string
  status: CategoryStatus
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['product', 'blog'],
      default: 'product',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['public', 'draft', 'delete'],
      default: 'public',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

categorySchema.index({ type: 1, slug: 1 }, { unique: true })

const Category =
  (models.Category as Model<ICategory>) ||
  model<ICategory>('Category', categorySchema)

export default Category
