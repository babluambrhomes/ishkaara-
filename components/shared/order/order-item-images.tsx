import Image from 'next/image'

import { getImageUrl } from '@/lib/image-url'
import { cn } from '@/lib/utils'

type OrderThumbItem = {
  image: string
  name: string
}

export default function OrderItemImages({
  items,
  max = 4,
  className,
}: {
  items: OrderThumbItem[]
  max?: number
  className?: string
}) {
  const shown = items.slice(0, max)
  const remaining = items.length - shown.length

  return (
    <div className={cn('flex items-center -space-x-3', className)}>
      {shown.map((item, index) => (
        <div
          key={index}
          className='relative h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-muted shadow-soft ring-1 ring-border/60'
        >
          <Image
            src={getImageUrl(item.image)}
            alt={item.name}
            fill
            sizes='60px'
            className='object-contain p-1'
          />
        </div>
      ))}
      {remaining > 0 && (
        <div className='relative flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-muted text-xs font-bold text-muted-foreground shadow-soft ring-1 ring-border/60'>
          +{remaining}
        </div>
      )}
    </div>
  )
}
