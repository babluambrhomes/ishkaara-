'use client'

import * as React from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide, type SwiperClass } from 'swiper/react'
import 'swiper/css'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import ImageHover from '../product/image-hover'

type CategoryItem = {
  name: string
  image: string
  href: string
}

export function CategoryStrip({ categories }: { categories: CategoryItem[] }) {
  const swiperRef = React.useRef<SwiperClass | null>(null)

  if (categories.length === 0) return null

  return (
    <section className='w-full bg-white'>
      <h2 className='premium-title text-xl lg:text-2xl mb-6'>
        Categories to explore
      </h2>
      <div className='relative'>
        <Swiper
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            480: { slidesPerView: 3 },
            768: { slidesPerView: 5 },
            1024: { slidesPerView: 7 },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          className='w-full'
        >
          {categories.map((category) => (
            <SwiperSlide key={category.name}>
              <Link
                href={category.href}
                className='group group/item flex flex-col items-center gap-3'
              >
                <div className='relative aspect-square w-full overflow-hidden  border border-border/60 bg-muted'>
                  <ImageHover
                    src={category.image}
                    hoverSrc={category.image}
                    alt={category.name}
                  />
                </div>
                <p className='max-w-full truncate text-center text-sm font-medium transition-colors group-hover/item:text-primary'>
                  {category.name}
                </p>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

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
      </div>
    </section>
  )
}
