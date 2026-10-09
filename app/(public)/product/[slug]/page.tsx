import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import AddToCart from '@/components/shared/product/add-to-cart'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronRight,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react'
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from '@/lib/actions/product.actions'

import ReviewList from './review-list'
import { generateId, round2 } from '@/lib/utils'
import SelectVariant from '@/components/shared/product/select-variant'
import ProductPrice from '@/components/shared/product/product-price'
import ProductGallery from '@/components/shared/product/product-gallery'
import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import RatingSummary from '@/components/shared/product/rating-summary'
import ProductSlider from '@/components/shared/product/product-slider'
import AddToWishlist from '@/components/shared/add-to-wishlist'
import { Separator } from '@/components/ui/separator'
import { TiptapContent } from '@/components/editor/tiptap-content'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const product = await getProductBySlug(params.slug)
  if (!product) {
    return { title: 'Product not found' }
  }
  return {
    title: product.name,
    description: product.description.replace(/<[^>]*>/g, '').trim(),
  }
}

export default async function ProductDetails(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page: string; color: string; size: string }>
}) {
  const searchParams = await props.searchParams

  const { page, color, size } = searchParams

  const params = await props.params

  const { slug } = params

  const session = await auth()

  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product._id,
    page: Number(page || '1'),
  })

  const inStock = product.countInStock > 0
  const isDeal = product.tags.includes('todays-deal')
  const lowStock = inStock && product.countInStock <= 3

  const stockStatus = !inStock
    ? {
      dot: 'bg-destructive',
      text: 'Out of Stock',
      cls: 'text-destructive',
    }
    : lowStock
      ? {
        dot: 'bg-amber-500',
        text: `Only ${product.countInStock} left in stock`,
        cls: 'text-amber-600',
      }
      : { dot: 'bg-emerald-500', text: 'In Stock', cls: 'text-emerald-600' }

  const trustItems = [
    { icon: Truck, title: 'Free Shipping', sub: 'On orders over ₹499' },
    { icon: ShieldCheck, title: 'Secure Payments', sub: '100% protected' },
    { icon: PackageCheck, title: 'Quality Checked', sub: 'Handcrafted with care' },
    { icon: RotateCcw, title: 'Easy Returns', sub: '7-day return window' },
  ]

  return (
    <div className='mx-auto  px-4 pb-16 pt-8 '>
      <AddToBrowsingHistory id={product._id} category={product.categoryName} />

      <nav className='mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground'>
        <Link href='/' className='transition-colors hover:text-primary'>
          Home
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <Link
          href={`/search?category=${product.categoryName}`}
          className='transition-colors hover:text-primary'
        >
          {product.categoryName}
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <span className='max-w-[220px] truncate font-medium text-foreground'>
          {product.name}
        </span>
      </nav>

      <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12'>
        <div className='lg:sticky lg:top-24'>
          <AddToWishlist
            className='absolute right-4 top-4 z-10 rounded-full bg-background p-2 text-muted-foreground transition-colors hover:text-primary'
            item={{
              _id: product._id,
              name: product.name,
              slug: product.slug,
              price: round2(product.price),
              image: product.images[0],
              category: product.categoryName,
            }}
          />
          <ProductGallery images={product.images} />
        </div>

        <div>
          <Card className='overflow-hidden rounded-3xl border-transparent bg-white shadow-none'>
            <CardContent className='space-y-6 p-6 lg:p-8'>
              {isDeal && (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9a2a04] to-[#f5b942] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white shadow-soft'>
                  <Sparkles className='h-3 w-3' />
                  Today&apos;s Deal
                </span>
              )}
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.18em] text-gold'>
                  {product.brand}
                </p>

                <h1 className='mt-1.5 text-xl font-semibold leading-tight '>
                  {product.name}
                </h1>
                <div className='mt-3'>
                  <RatingSummary
                    avgRating={product.avgRating}
                    numReviews={product.numReviews}
                    asPopover
                    ratingDistribution={product.ratingDistribution}
                  />
                </div>
              </div>

              <Separator />

              <div className='space-y-4'>
                <div className='flex flex-wrap items-end justify-between gap-3'>
                  <ProductPrice
                    price={product.price}
                    listPrice={product.listPrice}
                    isDeal={isDeal}
                    forListing={false}
                  />
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${stockStatus.cls} ${inStock ? 'bg-emerald-500/10' : 'bg-destructive/10'
                      }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${stockStatus.dot} ${inStock ? 'animate-pulse' : ''
                        }`}
                    />
                    {stockStatus.text}
                  </span>
                </div>

                <SelectVariant
                  product={product}
                  size={size || product.sizes[0]}
                  color={color || product.colors[0]}
                />
              </div>

              {lowStock && (
                <div className='rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700'>
                  Hurry! Only {product.countInStock} left in stock — order soon.
                </div>
              )}

              <div className='flex flex-col gap-3'>
                {inStock && (
                  <div className='rounded-3xl border border-gold/30 bg-gradient-to-br from-[#fff5dd] via-background to-[#ffe9bd] max-w-md p-4 sm:p-5'>
                    <AddToCart
                      item={{
                        clientId: generateId(),
                        product: product._id,
                        countInStock: product.countInStock,
                        name: product.name,
                        slug: product.slug,
                        category: product.categoryName,
                        price: round2(product.price),
                        quantity: 1,
                        image: product.images[0],
                        size: size || product.sizes[0],
                        color: color || product.colors[0],
                      }}
                    />
                  </div>
                )}
                <div>

                </div>
              </div>


              <div className='space-y-2 '>
                <div className='flex items-center gap-3'>
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold'>
                    <PackageCheck className='h-4 w-4' />
                  </span>
                  <div>
                    <h3 className='font-bold tracking-tight'>Product Details</h3>
                    <p className='text-xs text-muted-foreground'>
                      Everything you need to know
                    </p>
                  </div>
                </div>

                <div className='text-sm leading-6 text-muted-foreground lg:text-[15px] lg:leading-7'>
                  <TiptapContent html={product.description} />
                </div>

              </div>

              <div className='grid grid-cols-2 gap-3'>
                {trustItems.map(({ icon: Icon, title, sub }) => (
                  <div
                    key={title}
                    className='flex items-start gap-3 p-2'
                  >
                    <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold'>
                      <Icon className='h-4 w-4' />
                    </span>
                    <div>
                      <p className='text-sm font-semibold leading-tight'>
                        {title}
                      </p>
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>



      <section className='mt-12 scroll-mt-24' id='reviews'>
        <div className='mb-4 flex items-center gap-3'>
          <h2 className='text-xl font-bold tracking-tight lg:text-2xl'>
            Customer Reviews
          </h2>
        </div>
        <ReviewList product={product} userId={session?.user.id} />
      </section>

      <section className='mt-14'>
        <ProductSlider
          products={relatedProducts.data}
          title={`Best Sellers in ${product.categoryName}`}
        />
      </section>

      <section className='mt-10'>
        <BrowsingHistoryList className='mt-10' />
      </section>
    </div>
  )
}