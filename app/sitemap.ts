import type { MetadataRoute } from 'next'
import { connectToDatabase } from '@/lib/db'
import BlogPost from '@/lib/db/models/blog-post.model'
import { staticPages } from '@/lib/static-pages'

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
  const posts = await BlogPost.find({ isPublished: true })
    .select('slug date')
    .lean()

  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  const pageRoutes = Object.keys(staticPages).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes, ...pageRoutes]
}