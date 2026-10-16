'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide, type SwiperClass } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { getImageUrl } from '@/lib/image-url'
import { cn } from '@/lib/utils'

export type HeroBannerItem = {
  _id: string
  productSlug: string
  bannerUrl: string
}

export function HomeCarousel({ banners }: { banners: HeroBannerItem[] }) {
  const swiperRef = React.useRef<SwiperClass | null>(null)
  const [current, setCurrent] = React.useState(0)

  if (banners.length === 0) return null

  return (
    <div className='relative w-full mx-auto overflow-hidden rounded-2xl bg-white'>
      <Swiper
        modules={[Autoplay]}
        loop={banners.length > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={(swiper) => setCurrent(swiper.realIndex)}
        className='w-full'
      >
        {banners.map((banner) => {
          const image = getImageUrl(banner.bannerUrl)

          return (
            <SwiperSlide key={banner._id}>
              <Link href={`/product/${banner.productSlug}`}>
                <div className='relative flex h-[70vh] w-full items-center justify-center bg-gradient-to-r from-primary/[0.07] via-background to-gold/10'>
                  {image ? (
                    <Image
                      src={image}
                      alt={banner.productSlug}
                      fill
                      sizes='100vw'
                      className='object-cover '
                      priority
                    />
                  ) : null}
                </div>
              </Link>
            </SwiperSlide>
          )
        })}
      </Swiper>

      <div className='absolute bottom-4 right-3 z-10 flex items-center gap-2 md:right-6'>
        <button
          type='button'
          aria-label='Previous slide'
          onClick={() => swiperRef.current?.slidePrev()}
          className='flex h-10 w-10 items-center justify-center rounded-circle bg-white/70 text-foreground backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
        </button>
        <button
          type='button'
          aria-label='Next slide'
          onClick={() => swiperRef.current?.slideNext()}
          className='flex h-10 w-10 items-center justify-center rounded-circle bg-white/70 text-foreground backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground'
        >
          <ArrowRight className='h-4 w-4' />
        </button>
      </div>

      {banners.length > 1 && (
        <div className='absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2'>
          {banners.map((banner, index) => (
            <button
              key={banner._id}
              type='button'
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => swiperRef.current?.slideToLoop(index)}
              className={cn(
                'h-2 rounded-circle transition-all duration-300',
                index === current
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-white/70 hover:bg-white'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
