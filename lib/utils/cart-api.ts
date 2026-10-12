import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { connectToDatabase } from '@/config/db'
import Cart, { ICart } from '@/lib/models/cart.model'
import Product from '@/lib/models/product.model'
import { calcDeliveryDateAndPrice } from '@/lib/actions/order.actions'
import { generateId, round2 } from '@/lib/utils'
import { CartItem, ShippingAddress } from '@/types'

export const CART_GUEST_COOKIE = 'cart_guest_id'

export class CartApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

interface LeanVariant {
  _id?: { toString(): string }
  price: number
  listPrice: number
  images?: string[]
  size?: string[]
  countInStock: number
}

interface LeanProduct {
  _id: { toString(): string }
  status: string
  name: string
  slug: string
  categoryName: string
  variants: LeanVariant[]
}

export interface CartOwner {
  userId?: string
  guestId?: string
}

export async function getCartOwner(): Promise<CartOwner> {
  const session = await auth()
  const cookieStore = await cookies()
  return {
    userId: session?.user?.id,
    guestId: cookieStore.get(CART_GUEST_COOKIE)?.value,
  }
}

export async function findCartForOwner({ userId, guestId }: CartOwner) {
  await connectToDatabase()
  if (userId) return Cart.findOne({ userId })
  if (guestId) return Cart.findOne({ guestId })
  return null
}

export const cartToPlain = (cart: ICart | null | undefined): CartItem[] =>
  cart && Array.isArray(cart.items)
    ? (JSON.parse(JSON.stringify(cart.items)) as CartItem[])
    : []

export const cartItemKey = (item: CartItem) =>
  `${item.product}|${item.variantId ?? ''}|${item.size ?? ''}`

export function mergeCartItems(
  userItems: CartItem[],
  guestItems: CartItem[]
): CartItem[] {
  const merged = [...userItems]
  for (const guest of guestItems) {
    const idx = merged.findIndex((u) => cartItemKey(u) === cartItemKey(guest))
    if (idx >= 0) {
      merged[idx] = {
        ...merged[idx],
        quantity: Math.min(
          merged[idx].countInStock,
          merged[idx].quantity + guest.quantity
        ),
      }
    } else {
      merged.push(guest)
    }
  }
  return merged
}

export async function buildCartItem({
  productId,
  variantId,
  size,
  quantity,
}: {
  productId: string
  variantId?: string
  size?: string
  quantity?: number
}): Promise<CartItem> {
  await connectToDatabase()
  const qty = Math.max(1, Math.floor(quantity ?? 1))
  const product = (await Product.findById(productId).lean()) as unknown as
    | LeanProduct
    | null

  if (!product || product.status !== 'public') {
    throw new CartApiError(404, 'Product not found')
  }

  const variants = product.variants ?? []
  let variant =
    variantId !== undefined && variantId !== ''
      ? variants.find((v) => v._id?.toString() === variantId)
      : undefined
  if (!variant && size && size !== '') {
    const lower = size.toLowerCase()
    variant = variants.find((v) =>
      (v.size ?? []).some((s) => s.toLowerCase() === lower)
    )
  }
  if (!variant) variant = variants[0]
  if (!variant) throw new CartApiError(404, 'Product not found')

  if (qty > variant.countInStock) {
    throw new CartApiError(400, 'Not enough items in stock')
  }

  return {
    clientId: generateId(),
    product: product._id.toString(),
    variantId: variant._id?.toString(),
    ...(size && size !== '' ? { size } : {}),
    countInStock: variant.countInStock,
    name: product.name,
    slug: product.slug,
    category: product.categoryName,
    price: round2(variant.price),
    quantity: qty,
    image: variant.images?.[0] ?? '',
  }
}

export async function toServerCart(
  items: CartItem[],
  opts?: { shippingAddress?: ShippingAddress }
) {
  const pricing = await calcDeliveryDateAndPrice({
    items,
    shippingAddress: opts?.shippingAddress,
  })
  return { items, ...pricing }
}