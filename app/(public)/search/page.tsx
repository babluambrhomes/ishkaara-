import Link from 'next/link'
import React from 'react'

import { cn, getFilterUrl } from '@/lib/utils'
import {
  SEARCH_RATING_OPTIONS,
  SEARCH_SORT_ORDERS,
} from '@/lib/search-filters'

import Pagination from '@/components/shared/pagination'
import ProductCard from '@/components/shared/product/product-card'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import Rating from '@/components/shared/product/rating'
import CollapsibleOnMobile from '@/components/shared/collapsible-on-mobile'
import SearchBox from '@/components/shared/search/search-box'
import PriceRangeFilter from '@/components/shared/search/price-range-filter'
import TagFilter from '@/components/shared/search/tag-filter'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  getAllBrands,
  getAllCategories,
  getAllProducts,
  getAllSizes,
  getAllTags,
  getPriceBounds,
} from '@/lib/actions/product.actions'
import { IProductDisplay } from '@/types'
import {
  PackageSearch,
  RotateCcw,
} from 'lucide-react'

type SearchParamsShape = {
  q: string
  category: string
  tag: string
  brand: string
  price: string
  rating: string
  size: string
  sort: string
  page: string
}

export async function generateMetadata(props: {
  searchParams: Promise<SearchParamsShape>
}) {
  const searchParams = await props.searchParams
  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    brand = 'all',
    price = 'all',
    rating = 'all',
  } = searchParams

  if (
    (q !== 'all' && q !== '') ||
    category !== 'all' ||
    tag !== 'all' ||
    brand !== 'all' ||
    rating !== 'all' ||
    price !== 'all'
  ) {
    return {
      title: `Search ${q !== 'all' ? q : ''}
        ${category !== 'all' ? ` : Category ${category}` : ''}
        ${tag !== 'all' ? ` : Tag ${tag}` : ''}
        ${brand !== 'all' ? ` : Brand ${brand}` : ''}
        ${price !== 'all' ? ` : Price ${price}` : ''}
        ${rating !== 'all' ? ` : Rating ${rating}` : ''}`,
    }
  } else {
    return {
      title: 'Search Products',
    }
  }
}

const FilterSection = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div>
    <h3 className='mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground'>
      {title}
    </h3>
    {children}
  </div>
)

const FilterLink = ({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) => (
  <Link
    href={href}
    className={cn(
      'flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors duration-200',
      active
        ? 'bg-primary/10 font-semibold text-primary'
        : 'text-foreground/85 hover:bg-muted hover:text-foreground'
    )}
  >
    {children}
    
  </Link>
)

export default async function SearchPage(props: {
  searchParams: Promise<SearchParamsShape>
}) {
  const searchParams = await props.searchParams

  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    brand = 'all',
    price = 'all',
    rating = 'all',
    size = 'all',
    sort = 'best-selling',
    page = '1',
  } = searchParams

  const params = { q, category, tag, brand, price, rating, size, sort, page }

  const categories = await getAllCategories()
  const tags = await getAllTags({ category })
  const brands = await getAllBrands({ category })
  const sizes = await getAllSizes({ category })
  const priceBounds = await getPriceBounds()
  const data = await getAllProducts({
    category,
    tag,
    brand,
    query: q,
    price,
    rating,
    size,
    page: Number(page),
    sort,
  })

  const hasSearch = q !== 'all' && q !== ''
  const hasActiveFilters =
    hasSearch ||
    (category !== 'all' && category !== '') ||
    (tag !== 'all' && tag !== '') ||
    brand !== 'all' ||
    price !== 'all' ||
    rating !== 'all' ||
    size !== 'all'

  const { totalProducts, totalPages } = data

  return (
    <div>
      {/* Hero / header band */}
      <div className='border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-gold/[0.12]'>
        <div className=' px-3 py-8'>
          <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold'>
            Shop the collection
          </p>
          <h1 className='premium-title text-3xl font-bold tracking-tight lg:text-4xl'>
            {hasSearch ? (
              <>
                Results for &ldquo;{q}&rdquo;
              </>
            ) : (
              'Search Products'
            )}
          </h1>
          <div className='mt-6 flex flex-col items-stretch gap-4 lg:max-w-4xl lg:flex-row lg:items-center'>
            <div className='flex-1'>
              <SearchBox defaultValue={hasSearch ? q : ''} />
            </div>
          </div>
          <div className='mt-4'>
            <ProductSortSelector
              sortOrders={SEARCH_SORT_ORDERS}
              sort={sort}
              params={params}
            />
          </div>
        </div>
      </div>

      <div className=' px-3 py-8'>
        <div className='grid gap-6 lg:grid-cols-[260px_1fr]'>
          {/* Filters sidebar */}
          <CollapsibleOnMobile title='Filters'>
            <Card className='rounded-2xl border-border/60  lg:sticky lg:top-6'>
              <CardContent className='p-5'>
                <div className='mb-4 flex items-center justify-between'>
                  <h2 className='text-sm font-bold uppercase tracking-[0.16em]'>
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                      className='gap-1 text-muted-foreground'
                    >
                      <Link href='/search'>
                        <RotateCcw className='h-3.5 w-3.5' /> Clear all
                      </Link>
                    </Button>
                  )}
                </div>

                <div className='space-y-5'>
                  <FilterSection title='Category'>
                    <ul className='space-y-0.5 flex flex-wrap gap-2'>
                      <li>
                        <FilterLink
                          href={getFilterUrl({ category: 'all', params })}
                          active={category === 'all' || category === ''}
                        >
                          All
                        </FilterLink>
                      </li>
                      {categories.map((c) => (
                        <li key={c._id}>
                          <FilterLink
                            href={getFilterUrl({ category: c.name, params })}
                            active={c.name === category}
                          >
                            {c.name}
                          </FilterLink>
                        </li>
                      ))}
                    </ul>
                  </FilterSection>

                  <Separator />

                  <FilterSection title='Brand'>
                    <ul className='space-y-0.5 flex flex-wrap gap-2'>
                      <li>
                        <FilterLink
                          href={getFilterUrl({ brand: 'all', params })}
                          active={brand === 'all' || brand === ''}
                        >
                          All
                        </FilterLink>
                      </li>
                      {brands.map((b) => (
                        <li key={b}>
                          <FilterLink
                            href={getFilterUrl({ brand: b, params })}
                            active={b === brand}
                          >
                            {b}
                          </FilterLink>
                        </li>
                      ))}
                    </ul>
                  </FilterSection>

                  <Separator />

                  <FilterSection title='Price'>
                    <PriceRangeFilter
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={price}
                      params={params}
                    />
                  </FilterSection>

                  <Separator />

                  <FilterSection title='Customer Review'>
                    <ul className='space-y-0.5'>
                      <li>
                        <FilterLink
                          href={getFilterUrl({ rating: 'all', params })}
                          active={rating === 'all'}
                        >
                          All
                        </FilterLink>
                      </li>
                      {SEARCH_RATING_OPTIONS.map((r) => (
                        <li key={r.value}>
                          <FilterLink
                            href={getFilterUrl({ rating: r.value, params })}
                            active={rating === r.value}
                          >
                            <span className='flex items-center gap-2'>
                              <Rating rating={Number(r.value)} size={4} />
                              {r.label}
                            </span>
                          </FilterLink>
                        </li>
                      ))}
                    </ul>
                  </FilterSection>

                  <Separator />

                  <FilterSection title='Size'>
                    <ul className='space-y-0.5 flex flex-wrap gap-2'>
                      <li>
                        <FilterLink
                          href={getFilterUrl({ size: 'all', params })}
                          active={size === 'all' || size === ''}
                        >
                          All
                        </FilterLink>
                      </li>
                      {sizes.map((s) => (
                        <li key={s}>
                          <FilterLink
                            href={getFilterUrl({ size: s, params })}
                            active={s === size}
                          >
                            {s}
                          </FilterLink>
                        </li>
                      ))}
                    </ul>
                  </FilterSection>

                  <Separator />

                  <FilterSection title='Tag'>
                    <TagFilter tags={tags} params={params} activeTag={tag} />
                  </FilterSection>
                </div>
              </CardContent>
            </Card>
          </CollapsibleOnMobile>

          {/* Results */}
          <div className='space-y-5'>
          

           

            {totalProducts === 0 ? (
              <Card className='rounded-2xl border-border/60 '>
                <CardContent className='flex flex-col items-center justify-center gap-3 px-6 py-16 text-center'>
                  <PackageSearch className='h-12 w-12 text-muted-foreground/50' />
                  <p className='text-lg font-semibold'>No products found</p>
                  <p className='max-w-sm text-sm text-muted-foreground'>
                    Try adjusting or clearing your filters, or search with a
                    different keyword.
                  </p>
                  <Button asChild variant='outline' className='mt-2 rounded-full'>
                    <Link href='/search'>
                      <RotateCcw className='h-4 w-4' /> Clear all filters
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4'>
                  {data.products.map((product: IProductDisplay) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className='flex justify-center pt-2'>
                    <Pagination page={page} totalPages={totalPages} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}