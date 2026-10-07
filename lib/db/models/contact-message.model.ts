import { Document, Model, model, models, Schema } from 'mongoose'

export interface IContactMessage extends Document {
  name: string
  email: string
  phone: string
  subject: string
  status: string
  comments: string
  message: string
  createdAt: Date
  updatedAt: Date
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    status: { type: String, required: true, default: 'New' },
    comments: { type: String, default: '' },
    message: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
)

const ContactMessage =
  (models.ContactMessage as Model<IContactMessage>) ||
  model<IContactMessage>('ContactMessage', contactMessageSchema)

export default ContactMessage