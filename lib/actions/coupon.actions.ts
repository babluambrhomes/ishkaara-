'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/config/db'
import Coupon, { ICoupon } from '@/lib/models/coupon.model'
import { formatError } from '@/lib/utils'
import { CouponInputSchema, CouponUpdateSchema } from '@/lib/validator'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isStaffRole } from '@/lib/roles'
import { getSetting } from './setting.actions'

export type CouponListData = {
  data: ICoupon[]
  totalPages: number
  totalCoupons: number
  activeCount: number
}

const toExpiryDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day, 23, 59, 59)
}

// ADMIN: Get all coupons with pagination & search
export async function getAllCouponsForAdmin({
  page = 1,
  limit,
  query = '',
  status = 'all',
}: {
  page?: number
  limit?: number
  query?: string
  status?: string
}): Promise<CouponListData> {
  const session = await auth()
  if (!isStaffRole(session?.user?.role)) {
    throw new Error('Staff permission required')
  }

  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()

  const trimmed = query.trim()
  const safeQuery = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}

  if (status === 'Active' || status === 'Inactive') {
    filter.status = status
  }

  if (trimmed) {
    filter.code = { $regex: safeQuery, $options: 'i' }
  }

  const skipAmount = (Number(page) - 1) * limit
  const coupons = await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(limit)

  const totalCoupons = await Coupon.countDocuments(filter)
  const activeCount = await Coupon.countDocuments({ status: 'Active' })

  return {
    data: JSON.parse(JSON.stringify(coupons)) as ICoupon[],
    totalPages: Math.ceil(totalCoupons / limit),
    totalCoupons,
    activeCount,
  }
}

// ADMIN: Create coupon
export async function createCoupon(data: z.infer<typeof CouponInputSchema>) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    const validated = CouponInputSchema.parse(data)
    await connectToDatabase()

    const existing = await Coupon.findOne({
      code: validated.code,
    })
    if (existing) throw new Error('A coupon with this code already exists')

    await Coupon.create({
      ...validated,
      expiresAt: toExpiryDate(validated.expiresAt),
    })

    revalidatePath('/workspace/coupons')
    return {
      success: true,
      message: 'Coupon created successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// ADMIN: Update coupon
export async function updateCoupon(data: z.infer<typeof CouponUpdateSchema>) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    const { _id, ...fields } = CouponUpdateSchema.parse(data)
    await connectToDatabase()

    const existing = await Coupon.findOne({
      code: fields.code,
      _id: { $ne: _id },
    })
    if (existing) throw new Error('A coupon with this code already exists')

    const coupon = await Coupon.findByIdAndUpdate(
      _id,
      {
        ...fields,
        expiresAt: toExpiryDate(fields.expiresAt),
      },
      { new: true }
    )
    if (!coupon) throw new Error('Coupon not found')

    revalidatePath('/workspace/coupons')
    return {
      success: true,
      message: 'Coupon updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// ADMIN: Toggle Active / Inactive status
export async function toggleCouponStatus(id: string) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    await connectToDatabase()
    const coupon = await Coupon.findById(id)
    if (!coupon) throw new Error('Coupon not found')

    coupon.status = coupon.status === 'Active' ? 'Inactive' : 'Active'
    await coupon.save()

    revalidatePath('/workspace/coupons')
    return {
      success: true,
      message: `Coupon marked as ${coupon.status}`,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// ADMIN: Delete coupon
export async function deleteCoupon(id: string) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    await connectToDatabase()
    const res = await Coupon.findByIdAndDelete(id)
    if (!res) throw new Error('Coupon not found')

    revalidatePath('/workspace/coupons')
    return {
      success: true,
      message: 'Coupon deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// STOREFRONT: Get active, non-expired coupons (for checkout)
export async function getActiveCoupons() {
  try {
    await connectToDatabase()
    const coupons = await Coupon.find({
      status: 'Active',
      expiresAt: { $gte: new Date() },
    })
      .sort({ value: -1 })
      .limit(30)

    return {
      data: JSON.parse(JSON.stringify(coupons)) as ICoupon[],
    }
  } catch {
    return { data: [] }
  }
}