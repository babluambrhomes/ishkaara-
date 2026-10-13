import {
  Ban,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Truck,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  success: {
    label: 'Confirmed',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: CheckCircle2,
  },
  shipped: {
    label: 'Shipped',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    icon: Truck,
  },
  out_for_delivery: {
    label: 'Out for delivery',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: PackageCheck,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-red-200 bg-red-50 text-red-700',
    icon: Ban,
  },
  returned: {
    label: 'Returned',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: RotateCcw,
  },
}

export default function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus
  className?: string
}) {
  const meta = ORDER_STATUS_META[status] ?? ORDER_STATUS_META.success
  const Icon = meta.icon

  return (
    <Badge
      variant='outline'
      className={cn(
        'gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        meta.className,
        className
      )}
    >
      <Icon className='h-3.5 w-3.5' />
      {meta.label}
    </Badge>
  )
}
