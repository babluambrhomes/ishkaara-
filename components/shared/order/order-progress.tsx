import {
  Ban,
  Check,
  CheckCircle2,
  Home,
  Package,
  RotateCcw,
  Truck,
} from 'lucide-react'

import { OrderStatus, OrderStatusEntry } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'

const STEPS: {
  key: Exclude<OrderStatus, 'cancelled' | 'returned'>
  label: string
  icon: typeof CheckCircle2
}[] = [
  { key: 'success', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', icon: Package },
  { key: 'out_for_delivery', label: 'Out for delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
]

function stepDate(
  history: OrderStatusEntry[],
  key: OrderStatus
): Date | undefined {
  return [...history].reverse().find((entry) => entry.status === key)?.at
}

export default function OrderProgress({
  status,
  statusHistory = [],
  expectedDeliveryDate,
}: {
  status: OrderStatus
  statusHistory?: OrderStatusEntry[]
  expectedDeliveryDate?: Date
}) {
  const history = [...statusHistory].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  )

  if (status === 'cancelled' || status === 'returned') {
    const isCancelled = status === 'cancelled'
    const date = stepDate(history, status)
    const Icon = isCancelled ? Ban : RotateCcw
    return (
      <div
        className={cn(
          'flex items-start gap-3 rounded-2xl border p-4',
          isCancelled
            ? 'border-red-200 bg-red-50'
            : 'border-amber-200 bg-amber-50'
        )}
      >
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-circle',
            isCancelled
              ? 'bg-red-100 text-red-600'
              : 'bg-amber-100 text-amber-600'
          )}
        >
          <Icon className='h-5 w-5' />
        </span>
        <div>
          <p
            className={cn(
              'font-semibold',
              isCancelled ? 'text-red-700' : 'text-amber-700'
            )}
          >
            {isCancelled ? 'Order Cancelled' : 'Order Returned'}
          </p>
          {date && (
            <p
              className={cn(
                'text-sm',
                isCancelled ? 'text-red-600/80' : 'text-amber-600/80'
              )}
            >
              {formatDateTime(date).dateTime}
            </p>
          )}
        </div>
      </div>
    )
  }

  const currentIndex = STEPS.findIndex((step) => step.key === status)
  const isDelivered = status === 'delivered'

  return (
    <div>
      {/* Horizontal — desktop */}
      <div className='hidden sm:block'>
        <div className='flex items-start'>
          {STEPS.map((step, index) => {
            const completed = index < currentIndex
            const active = index === currentIndex
            const date = stepDate(history, step.key)
            const Icon = step.icon
            return (
              <div
                key={step.key}
                className='relative flex flex-1 flex-col items-center text-center'
              >
                {index < STEPS.length - 1 && (
                  <span
                    className={cn(
                      'absolute left-1/2 top-5 h-0.5 w-full',
                      index < currentIndex ? 'bg-emerald-500' : 'bg-border'
                    )}
                  />
                )}
                <span
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-circle border-2 bg-white transition-colors',
                    completed
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : active
                        ? 'border-emerald-500 text-emerald-600 ring-4 ring-emerald-100'
                        : 'border-border text-muted-foreground'
                  )}
                >
                  {completed ? (
                    <Check className='h-5 w-5' />
                  ) : (
                    <Icon className='h-5 w-5' />
                  )}
                </span>
                <p
                  className={cn(
                    'mt-3 text-sm font-semibold',
                    completed || active
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                {date && (
                  <p className='text-[11px] text-muted-foreground'>
                    {formatDateTime(date).dateOnly}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Vertical — mobile */}
      <div className='flex flex-col sm:hidden'>
        {STEPS.map((step, index) => {
          const completed = index < currentIndex
          const active = index === currentIndex
          const date = stepDate(history, step.key)
          const Icon = step.icon
          return (
            <div
              key={step.key}
              className='relative flex gap-4 pb-6 last:pb-0'
            >
              {index < STEPS.length - 1 && (
                <span
                  className={cn(
                    'absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5',
                    completed ? 'bg-emerald-500' : 'bg-border'
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-circle border-2 bg-white transition-colors',
                  completed
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : active
                      ? 'border-emerald-500 text-emerald-600 ring-4 ring-emerald-100'
                      : 'border-border text-muted-foreground'
                )}
              >
                {completed ? (
                  <Check className='h-5 w-5' />
                ) : (
                  <Icon className='h-5 w-5' />
                )}
              </span>
              <div className='pt-1.5'>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    completed || active
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                {date && (
                  <p className='text-[11px] text-muted-foreground'>
                    {formatDateTime(date).dateOnly}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!isDelivered && expectedDeliveryDate && (
        <p className='mt-5 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground sm:text-left'>
          Expected delivery by{' '}
          <span className='font-semibold text-foreground'>
            {formatDateTime(expectedDeliveryDate).dateOnly}
          </span>
        </p>
      )}
    </div>
  )
}
