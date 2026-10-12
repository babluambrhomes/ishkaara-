import { NextRequest, NextResponse } from 'next/server'

import Cart from '@/lib/models/cart.model'
import { connectToDatabase } from '@/config/db'
import { generateId } from '@/lib/utils'
import {
  CartApiError,
  CART_GUEST_COOKIE,
  buildCartItem,
  cartItemKey,
  cartToPlain,
  findCartForOwner,
  getCartOwner,
  toServerCart,
} from '@/lib/utils/cart-api'
import { CartItem } from '@/types'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}))
    const { productId } = body as {
      productId?: string
      variantId?: string
      size?: string
      quantity?: number
    }
    if (!productId) throw new CartApiError(400, 'Product is required')

    const item = await buildCartItem({
      productId,
      variantId: body.variantId,
      size: body.size,
      quantity: body.quantity,
    })

    const owner = await getCartOwner()
    await connectToDatabase()
    let guestId = owner.guestId
    if (!owner.userId && !guestId) guestId = generateId()

    const cart = await findCartForOwner({
      userId: owner.userId,
      guestId,
    })
    let items: CartItem[]

    if (cart) {
      const plain = cartToPlain(cart)
      const idx = plain.findIndex((i) => cartItemKey(i) === cartItemKey(item))
      if (idx >= 0) {
        const total = plain[idx].quantity + item.quantity
        if (total > plain[idx].countInStock) {
          throw new CartApiError(400, 'Not enough items in stock')
        }
        plain[idx] = {
          ...plain[idx],
          quantity: total,
          countInStock: item.countInStock,
        }
      } else {
        plain.push(item)
      }
      items = plain
      cart.items = items as never
      await cart.save()
    } else {
      await Cart.create({
        userId: owner.userId ?? undefined,
        guestId,
        items: [item],
      })
      items = [item]
    }

    const serverCart = await toServerCart(items)
    const res = NextResponse.json({
      cart: serverCart,
      clientId: item.clientId,
      message: 'Added to cart',
    })
    if (!owner.userId) {
      res.cookies.set(CART_GUEST_COOKIE, guestId as string, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 180,
      })
    } else if (owner.guestId) {
      res.cookies.set(CART_GUEST_COOKIE, '', { path: '/', maxAge: 0 })
    }
    return res
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