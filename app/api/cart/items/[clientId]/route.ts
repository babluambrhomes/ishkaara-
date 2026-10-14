import { NextRequest, NextResponse } from 'next/server'

import { connectToDatabase } from '@/config/db'
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/ratelimit'
import {
  CartApiError,
  cartToPlain,
  findCartForOwner,
  getCartOwner,
  toServerCart,
} from '@/lib/utils/cart-api'
import { CartItem } from '@/types'

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) => {
  try {
    const rl = await rateLimit('cart', getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl)

    const { clientId } = await params
    const body = await request.json().catch(() => ({}))
    const quantity = Math.max(1, Math.floor(body.quantity ?? 1))

    const owner = await getCartOwner()
    if (!owner.userId && !owner.guestId) {
      throw new CartApiError(404, 'Item not found in cart')
    }
    await connectToDatabase()
    const cart = await findCartForOwner(owner)
    const plain: CartItem[] = cartToPlain(cart)
    const idx = plain.findIndex((i) => i.clientId === clientId)
    if (!cart || idx < 0) {
      throw new CartApiError(404, 'Item not found in cart')
    }
    if (quantity > plain[idx].countInStock) {
      throw new CartApiError(400, 'Not enough items in stock')
    }
    plain[idx] = { ...plain[idx], quantity }
    cart.items = plain as never
    await cart.save()

    const serverCart = await toServerCart(plain)
    return NextResponse.json({ cart: serverCart })
  } catch (error) {
    if (error instanceof CartApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) => {
  try {
    const rl = await rateLimit('cart', getClientIp(request))
    if (!rl.success) return rateLimitResponse(rl)

    const { clientId } = await params
    const owner = await getCartOwner()
    if (!owner.userId && !owner.guestId) {
      throw new CartApiError(404, 'Item not found in cart')
    }
    await connectToDatabase()
    const cart = await findCartForOwner(owner)
    const plain: CartItem[] = cartToPlain(cart)
    if (!cart || !plain.some((i) => i.clientId === clientId)) {
      throw new CartApiError(404, 'Item not found in cart')
    }
    const items = plain.filter((i) => i.clientId !== clientId)
    cart.items = items as never
    await cart.save()

    const serverCart = await toServerCart(items)
    return NextResponse.json({ cart: serverCart })
  } catch (error) {
    if (error instanceof CartApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}