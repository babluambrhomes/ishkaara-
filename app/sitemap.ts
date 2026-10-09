import type { MetadataRoute } from 'next'
import { connectToDatabase } from '@/config/db'
import BlogPost from '@/lib/models/blog-post.model'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/search',
    '/cart',
    '/wishlist',
    '/about-us',
    '/contact-us',
    '/faq',
    '/help',
    '/blog',
    '/testimonials',
    '/returns-policy',
    '/terms-and-conditions',
    '/privacy-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  await connectToDatabase()
  const posts = await BlogPost.find({ status: 'public' })
    .select('slug date')
    .lean()

  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...blogRoutes]
}