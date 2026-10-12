import { NextRequest, NextResponse } from 'next/server'

import Product from '@/lib/models/product.model'
import { connectToDatabase } from '@/config/db'
import { toPublicProducts } from '@/lib/utils/product-transform'

export const GET = async (request: NextRequest) => {
  const listType = request.nextUrl.searchParams.get('type') || 'history'
  const productIdsParam = request.nextUrl.searchParams.get('ids')
  const categoriesParam = request.nextUrl.searchParams.get('categories')

  if (!productIdsParam || !categoriesParam) {
    return NextResponse.json([])
  }

  const productIds = productIdsParam.split(',')
  const categories = categoriesParam.split(',')
  const filter =
    listType === 'history'
      ? {
          _id: { $in: productIds },
        }
      : { categoryName: { $in: categories }, _id: { $nin: productIds } }

  await connectToDatabase()
  const products = await Product.find(filter).lean()
  if (listType === 'history')
    return NextResponse.json(
      toPublicProducts(
        products.sort(
          (a, b) =>
            productIds.indexOf(a._id.toString()) -
            productIds.indexOf(b._id.toString())
        )
      )
    )
  return NextResponse.json(toPublicProducts(products))
}
