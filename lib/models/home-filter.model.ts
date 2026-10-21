import { Document, Model, model, models, Schema } from 'mongoose'

export interface IHomeFilterSection {
  name?: string
  imgurl: string[]
  redirect: string
  details?: string
}

export interface IHomeFilter extends Document {
  title?: string
  section: IHomeFilterSection[]
  redirect?: string
  order: number
  details?: string
}

const homeFilterSectionSchema = new Schema<IHomeFilterSection>(
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

const homeFilterSchema = new Schema<IHomeFilter>(
  {
    title: {
      type: String,
      trim: true,
    },
    section: {
      type: [homeFilterSectionSchema],
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
  },
  { timestamps: true }
)

homeFilterSchema.index({ order: 1 })

const HomeFilter =
  (models.HomeFilter as Model<IHomeFilter>) ||
  model<IHomeFilter>('HomeFilter', homeFilterSchema)

export default HomeFilter