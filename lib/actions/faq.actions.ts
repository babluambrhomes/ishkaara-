'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/config/db'
import Faq, { IFaq } from '@/lib/models/faq.model'
import { formatError } from '@/lib/utils'
import { FaqInputSchema, FaqUpdateSchema } from '@/lib/validator'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isStaffRole } from '@/lib/roles'
import { getSetting } from './setting.actions'


export type FaqListData = {
  data: IFaq[]
  totalPages: number
  totalFaqs: number
  publicCount: number
}

// PUBLIC: Get active FAQs for customers
export async function getPublicFaqs(): Promise<IFaq[]> {
  await connectToDatabase()


  const faqs = await Faq.find({ is_public: true }).sort({ sortOrder: 1, createdAt: 1 })
  return JSON.parse(JSON.stringify(faqs)) as IFaq[]
}

// ADMIN: Get all FAQs with pagination & search
export async function getAllFaqsForAdmin({
  page = 1,
  limit,
  query = '',
  status = 'all',
}: {
  page?: number
  limit?: number
  query?: string
  status?: string
}): Promise<FaqListData> {
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

  if (status === 'public') {
    filter.is_public = true
  } else if (status === 'private') {
    filter.is_public = false
  }

  if (trimmed) {
    filter.$or = [
      { question: { $regex: safeQuery, $options: 'i' } },
      { answer: { $regex: safeQuery, $options: 'i' } },
    ]
  }

  const skipAmount = (Number(page) - 1) * limit
  const faqs = await Faq.find(filter)
    .sort({ sortOrder: 1, createdAt: -1 })
    .skip(skipAmount)
    .limit(limit)

  const totalFaqs = await Faq.countDocuments(filter)
  const publicCount = await Faq.countDocuments({ is_public: true })

  return {
    data: JSON.parse(JSON.stringify(faqs)) as IFaq[],
    totalPages: Math.ceil(totalFaqs / limit),
    totalFaqs,
    publicCount,
  }
}

// ADMIN: Create FAQ
export async function createFaq(data: z.infer<typeof FaqInputSchema>) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    const validated = FaqInputSchema.parse(data)
    await connectToDatabase()

    await Faq.create(validated)

    revalidatePath('/faq')
    revalidatePath('/workspace/faqs')
    return {
      success: true,
      message: 'FAQ created successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// ADMIN: Update FAQ
export async function updateFaq(data: z.infer<typeof FaqUpdateSchema>) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    const { _id, ...fields } = FaqUpdateSchema.parse(data)
    await connectToDatabase()

    const faq = await Faq.findByIdAndUpdate(_id, fields, { new: true })
    if (!faq) throw new Error('FAQ not found')

    revalidatePath('/faq')
    revalidatePath('/workspace/faqs')
    return {
      success: true,
      message: 'FAQ updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// ADMIN: Toggle is_public status
export async function toggleFaqPublic(id: string) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    await connectToDatabase()
    const faq = await Faq.findById(id)
    if (!faq) throw new Error('FAQ not found')

    faq.is_public = !faq.is_public
    await faq.save()

    revalidatePath('/faq')
    revalidatePath('/workspace/faqs')
    return {
      success: true,
      message: `FAQ marked as ${faq.is_public ? 'Public' : 'Hidden'}`,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// ADMIN: Delete FAQ
export async function deleteFaq(id: string) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    await connectToDatabase()
    const res = await Faq.findByIdAndDelete(id)
    if (!res) throw new Error('FAQ not found')

    revalidatePath('/faq')
    revalidatePath('/workspace/faqs')
    return {
      success: true,
      message: 'FAQ deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
