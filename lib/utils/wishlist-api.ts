import { connectToDatabase } from '@/config/db'
import Wishlist from '@/lib/models/wishlist.model'
import Product from '@/lib/models/product.model'
import { toPublicProducts } from './product-transform'
import { IProductDisplay } from '@/types'

export async function getWishlistProducts(
  userId: string
): Promise<IProductDisplay[]> {
  await connectToDatabase()
  const wishlist = await Wishlist.findOne({ userId })
  const ids = (wishlist?.products ?? []).map((p) => p.toString())
  if (ids.length === 0) return []
  const products = await Product.find({ _id: { $in: ids }, status: 'public' }).lean()
  const map = new Map(products.map((p) => [p._id.toString(), p]))
  const ordered = ids
    .map((id) => map.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  return toPublicProducts(ordered)
}