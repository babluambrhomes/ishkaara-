'use client'

import * as React from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Link from 'next/link'
import { IProductDisplay } from '@/types'
import { getImageUrl } from '@/lib/image-url'

export function HomeCarousel({ products }: { products: IProductDisplay[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  if (products.length === 0) return null

  return (
    <Carousel
      dir='ltr'
      plugins={[plugin.current]}
      className='w-full mx-auto overflow-hidden rounded-2xl bg-white shadow-soft'
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {products.map((product) => {
          const banner = getImageUrl(product.siteBanner || product.images?.[0])

          return (
            <CarouselItem key={product._id}>
              <Link href={`/product/${product.slug}`}>
                <div className='relative flex h-[70vh] w-full items-center justify-center bg-gradient-to-r from-primary/[0.07] via-background to-gold/10'>
                  {banner ? (
                    <Image
                      src={banner}
                      alt={product.name}
                      fill
                      sizes='100vw'
                      className='object-cover '
                      priority
                    />
                  ) : null}
                </div>
              </Link>
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className='left-3 md:left-8' />
      <CarouselNext className='right-3 md:right-8' />
    </Carousel>
  )
}
