import { OrderStatus } from '@/types'

// Allowed status transitions (admin only)
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  success: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'cancelled', 'returned'],
  out_for_delivery: ['delivered', 'cancelled', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  success: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}
