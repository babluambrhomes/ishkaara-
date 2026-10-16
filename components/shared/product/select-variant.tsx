import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getImageUrl } from '@/lib/image-url'
import { IProductDisplay } from '@/types'

export default function SelectVariant({
  product,
  variantId,
}: {
  product: IProductDisplay
  variantId?: string
}) {
  const variants = product.variants ?? []
  if (variants.length <= 1) return null

  const selectedId = variantId || variants[0]._id

  return (
    <div className='space-y-2.5'>
      <p className='text-sm font-semibold text-foreground'>Options</p>
      <div className='flex flex-wrap gap-2.5'>
        {variants.map((variant, index) => {
          const id = variant._id ?? String(index)
          const active = id === selectedId
          return (
            <Link
              replace
              scroll={false}
              key={id}
              href={`?variantId=${id}`}
              aria-label='Select this option'
              className={cn(
                'inline-flex rounded-2xl border-2 p-1.5 transition-all ',
                active
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-white hover:border-primary/40'
              )}
            >
              <span className='relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-grey-500/10'>
                {variant.images[0] ? (
                  <Image
                    src={getImageUrl(variant.images[0])}
                    alt='Variant option'
                    fill
                    sizes='48px'
                    className='object-cover'
                  />
                ) : null}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}