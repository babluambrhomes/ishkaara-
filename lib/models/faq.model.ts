import { Document, Model, model, models, Schema } from 'mongoose'

export interface IFaq extends Document {
  question: string
  answer: string
  is_public: boolean
  sortOrder?: number
  createdAt: Date
  updatedAt: Date
}

const faqSchema = new Schema<IFaq>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    is_public: {
      type: Boolean,
      required: true,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Faq = (models.Faq as Model<IFaq>) || model<IFaq>('Faq', faqSchema)

export default Faq
