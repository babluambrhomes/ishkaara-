import { NextRequest, NextResponse } from 'next/server'

import Cart from '@/lib/models/cart.model'
import { connectToDatabase } from '@/config/db'
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/ratelimit'
import {
  CART_GUEST_COOKIE,
  cartToPlain,
  findCartForOwner,
  getCartOwner,
  mergeCartItems,
  toServerCart,
} from '@/lib/utils/cart-api'

export const GET = async (request: NextRequest) => {
  try {
    const rl = await rateLimit('cart', getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl)

    const owner = await getCartOwner()
    await connectToDatabase()

    if (owner.userId && owner.guestId) {
      let userCart = await Cart.findOne({ userId: owner.userId })
      const guestCart = await Cart.findOne({ guestId: owner.guestId })
      const guestItems = cartToPlain(guestCart)
      if (guestItems.length > 0) {
        const mergedItems = mergeCartItems(cartToPlain(userCart), guestItems)
        if (userCart) {
          userCart.items = mergedItems
          await userCart.save()
        } else {
          userCart = await Cart.create({ userId: owner.userId, items: mergedItems })
        }
      }
      if (guestCart) await Cart.findByIdAndDelete(guestCart._id)
      const serverCart = await toServerCart(cartToPlain(userCart))
      const res = NextResponse.json({ cart: serverCart })
      res.cookies.set(CART_GUEST_COOKIE, '', { path: '/', maxAge: 0 })
      return res
    }

    const cart = await findCartForOwner(owner)
    const serverCart = await toServerCart(cartToPlain(cart))
    return NextResponse.json({ cart: serverCart })
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export const DELETE = async (request: NextRequest) => {
  try {
    const rl = await rateLimit('cart', getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl)

    const owner = await getCartOwner()
    if (!owner.userId && !owner.guestId) {
      return NextResponse.json({ cart: await toServerCart([]) })
    }
    await connectToDatabase()
    const cart = await findCartForOwner(owner)
    if (cart) {
      cart.items = []
      await cart.save()
    }
    const serverCart = await toServerCart([])
    return NextResponse.json({ cart: serverCart })
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
