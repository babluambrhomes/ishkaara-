import { Document, Model, model, models, Schema } from 'mongoose'

export interface INewsletterSubscriber extends Document {
  email: string
  isSubscribed: boolean
  createdAt: Date
  updatedAt: Date
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isSubscribed: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const NewsletterSubscriber =
  (models.NewsletterSubscriber as Model<INewsletterSubscriber>) ||
  model<INewsletterSubscriber>(
    'NewsletterSubscriber',
    newsletterSubscriberSchema
  )

export default NewsletterSubscriber