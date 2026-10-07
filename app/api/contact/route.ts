import { NextRequest, NextResponse } from 'next/server'

import ContactMessage from '@/lib/db/models/contact-message.model'
import { connectToDatabase } from '@/lib/db'

export const POST = async (request: NextRequest) => {
  const body = (await request.json().catch(() => null)) as {
    name?: string
    email?: string
    phone?: string
    subject?: string
    message?: string
  } | null

  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const phone = body?.phone?.trim()
  const subject = body?.subject?.trim()
  const message = body?.message?.trim()

  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email) || !phone || !subject || !message) {
    return NextResponse.json(
      { message: 'Please fill in all required fields with valid information.' },
      { status: 400 }
    )
  }

  await connectToDatabase()

  try {
    await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
    })
    return NextResponse.json(
      { message: 'Message sent! Our team will get back to you soon.' },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}