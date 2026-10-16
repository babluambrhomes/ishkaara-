'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  CreditCard,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  ShoppingBag,
  TicketPercent,
  User,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { IOrder } from '@/lib/models/order.model'
import { OrderStatus } from '@/types'
import { cn, formatDateTime, formatId } from '@/lib/utils'
import { getImageUrl } from '@/lib/image-url'
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '@/lib/order-status'
import data from '@/config/data'
import ProductPrice from '../product/product-price'
import ActionButton from '../action-button'
import OrderStatusBadge, { ORDER_STATUS_META } from './order-status-badge'
import OrderProgress from './order-progress'
import PayNowButton from './pay-now-button'
import {
  cancelOrder,
  requestReturn,
  updateOrderStatus,
  updateOrderToPaid,
} from '@/lib/actions/order.actions'

const PAYMENT_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  paid: {
    label: 'Paid',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  pending: {
    label: 'Payment pending',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  failed: {
    label: 'Payment failed',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  refunded: {
    label: 'Refunded',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
}

function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  tone = 'default',
  action,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  tone?: 'default' | 'destructive'
  action: (reason: string) => Promise<{ success: boolean; message: string }>
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!reason.trim()) return
    setSaving(true)
    const res = await action(reason.trim())
    setSaving(false)
    toast({
      description: res.message,
      variant: res.success ? 'default' : 'destructive',
    })
    if (res.success) {
      setReason('')
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder='Please tell us why…'
        />
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='rounded-full'
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={submit}
            disabled={!reason.trim() || saving}
            variant={tone === 'destructive' ? 'destructive' : 'default'}
            className='rounded-full font-bold'
          >
            {saving ? 'Submitting…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CustomerOrderActions({
  orderId,
  status,
  hasReturnRequest,
  whatsappLink,
}: {
  orderId: string
  status: OrderStatus
  hasReturnRequest: boolean
  whatsappLink: string
}) {
  const [helpOpen, setHelpOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  const canCancel = status === 'success'
  const canReturn = status === 'delivered' && !hasReturnRequest

  return (
    <div className='space-y-2 border-t border-border/60 pt-4'>
      <Button
        type='button'
        variant='outline'
        onClick={() => setHelpOpen(true)}
        className='h-10 w-full gap-2 rounded-full font-bold'
      >
        <LifeBuoy className='h-4 w-4' />
        Need Help?
      </Button>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Need help with this order?</DialogTitle>
            <DialogDescription>
              Chat with our support team on WhatsApp or pick an option below.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Button
              asChild
              className='h-11 w-full gap-2 rounded-full font-bold'
            >
              <a href={whatsappLink} target='_blank' rel='noreferrer'>
                <MessageCircle className='h-4 w-4' />
                Chat with Support
              </a>
            </Button>
            {canCancel && (
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setHelpOpen(false)
                  setCancelOpen(true)
                }}
                className='h-11 w-full gap-2 rounded-full font-bold text-destructive hover:text-destructive'
              >
                <XCircle className='h-4 w-4' />
                Cancel Order
              </Button>
            )}
            {canReturn && (
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setHelpOpen(false)
                  setReturnOpen(true)
                }}
                className='h-11 w-full gap-2 rounded-full font-bold'
              >
                <RotateCcw className='h-4 w-4' />
                Request Return
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ReasonDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title='Cancel this order?'
        description='This cannot be undone. Please share the reason for cancellation.'
        confirmLabel='Confirm cancellation'
        tone='destructive'
        action={(reason) => cancelOrder({ orderId, reason })}
      />
      <ReasonDialog
        open={returnOpen}
        onOpenChange={setReturnOpen}
        title='Request a return'
        description='Tell us why you want to return this order. Our team will review your request.'
        confirmLabel='Submit request'
        action={(reason) => requestReturn({ orderId, reason })}
      />
    </div>
  )
}

function WorkspaceStatusControl({
  orderId,
  current,
}: {
  orderId: string
  current: OrderStatus
}) {
  const { toast } = useToast()
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const options = ORDER_STATUS_FLOW[current] ?? []
  if (options.length === 0) {
    return (
      <p className='mt-5 rounded-2xl border border-dashed border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground'>
        No further status changes available for this order.
      </p>
    )
  }

  const submit = async () => {
    if (!status) return
    setSaving(true)
    const res = await updateOrderStatus({ orderId, status, note })
    setSaving(false)
    toast({
      description: res.message,
      variant: res.success ? 'default' : 'destructive',
    })
    if (res.success) {
      setStatus('')
      setNote('')
    }
  }

  return (
    <div className='mt-5 space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4'>
      <p className='text-sm font-semibold'>Update status</p>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
        className='h-10 w-full rounded-xl border border-border/70 bg-white px-3 text-sm font-medium outline-none focus:border-primary'
      >
        <option value=''>Select new status…</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder='Add a comment (optional)'
        className='w-full rounded-xl border border-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-primary'
      />
      <Button
        type='button'
        onClick={submit}
        disabled={!status || saving}
        className='h-10 w-full rounded-full font-bold'
      >
        {saving ? 'Updating…' : 'Update status'}
      </Button>
    </div>
  )
}

export default function OrderDetailsForm({
  order,
  variant,
}: {
  order: IOrder
  variant: 'customer' | 'admin'
}) {
  const isAdmin = variant === 'admin'
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    payment,
    coupon,
    status,
    statusHistory,
    expectedDeliveryDate,
    createdAt,
    cancellation,
    returnRequest,
  } = order

  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const isPaid = payment.status === 'paid'
  const paymentMeta =
    PAYMENT_STATUS_META[payment.status] ?? PAYMENT_STATUS_META.pending
  const discount = coupon ? Math.min(coupon.value, itemsPrice) : 0
  const history = [...(statusHistory ?? [])].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  )
  const customer =
    order.user && typeof order.user === 'object'
      ? (order.user as { name?: string; email?: string; phone?: string })
      : null

  const site = data.settings[0]?.site
  const whatsappNumber = (site?.whatsapp ?? '').replace(/\D/g, '')
  const itemNames = items.map((item) => item.name).join(', ')
  const whatsappMessage = [
    `Hi ${site?.name ?? ''}, I need help with my order ${formatId(order._id)}.`,
    `Items: ${itemNames}.`,
    customer?.name ? `Name: ${customer.name}` : null,
    customer?.email ? `Email: ${customer.email}` : null,
    customer?.phone ? `Phone: ${customer.phone}` : null,
    'Issue: ',
  ]
    .filter(Boolean)
    .join('\n')
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : '#'

  return (
    <div className='space-y-5'>
      <Card className='overflow-hidden rounded-3xl border-border/60 bg-white '>
        <CardContent className='p-6'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-gold text-white '>
                <Package className='h-7 w-7' />
              </span>
              <div>
                <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                  Order
                </p>
                <h2 className='text-xl font-bold tracking-tight'>
                  {formatId(order._id)}
                </h2>
                <p className='text-sm text-muted-foreground'>
                  Placed on{' '}
                  {createdAt ? formatDateTime(createdAt).dateTime : '-'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <OrderStatusBadge
                status={status}
                className='px-3 py-1.5 text-xs'
              />
              <div className='text-right'>
                <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                  Total
                </p>
                <div className='text-xl font-bold text-primary'>
                  <ProductPrice price={totalPrice} plain />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-3xl border-border/60 bg-white '>
        <CardContent className='p-6'>
          <h2 className='font-bold tracking-tight'>
            {isAdmin ? 'Order Status' : 'Track your order'}
          </h2>

          {isAdmin ? (
            <>
              {history.length > 0 ? (
                <ol className='mt-4 space-y-5 border-l border-border/60 pl-6'>
                  {history.map((entry, index) => {
                    const meta =
                      ORDER_STATUS_META[entry.status] ??
                      ORDER_STATUS_META.success
                    const Icon = meta.icon
                    const isLast = index === history.length - 1
                    return (
                      <li key={`${entry.status}-${index}`} className='relative'>
                        <span
                          className={cn(
                            'absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-circle border-2 bg-white',
                            isLast
                              ? 'border-primary text-primary'
                              : 'border-border text-muted-foreground'
                          )}
                        >
                          <Icon className='h-3 w-3' />
                        </span>
                        <div className='flex flex-wrap items-center gap-2'>
                          <p className='text-sm font-semibold'>
                            {ORDER_STATUS_LABELS[entry.status]}
                          </p>
                          <span className='text-xs text-muted-foreground'>
                            {formatDateTime(entry.at).dateTime}
                          </span>
                        </div>
                        {entry.note && (
                          <p className='mt-0.5 text-xs text-muted-foreground'>
                            {entry.note}
                          </p>
                        )}
                        {entry.by && (
                          <p className='text-[11px] text-muted-foreground/70'>
                            by {entry.by}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <p className='mt-3 text-sm text-muted-foreground'>
                  No status updates yet.
                </p>
              )}

              <WorkspaceStatusControl orderId={order._id} current={status} />
            </>
          ) : (
            <div className='mt-6'>
              <OrderProgress
                status={status}
                statusHistory={statusHistory}
                expectedDeliveryDate={expectedDeliveryDate}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {(cancellation || returnRequest) && (
        <Card className='rounded-3xl border-border/60 bg-white '>
          <CardContent className='space-y-4 p-6'>
            <h2 className='font-bold tracking-tight'>
              Cancellation &amp; Return
            </h2>
            {cancellation && (
              <div className='flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-4'>
                <span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-circle bg-red-100 text-red-600'>
                  <XCircle className='h-4 w-4' />
                </span>
                <div>
                  <p className='text-sm font-semibold text-red-700'>
                    Order cancelled
                  </p>
                  <p className='mt-0.5 text-sm text-muted-foreground'>
                    {cancellation.reason}
                  </p>
                  {cancellation.date && (
                    <p className='mt-1 text-xs text-muted-foreground/70'>
                      {formatDateTime(cancellation.date).dateTime}
                    </p>
                  )}
                </div>
              </div>
            )}
            {returnRequest && (
              <div className='flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4'>
                <span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-circle bg-amber-100 text-amber-600'>
                  <RotateCcw className='h-4 w-4' />
                </span>
                <div>
                  <p className='text-sm font-semibold text-amber-700'>
                    Return requested
                  </p>
                  <p className='mt-0.5 text-sm text-muted-foreground'>
                    {returnRequest.reason}
                  </p>
                  {returnRequest.date && (
                    <p className='mt-1 text-xs text-muted-foreground/70'>
                      {formatDateTime(returnRequest.date).dateTime}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isAdmin && customer && (
        <Card className='rounded-3xl border-border/60 bg-white '>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary'>
                <User className='h-5 w-5' />
              </span>
              <h2 className='font-bold tracking-tight'>Customer</h2>
            </div>
            <dl className='grid gap-4 sm:grid-cols-3'>
              <div>
                <dt className='text-xs uppercase tracking-wide text-muted-foreground'>
                  Name
                </dt>
                <dd className='mt-0.5 font-semibold'>{customer.name || '—'}</dd>
              </div>
              <div>
                <dt className='text-xs uppercase tracking-wide text-muted-foreground'>
                  Email
                </dt>
                <dd className='mt-0.5 break-all font-medium'>
                  {customer.email || '—'}
                </dd>
              </div>
              <div>
                <dt className='text-xs uppercase tracking-wide text-muted-foreground'>
                  Phone
                </dt>
                <dd className='mt-0.5 font-medium'>{customer.phone || '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <div className='grid gap-5 md:grid-cols-3'>
        <div className='space-y-5 md:col-span-2'>
          <Card className='rounded-3xl border-border/60 bg-white '>
            <CardContent className='p-6'>
              <div className='mb-2 flex items-center gap-3'>
                <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary'>
                  <ShoppingBag className='h-5 w-5' />
                </span>
                <h2 className='font-bold tracking-tight'>Order Items</h2>
                <Badge
                  variant='secondary'
                  className='ml-auto rounded-full px-2.5'
                >
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              <div className='divide-y divide-border/60'>
                {items.map((item, index) => (
                  <div
                    key={`${item.slug}-${index}`}
                    className='flex items-center gap-4 py-4'
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      className='relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted'
                    >
                      <Image
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        fill
                        sizes='80px'
                        className='object-contain p-1'
                      />
                    </Link>
                    <div className='min-w-0 flex-1'>
                      <Link
                        href={`/product/${item.slug}`}
                        className='line-clamp-1 font-semibold transition-colors hover:text-primary'
                      >
                        {item.name}
                      </Link>
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        {[item.size, item.color].filter(Boolean).join(' · ') ||
                          item.category}
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        Qty {item.quantity} ×{' '}
                        <ProductPrice price={item.price} plain />
                      </p>
                    </div>
                    <div className='font-bold text-primary'>
                      <ProductPrice price={item.price * item.quantity} plain />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className='grid gap-5 sm:grid-cols-2'>
            <Card className='rounded-3xl border-border/60 bg-white '>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-center gap-3'>
                  <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary'>
                    <MapPin className='h-5 w-5' />
                  </span>
                  <h2 className='font-bold tracking-tight'>Shipping Address</h2>
                </div>
                <p className='font-semibold'>{shippingAddress.fullName}</p>
                <p className='text-sm text-muted-foreground'>
                  {shippingAddress.phone}
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {shippingAddress.street}, {shippingAddress.city},{' '}
                  {shippingAddress.province}, {shippingAddress.postalCode},{' '}
                  {shippingAddress.country}
                </p>
              </CardContent>
            </Card>

            <Card className='rounded-3xl border-border/60 bg-white '>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-center gap-3'>
                  <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary'>
                    <CreditCard className='h-5 w-5' />
                  </span>
                  <h2 className='font-bold tracking-tight'>Payment</h2>
                </div>
                <p className='font-semibold'>{payment.method}</p>
                <Badge
                  variant='outline'
                  className={cn(
                    'mt-3 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    paymentMeta.className
                  )}
                >
                  {paymentMeta.label}
                </Badge>
                {payment.paidAt && (
                  <p className='mt-2 text-xs text-muted-foreground'>
                    Paid on {formatDateTime(payment.paidAt).dateOnly}
                  </p>
                )}
                {payment.result?.id && (
                  <p className='mt-1 break-all text-[11px] text-muted-foreground/70'>
                    Txn: {payment.result.id}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Card className='rounded-3xl border-border/60 bg-white  md:sticky md:top-24'>
            <CardContent className='space-y-4 p-6'>
              <h2 className='font-bold tracking-tight'>Order Summary</h2>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Items</span>
                <span className='font-medium'>
                  <ProductPrice price={itemsPrice} plain />
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Tax</span>
                <span className='font-medium'>
                  <ProductPrice price={taxPrice} plain />
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Shipping</span>
                <span className='font-medium'>
                  <ProductPrice price={shippingPrice} plain />
                </span>
              </div>
              {coupon && discount > 0 && (
                <div className='flex items-center justify-between text-sm'>
                  <span className='inline-flex items-center gap-1.5 text-emerald-700'>
                    <TicketPercent className='h-4 w-4' />
                    Coupon ({coupon.code})
                  </span>
                  <span className='font-semibold text-emerald-700'>
                    -<ProductPrice price={discount} plain />
                  </span>
                </div>
              )}
              <div className='flex justify-between border-t border-border/60 pt-4'>
                <span className='font-bold'>Total</span>
                <span className='text-lg font-bold text-primary'>
                  <ProductPrice price={totalPrice} plain />
                </span>
              </div>

              {!isAdmin && !isPaid && payment.method === 'Razorpay' && (
                <PayNowButton
                  orderId={order._id}
                  label='Pay Now'
                  successRedirect={`/order-success/${order._id}`}
                  failureRedirect={`/order-failed/${order._id}`}
                  className='h-11 w-full gap-2 rounded-full font-bold'
                />
              )}

              {isAdmin && !isPaid && payment.method === 'Cash On Delivery' && (
                <ActionButton
                  caption='Mark as paid'
                  action={() => updateOrderToPaid(order._id)}
                />
              )}

              {!isAdmin && (
                <CustomerOrderActions
                  orderId={order._id}
                  status={status}
                  hasReturnRequest={Boolean(returnRequest)}
                  whatsappLink={whatsappLink}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
