import Link from 'next/link'

import { cn, getFilterUrl } from '@/lib/utils'

export default function ProductSortSelector({
  sortOrders,
  sort,
  params,
}: {
  sortOrders: { value: string; name: string }[]
  sort: string
  params: {
    q?: string
    category?: string
    tag?: string
    price?: string
    rating?: string
    sort?: string
    page?: string
  }
}) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <span className='mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
        Sort by
      </span>
      {sortOrders.map((s) => {
        const active = s.value === sort
        return (
          <Link
            key={s.value}
            href={getFilterUrl({ params, sort: s.value })}
            className={cn(
              'inline-flex items-center border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-white text-foreground/80 hover:border-primary/40 hover:text-primary'
            )}
          >
            {s.name}
          </Link>
        )
      })}
    </div>
  )
}
