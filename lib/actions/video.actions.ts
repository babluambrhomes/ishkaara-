'use server'

import { connectToDatabase } from '@/config/db'
import Video, { IVideo } from '@/lib/models/video.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { VideoInputSchema, VideoUpdateSchema } from '../validator'
import { z } from 'zod'
import { auth } from '@/auth'
import { isStaffRole } from '@/lib/roles'
import { getSetting } from './setting.actions'

const assertStaff = async () => {
  const session = await auth()
  if (!isStaffRole(session?.user?.role))
    throw new Error('Staff permission required')
}

const revalidateVideoPaths = () => {
  revalidatePath('/')
  revalidatePath('/workspace/videos')
}

// CREATE
export async function createVideo(data: z.infer<typeof VideoInputSchema>) {
  try {
    await assertStaff()
    const values = VideoInputSchema.parse(data)
    await connectToDatabase()
    await Video.create(values)
    revalidateVideoPaths()
    return { success: true, message: 'Video created successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateVideo(data: z.infer<typeof VideoUpdateSchema>) {
  try {
    await assertStaff()
    const values = VideoUpdateSchema.parse(data)
    await connectToDatabase()
    const video = await Video.findById(values._id)
    if (!video) throw new Error('Video not found')
    video.title = values.title
    video.videoUrl = values.videoUrl
    video.status = values.status
    video.expireAt = values.expireAt
    video.order = values.order
    await video.save()
    revalidateVideoPaths()
    return { success: true, message: 'Video updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// HARD DELETE (row removed)
export async function deleteVideo(id: string) {
  try {
    await assertStaff()
    await connectToDatabase()
    const res = await Video.findByIdAndDelete(id)
    if (!res) throw new Error('Video not found')
    revalidateVideoPaths()
    return { success: true, message: 'Video deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// SOFT DELETE (mark INACTIVE)
export async function deactivateVideo(id: string) {
  try {
    await assertStaff()
    await connectToDatabase()
    const res = await Video.findByIdAndUpdate(id, { status: 'INACTIVE' })
    if (!res) throw new Error('Video not found')
    revalidateVideoPaths()
    return { success: true, message: 'Video deactivated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ALL FOR ADMIN (paginated)
export async function getAllVideosForAdmin({
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
    const regex = new RegExp(query, 'i')
    filters.$or = [{ title: regex }, { videoUrl: regex }]
  }

  const videos = await Video.find(filters)
    .sort({ order: 1, createdAt: -1 })
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()
  const countVideos = await Video.countDocuments(filters)

  return {
    videos: JSON.parse(JSON.stringify(videos)) as IVideo[],
    totalPages: Math.ceil(countVideos / limit),
    totalVideos: countVideos,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + videos.length,
  }
}

// GET ACTIVE VIDEOS (public home section)
export async function getActiveVideos(): Promise<IVideo[]> {
  await connectToDatabase()
  const now = new Date()
  const videos = await Video.find({
    status: 'ACTIVE',
    $or: [{ expireAt: null }, { expireAt: { $gt: now } }],
  })
    .sort({ order: 1, createdAt: -1 })
    .lean()
  return JSON.parse(JSON.stringify(videos)) as IVideo[]
}
