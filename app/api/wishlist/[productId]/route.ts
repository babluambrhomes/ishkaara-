import { NextResponse } from 'next/server'
import { Types } from 'mongoose'

import { auth } from '@/auth'
import { connectToDatabase } from '@/config/db'
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/ratelimit'
import Wishlist from '@/lib/models/wishlist.model'
import { getWishlistProducts } from '@/lib/utils/wishlist-api'

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) => {
  try {
    const session = await auth()
    const rl = await rateLimit(
      'wishlist',
      session?.user?.id ?? getClientIp(request)
    )
    if (!rl.success) return rateLimitResponse(rl)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Please sign in' }, { status: 401 })
    }
    const { productId } = await params
    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    await connectToDatabase()
    const wishlist = await Wishlist.findOne({ userId: session.user.id })
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (p) => p.toString() !== productId
      )
      await wishlist.save()
    }
    const items = await getWishlistProducts(session.user.id)
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
