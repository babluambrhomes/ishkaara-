import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { getImageUrl } from '@/lib/image-url'
import { ChevronRight } from 'lucide-react'

type CardItem = {
  title: string
  link: { text: string; href: string }
  items: {
    name: string
    items?: string[]
    image: string
    href: string
  }[]
}

export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
      {cards.map((card) => (
        <Card
          key={card.title}
          className='group overflow-hidden flex flex-col rounded-xl border-border/40 bg-background  transition-all duration-300  '
        >
          <CardContent className='p-4 lg:p-5 flex-1'>
            <h3 className='mb-4 text-xs font-bold uppercase tracking-[0.28em] text-foreground/70'>
              {card.title}
            </h3>
            <div className='grid grid-cols-2 gap-3 lg:gap-4'>
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='flex flex-col group/item'
                >
                  <div className='relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gradient-to-br from-grey-500/5 via-background to-primary/[0.03]'>
                    <Image
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      fill
                      sizes='(max-width: 768px) 50vw, 25vw'
                      className='object-cover transition-transform duration-500 ease-out group-hover/item:scale-105'
                    />
                  </div>
                  <p className='mt-2 text-center text-xs lg:text-sm font-medium leading-snug line-clamp-1 transition-colors group-hover/item:text-primary'>
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
          {card.link && (
            <CardFooter className='px-4 lg:px-5 pb-4 lg:pb-5 pt-0'>
              <Link
                href={card.link.href}
                className='inline-flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-primary transition-all duration-200 hover:gap-2'
              >
                {card.link.text}
                <ChevronRight className='h-4 w-4' />
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
