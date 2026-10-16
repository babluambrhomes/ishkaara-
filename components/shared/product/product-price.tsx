'use client'
import { cn, formatCurrency } from '@/lib/utils'

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const CURRENCY_SYMBOL = '₹'

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  isDeal = false,
  forListing = true,
  plain = false,
  centered,
}: {
  price: number
  isDeal?: boolean
  listPrice?: number
  className?: string
  forListing?: boolean
  plain?: boolean
  centered?: boolean
}) => {
  const center = centered ?? forListing
  const roundedPrice = Math.round(price)
  const roundedList = Math.round(listPrice)
  const discountPercent =
    roundedList > 0
      ? Math.round(100 - (roundedPrice / roundedList) * 100)
      : 0
  const intValue = roundedPrice.toLocaleString('en-IN')

  return plain ? (
    formatCurrency(roundedPrice)
  ) : roundedList == 0 ? (
    <div className={cn('text-2xl sm:text-3xl font-semibold tracking-tight', className)}>
      <span className='text-xs align-super'>{CURRENCY_SYMBOL}</span>
      {intValue}
    </div>
  ) : isDeal ? (
    <div className='space-y-2'>
      <div
        className={`flex ${center ? 'justify-center' : ''} items-center gap-2`}
      >
        <span className='rounded-full bg-gradient-to-r from-[#344c35] to-[#243526] px-1 sm:px-3 py-1 text-white text-[10px] sm:text-xs font-normal sm:font-bold '>
          {discountPercent}% Off
        </span>
        <span className='text-gold text-xs font-semibold tracking-tight'>
          Limited time deal
        </span>
      </div>
      <div
        className={`flex ${center ? 'justify-center' : ''} items-center gap-2`}
      >
        <div className={cn('text-2xl sm:text-3xl font-semibold tracking-tight', className)}>
          <span className='text-xs align-super'>{CURRENCY_SYMBOL}</span>
          {intValue}
        </div>
        <div className='text-muted-foreground text-xs py-2'>
          Was:{' '}
          <span className='line-through'>
            {CURRENCY_FORMATTER.format(roundedList)}
          </span>
        </div>
      </div>
    </div>
  ) : (
    <div className=''>
      <div className={`flex gap-3 ${center ? 'justify-center' : ''}`}>
        <div className='shrink-0 self-center whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1 text-sm font-bold leading-none text-primary'>
          {discountPercent}%
        </div>
        <div className={cn('text-2xl sm:text-3xl font-semibold tracking-tight', className)}>
          <span className='text-xs align-super'>{CURRENCY_SYMBOL}</span>
          {intValue}
        </div>
      </div>
      <div className='text-muted-foreground text-xs py-2'>
        List price:{' '}
        <span className='line-through'>
          {CURRENCY_FORMATTER.format(roundedList)}
        </span>
      </div>
    </div>
  )
}

export default ProductPrice