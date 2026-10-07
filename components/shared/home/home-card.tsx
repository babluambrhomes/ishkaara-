import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

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
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-4'>
      {cards.map((card) => (
        <Card
          key={card.title}
          className='overflow-hidden flex flex-col rounded-2xl border-border/60 shadow-soft card-hover'
        >
          <CardContent className='p-5 flex-1'>
            <h3 className='premium-title text-lg mb-5'>{card.title}</h3>
            <div className='grid grid-cols-2 gap-4'>
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='flex flex-col group/item'
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    className='aspect-square object-scale-down max-w-full h-auto mx-auto transition-transform duration-300 group-hover/item:scale-105'
                    height={120}
                    width={120}
                  />
                  <p className='text-center text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis transition-colors group-hover/item:text-primary'>
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
          {card.link && (
            <CardFooter>
              <Link
                href={card.link.href}
                className='mt-1 inline-flex items-center gap-1 font-semibold text-primary transition-all duration-200 hover:gap-2'
              >
                {card.link.text} <span aria-hidden>&rarr;</span>
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
