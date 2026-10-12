import { IProductDisplay, IProductVariant } from '@/types'

type VariantLike = IProductVariant & { id?: string }

type ProductLike = {
  variants?: VariantLike[]
  price?: number
  listPrice?: number
  images?: string[]
  countInStock?: number
  [key: string]: unknown
}

// Legacy products may still store `size` as a single string; normalize it to an
// array so every consumer can rely on `string[]`.
const toSizeArray = (size: string[] | string | undefined): string[] | undefined =>
  Array.isArray(size)
    ? size
    : typeof size === 'string' && size.length > 0
      ? [size]
      : undefined

/**
 * Resolves the variant to display. When `variantId` is provided (and matches a
 * variant) that one is used, otherwise the first (index 0) variant is returned.
 */
export const getVariant = (
  product: ProductLike | null | undefined,
  variantId?: string | null
): VariantLike | null => {
  const variants = product?.variants ?? []
  if (variantId) {
    const found = variants.find(
      (v) => (v._id?.toString() ?? v.id) === variantId
    )
    if (found) return found
  }
  return variants[0] ?? null
}

export const getPrimaryVariant = (product: ProductLike | null | undefined) =>
  getVariant(product)

/**
 * Flattens the selected (or first) variant onto the product document so the
 * storefront can read `price`, `listPrice`, `images`, `countInStock` and
 * `size` directly, while keeping the full `variants` array.
 */
export const toPublicProduct = (
  product: ProductLike | null | undefined,
  variantId?: string | null
): IProductDisplay => {
  const plain = JSON.parse(JSON.stringify(product)) as ProductLike
  const variant = getVariant(plain, variantId)
  return {
    ...plain,
    price: variant?.price ?? plain.price ?? 0,
    listPrice: variant?.listPrice ?? plain.listPrice ?? 0,
    images: variant?.images ?? plain.images ?? [],
    countInStock: variant?.countInStock ?? plain.countInStock ?? 0,
    size: toSizeArray(variant?.size),
    variantId: variant?._id?.toString() ?? variant?.id,
    primaryVariant: variant ?? undefined,
    variants: plain.variants ?? [],
  } as IProductDisplay
}

export const toPublicProducts = (
  products: ProductLike[] | null | undefined
): IProductDisplay[] => (products ?? []).map((product) => toPublicProduct(product))
