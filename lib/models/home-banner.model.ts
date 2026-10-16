import { Document, Model, model, models, Schema } from 'mongoose'

export type HomeBannerType = 'Hero' | 'Common'
export type HomeBannerStatus = 'ACTIVE' | 'INACTIVE'

export interface IHomeBanner extends Omit<Document, '_id'> {
  _id: string
  productId: string
  productSlug: string
  bannerUrl: string
  bannerType: HomeBannerType
  status: HomeBannerStatus
  expireAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const homeBannerSchema = new Schema<IHomeBanner>(
  {
    productId: {
      type: Schema.Types.ObjectId as unknown as typeof String,
      ref: 'Product',
      required: true,
      index: true,
    },
    productSlug: {
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
      enum: ['Hero', 'Common'],
      default: 'Common',
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
