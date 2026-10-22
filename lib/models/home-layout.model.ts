import { Document, Model, model, models, Schema } from 'mongoose'
import {
  HOME_LAYOUT_TYPES,
  type HomeLayoutType,
} from '@/lib/home-layout-types'

export interface IHomeLayoutSection {
  name?: string
  imgurl: string[]
  redirect: string
  details?: string
}

export interface IHomeLayout extends Document {
  title?: string
  section: IHomeLayoutSection[]
  redirect?: string
  order: number
  details?: string
  layout: HomeLayoutType
}

const homeLayoutSectionSchema = new Schema<IHomeLayoutSection>(
  {
    name: {
      type: String,
      trim: true,
    },
    imgurl: {
      type: [String],
      default: [],
    },
    redirect: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
)

const homeLayoutSchema = new Schema<IHomeLayout>(
  {
    title: {
      type: String,
      trim: true,
    },
    section: {
      type: [homeLayoutSectionSchema],
      default: [],
    },
    redirect: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    details: {
      type: String,
      trim: true,
    },
    layout: {
      type: String,
      enum: [...HOME_LAYOUT_TYPES],
      default: 'grid',
      required: true,
    },
  },
  { timestamps: true }
)

homeLayoutSchema.index({ order: 1 })

const HomeLayout =
  (models.HomeLayout as Model<IHomeLayout>) ||
  model<IHomeLayout>('HomeLayout', homeLayoutSchema)

export default HomeLayout
