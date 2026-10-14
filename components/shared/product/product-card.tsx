import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useCartStore from '@/hooks/use-cart-store'
import { WishlistItem } from '@/hooks/use-wishlist-store'
import { IProductDisplay } from '@/types'
import { CartItem } from '@/types'
import { generateId, round2 } from '@/lib/utils'
import { getImageUrl } from '@/lib/image-url'

import AddToCart from './add-to-cart'
import AddToWishlist from '../add-to-wishlist'
import ImageHover from './image-hover'
import ProductPrice from './product-price'

function ProductCardImage({
  name,
  slug,
  images,
  countInStock,
  isDeal,
  discountPercent,
  wishlistItem,
}: {
  name: string
  slug: string
  images: string[]
  countInStock: number
  isDeal: boolean
  discountPercent: number
  wishlistItem: WishlistItem
}) {
  return (
    <div className='relative'>
      <Link href={`/product/${slug}`} className='block'>
        <div className='relative h-36 overflow-hidden rounded-xl bg-gradient-to-br from-grey-500/10 via-background to-primary/[0.05]'>
          <ImageHover
            src={images[0]}
            hoverSrc={images[1] ?? images[0]}
            alt={name}
          />
        </div>
      </Link>

      {/* Offer badge */}
      <div className='absolute left-2 top-2 z-10'>
        {isDeal ? (
          <span className='rounded-full bg-gradient-to-r from-[#930202] to-[#560101] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft'>
            Limited Deal
          </span>
        ) : discountPercent > 0 ? (
          <span className='rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3d1a00] shadow-soft'>
            {discountPercent}% Off
          </span>
        ) : null}
      </div>

      {/* Out of stock overlay */}
      {countInStock === 0 && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]'>
          <span className='rounded-full bg-destructive px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lift'>
            Out of Stock
          </span>
        </div>
      )}

      {/* Wishlist */}
      <div className='absolute right-2 top-2 z-20'>
        <AddToWishlist variant='overlay' item={wishlistItem} />
      </div>
    </div>
  )
}

function ProductCardDetails({
  brand,
  name,
  slug,
  price,
  listPrice,
  isDeal,
  centered = true,
}: {
  brand: string
  name: string
  slug: string
  price: number
  listPrice: number
  isDeal: boolean
  centered?: boolean
}) {
  const align = centered ? 'text-center' : 'text-left'
  return (
    <div className={`flex-1 space-y-1 ${align}`}>
      <p className='text-[11px] font-bold uppercase tracking-[0.16em] text-gold'>
        {brand}
      </p>
      <Link
        href={`/product/${slug}`}
        className='text-sm font-semibold leading-snug transition-colors group-hover:text-primary'
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {name}
      </Link>
      <ProductPrice
        isDeal={isDeal}
        price={price}
        listPrice={listPrice}
        forListing
        centered={centered}
      />
    </div>
  )
}

const isProductData = (
  p: IProductDisplay | WishlistItem
): p is IProductDisplay => 'images' in p

export default function ProductCard({
  product,
  isWishlist = false,
  onRemove,
}: {
  product: IProductDisplay | WishlistItem
  isWishlist?: boolean
  onRemove?: (productId: string) => void
}) {
  const images = isProductData(product) ? product.images : [product.image]
  const brand = isProductData(product) ? product.brand : product.category
  const category = isProductData(product)
    ? product.categoryName
    : product.category
  const countInStock = isProductData(product) ? product.countInStock : 10
  const isDeal = isProductData(product)
    ? product.tags.includes('todays-deal')
    : false
  const discountPercent =
    isProductData(product) && product.listPrice > product.price
      ? Math.round(100 - (product.price / product.listPrice) * 100)
      : 0

  const wishlistItem: WishlistItem = {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    price: round2(product.price),
    image: images[0],
    category,
  }

  const orderItem: CartItem = {
    clientId: generateId(),
    product: product._id,
    variantId: isProductData(product) ? product.variantId : undefined,
    size: '',
    countInStock,
    name: product.name,
    slug: product.slug,
    category,
    price: round2(product.price),
    quantity: 1,
    image: images[0],
  }

  return (
    <Card className='group relative flex flex-col overflow-hidden rounded-2xl border-border/60 bg-background shadow-soft card-hover hover:border-primary/30'>
      <CardHeader className='p-2 pb-0'>
        <ProductCardImage
          name={product.name}
          slug={product.slug}
          images={images}
          countInStock={countInStock}
          isDeal={isDeal}
          discountPercent={discountPercent}
          wishlistItem={wishlistItem}
        />
      </CardHeader>
      <CardContent className='flex-1 px-3 pb-2 pt-2'>
        <ProductCardDetails
          brand={brand}
          name={product.name}
          slug={product.slug}
          price={product.price}
          listPrice={isProductData(product) ? product.listPrice : 0}
          isDeal={isDeal}
          centered={false}
        />
      </CardContent>
      <CardFooter className='px-3 pb-3 pt-0'>
        <div className='flex w-full items-center gap-2'>
          <div className='flex-1'>
            <AddToCart
              compact
              item={orderItem}
              sizes={isProductData(product) ? product.size ?? [] : []}
            />
          </div>
          {isWishlist && onRemove && (
            <Button
              variant='ghost'
              size='icon'
              aria-label='Remove from wishlist'
              onClick={() => onRemove(product._id)}
              className='shrink-0 rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export function ProductCardSlider({
  product,
  hideDetails = false,
}: {
  product: IProductDisplay
  hideDetails?: boolean
}) {
  const isDeal = product.tags.includes('todays-deal')
  const discountPercent =
    product.listPrice > product.price
      ? Math.round(100 - (product.price / product.listPrice) * 100)
      : 0
  const wishlistItem: WishlistItem = {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    price: round2(product.price),
    image: product.images[0],
    category: product.categoryName,
  }

  return (
    <div className='group flex flex-col bg-white overflow-hidden rounded-2xl'>
      <ProductCardImage
        name={product.name}
        slug={product.slug}
        images={product.images}
        countInStock={product.countInStock}
        isDeal={isDeal}
        discountPercent={discountPercent}
        wishlistItem={wishlistItem}
      />
      {!hideDetails && (
        <div className='flex-1 p-3'>
          <ProductCardDetails
            brand={product.brand}
            name={product.name}
            slug={product.slug}
            price={product.price}
            listPrice={product.listPrice}
            isDeal={isDeal}
            centered={false}
          />
        </div>
      )}
    </div>
  )
}

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateItem, removeItem } = useCartStore()

  return (
    <div className='group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-4 shadow-soft transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:gap-6'>
      <Link
        href={`/product/${item.slug}`}
        className='shrink-0 self-center sm:self-auto'
      >
        <div className='relative h-28 w-28 overflow-hidden rounded-xl bg-gradient-to-br from-grey-500/10 via-background to-primary/[0.05]'>
          <Image
            src={getImageUrl(item.image)}
            alt={item.name}
            fill
            sizes='112px'
            className='object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105'
          />
        </div>
      </Link>

      <div className='flex-1 space-y-2.5'>
        <Link
          href={`/product/${item.slug}`}
          className='text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary'
        >
          {item.name}
        </Link>

        {item.size && (
          <span className='inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
            Size: {item.size}
          </span>
        )}

        <div className='flex flex-wrap items-center gap-2 pt-1'>
          <div className='inline-flex items-center rounded-full border border-border bg-background'>
            <button
              type='button'
              aria-label='Decrease quantity'
              disabled={item.quantity <= 1}
              onClick={() =>
                updateItem(item, Math.max(1, item.quantity - 1))
              }
              className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary disabled:opacity-40'
            >
              <Minus className='h-4 w-4' />
            </button>
            <span className='w-8 text-center text-sm font-semibold text-foreground'>
              {item.quantity}
            </span>
            <button
              type='button'
              aria-label='Increase quantity'
              disabled={item.quantity >= item.countInStock}
              onClick={() =>
                updateItem(item, Math.min(item.countInStock, item.quantity + 1))
              }
              className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary disabled:opacity-40'
            >
              <Plus className='h-4 w-4' />
            </button>
          </div>

          <button
            type='button'
            onClick={() => removeItem(item)}
            className='inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive'
          >
            <Trash2 className='h-3.5 w-3.5' />
            Remove
          </button>
        </div>
      </div>

      <div className='shrink-0 text-right sm:w-24'>
        <p className='text-lg font-bold text-foreground'>
          <ProductPrice price={item.price * item.quantity} plain />
        </p>
        {item.quantity > 1 && (
          <p className='whitespace-nowrap text-xs text-muted-foreground'>
            {item.quantity} x <ProductPrice price={item.price} plain />
          </p>
        )}
      </div>
    </div>
  )
}
