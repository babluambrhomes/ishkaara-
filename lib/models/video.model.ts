import { Document, Model, model, models, Schema } from 'mongoose'

export type VideoStatus = 'ACTIVE' | 'INACTIVE'

export interface IVideo extends Omit<Document, '_id'> {
  _id: string
  title?: string
  videoUrl: string
  status: VideoStatus
  expireAt: Date | null
  order: number
  createdAt: Date
  updatedAt: Date
}

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
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
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

videoSchema.index({ order: 1 })

const Video =
  (models.Video as Model<IVideo>) || model<IVideo>('Video', videoSchema)

export default Video
