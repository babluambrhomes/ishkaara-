import { Document, Model, model, models, Schema } from 'mongoose'

export type HomeBannerType = 'Hero'
export type HomeBannerStatus = 'ACTIVE' | 'INACTIVE'

export interface IHomeBanner extends Omit<Document, '_id'> {
  _id: string
  redirect: string
  bannerUrl: string
  bannerType: HomeBannerType
  status: HomeBannerStatus
  expireAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const homeBannerSchema = new Schema<IHomeBanner>(
  {
    redirect: {
      type: String,
      required: true,
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: '',
      trim: true,
    },
    bannerType: {
      type: String,
      enum: ['Hero'],
      default: 'Hero',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      required: true,
      index: true,
    },
    expireAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

const HomeBanner =
  (models.HomeBanner as Model<IHomeBanner>) ||
  model<IHomeBanner>('HomeBanner', homeBannerSchema)

export default HomeBanner
