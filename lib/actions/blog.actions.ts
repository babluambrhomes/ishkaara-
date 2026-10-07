'use server'

import { connectToDatabase } from '@/lib/db'
import BlogPost, { IPost } from '@/lib/db/models/blog-post.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { BlogPostInputSchema, BlogPostUpdateSchema } from '../validator'
import { IPostInput } from '@/types'
import { z } from 'zod'
import { getSetting } from './setting.actions'

// CREATE
export async function createBlogPost(data: IPostInput) {
  try {
    const post = BlogPostInputSchema.parse(data)
    await connectToDatabase()
    await BlogPost.create(post)
    revalidatePath('/admin/blog/posts')
    revalidatePath('/blog')
    return {
      success: true,
      message: 'Post created successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateBlogPost(data: z.infer<typeof BlogPostUpdateSchema>) {
  try {
    const post = BlogPostUpdateSchema.parse(data)
    await connectToDatabase()
    await BlogPost.findByIdAndUpdate(post._id, post)
    revalidatePath('/admin/blog/posts')
    revalidatePath('/blog')
    revalidatePath(`/blog/${post.slug}`)
    return {
      success: true,
      message: 'Post updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// DELETE
export async function deleteBlogPost(id: string) {
  try {
    await connectToDatabase()
    const res = await BlogPost.findByIdAndDelete(id)
    if (!res) throw new Error('Post not found')
    revalidatePath('/admin/blog/posts')
    revalidatePath('/blog')
    return {
      success: true,
      message: 'Post deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ONE POST BY ID
export async function getBlogPostById(postId: string) {
  await connectToDatabase()
  const post = await BlogPost.findById(postId)
  return post ? (JSON.parse(JSON.stringify(post)) as IPost) : null
}

// GET ONE PUBLISHED POST BY SLUG
export async function getBlogPostBySlug(slug: string) {
  await connectToDatabase()
  const post = await BlogPost.findOne({ slug, isPublished: true })
  return post ? (JSON.parse(JSON.stringify(post)) as IPost) : null
}

// GET RELATIVE POSTS (same category)
export async function getRelatedPosts({
  category,
  postId,
  limit = 3,
}: {
  category: string
  postId: string
  limit?: number
}) {
  await connectToDatabase()
  const posts = await BlogPost.find({
    isPublished: true,
    category,
    _id: { $ne: postId },
  })
    .sort({ date: 'desc' })
    .limit(limit)
  return JSON.parse(JSON.stringify(posts)) as IPost[]
}

// GET ALL PUBLISHED POSTS FOR FRONTEND
export async function getAllBlogPosts({
  query = 'all',
  category = 'all',
  tag = 'all',
  page = 1,
  limit,
}: {
  query?: string
  category?: string
  tag?: string
  page?: number
  limit?: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  const skipAmount = (Number(page) - 1) * limit
  await connectToDatabase()

  const queryFilter =
    query && query !== 'all'
      ? {
          title: {
            $regex: query,
            $options: 'i',
          },
        }
      : {}
  const categoryFilter = category && category !== 'all' ? { category } : {}
  const tagFilter = tag && tag !== 'all' ? { tags: tag } : {}

  const posts = await BlogPost.find({
    isPublished: true,
    ...queryFilter,
    ...categoryFilter,
    ...tagFilter,
  })
    .sort({ date: 'desc' })
    .skip(skipAmount)
    .limit(limit)
    .lean()

  const countPosts = await BlogPost.countDocuments({
    isPublished: true,
    ...queryFilter,
    ...categoryFilter,
    ...tagFilter,
  })

  return {
    posts: JSON.parse(JSON.stringify(posts)) as IPost[],
    totalPages: Math.ceil(countPosts / limit),
    totalPosts: countPosts,
    from: skipAmount + 1,
    to: skipAmount + posts.length,
  }
}

// GET ALL POSTS FOR ADMIN (includes drafts)
export async function getAllBlogPostsForAdmin({
  query,
  page = 1,
  sort = 'latest',
  limit,
}: {
  query: string
  page?: number
  sort?: string
  limit?: number
}) {
  await connectToDatabase()

  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  const queryFilter =
    query && query !== 'all'
      ? {
          title: {
            $regex: query,
            $options: 'i',
          },
        }
      : {}

  const order: Record<string, 1 | -1> =
    sort === 'oldest' ? { date: 1 } : { date: -1 }

  const posts = await BlogPost.find({
    ...queryFilter,
  })
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()

  const countPosts = await BlogPost.countDocuments({
    ...queryFilter,
  })

  return {
    posts: JSON.parse(JSON.stringify(posts)) as IPost[],
    totalPages: Math.ceil(countPosts / limit),
    totalPosts: countPosts,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + posts.length,
  }
}

// GET ALL CATEGORIES
export async function getAllBlogCategories() {
  await connectToDatabase()
  const categories = await BlogPost.find({ isPublished: true }).distinct(
    'category'
  )
  return categories.sort((a: string, b: string) => a.localeCompare(b))
}

// GET ALL TAGS
export async function getAllBlogTags() {
  await connectToDatabase()
  const tags = await BlogPost.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ])
  return ((tags[0]?.uniqueTags as string[]) || []).sort((a, b) =>
    a.localeCompare(b)
  )
}