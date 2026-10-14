'use server'

import { auth, signIn, signOut } from '@/auth'
import { IUserName, IUserOtpSend, IUserSignIn } from '@/types'
import {
  PhoneVerifySchema,
  UserOtpSendSchema,
  UserProfileUpdateSchema,
  UserUpdateSchema,
} from '../validator'
import { connectToDatabase } from '@/config/db'
import User, { IUser } from '../models/user.model'
import Order from '../models/order.model'
import { formatError } from '../utils'
import { isAdminRole, isStaffRole } from '../roles'
import { deleteFiles } from '../storage'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSetting } from './setting.actions'
import { assertRateLimit, getClientIpFromHeaders } from '../ratelimit'

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

// CREATE
// Single flow for both create & login: first-time OTP login auto-creates the user
export async function sendOtp(
  user: IUserOtpSend
): Promise<
  | { success: true; message: string; otp: string }
  | { success: false; error: string }
> {
  try {
    const { phone } = UserOtpSendSchema.parse(user)

    const ip = getClientIpFromHeaders(await headers())
    await assertRateLimit('otp', `ip:${ip}`)
    await assertRateLimit('otp', `phone:${phone}`)

    await connectToDatabase()
    const dbUser = await User.findOneAndUpdate(
      { phone },
      { $setOnInsert: { phone } },
      { upsert: true, new: true }
    )
    dbUser.otp = generateOtp()
    await dbUser.save()
    return { success: true, message: 'OTP sent successfully', otp: dbUser.otp! }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

// DELETE

export async function deleteUser(id: string) {
  try {
    const session = await auth()
    if (!isAdminRole(session?.user?.role))
      throw new Error('Admin permission required')
    await connectToDatabase()
    const res = await User.findByIdAndDelete(id)
    if (!res) throw new Error('Use not found')
    revalidatePath('/workspace/users')
    return {
      success: true,
      message: 'User deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// UPDATE

export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    const session = await auth()
    if (!isStaffRole(session?.user?.role))
      throw new Error('Staff permission required')
    await connectToDatabase()
    const dbUser = await User.findById(user._id)
    if (!dbUser) throw new Error('User not found')
    dbUser.name = user.name
    dbUser.email = user.email
    if (isAdminRole(session?.user?.role)) dbUser.role = user.role
    const updatedUser = await dbUser.save()
    revalidatePath('/workspace/users')
    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
export async function updateUserName(user: IUserName) {
  try {
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')
    currentUser.name = user.name
    const updatedUser = await currentUser.save()
    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateProfile(
  user: z.infer<typeof UserProfileUpdateSchema>
) {
  try {
    UserProfileUpdateSchema.parse(user)
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')
    currentUser.name = user.name
    if (user.email) currentUser.email = user.email
    if (user.profile !== undefined && user.profile !== currentUser.profile) {
      const oldProfile = currentUser.profile
      currentUser.profile = user.profile || null
      if (oldProfile) await deleteFiles([oldProfile])
    }
    await currentUser.save()
    return { success: true, message: 'Profile updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Add & verify phone (used when account has no phone, e.g. Google sign-in)
export async function sendPhoneVerificationOtp(phone: string) {
  try {
    UserOtpSendSchema.parse({ phone })
    const ip = getClientIpFromHeaders(await headers())
    await assertRateLimit('otp', `ip:${ip}`)
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')
    if (currentUser.phone && currentUser.phoneVerified)
      return { success: false, message: 'Phone number is already verified' }
    const existing = await User.findOne({ phone })
    if (existing && existing._id.toString() !== currentUser._id.toString())
      return {
        success: false,
        message: 'This phone number is already linked to another account',
      }
    currentUser.otp = generateOtp()
    await currentUser.save()
    return { success: true, message: 'OTP sent successfully', otp: currentUser.otp }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function verifyPhoneLink(
  data: z.infer<typeof PhoneVerifySchema>
) {
  try {
    PhoneVerifySchema.parse(data)
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')
    if (currentUser.otp !== data.otp)
      throw new Error('Invalid or expired OTP')
    const existing = await User.findOne({ phone: data.phone })
    if (existing && existing._id.toString() !== currentUser._id.toString())
      return {
        success: false,
        message: 'This phone number is already linked to another account',
      }
    currentUser.phone = data.phone
    currentUser.phoneVerified = true
    currentUser.otp = null
    await currentUser.save()
    return { success: true, message: 'Phone number verified successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Attach Google to a phone-created account to verify email
export async function initiateGoogleAttach() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/account/profile')
  }
  await connectToDatabase()
  const currentUser = await User.findById(session.user.id)
  if (!currentUser) throw new Error('User not found')
  currentUser.otp = null
  await currentUser.save()
  const cookieStore = await cookies()
  cookieStore.set('auth-google-link', currentUser._id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  await signIn('google', { redirectTo: '/account/profile?googleAttached=1' })
}

export async function completeGoogleAttach() {
  let linked = false
  try {
    await connectToDatabase()
    const session = await auth()
    const googleEmail = session?.user?.email
    if (!googleEmail || !session?.user?.id)
      throw new Error('No Google account detected')

    const cookieStore = await cookies()
    const pendingId = cookieStore.get('auth-google-link')?.value
    if (!pendingId) throw new Error('Link session expired, please try again')

    const pendingUser = await User.findById(pendingId)
    if (!pendingUser) throw new Error('User not found')
    if (!pendingUser.phone || !pendingUser.phoneVerified)
      throw new Error('This account is not linked to a phone number')

    const emailTaken = await User.findOne({
      email: googleEmail,
      _id: { $ne: pendingUser._id },
    })
    if (emailTaken)
      throw new Error('This Google email is already used by another account')

    const cookieUser = await User.findById(session.user.id)
    const hasOrders = cookieUser
      ? !!(await Order.exists({ user: cookieUser._id }))
      : true
    if (cookieUser && session.user.id !== pendingId && !hasOrders) {
      await User.findByIdAndDelete(cookieUser._id)
    }

    pendingUser.email = googleEmail
    pendingUser.emailVerified = true
    pendingUser.googleId = cookieUser?.googleId || googleEmail
    const relinkOtp = generateOtp()
    pendingUser.otp = relinkOtp
    await pendingUser.save()
    cookieStore.delete('auth-google-link')

    await signIn('credentials', {
      phone: pendingUser.phone,
      otp: relinkOtp,
      redirect: false,
    })
    linked = true
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
  if (linked) redirect('/account/profile')
  return { success: false, message: 'Unable to link account' }
}

export async function signInWithOtp(user: IUserSignIn) {
  return await signIn('credentials', { ...user, redirect: false })
}
export const SignInWithGoogle = async () => {
  await signIn('google')
}
export const SignOut = async () => {
  const redirectTo = await signOut({ redirect: false })
  redirect(redirectTo.redirect)
}

// GET
export async function getAllUsers({
  limit,
  page,
  query = '',
}: {
  limit?: number
  page: number
  query?: string
}) {
  const session = await auth()
  if (!isStaffRole(session?.user?.role))
    throw new Error('Staff permission required')

  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()

  const trimmed = query.trim()
  const safeQuery = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const filter = trimmed
    ? {
        $or: [
          { name: { $regex: safeQuery, $options: 'i' } },
          { email: { $regex: safeQuery, $options: 'i' } },
          { phone: { $regex: safeQuery, $options: 'i' } },
        ],
      }
    : {}

  const skipAmount = (Number(page) - 1) * limit
  const users = await User.find(filter)
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const usersCount = await User.countDocuments(filter)
  return {
    data: JSON.parse(JSON.stringify(users)) as IUser[],
    totalPages: Math.ceil(usersCount / limit),
    totalUsers: usersCount,
  }
}

export async function getUserById(userId: string) {
  await connectToDatabase()
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')
  return JSON.parse(JSON.stringify(user)) as IUser
}
