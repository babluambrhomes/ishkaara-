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
import { Button } from '@/components/ui/button'
import { IProduct } from '@/lib/models/product.model'
import { getImageUrl } from '@/lib/image-url'
import ProductPrice from '@/components/shared/product/product-price'

export function HomeCarousel({ products }: { products: IProduct[] }) {
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
          const isDeal = product.tags.includes('todays-deal')
          return (
            <CarouselItem key={product._id}>
              <Link href={`/product/${product.slug}`}>
                <div className='relative flex aspect-[16/6] items-center bg-gradient-to-r from-primary/[0.07] via-background to-gold/10'>
                  <div className='relative z-10 ml-6 w-1/2 space-y-1.5 md:ml-20 md:space-y-3'>
                    <p className='text-[10px] font-bold uppercase tracking-[0.16em] text-gold md:text-xs'>
                      {product.brand}
                    </p>
                    <h2 className='line-clamp-2 text-sm font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl'>
                      {product.name}
                    </h2>
                    <ProductPrice
                      price={product.price}
                      listPrice={product.listPrice}
                      isDeal={isDeal}
                      className='text-lg md:text-4xl'
                    />
                    <Button className='hidden rounded-full px-8 shadow-lift md:inline-flex'>
                      Shop Now
                    </Button>
                  </div>
                  <div className='absolute right-0 top-0 h-full w-1/2'>
                    <Image
                      src={getImageUrl(product.siteBanner)}
                      alt={product.name}
                      fill
                      sizes='50vw'
                      className='object-contain p-4'
                      priority
                    />
                  </div>
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
