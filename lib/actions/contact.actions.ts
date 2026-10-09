'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/config/db'
import ContactMessage, { IContactMessage } from '@/lib/models/contact-message.model'
import { formatError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { getSetting } from './setting.actions'

export type ContactMessageListData = {
  data: IContactMessage[]
  totalPages: number
  totalMessages: number
  newMessagesCount: number
}

export async function getAllContactMessages({
  page = 1,
  limit,
  query = '',
  status = 'all',
}: {
  page?: number
  limit?: number
  query?: string
  status?: string
}): Promise<ContactMessageListData> {
  const session = await auth()
  if (session?.user?.role !== 'Admin') {
    throw new Error('Admin permission required')
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

  if (status && status !== 'all') {
    filter.status = status
  }

  if (trimmed) {
    filter.$or = [
      { name: { $regex: safeQuery, $options: 'i' } },
      { email: { $regex: safeQuery, $options: 'i' } },
      { phone: { $regex: safeQuery, $options: 'i' } },
      { subject: { $regex: safeQuery, $options: 'i' } },
      { message: { $regex: safeQuery, $options: 'i' } },
    ]
  }

  const skipAmount = (Number(page) - 1) * limit
  const messages = await ContactMessage.find(filter)
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)

  const totalMessages = await ContactMessage.countDocuments(filter)
  const newMessagesCount = await ContactMessage.countDocuments({ status: 'New' })

  return {
    data: JSON.parse(JSON.stringify(messages)) as IContactMessage[],
    totalPages: Math.ceil(totalMessages / limit),
    totalMessages,
    newMessagesCount,
  }
}

export async function updateContactMessage({
  id,
  status,
  comments,
}: {
  id: string
  status: string
  comments?: string
}) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'Admin') {
      throw new Error('Admin permission required')
    }

    await connectToDatabase()
    const message = await ContactMessage.findById(id)
    if (!message) throw new Error('Message not found')

    message.status = status
    if (comments !== undefined) {
      message.comments = comments
    }
    await message.save()

    revalidatePath('/admin/messages')
    return {
      success: true,
      message: 'Message updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function deleteContactMessage(id: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'Admin') {
      throw new Error('Admin permission required')
    }

    await connectToDatabase()
    const res = await ContactMessage.findByIdAndDelete(id)
    if (!res) throw new Error('Message not found')

    revalidatePath('/admin/messages')
    return {
      success: true,
      message: 'Message deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
