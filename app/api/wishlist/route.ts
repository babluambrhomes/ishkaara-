import { NextRequest, NextResponse } from 'next/server'
import { Types } from 'mongoose'

import { auth } from '@/auth'
import { connectToDatabase } from '@/config/db'
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/ratelimit'
import Wishlist from '@/lib/models/wishlist.model'
import Product from '@/lib/models/product.model'
import { getWishlistProducts } from '@/lib/utils/wishlist-api'

export const GET = async (request: NextRequest) => {
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
    const items = await getWishlistProducts(session.user.id)
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export const POST = async (request: NextRequest) => {
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
    const body = await request.json().catch(() => ({}))
    const productId =
      typeof body.productId === 'string' ? body.productId.trim() : ''
    if (!productId || !Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { message: 'Product is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const product = await Product.findById(productId)
      .select('_id status')
      .lean()
    if (!product || product.status !== 'public') {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    let wishlist = await Wishlist.findOne({ userId: session.user.id })
    const exists = wishlist
      ? wishlist.products.some((p) => p.toString() === productId)
      : false

    if (exists && wishlist) {
      wishlist.products = wishlist.products.filter(
        (p) => p.toString() !== productId
      )
    } else {
      if (wishlist) {
        wishlist.products.push(new Types.ObjectId(productId))
      } else {
        wishlist = await Wishlist.create({
          userId: session.user.id,
          products: [new Types.ObjectId(productId)],
        })
      }
    }
    await wishlist.save()

    const items = await getWishlistProducts(session.user.id)
    return NextResponse.json({ added: !exists, items })
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
