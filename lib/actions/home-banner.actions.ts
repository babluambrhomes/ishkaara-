'use server'

import { connectToDatabase } from '@/config/db'
import HomeBanner, { IHomeBanner } from '@/lib/models/home-banner.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { HomeBannerInputSchema, HomeBannerUpdateSchema } from '../validator'
import { z } from 'zod'
import { auth } from '@/auth'
import { isStaffRole } from '@/lib/roles'
import { getSetting } from './setting.actions'

const assertStaff = async () => {
  const session = await auth()
  if (!isStaffRole(session?.user?.role))
    throw new Error('Staff permission required')
}

const revalidateHomePaths = () => {
  revalidatePath('/')
  revalidatePath('/workspace/home-banners')
}

// CREATE
export async function createHomeBanner(
  data: z.infer<typeof HomeBannerInputSchema>
) {
  try {
    await assertStaff()
    const values = HomeBannerInputSchema.parse(data)
    await connectToDatabase()
    await HomeBanner.create(values)
    revalidateHomePaths()
    return { success: true, message: 'Home banner created successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateHomeBanner(
  data: z.infer<typeof HomeBannerUpdateSchema>
) {
  try {
    await assertStaff()
    const values = HomeBannerUpdateSchema.parse(data)
    await connectToDatabase()
    const banner = await HomeBanner.findById(values._id)
    if (!banner) throw new Error('Home banner not found')
    banner.redirect = values.redirect
    banner.bannerUrl = values.bannerUrl
    banner.bannerType = values.bannerType
    banner.status = values.status
    banner.expireAt = values.expireAt
    await banner.save()
    revalidateHomePaths()
    return { success: true, message: 'Home banner updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// HARD DELETE (row removed)
export async function deleteHomeBanner(id: string) {
  try {
    await assertStaff()
    await connectToDatabase()
    const res = await HomeBanner.findByIdAndDelete(id)
    if (!res) throw new Error('Home banner not found')
    revalidateHomePaths()
    return { success: true, message: 'Home banner deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// SOFT DELETE (mark INACTIVE)
export async function deactivateHomeBanner(id: string) {
  try {
    await assertStaff()
    await connectToDatabase()
    const res = await HomeBanner.findByIdAndUpdate(id, { status: 'INACTIVE' })
    if (!res) throw new Error('Home banner not found')
    revalidateHomePaths()
    return { success: true, message: 'Home banner deactivated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ALL FOR ADMIN (paginated)
export async function getAllHomeBannersForAdmin({
  query = '',
  page = 1,
  limit,
}: {
  query?: string
  page?: number
  limit?: number
} = {}) {
  await assertStaff()
  await connectToDatabase()
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize

  const filters: Record<string, unknown> = {}
  if (query && query !== 'all') {
    filters.redirect = new RegExp(query, 'i')
  }

  const banners = await HomeBanner.find(filters)
    .sort({ createdAt: -1 })
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()
  const countBanners = await HomeBanner.countDocuments(filters)

  return {
    banners: JSON.parse(JSON.stringify(banners)) as IHomeBanner[],
    totalPages: Math.ceil(countBanners / limit),
    totalBanners: countBanners,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + banners.length,
  }
}

// GET ACTIVE HERO BANNERS (public home hero)
export async function getActiveHeroBanners({
  limit = 6,
}: { limit?: number } = {}): Promise<IHomeBanner[]> {
  await connectToDatabase()
  const now = new Date()
  const banners = await HomeBanner.find({
    bannerType: 'Hero',
    status: 'ACTIVE',
    $or: [{ expireAt: null }, { expireAt: { $gt: now } }],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
  return JSON.parse(JSON.stringify(banners)) as IHomeBanner[]
}
