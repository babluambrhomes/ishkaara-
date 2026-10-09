import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  getBlogPostBySlug,
  getRelatedPosts,
} from '@/lib/actions/blog.actions'
import { formatDateTime, stripHtml, toSlug } from '@/lib/utils'
import { getImageUrl } from '@/lib/image-url'
import TableOfContents from '@/components/shared/blog/table-of-contents'
import { TiptapContent } from '@/components/editor/tiptap-content'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const params = await props.params
  const post = await getBlogPostBySlug(params.slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: stripHtml(post.excerpt),
    openGraph: {
      title: post.title,
      description: stripHtml(post.excerpt),
      type: 'article',
      publishedTime: post.date,
      images: [getImageUrl(post.image)],
    },
  }
}

function addHeadingIds(html: string): string {
  return html.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level, attrs, inner) => {
      const text = String(inner).replace(/<[^>]*>/g, '').trim()
      if (!text) return match
      let newAttrs = String(attrs)
      if (!/\bid=["']/.test(newAttrs)) {
        newAttrs += ` id="${toSlug(text)}"`
      }
      if (!/class=/.test(newAttrs)) {
        newAttrs += ' class="scroll-mt-24"'
      }
      return `<h${level}${newAttrs}>${inner}</h${level}>`
    }
  )
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const post = await getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts({
    category: post.category,
    postId: post._id,
  })

  return (
    <div>
      {/* Back link */}
      <div className='px-3 pt-6 '>
        <Link
          href='/blog'
          className='highlight-link text-sm font-semibold'
        >
          &larr; Back to Blog
        </Link>
      </div>

      <div className='mx-auto grid  gap-8 px-3 py-8  lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start '>
        <article className='min-w-0'>
          {/* Article header */}
          <div className='mb-4 flex flex-wrap items-center gap-2 text-xs'>
            <Badge
              variant='outline'
              className='rounded-full border-gold/40 px-3 py-1 text-gold'
            >
              {post.categoryName}
            </Badge>
            <span className='text-muted-foreground'>
              {formatDateTime(new Date(post.date)).dateOnly}
            </span>
            {post.author && (
              <span className='text-muted-foreground'>· {post.author}</span>
            )}
          </div>
          <h1 className='premium-title text-3xl font-bold leading-tight tracking-tight lg:text-4xl'>
            {post.title}
          </h1>
          <p className='mt-4 text-lg text-muted-foreground'>
            {stripHtml(post.excerpt)}
          </p>

          {/* Mobile TOC */}
          <details className='mt-6 rounded-2xl border border-border/60 bg-background shadow-soft lg:hidden'>
            <summary className='cursor-pointer px-4 py-3 text-sm font-bold text-primary'>
              Table of Contents
            </summary>
            <div className='px-3 pb-3'>
              <TableOfContents content={post.content} />
            </div>
          </details>

          {/* Cover image */}
          <div className='relative mt-8 aspect-[21/9] w-full overflow-hidden'>
            <Image
              src={getImageUrl(post.image)}
              alt={post.title}
              fill
              priority
              sizes='100vw'
              className='object-cover'
            />
          </div>

          {/* Article body */}
          <div className='mt-8'>
            <section className='web-page-content text-lg leading-relaxed'>
              <TiptapContent html={addHeadingIds(post.content)} />
            </section>
          </div>
        </article>

        {/* Sticky table of contents (desktop) */}
        <aside className='hidden lg:block'>
          <div className='sticky top-24'>
            <TableOfContents content={post.content} />
          </div>
        </aside>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className='border-t border-border/60 px-4 py-10 md:px-8 lg:px-12'>
          <h2 className='premium-title mb-6 text-2xl font-bold tracking-tight'>
            Keep Reading
          </h2>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {relatedPosts.map((related) => (
              <Card
                key={related._id}
                className='group overflow-hidden rounded-2xl border-border/60 shadow-soft transition-all duration-300 hover:shadow-lift'
              >
                <Link href={`/blog/${related.slug}`} className='block'>
                  <div className='relative aspect-[16/10] overflow-hidden'>
                    <Image
                      src={getImageUrl(related.image)}
                      alt={related.title}
                      fill
                      sizes='(max-width: 768px) 100vw, 33vw'
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
                      {related.categoryName}
                    </Badge>
                    <span className='text-muted-foreground'>
                      {formatDateTime(new Date(related.date)).dateOnly}
                    </span>
                  </div>
                  <Link
                    href={`/blog/${related.slug}`}
                    className='text-lg font-bold leading-snug tracking-tight hover:text-primary'
                  >
                    {related.title}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}