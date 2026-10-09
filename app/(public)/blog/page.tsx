import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Pagination from '@/components/shared/pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  getAllBlogCategories,
  getAllBlogPosts,
} from '@/lib/actions/blog.actions'
import { cn, formatDateTime, stripHtml } from '@/lib/utils'
import { getImageUrl } from '@/lib/image-url'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Read the latest style guides, beauty routines, and shopping tips from the Ishkaara blog.',
}

export default async function BlogPage(props: {
  searchParams: Promise<{
    category?: string
    page?: string
  }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const category = searchParams.category || 'all'

  const [data, categories] = await Promise.all([
    getAllBlogPosts({ category, page }),
    getAllBlogCategories(),
  ])

  const { posts, totalPages, totalPosts, from, to } = data

  return (
    <div>
      {/* Hero / header band */}
      <div className='border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-gold/[0.12]'>
        <div className='px-3 py-8 '>
          <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold'>
            The Ishkaara Journal
          </p>
          <h1 className='premium-title text-3xl font-bold tracking-tight lg:text-4xl'>
            {category !== 'all'
              ? `${category} Stories`
              : 'Style, Beauty & Shopping Guides'}
          </h1>
          <p className='mt-3 max-w-2xl text-muted-foreground'>
            Trend reports, beauty routines, and thoughtful shopping tips —
            curated by the Ishkaara team.
          </p>

          {/* Category chips */}
          <div className='mt-6 flex flex-wrap items-center gap-2'>
            <Link href='/blog'>
              <Badge
                variant={category === 'all' ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer select-none rounded-full px-4 py-1 text-sm',
                  category === 'all' && 'shadow-soft'
                )}
              >
                All
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat} href={`/blog?category=${encodeURIComponent(cat)}`}>
                <Badge
                  variant={category === cat ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer select-none rounded-full px-4 py-1 text-sm',
                    category === cat && 'shadow-soft'
                  )}
                >
                  {cat}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className='px-3 py-8 '>
        {/* Toolbar */}
        <div className='mb-6 flex items-center justify-between gap-3'>
          {totalPosts > 0 ? (
            <p className='text-sm text-muted-foreground'>
              Showing {from}&ndash;{to} of {totalPosts}{' '}
              {totalPosts === 1 ? 'story' : 'stories'}
            </p>
          ) : (
            <p className='text-sm text-muted-foreground'>No stories found</p>
          )}
          {category !== 'all' && (
            <Button asChild variant='ghost' size='sm'>
              <Link href='/blog'>Clear category</Link>
            </Button>
          )}
        </div>

        {/* Posts grid */}
        {posts.length > 0 ? (
          <>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {posts.map((post) => (
                <Card
                  key={post._id}
                  className='group overflow-hidden rounded-2xl border-border/60 shadow-soft transition-all duration-300 hover:shadow-lift'
                >
                  <Link href={`/blog/${post.slug}`} className='block'>
                    <div className='relative aspect-[16/10] overflow-hidden'>
                      <Image
                        src={getImageUrl(post.image)}
                        alt={post.title}
                        fill
                        priority={post === posts[0]}
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                      />
                    </div>
                  </Link>
                  <CardContent className='p-5'>
                    <div className='mb-2 flex items-center gap-2 text-xs'>
                      <Badge
                        variant='outline'
                        className='rounded-full border-gold/40 px-2.5 py-0.5 text-gold'
                      >
                        {post.categoryName}
                      </Badge>
                      <span className='text-muted-foreground'>
                        {formatDateTime(new Date(post.date)).dateOnly}
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className='text-xl font-bold line-clamp-1 leading-snug tracking-tight hover:text-primary'
                    >
                      {post.title}
                    </Link>
                    <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
                      {stripHtml(post.excerpt)}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className='highlight-link mt-4 inline-block text-sm font-semibold'
                    >
                      Read story &rarr;
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='mt-10 flex justify-center'>
              <Pagination page={page} totalPages={totalPages} />
            </div>
          </>
        ) : (
          <div className='rounded-2xl border border-dashed border-border/70 py-20 text-center'>
            <h3 className='text-lg font-semibold'>No stories here yet</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Check back soon or explore another category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}