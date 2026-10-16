// Database seed script. Run with `npm run seed`.
//
// Loads the local .env (via @next/env) before touching any module that reads
// process.env at import time, then wipes the seeded collections and inserts a
// fresh sample catalogue: categories, products, reviews, blog posts, coupons
// and demo users.
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

import {
  blogCategories,
  blogPosts,
  coupons,
  productCategories,
  products,
  reviewTemplates,
  seedBanners,
  users,
  type SeedCategory,
} from './seed-data'

const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

const daysFromNow = (days: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(23, 59, 59, 999)
  return date
}

async function main() {
  const { connectToDatabase } = await import('../../config/db')
  const { default: mongoose } = await import('mongoose')
  const { default: Category } = await import('../models/category.model')
  const { default: Product } = await import('../models/product.model')
  const { default: BlogPost } = await import('../models/blog-post.model')
  const { default: Coupon } = await import('../models/coupon.model')
  const { default: Review } = await import('../models/review.model')
  const { default: User } = await import('../models/user.model')
  const { default: HomeBanner } = await import('../models/home-banner.model')

  await connectToDatabase()
  console.log('Connected to MongoDB')

  // Wipe the seeded collections (users are upserted, not wiped).
  await Promise.all([
    Review.deleteMany({}),
    Product.deleteMany({}),
    BlogPost.deleteMany({}),
    Category.deleteMany({}),
    Coupon.deleteMany({}),
    HomeBanner.deleteMany({}),
  ])
  console.log(
    'Cleared reviews, products, blog posts, categories, coupons and home banners'
  )

  const createCategories = async (items: SeedCategory[]) => {
    const map = new Map<string, string>()
    for (const item of items) {
      const doc = await Category.create({
        name: item.name,
        slug: toSlug(item.name),
        type: item.type,
        description: item.description,
        imageUrl: item.imageUrl,
        status: 'public',
      })
      map.set(item.name, doc._id.toString())
    }
    return map
  }

  const productCategoryIds = await createCategories(productCategories)
  const blogCategoryIds = await createCategories(blogCategories)
  console.log(
    `Created ${productCategories.length} product and ${blogCategories.length} blog categories`
  )

  // Tags consumed by the storefront home page filters. Spread them across the
  // catalogue so every home section has products to show.
  const homeTagsForIndex = (index: number): string[] => {
    const tags: string[] = []
    if (index % 3 === 0) tags.push('todays-deal')
    if (index % 3 === 1) tags.push('best-seller')
    if (index % 3 === 2) tags.push('featured')
    if (index % 2 === 0) tags.push('new-arrival')
    return tags
  }

  const createdProducts = await Product.create(
    products.map((product, index) => ({
      name: product.name,
      slug: toSlug(product.name),
      category: productCategoryIds.get(product.categoryName),
      categoryName: product.categoryName,
      brand: product.brand,
      description: product.description,
      tags: Array.from(new Set([...product.tags, ...homeTagsForIndex(index)])),
      numSales: product.numSales,
      status: 'public',
      variants: product.variants,
    }))
  )
  console.log(`Created ${createdProducts.length} products`)

  // Map product name -> id/slug so home banners can link to a real product.
  const productRefs = new Map(
    createdProducts.map((product) => [
      product.name,
      { _id: product._id.toString(), slug: product.slug },
    ])
  )

  const createdBanners = await HomeBanner.create(
    seedBanners.map((banner) => {
      const ref = productRefs.get(banner.productName)
      if (!ref) {
        throw new Error(
          `Home banner references unknown product "${banner.productName}"`
        )
      }
      return {
        productId: ref._id,
        productSlug: ref.slug,
        bannerUrl: banner.bannerUrl,
        bannerType: banner.bannerType,
        status: 'ACTIVE',
        expireAt: null,
      }
    })
  )
  console.log(`Created ${createdBanners.length} home banners`)

  // Seed a deterministic sample of reviews per product and roll the ratings up
  // onto the product document, mirroring updateProductReview.
  let reviewCount = 0
  for (let i = 0; i < createdProducts.length; i++) {
    const product = createdProducts[i]
    const numReviews = 2 + (i % 4) // 2..5 reviews per product
    const distribution: Record<number, number> = {}

    for (let r = 0; r < numReviews; r++) {
      const template =
        reviewTemplates[(i * 3 + r) % reviewTemplates.length]
      await Review.create({
        product: product._id,
        rating: template.rating,
        title: template.title,
        comment: template.comment,
        isVerifiedPurchase: r % 2 === 0,
      })
      distribution[template.rating] = (distribution[template.rating] || 0) + 1
      reviewCount++
    }

    const total = numReviews
    const sum = Object.entries(distribution).reduce(
      (acc, [rating, count]) => acc + Number(rating) * count,
      0
    )
    product.avgRating = Number((sum / total).toFixed(1))
    product.numReviews = total
    product.ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: distribution[rating] || 0,
    }))
    await product.save()
  }
  console.log(`Created ${reviewCount} reviews`)

  await BlogPost.create(
    blogPosts.map((post) => ({
      title: post.title,
      slug: toSlug(post.slug),
      image: post.image,
      category: blogCategoryIds.get(post.categoryName),
      categoryName: post.categoryName,
      tags: post.tags,
      excerpt: post.excerpt,
      content: post.content,
      date: post.date,
      author: post.author,
      status: 'public',
    }))
  )
  console.log(`Created ${blogPosts.length} blog posts`)

  await Coupon.create(
    coupons.map((coupon) => ({
      code: coupon.code,
      value: coupon.value,
      minAmount: coupon.minAmount,
      status: coupon.status,
      expiresAt: daysFromNow(coupon.daysFromNow),
    }))
  )
  console.log(`Created ${coupons.length} coupons`)

  // Upsert demo users so existing accounts are never destroyed.
  for (const user of users) {
    await User.findOneAndUpdate(
      { email: user.email },
      {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        phoneVerified: user.phoneVerified,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
  console.log(`Upserted ${users.length} users`)

  await mongoose.disconnect()
  console.log('Seed complete')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
