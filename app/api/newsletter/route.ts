import { NextRequest, NextResponse } from 'next/server'

import NewsletterSubscriber from '@/lib/models/newsletter-subscriber.model'
import { connectToDatabase } from '@/config/db'
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/ratelimit'

export const POST = async (request: NextRequest) => {
  const rl = await rateLimit('write', getClientIp(request))
  if (!rl.success) return rateLimitResponse(rl)

  const body = (await request.json().catch(() => null)) as { email?: string } | null
  const email = body?.email?.trim().toLowerCase()

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { message: 'Please enter a valid email address.' },
      { status: 400 }
    )
  }

  await connectToDatabase()

  try {
    const existing = await NewsletterSubscriber.findOne({ email })
    if (existing) {
      if (existing.isSubscribed) {
        return NextResponse.json(
          { message: 'You are already subscribed. Stay tuned!' },
          { status: 200 }
        )
      }
      existing.isSubscribed = true
      await existing.save()
      return NextResponse.json(
        { message: 'Welcome back! You are subscribed again.' },
        { status: 200 }
      )
    }
    await NewsletterSubscriber.create({ email })
    return NextResponse.json(
      { message: 'Subscribed! Welcome to the community.' },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}