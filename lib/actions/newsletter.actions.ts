'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/config/db'
import NewsletterSubscriber, {
  INewsletterSubscriber,
} from '@/lib/models/newsletter-subscriber.model'
import { formatError } from '@/lib/utils'
import { isStaffRole } from '@/lib/roles'
import { revalidatePath } from 'next/cache'
import { getSetting } from './setting.actions'

export type NewsletterSubscriberListData = {
  data: INewsletterSubscriber[]
  totalPages: number
  totalSubscribers: number
  activeSubscribers: number
}

export async function getAllNewsletterSubscribers({
  page = 1,
  limit,
  query = '',
  status = 'all',
}: {
  page?: number
  limit?: number
  query?: string
  status?: string
}): Promise<NewsletterSubscriberListData> {
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

  if (status === 'subscribed') {
    filter.isSubscribed = true
  } else if (status === 'unsubscribed') {
    filter.isSubscribed = false
  }

  if (trimmed) {
    filter.email = { $regex: safeQuery, $options: 'i' }
  }

  const skipAmount = (Number(page) - 1) * limit
  const subscribers = await NewsletterSubscriber.find(filter)
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)

  const totalSubscribers = await NewsletterSubscriber.countDocuments(filter)
  const activeSubscribers = await NewsletterSubscriber.countDocuments({
    isSubscribed: true,
  })

  return {
    data: JSON.parse(JSON.stringify(subscribers)) as INewsletterSubscriber[],
    totalPages: Math.ceil(totalSubscribers / limit),
    totalSubscribers,
    activeSubscribers,
  }
}

export async function getAllActiveSubscriberEmails(): Promise<string[]> {
  const session = await auth()
  if (!isStaffRole(session?.user?.role)) {
    throw new Error('Staff permission required')
  }

  await connectToDatabase()
  const subscribers = await NewsletterSubscriber.find(
    { isSubscribed: true },
    { email: 1, _id: 0 }
  )
  return subscribers.map((s) => s.email)
}

export async function toggleNewsletterSubscription(id: string) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    await connectToDatabase()
    const subscriber = await NewsletterSubscriber.findById(id)
    if (!subscriber) throw new Error('Subscriber not found')

    subscriber.isSubscribed = !subscriber.isSubscribed
    await subscriber.save()

    revalidatePath('/workspace/newsletter')
    return {
      success: true,
      message: `Subscriber ${
        subscriber.isSubscribed ? 'subscribed' : 'unsubscribed'
      } successfully`,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function deleteNewsletterSubscriber(id: string) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role)) {
      throw new Error('Staff permission required')
    }

    await connectToDatabase()
    const res = await NewsletterSubscriber.findByIdAndDelete(id)
    if (!res) throw new Error('Subscriber not found')

    revalidatePath('/workspace/newsletter')
    return {
      success: true,
      message: 'Subscriber deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
