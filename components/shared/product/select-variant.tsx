import { Button } from '@/components/ui/button'
import { IProduct } from '@/lib/db/models/product.model'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function SelectVariant({
  product,
  size,
  color,
}: {
  product: IProduct
  color: string
  size: string
}) {
  const selectedColor = color || product.colors[0]
  const selectedSize = size || product.sizes[0]

  return (
    <div className='space-y-5'>
      {product.colors.length > 0 && (
        <div className='space-y-2.5'>
          <p className='text-sm font-semibold text-foreground'>
            Color:{' '}
            <span className='font-medium text-muted-foreground'>
              {selectedColor}
            </span>
          </p>
          <div className='flex flex-wrap gap-2'>
            {product.colors.map((x: string) => (
              <Button
                asChild
                key={x}
                variant='outline'
                className={cn(
                  'h-9 rounded-full border-2 px-3.5 text-sm font-medium transition-all shadow-none',
                  selectedColor === x
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                <Link
                  replace
                  scroll={false}
                  href={`?${new URLSearchParams({
                    color: x,
                    size: selectedSize,
                  })}`}
                >
                  <span
                    style={{ backgroundColor: x }}
                    className='h-4 w-4 rounded-full ring-1 ring-black/10'
                  />
                  <span className='capitalize'>{x}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className='space-y-2.5'>
          <p className='text-sm font-semibold text-foreground'>
            Size:{' '}
            <span className='font-medium text-muted-foreground'>
              {selectedSize}
            </span>
          </p>
          <div className='flex flex-wrap gap-2'>
            {product.sizes.map((x: string) => (
              <Button
                asChild
                key={x}
                variant='outline'
                className={cn(
                  'h-9 min-w-11 rounded-full border-2 px-4 text-sm font-semibold transition-all shadow-none',
                  selectedSize === x
                    ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                    : 'border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                <Link
                  replace
                  scroll={false}
                  href={`?${new URLSearchParams({
                    color: selectedColor,
                    size: x,
                  })}`}
                >
                  {x}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}