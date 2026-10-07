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
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ICarousel } from '@/types'

export function HomeCarousel({ items }: { items: ICarousel[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <Carousel
      dir='ltr'
      plugins={[plugin.current]}
      className='w-full mx-auto overflow-hidden rounded-2xl bg-white shadow-soft'
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {items.map((item) => (
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
                  <h2
                    className={cn(
                      'text-xl md:text-6xl font-bold mb-4 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] tracking-tight'
                    )}
                  >
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
