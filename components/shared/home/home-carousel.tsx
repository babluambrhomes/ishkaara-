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
import { ICarousel } from '@/types'
import { IProduct } from '@/lib/db/models/product.model'
import ProductPrice from '@/components/shared/product/product-price'

export function HomeCarousel({
  products,
  banners,
}: {
  products: IProduct[]
  banners: ICarousel[]
}) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )
  const showProducts = products.length > 0

  return (
    <Carousel
      dir='ltr'
      plugins={[plugin.current]}
      className='w-full mx-auto overflow-hidden rounded-2xl bg-white shadow-soft'
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {showProducts
          ? products.map((product) => {
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
                          src={product.images[0]}
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
            })
          : banners.map((item) => (
              <CarouselItem key={item.title}>
                <Link href={item.url}>
                  <div className='flex aspect-[16/6] items-center justify-center p-6 relative -m-1'>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className='object-cover'
                      priority
                    />
                    <div className='absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent' />
                    <div className='absolute w-1/3 left-16 md:left-32 top-1/2 transform -translate-y-1/2'>
                      <h2 className='text-xl md:text-6xl font-bold mb-4 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] tracking-tight'>
                        {item.title}
                      </h2>
                      <Button className='hidden md:block rounded-full px-8 shadow-lift'>
                        {item.buttonCaption}
                      </Button>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
      </CarouselContent>
      <CarouselPrevious className='left-3 md:left-8' />
      <CarouselNext className='right-3 md:right-8' />
    </Carousel>
  )
}
