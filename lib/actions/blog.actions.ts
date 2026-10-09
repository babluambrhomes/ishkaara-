'use server'

import { connectToDatabase } from '@/config/db'
import BlogPost, { IPost } from '@/lib/models/blog-post.model'
import Category from '@/lib/models/category.model'
import { revalidatePath } from 'next/cache'
import { formatError, generateSlug, toSlug } from '../utils'
import { BlogPostInputSchema, BlogPostUpdateSchema } from '../validator'
import { IPostInput } from '@/types'
import { z } from 'zod'
import { getSetting } from './setting.actions'

const resolveCategoryName = async (categoryId: string) => {
  const category = await Category.findById(categoryId).select('name')
  if (!category) throw new Error('Category not found')
  return category.name
}

const resolveSlug = async (slug: string, title: string, excludeId?: string) => {
  const base = toSlug(slug) || toSlug(title)
  if (!base) return generateSlug(title)
  const exists = await BlogPost.exists({
    slug: base,
    _id: { $ne: excludeId },
  })
  return exists ? generateSlug(base) : base
}

// CREATE
export async function createBlogPost(data: IPostInput) {
  try {
    const post = BlogPostInputSchema.parse(data)
    await connectToDatabase()
    const categoryName = await resolveCategoryName(post.category)
    const slug = await resolveSlug(post.slug, post.title)
    await BlogPost.create({ ...post, slug, categoryName })
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
    const categoryName = await resolveCategoryName(post.category)
    const slug = await resolveSlug(post.slug, post.title, post._id)
    await BlogPost.findByIdAndUpdate(post._id, { ...post, slug, categoryName })
    revalidatePath('/admin/blog/posts')
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
    return {
      success: true,
      message: 'Post updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// DELETE (soft delete)
export async function deleteBlogPost(id: string) {
  try {
    await connectToDatabase()
    const res = await BlogPost.findByIdAndUpdate(id, { status: 'delete' })
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
  const post = await BlogPost.findOne({ slug, status: 'public' })
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
    status: 'public',
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
  const categoryFilter =
    category && category !== 'all' ? { categoryName: category } : {}
  const tagFilter = tag && tag !== 'all' ? { tags: tag } : {}

  const posts = await BlogPost.find({
    status: 'public',
    ...queryFilter,
    ...categoryFilter,
    ...tagFilter,
  })
    .sort({ date: 'desc' })
    .skip(skipAmount)
    .limit(limit)
    .lean()

  const countPosts = await BlogPost.countDocuments({
    status: 'public',
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
    status: { $ne: 'delete' },
    ...queryFilter,
  })
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()

  const countPosts = await BlogPost.countDocuments({
    status: { $ne: 'delete' },
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
  const categories = await Category.find({
    type: 'blog',
    status: 'public',
  })
    .sort({ name: 1 })
    .select('name')
  return categories.map((c) => c.name)
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