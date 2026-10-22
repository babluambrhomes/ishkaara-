'use server'

import { connectToDatabase } from '@/config/db'
import HomeLayout from '@/lib/models/home-layout.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { HomeLayoutInputSchema, HomeLayoutUpdateSchema } from '../validator'
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
  revalidatePath('/workspace/home-layouts')
}

// CREATE
export async function createHomeLayout(
  data: z.infer<typeof HomeLayoutInputSchema>
) {
  try {
    await assertStaff()
    const values = HomeLayoutInputSchema.parse(data)
    await connectToDatabase()
    await HomeLayout.create(values)
    revalidateHomePaths()
    return { success: true, message: 'Home layout created successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateHomeLayout(
  data: z.infer<typeof HomeLayoutUpdateSchema>
) {
  try {
    await assertStaff()
    const values = HomeLayoutUpdateSchema.parse(data)
    await connectToDatabase()
    const layout = await HomeLayout.findById(values._id)
    if (!layout) throw new Error('Home layout not found')
    layout.title = values.title
    layout.section = values.section
    layout.redirect = values.redirect
    layout.order = values.order
    layout.details = values.details
    layout.layout = values.layout
    await layout.save()
    revalidateHomePaths()
    return { success: true, message: 'Home layout updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// DELETE
export async function deleteHomeLayout(id: string) {
  try {
    await assertStaff()
    await connectToDatabase()
    const res = await HomeLayout.findByIdAndDelete(id)
    if (!res) throw new Error('Home layout not found')
    revalidateHomePaths()
    return { success: true, message: 'Home layout deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ALL FOR ADMIN (paginated)
export async function getAllHomeLayoutsForAdmin({
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

  const layouts = await HomeLayout.find({})
    .sort({ order: 1, createdAt: -1 })
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()
  const countLayouts = await HomeLayout.countDocuments({})

  return {
    layouts: JSON.parse(JSON.stringify(layouts)),
    totalPages: Math.ceil(countLayouts / limit),
    totalLayouts: countLayouts,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + layouts.length,
  }
}

// GET ACTIVE LAYOUTS FOR HOME PAGE (public, sorted by order)
export async function getHomeLayouts() {
  await connectToDatabase()
  const layouts = await HomeLayout.find({}).sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(layouts))
}
