import { IPostInput } from '@/types'
import { Document, Model, model, models, Schema } from 'mongoose'

export interface IPost extends Document, IPostInput {
  _id: string
  createdAt: Date
  updatedAt: Date
}

const blogPostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    tags: [{ type: String, trim: true }],
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    author: { type: String, default: 'Ishkaara', trim: true },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

const BlogPost =
  (models.BlogPost as Model<IPost>) ||
  model<IPost>('BlogPost', blogPostSchema)

export default BlogPost