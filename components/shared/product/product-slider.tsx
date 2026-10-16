'use client'

import * as React from 'react'
import { Swiper, SwiperSlide, type SwiperClass } from 'swiper/react'
import 'swiper/css'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { ProductCardSlider } from './product-card'
import { IProductDisplay } from '@/types'

export default function ProductSlider({
  title,
  products,
  hideDetails = false,
}: {
  title?: string
  products: IProductDisplay[]
  hideDetails?: boolean
}) {
  const swiperRef = React.useRef<SwiperClass | null>(null)

  return (
    <div className='w-full bg-white'>
      <h2 className='premium-title text-xl lg:text-2xl mb-6'>{title}</h2>
      <div className='relative'>
        <Swiper
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: hideDetails ? 4 : 3 },
            1024: { slidesPerView: hideDetails ? 6 : 5 },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          className='w-full'
        >
          {products.map((product) => (
            <SwiperSlide key={product.slug}>
              <ProductCardSlider hideDetails={hideDetails} product={product} />
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
    </div>
  )
}
