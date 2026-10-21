'use server'

import { connectToDatabase } from '@/config/db'
import Product, { IProduct } from '@/lib/models/product.model'
import Category, { ICategory } from '@/lib/models/category.model'
import { revalidatePath } from 'next/cache'
import { formatError, generateSlug, toSlug } from '../utils'
import { ProductInputSchema, ProductUpdateSchema } from '../validator'
import { IProductInput } from '@/types'
import { z } from 'zod'
import { auth } from '@/auth'
import { isStaffRole } from '@/lib/roles'
import { getSetting } from './setting.actions'
import { getActiveHeroBanners, getActiveCommonBanners } from './home-banner.actions'
import { getHomeFilters } from './home-filter.actions'
import {
  toPublicProduct,
  toPublicProducts as toPublicProductsList,
} from '../utils/product-transform'

const assertStaff = async () => {
  const session = await auth()
  if (!isStaffRole(session?.user?.role))
    throw new Error('Staff permission required')
}

// Price of the display (first) variant. Kept in one place so listings always
// sort/filter on the same value they show.
const PRICE_PATH = 'variants.0.price'

const resolveCategoryName = async (categoryId: string) => {
  const category = await Category.findById(categoryId).select('name')
  if (!category) throw new Error('Category not found')
  return category.name
}

const resolveSlug = async (slug: string, name: string, excludeId?: string) => {
  const base = toSlug(slug) || toSlug(name)
  if (!base) return generateSlug(name)
  const exists = await Product.exists({
    slug: base,
    _id: { $ne: excludeId },
  })
  return exists ? generateSlug(base) : base
}

const orderBy = (sort?: string): Record<string, 1 | -1> =>
  sort === 'best-selling'
    ? { numSales: -1 }
    : sort === 'price-low-to-high'
      ? { [PRICE_PATH]: 1 }
      : sort === 'price-high-to-low'
        ? { [PRICE_PATH]: -1 }
        : sort === 'avg-customer-review'
          ? { avgRating: -1 }
          : { _id: -1 }

// CREATE
export async function createProduct(data: IProductInput) {
  try {
    await assertStaff()
    const product = ProductInputSchema.parse(data)
    await connectToDatabase()
    const categoryName = await resolveCategoryName(product.category)
    const slug = await resolveSlug(product.slug, product.name)
    await Product.create({ ...product, slug, categoryName })
    revalidatePath('/workspace/products')
    return {
      success: true,
      message: 'Product created successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    await assertStaff()
    const product = ProductUpdateSchema.parse(data)
    await connectToDatabase()
    const categoryName = await resolveCategoryName(product.category)
    const slug = await resolveSlug(product.slug, product.name, product._id)
    await Product.findByIdAndUpdate(product._id, {
      ...product,
      slug,
      categoryName,
    })
    revalidatePath('/workspace/products')
    revalidatePath('/product/[slug]', 'page')
    return {
      success: true,
      message: 'Product updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// DELETE (soft delete)
export async function deleteProduct(id: string) {
  try {
    await assertStaff()
    await connectToDatabase()
    const res = await Product.findByIdAndUpdate(id, { status: 'delete' })
    if (!res) throw new Error('Product not found')
    revalidatePath('/workspace/products')
    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// GET ONE PRODUCT BY ID (full document, used by the admin form)
export async function getProductById(productId: string) {
  await connectToDatabase()
  const product = await Product.findById(productId).lean()
  return product
    ? (JSON.parse(JSON.stringify(product)) as IProduct)
    : (null as unknown as IProduct)
}

// GET ALL PRODUCTS FOR ADMIN (includes drafts, flattened for the table)
export async function getAllProductsForAdmin({
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
  await assertStaff()
  await connectToDatabase()

  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  const queryFilter =
    query && query !== 'all'
      ? {
          name: {
            $regex: query,
            $options: 'i',
          },
        }
      : {}

  const products = await Product.find({
    status: { $ne: 'delete' },
    ...queryFilter,
  })
    .sort(orderBy(sort))
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()

  const countProducts = await Product.countDocuments({
    status: { $ne: 'delete' },
    ...queryFilter,
  })
  return {
    products: toPublicProductsList(products),
    totalPages: Math.ceil(countProducts / pageSize),
    totalProducts: countProducts,
    from: pageSize * (Number(page) - 1) + 1,
    to: pageSize * (Number(page) - 1) + products.length,
  }
}

export async function getAllCategories(): Promise<ICategory[]> {
  await connectToDatabase()
  const categories = await Category.find({
    type: 'product',
    status: 'public',
  }).sort({ name: 1 })
  return JSON.parse(JSON.stringify(categories)) as ICategory[]
}
export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find(
    { tags: { $in: [tag] }, status: 'public' },
    { name: 1, slug: 1, variants: 1 }
  )
    .sort({ createdAt: 'desc' })
    .limit(limit)
    .lean()
  return products.map((product) => ({
    name: product.name,
    href: `/product/${product.slug}`,
    image: product.variants?.[0]?.images?.[0] ?? '',
  }))
}
// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find({
    tags: { $in: [tag] },
    status: 'public',
  })
    .sort({ createdAt: 'desc' })
    .limit(limit)
    .lean()
  return toPublicProductsList(products)
}

// AGGREGATED HOME PAGE DATA (single entry point for the home page)
export async function getHomePageData() {
  await connectToDatabase()
  const [heroBanners, commonBanners, categories, homeFilters] =
    await Promise.all([
      getActiveHeroBanners({ limit: 6 }),
      getActiveCommonBanners(),
      getAllCategories(),
      getHomeFilters(),
    ])

  return {
    heroBanners,
    commonBanners,
    categories,
    homeFilters,
  }
}

// SEARCH PRODUCT OPTIONS FOR PICKERS (id + name + slug)
export async function searchProductOptions({
  query,
  limit = 10,
}: {
  query: string
  limit?: number
}) {
  await assertStaff()
  await connectToDatabase()
  const filter = query
    ? { name: { $regex: query, $options: 'i' }, status: { $ne: 'delete' } }
    : { status: { $ne: 'delete' } }
  const products = await Product.find(filter, { name: 1, slug: 1 })
    .sort({ name: 1 })
    .limit(limit)
    .lean()
  return products.map((product) => ({
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
  }))
}

// GET ONE PRODUCT BY SLUG (flattened to the requested/primary variant)
export async function getProductBySlug(slug: string, variantId?: string) {
  await connectToDatabase()
  const product = await Product.findOne({ slug, status: 'public' }).lean()
  if (!product) return null
  return toPublicProduct(product, variantId)
}
// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = 4,
  page = 1,
}: {
  category: string
  productId: string
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()
  const skipAmount = (Number(page) - 1) * limit
  const conditions = {
    status: 'public' as const,
    category,
    _id: { $ne: productId },
  }
  const products = await Product.find(conditions)
    .sort({ numSales: 'desc' })
    .skip(skipAmount)
    .limit(limit)
    .lean()
  const productsCount = await Product.countDocuments(conditions)
  return {
    data: toPublicProductsList(products),
    totalPages: Math.ceil(productsCount / limit),
  }
}

// GET ALL PRODUCTS
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  price,
  rating,
  sort,
}: {
  query: string
  category: string
  tag: string
  limit?: number
  page: number
  price?: string
  rating?: string
  sort?: string
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()

  const queryFilter =
    query && query !== 'all'
      ? {
          name: {
            $regex: query,
            $options: 'i',
          },
        }
      : {}
  const categoryFilter =
    category && category !== 'all' ? { categoryName: category } : {}
  const tagFilter = tag && tag !== 'all' ? { tags: tag } : {}

  const ratingFilter =
    rating && rating !== 'all'
      ? {
          avgRating: {
            $gte: Number(rating),
          },
        }
      : {}
  // 10-50
  const priceFilter =
    price && price !== 'all'
      ? {
          [PRICE_PATH]: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {}
  const statusFilter = { status: 'public' as const }
  const products = await Product.find({
    ...statusFilter,
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })
    .sort(orderBy(sort))
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()

  const countProducts = await Product.countDocuments({
    ...statusFilter,
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })
  return {
    products: toPublicProductsList(products),
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + products.length,
  }
}

export async function getAllTags() {
  const tags = await Product.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ])
  return (
    (tags[0]?.uniqueTags
      .sort((a: string, b: string) => a.localeCompare(b))
      .map((x: string) =>
        x
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      ) as string[]) || []
  )
}
