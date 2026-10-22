'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide, type SwiperClass } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import ImageHover from '../product/image-hover'
import { getImageUrl } from '@/lib/image-url'
import { cn } from '@/lib/utils'
import { type HomeLayoutType } from '@/lib/home-layout-types'

export type HomeLayoutSectionItem = {
  name?: string
  imgurl: string[]
  redirect?: string
  details?: string
}

export type HomeLayoutData = {
  _id?: string
  title?: string
  section: HomeLayoutSectionItem[]
  redirect?: string
  order?: number
  details?: string
  layout?: HomeLayoutType
}

type Shape = 'square' | 'circle' | 'rectangle'

const SHAPE_CLASS: Record<Shape, string> = {
  square:
    'relative aspect-square w-full overflow-hidden border border-border/60 bg-muted',
  circle:
    'relative aspect-square w-full overflow-hidden rounded-circle border border-border/60 bg-muted',
  rectangle:
    'relative aspect-[3/4] w-full overflow-hidden border border-border/60 bg-muted',
}

const SHAPE_SIZES: Record<Shape, string> = {
  square:
    '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw',
  circle: '(max-width: 640px) 30vw, (max-width: 768px) 20vw, (max-width: 1024px) 15vw',
  rectangle:
    '(max-width: 640px) 40vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 15vw',
}

function SectionHeader({ layout }: { layout: HomeLayoutData }) {
  return (
    <div className='mb-6'>
      <div className='flex items-center justify-between gap-4'>
        {layout.title && (
          <h2 className='premium-title text-xl lg:text-2xl'>{layout.title}</h2>
        )}

        {layout.title && layout.redirect && (
          <Link
            className='premium-title shrink-0 text-sm lg:text-base'
            href={layout.redirect}
          >
            See All
          </Link>
        )}
      </div>

      {layout.details && (
        <p className='mt-1 text-sm text-muted-foreground'>{layout.details}</p>
      )}
    </div>
  )
}

function ImageBlock({
  images,
  name,
  imgClassName,
  shape = 'square',
}: {
  images: string[]
  name?: string
  imgClassName?: string
  shape?: Shape
}) {
  return (
    <div className={SHAPE_CLASS[shape]}>
      {images.length > 1 ? (
        <ImageHover
          src={getImageUrl(images[0])}
          hoverSrc={getImageUrl(images[1])}
          alt={name ?? ''}
        />
      ) : images.length === 1 ? (
        <Image
          src={getImageUrl(images[0])}
          alt={name ?? ''}
          fill
          sizes={SHAPE_SIZES[shape]}
          className={imgClassName}
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center bg-muted'>
          <span className='text-xs text-muted-foreground'>
            {name ?? 'No image'}
          </span>
        </div>
      )}
    </div>
  )
}

function wrap(
  item: HomeLayoutSectionItem,
  index: number,
  card: React.ReactNode,
  extraClassName?: string
) {
  return item.redirect ? (
    <Link
      key={item.redirect + index}
      href={item.redirect}
      className={cn('block min-w-0', extraClassName)}
    >
      {card}
    </Link>
  ) : (
    <div key={item.name ?? index} className={cn('min-w-0', extraClassName)}>
      {card}
    </div>
  )
}

// 1) Grid — the original tile grid.
function GridLayout({ sections }: { sections: HomeLayoutSectionItem[] }) {
  return (
    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
      {sections.map((item, index) => {
        const images = item.imgurl ?? []
        const card = (
          <div className='group flex flex-col gap-3'>
            <ImageBlock
              images={images}
              name={item.name}
              imgClassName='object-cover transition-transform duration-500 group-hover:scale-105'
            />
            <div className='text-center'>
              {item.name && (
                <p className='truncate text-sm font-medium transition-colors group-hover:text-primary'>
                  {item.name}
                </p>
              )}
              {item.details && (
                <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                  {item.details}
                </p>
              )}
            </div>
          </div>
        )
        return wrap(item, index, card)
      })}
    </div>
  )
}

// 2) Horizontal — a scrollable row of tall cards.
function HorizontalLayout({ sections }: { sections: HomeLayoutSectionItem[] }) {
  return (
    <div className='-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2'>
      {sections.map((item, index) => {
        const images = item.imgurl ?? []
        const card = (
          <div className='group flex w-40 shrink-0 snap-start flex-col gap-3 sm:w-48'>
            <ImageBlock
              images={images}
              name={item.name}
              imgClassName='object-cover transition-transform duration-500 group-hover:scale-105'
            />
            <div className='text-center'>
              {item.name && (
                <p className='truncate text-sm font-medium transition-colors group-hover:text-primary'>
                  {item.name}
                </p>
              )}
              {item.details && (
                <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                  {item.details}
                </p>
              )}
            </div>
          </div>
        )
        return wrap(item, index, card)
      })}
    </div>
  )
}

// 3) Featured — first item large, remaining items as a compact grid.
function FeaturedLayout({ sections }: { sections: HomeLayoutSectionItem[] }) {
  if (!sections.length) return null
  const [hero, ...rest] = sections

  const heroCard = (
    <div className='group relative h-full w-full overflow-hidden border border-border/60 bg-muted'>
      <div className='relative h-72 w-full sm:h-80 lg:h-[420px]'>
        {hero.imgurl?.length ? (
          <Image
            src={getImageUrl(hero.imgurl[0])}
            alt={hero.name ?? ''}
            fill
            sizes='(max-width: 1024px) 100vw, 50vw'
            className='object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-muted'>
            <span className='text-sm text-muted-foreground'>
              {hero.name ?? 'No image'}
            </span>
          </div>
        )}
        <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5'>
          {hero.name && (
            <p className='text-lg font-semibold text-white'>{hero.name}</p>
          )}
          {hero.details && (
            <p className='mt-1 text-sm text-white/80'>{hero.details}</p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      {hero.redirect ? (
        <Link href={hero.redirect} className='block min-w-0'>
          {heroCard}
        </Link>
      ) : (
        <div className='min-w-0'>{heroCard}</div>
      )}

      <div className='grid grid-cols-2 gap-4'>
        {rest.map((item, index) => {
          const images = item.imgurl ?? []
          const card = (
            <div className='group flex flex-col gap-3'>
              <ImageBlock
                images={images}
                name={item.name}
                imgClassName='object-cover transition-transform duration-500 group-hover:scale-105'
              />
              <div className='text-center'>
                {item.name && (
                  <p className='truncate text-sm font-medium transition-colors group-hover:text-primary'>
                    {item.name}
                  </p>
                )}
                {item.details && (
                  <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                    {item.details}
                  </p>
                )}
              </div>
            </div>
          )
          return wrap(item, index, card)
        })}
      </div>
    </div>
  )
}

// 4) Carousel — Swiper strip of cards. `shape` changes the card geometry and
// `autoPlay` adds the timed rotation plus the dot indicators.
function CarouselLayout({
  sections,
  shape = 'square',
  autoPlay = false,
}: {
  sections: HomeLayoutSectionItem[]
  shape?: Shape
  autoPlay?: boolean
}) {
  const swiperRef = React.useRef<SwiperClass | null>(null)
  const [current, setCurrent] = React.useState(0)

  if (!sections.length) return null

  const slidesPerView = shape === 'circle' ? 2.5 : 1.6

  return (
    <div className='relative'>
      <Swiper
        modules={autoPlay ? [Autoplay] : []}
        spaceBetween={16}
        slidesPerView={slidesPerView}
        breakpoints={{
          480: { slidesPerView: shape === 'circle' ? 3.5 : 2.4 },
          768: { slidesPerView: shape === 'circle' ? 5 : 3.6 },
          1024: { slidesPerView: shape === 'circle' ? 7 : 5.2 },
        }}
        loop={sections.length > 1}
        autoplay={
          autoPlay
            ? {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : undefined
        }
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={(swiper) => setCurrent(swiper.realIndex)}
        className='w-full'
      >
        {sections.map((item, index) => {
          const images = item.imgurl ?? []
          const card = (
            <div className='group flex flex-col gap-3'>
              <ImageBlock
                images={images}
                name={item.name}
                shape={shape}
                imgClassName='object-cover transition-transform duration-500 group-hover:scale-105'
              />
              <div className='text-center'>
                {item.name && (
                  <p className='truncate text-sm font-medium transition-colors group-hover:text-primary'>
                    {item.name}
                  </p>
                )}
                {item.details && (
                  <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                    {item.details}
                  </p>
                )}
              </div>
            </div>
          )
          return (
            <SwiperSlide key={item.redirect ?? item.name ?? index}>
              {item.redirect ? (
                <Link href={item.redirect} className='block min-w-0'>
                  {card}
                </Link>
              ) : (
                <div className='min-w-0'>{card}</div>
              )}
            </SwiperSlide>
          )
        })}
      </Swiper>

      {autoPlay && sections.length > 1 && (
        <div className='absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2'>
          {sections.map((item, index) => (
            <button
              key={item.redirect ?? item.name ?? index}
              type='button'
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => swiperRef.current?.slideToLoop(index)}
              className={cn(
                'h-2 rounded-circle transition-all duration-300',
                index === current
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-border hover:bg-primary/50'
              )}
            />
          ))}
        </div>
      )}

      {sections.length > 1 && (
        <>
          <button
            type='button'
            aria-label='Previous slide'
            onClick={() => swiperRef.current?.slidePrev()}
            className='absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-circle border border-border bg-background text-foreground transition-colors hover:bg-primary hover:text-primary-foreground'
          >
            <ArrowLeft className='h-4 w-4' />
          </button>
          <button
            type='button'
            aria-label='Next slide'
            onClick={() => swiperRef.current?.slideNext()}
            className='absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-circle border border-border bg-background text-foreground transition-colors hover:bg-primary hover:text-primary-foreground'
          >
            <ArrowRight className='h-4 w-4' />
          </button>
        </>
      )}    </div>
  )
}

// 5) Masonry — CSS columns so the cards stagger instead of aligning in rows.
// Card heights cycle through a few aspect ratios, otherwise every image is 1:1
// and the columns only stagger by the length of the caption.
const MASONRY_ASPECT = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]'] as const

function MasonryLayout({ sections }: { sections: HomeLayoutSectionItem[] }) {
  return (
    <div className='columns-2 gap-4 md:columns-3 lg:columns-4'>
      {sections.map((item, index) => {
        const images = item.imgurl ?? []
        const card = (
          <div className='group flex flex-col gap-3'>
            {images.length > 0 ? (
              <div
                className={cn(
                  'relative w-full overflow-hidden bg-muted',
                  MASONRY_ASPECT[index % MASONRY_ASPECT.length]
                )}
              >
                <Image
                  src={getImageUrl(images[0])}
                  alt={item.name ?? ''}
                  fill
                  sizes='(max-width: 768px) 50vw, 25vw'
                  className='object-cover transition-transform duration-500 group-hover:scale-105'
                />
              </div>
            ) : (
              <div className='flex aspect-square w-full items-center justify-center bg-muted'>
                <span className='text-xs text-muted-foreground'>
                  {item.name ?? 'No image'}
                </span>
              </div>
            )}
            {item.name && (
              <p className='truncate text-sm font-medium transition-colors group-hover:text-primary'>
                {item.name}
              </p>
            )}
            {item.details && (
              <p className='truncate text-xs text-muted-foreground'>
                {item.details}
              </p>
            )}
          </div>
        )
        return wrap(item, index, card, 'mb-4 break-inside-avoid')
      })}
    </div>
  )
}

export function HomeLayoutSection({
  layouts,
}: {
  layouts: HomeLayoutData[]
}) {
  if (!layouts?.length) return null

  return (
    <div className='flex flex-col gap-10'>
      {layouts.map((layout, layoutIndex) => {
        const sections = layout.section ?? []
        const layoutType = layout.layout ?? 'grid'

        return (
          <section
            key={layout._id ?? layout.title ?? layoutIndex}
            className='w-full bg-white'
          >
            <SectionHeader layout={layout} />

            {layoutType === 'horizontal' ? (
              <HorizontalLayout sections={sections} />
            ) : layoutType === 'featured' ? (
              <FeaturedLayout sections={sections} />
            ) : layoutType === 'carousel' ? (
              <CarouselLayout sections={sections} shape='square' autoPlay />
            ) : layoutType === 'carousel-square' ? (
              <CarouselLayout sections={sections} shape='square' />
            ) : layoutType === 'carousel-circle' ? (
              <CarouselLayout sections={sections} shape='circle' />
            ) : layoutType === 'carousel-rectangle' ? (
              <CarouselLayout sections={sections} shape='rectangle' />
            ) : layoutType === 'masonry' ? (
              <MasonryLayout sections={sections} />
            ) : (
              <GridLayout sections={sections} />
            )}
          </section>
        )
      })}
    </div>
  )
}
