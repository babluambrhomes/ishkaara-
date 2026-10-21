'use server'

import { connectToDatabase } from '@/config/db'
import HomeFilter from '@/lib/models/home-filter.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { HomeFilterInputSchema, HomeFilterUpdateSchema } from '../validator'
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
  revalidatePath('/workspace/home-filters')
}

// CREATE
export async function createHomeFilter(
  data: z.infer<typeof HomeFilterInputSchema>
) {
  try {
    await assertStaff()
    const values = HomeFilterInputSchema.parse(data)
    await connectToDatabase()
    await HomeFilter.create(values)
    revalidateHomePaths()
    return { success: true, message: 'Home filter created successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateHomeFilter(
  data: z.infer<typeof HomeFilterUpdateSchema>
) {
  try {
    await assertStaff()
    const values = HomeFilterUpdateSchema.parse(data)
    await connectToDatabase()
    const filter = await HomeFilter.findById(values._id)
    if (!filter) throw new Error('Home filter not found')
    filter.title = values.title
    filter.section = values.section
    filter.redirect = values.redirect
    filter.order = values.order
    filter.details = values.details
    await filter.save()
    revalidateHomePaths()
    return { success: true, message: 'Home filter updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// DELETE
export async function deleteHomeFilter(id: string) {
  try {
    await assertStaff()
    await connectToDatabase()
    const res = await HomeFilter.findByIdAndDelete(id)
    if (!res) throw new Error('Home filter not found')
    revalidateHomePaths()
    return { success: true, message: 'Home filter deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ALL FOR ADMIN (paginated)
export async function getAllHomeFiltersForAdmin({
  page = 1,
  limit,
}: {
  page?: number
  limit?: number
} = {}) {
  await assertStaff()
  await connectToDatabase()
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize

  const filters = await HomeFilter.find({})
    .sort({ order: 1, createdAt: -1 })
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()
  const countFilters = await HomeFilter.countDocuments({})

  return {
    filters: JSON.parse(JSON.stringify(filters)),
    totalPages: Math.ceil(countFilters / limit),
    totalFilters: countFilters,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + filters.length,
  }
}

// GET ACTIVE FILTERS FOR HOME PAGE (public, sorted by order)
export async function getHomeFilters() {
  await connectToDatabase()
  const filters = await HomeFilter.find({}).sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(filters))
}
