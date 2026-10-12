'use client'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { createOrder } from '@/lib/actions/order.actions'
import { saveAddress } from '@/lib/actions/address.actions'
import { getActiveCoupons } from '@/lib/actions/coupon.actions'
import { ICoupon } from '@/lib/models/coupon.model'
import {
  FREE_SHIPPING_MIN_PRICE,
  SHIPPING_PRICE,
  TAX_RATE,
  DELIVERY_DAYS,
} from '@/config/data'
import {
  calculateFutureDate,
  formatCurrency,
  formatDateTime,
  round2,
} from '@/lib/utils'
import { getImageUrl } from '@/lib/image-url'
import { ShippingAddressSchema } from '@/lib/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import CheckoutFooter from './checkout-footer'
import { CartItem, IAddressWithId, ShippingAddress } from '@/types'
import useIsMounted from '@/hooks/use-is-mounted'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import ProductPrice from '@/components/shared/product/product-price'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  MapPin,
  Minus,
  Pencil,
  Plus,
  ShieldCheck,
  Ticket,
  Trash2,
  Truck,
  X,
} from 'lucide-react'

const shippingAddressDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        fullName: 'John Doe',
        street: '1911, 65 Sherbrooke Est',
        city: 'Montreal',
        province: 'Quebec',
        phone: '4181234567',
        postalCode: 'H2X 1C4',
        country: 'Canada',
      }
    : {
        fullName: '',
        street: '',
        city: '',
        province: '',
        phone: '',
        postalCode: '',
        country: '',
      }

const StepBadge = ({
  step,
  done,
  active,
}: {
  step: number
  done?: boolean
  active?: boolean
}) => (
  <span
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
      done
        ? 'bg-primary text-white'
        : active
          ? 'bg-primary text-white'
          : 'border border-border bg-muted text-muted-foreground'
    }`}
  >
    {done ? <Check className='h-4 w-4' /> : step}
  </span>
)

const StepHeading = ({
  step,
  title,
  done,
  active,
}: {
  step: number
  title: string
  done?: boolean
  active?: boolean
}) => (
  <div className='flex items-center gap-3'>
    <StepBadge step={step} done={done} active={active} />
    <h2 className='text-base font-bold md:text-lg'>{title}</h2>
    {done && (
      <Badge className='rounded-full border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary hover:bg-primary/10'>
        Done
      </Badge>
    )}
  </div>
)

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <section className='rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:p-6'>
    {children}
  </section>
)

const ItemThumb = ({
  item,
  className = 'h-14 w-14',
}: {
  item: CartItem
  className?: string
}) => (
  <div
    className={`relative ${className} shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted`}
  >
    <Image
      src={getImageUrl(item.image)}
      alt={item.name}
      fill
      sizes='20vw'
      className='object-contain p-1'
    />
  </div>
)

const CheckoutForm = ({
  savedAddresses = [],
}: {
  savedAddresses?: IAddressWithId[]
}) => {
  const { toast } = useToast()
  const router = useRouter()
  const {
    setting: {
      site,
      availablePaymentMethods,
      defaultPaymentMethod,
    },
  } = useSettingStore()

  const {
    cart: {
      items,
      itemsPrice,
      shippingPrice,
      taxPrice,
      shippingAddress,
      paymentMethod = defaultPaymentMethod,
    },
    setShippingAddress,
    setPaymentMethod,
    updateItem,
    removeItem,
    clearCart,
  } = useCartStore()
  const isMounted = useIsMounted()

  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  })

  useEffect(() => {
    if (!isMounted || !shippingAddress) return
    shippingAddressForm.setValue('fullName', shippingAddress.fullName)
    shippingAddressForm.setValue('street', shippingAddress.street)
    shippingAddressForm.setValue('city', shippingAddress.city)
    shippingAddressForm.setValue('country', shippingAddress.country)
    shippingAddressForm.setValue('postalCode', shippingAddress.postalCode)
    shippingAddressForm.setValue('province', shippingAddress.province)
    shippingAddressForm.setValue('phone', shippingAddress.phone)
  }, [isMounted, shippingAddress, shippingAddressForm])

  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false)
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] =
    useState<boolean>(false)
  const [showManualAddressForm, setShowManualAddressForm] =
    useState<boolean>(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  )
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false)

  const canReview = isAddressSelected && isPaymentMethodSelected

  const hasFreeShipping = itemsPrice >= FREE_SHIPPING_MIN_PRICE
  const displayShippingPrice = hasFreeShipping
    ? 0
    : typeof shippingPrice === 'number'
      ? shippingPrice
      : SHIPPING_PRICE
  const displayTaxPrice =
    typeof taxPrice === 'number' ? taxPrice : round2(itemsPrice * TAX_RATE)
  const displayTotalPrice = round2(
    itemsPrice + displayShippingPrice + displayTaxPrice
  )
  const freeShippingGap = Math.max(0, FREE_SHIPPING_MIN_PRICE - itemsPrice)
  const shippingProgress = Math.min(
    100,
    Math.round((itemsPrice / FREE_SHIPPING_MIN_PRICE) * 100)
  )

  const [coupons, setCoupons] = useState<ICoupon[]>([])
  const [couponCode, setCouponCode] = useState<string>('')
  const [appliedCoupon, setAppliedCoupon] = useState<ICoupon | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [isLoadingCoupons, setIsLoadingCoupons] = useState<boolean>(true)

  useEffect(() => {
    let active = true
    getActiveCoupons()
      .then((res) => {
        if (active) setCoupons(res.data ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoadingCoupons(false)
      })
    return () => {
      active = false
    }
  }, [])

  const couponDiscount = appliedCoupon
    ? Math.min(appliedCoupon.value, itemsPrice)
    : 0
  const finalTotalPrice = round2(displayTotalPrice - couponDiscount)

  const applyCoupon = (coupon: ICoupon) => {
    if (itemsPrice < coupon.minAmount) {
      setCouponError(
        `This coupon requires a minimum order of ${formatCurrency(
          coupon.minAmount
        )}`
      )
      return
    }
    setAppliedCoupon(coupon)
    setCouponCode(coupon.code)
    setCouponError(null)
  }

  const handleApplyCouponCode = () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    const found = coupons.find((c) => c.code === code)
    if (!found) {
      setCouponError('This coupon code is invalid or has expired.')
      setAppliedCoupon(null)
      return
    }
    if (itemsPrice < found.minAmount) {
      setCouponError(
        `This coupon requires a minimum order of ${formatCurrency(
          found.minAmount
        )}`
      )
      return
    }
    setAppliedCoupon(found)
    setCouponCode(found.code)
    setCouponError(null)
  }

  const removeAppliedCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
    setCouponCode('')
  }

  const selectSavedAddress = (address: IAddressWithId) => {
    setShippingAddress({
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      phone: address.phone,
      country: address.country,
    })
    setSelectedAddressId(address._id.toString())
    setShowManualAddressForm(false)
    setIsAddressSelected(true)
  }

  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = async (
    values
  ) => {
    setShippingAddress(values)
    setSelectedAddressId('new')
    setShowManualAddressForm(false)
    setIsAddressSelected(true)
    try {
      await saveAddress({
        ...values,
        label: 'Other',
        isDefault: savedAddresses.length === 0,
      })
    } catch {
      // saving to address book is optional — never block checkout
    }
  }

  const handleEditAddress = () => {
    setSelectedAddressId(null)
    setShowManualAddressForm(false)
    setIsAddressSelected(false)
  }

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      toast({
        description: 'Please select a shipping address first.',
        variant: 'destructive',
      })
      return
    }
    setIsPlacingOrder(true)
    const res = await createOrder({
      items,
      shippingAddress,
      expectedDeliveryDate: calculateFutureDate(DELIVERY_DAYS),
      paymentMethod,
      itemsPrice,
      shippingPrice: displayShippingPrice,
      taxPrice: displayTaxPrice,
      totalPrice: finalTotalPrice,
    })
    setIsPlacingOrder(false)
    if (!res.success) {
      toast({
        description: res.message,
        variant: 'destructive',
      })
    } else {
      toast({
        description: res.message,
        variant: 'default',
      })
      clearCart()
      router.push(`/checkout/${res.data?.orderId}`)
    }
  }

  const NewAddressForm = ({ onCancel }: { onCancel?: () => void }) => (
    <Form {...shippingAddressForm}>
      <form
        method='post'
        onSubmit={shippingAddressForm.handleSubmit(onSubmitShippingAddress)}
        className='mt-4 space-y-4'
      >
        <div className='rounded-2xl border border-border/70 bg-background p-4 md:p-5'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <p className='text-sm font-bold'>Add a new address</p>
            {onCancel && (
              <button
                type='button'
                onClick={onCancel}
                className='inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary'
              >
                <ArrowLeft className='h-4 w-4' />
                Back
              </button>
            )}
          </div>
          <div className='space-y-4'>
            <FormField
              control={shippingAddressForm.control}
              name='fullName'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter full name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={shippingAddressForm.control}
              name='street'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter street address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 md:grid-cols-3'>
              <FormField
                control={shippingAddressForm.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter city' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shippingAddressForm.control}
                name='province'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province / State</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter province' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shippingAddressForm.control}
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter country' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={shippingAddressForm.control}
                name='postalCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter postal code' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shippingAddressForm.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter phone number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <Button type='submit' className='gap-2 rounded-full font-bold'>
          <MapPin className='h-4 w-4' />
          Ship to this address
        </Button>
      </form>
    </Form>
  )

  const PaymentRow = ({
    name,
    commission,
    selected,
    onClick,
  }: {
    name: string
    commission: number
    selected: boolean
    onClick: () => void
  }) => (
    <button
      type='button'
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border hover:border-primary/40 hover:bg-muted/40'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          selected
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <CreditCard className='h-4 w-4' />
      </span>
      <span className='flex-1'>
        <span className='block text-sm font-bold'>{name}</span>
        <span className='block text-xs text-muted-foreground'>
          {commission > 0
            ? `${commission}% processing fee`
            : 'No extra charges'}
        </span>
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary bg-primary text-white' : 'border-border'
        }`}
      >
        {selected && <Check className='h-3 w-3' />}
      </span>
    </button>
  )

  const AddressCard = ({
    address,
    selected,
    onSelect,
  }: {
    address: IAddressWithId
    selected: boolean
    onSelect: (a: IAddressWithId) => void
  }) => (
    <button
      type='button'
      onClick={() => onSelect(address)}
      className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      <span className='flex items-center gap-2'>
        <MapPin
          className={`h-4 w-4 shrink-0 ${
            selected ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
        <span className='truncate text-sm font-bold'>{address.label}</span>
        {address.isDefault && (
          <Badge className='rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white'>
            Default
          </Badge>
        )}
        <span
          className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? 'border-primary bg-primary text-white' : 'border-border'
          }`}
        >
          {selected && <Check className='h-3 w-3' />}
        </span>
      </span>
      <span className='mt-2 text-sm font-semibold'>{address.fullName}</span>
      <span className='mt-0.5 text-xs text-muted-foreground'>
        {address.street}
      </span>
      <span className='text-xs text-muted-foreground'>
        {address.city}, {address.province} {address.postalCode}
      </span>
      <span className='text-xs text-muted-foreground'>
        {address.country} · {address.phone}
      </span>
    </button>
  )

  const OrderSummary = () => {
    return (
    <div className='rounded-2xl border border-border/70 bg-card shadow-sm'>
      <CardContent className='p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <p className='text-base font-bold'>Order Summary</p>
          <Badge
            variant='secondary'
            className='rounded-full px-2 py-0.5 text-xs'
          >
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </Badge>
        </div>

        {hasFreeShipping ? (
          <div className='mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700'>
            <Truck className='h-4 w-4 shrink-0' />
            Your order qualifies for FREE Shipping
          </div>
        ) : (
          <div className='mt-3 rounded-xl border border-border/60 bg-white p-3 shadow-sm'>
            <p className='text-xs text-muted-foreground'>
              Add{' '}
              <span className='font-semibold text-gold'>
                <ProductPrice price={freeShippingGap} plain />
              </span>{' '}
              more to qualify for{' '}
              <span className='font-semibold'>FREE Shipping</span>
            </p>
            <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-muted'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-gold to-primary transition-all duration-500'
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className='mt-3 space-y-3 rounded-xl border border-border/60 bg-white p-3 shadow-sm'>
            {appliedCoupon ? (
              <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15'>
                    <Check className='h-3.5 w-3.5 text-emerald-600' />
                  </span>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-wide text-emerald-700'>
                      {appliedCoupon.code}
                    </p>
                    <p className='text-[11px] text-muted-foreground'>
                      {formatCurrency(appliedCoupon.value)} off applied
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={removeAppliedCoupon}
                  className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                  title='Remove coupon'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ) : (
              <>
                <p className='text-xs font-bold'>Apply Coupon</p>
                <div className='flex gap-2'>
                  <Input
                    type='text'
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleApplyCouponCode()
                      }
                    }}
                    placeholder='Enter coupon code'
                    className='h-9 flex-1 font-mono uppercase'
                  />
                  <Button
                    type='button'
                    size='sm'
                    onClick={handleApplyCouponCode}
                    disabled={!couponCode.trim()}
                    className='h-9 rounded-xl'
                  >
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <p className='text-[11px] font-medium text-red-500'>
                    {couponError}
                  </p>
                )}
              </>
            )}

            {isLoadingCoupons ? (
              <p className='border-t border-border/50 pt-3 text-[11px] text-muted-foreground'>
                Loading available coupons…
              </p>
            ) : (
              coupons.length > 0 && (
                <div className='border-t border-border/50 pt-3'>
                  
                  <div className='max-h-36 space-y-1.5 overflow-y-auto pr-1'>
                    {coupons.map((coupon) => {
                      const isApplied = appliedCoupon?._id === coupon._id
                      const isEligible =
                        !isApplied && itemsPrice >= coupon.minAmount
                      return (
                        <button
                          type='button'
                          key={coupon._id as string}
                          disabled={!isEligible}
                          onClick={() => applyCoupon(coupon)}
                          className={`w-full rounded-lg border p-2 text-left transition-colors ${
                            isEligible
                              ? 'border-border/60 hover:border-primary/40 hover:bg-primary/5'
                              : 'cursor-not-allowed border-border/30 opacity-45'
                          }`}
                        >
                          <div className='flex items-center justify-between gap-2'>
                            <span className='flex items-center gap-1.5 font-mono text-[11px] font-bold text-primary'>
                              <Ticket className='h-3.5 w-3.5 shrink-0' />
                              {coupon.code}
                            </span>
                            <span className='text-[11px] font-semibold'>
                              <ProductPrice price={coupon.value} plain /> off
                            </span>
                          </div>
                          <p className='mt-0.5 text-[10px] text-muted-foreground'>
                            Min. order <ProductPrice price={coupon.minAmount} plain />
                            {isApplied ? ' · Applied' : ''}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <div className='mt-2 space-y-2 border-t pt-4 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Items:</span>
            <span className='font-semibold'>
              <ProductPrice price={itemsPrice} plain />
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Shipping & Handling:</span>
            <span className='font-semibold'>
              {displayShippingPrice === 0 ? (
                'FREE'
              ) : (
                <ProductPrice price={displayShippingPrice} plain />
              )}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>
              Tax ({Math.round(TAX_RATE * 100)}%):
            </span>
            <span className='font-semibold'>
              <ProductPrice price={displayTaxPrice} plain />
            </span>
          </div>
          {appliedCoupon && couponDiscount > 0 && (
            <div className='flex justify-between text-emerald-600'>
              <span className='text-muted-foreground'>
                Coupon ({appliedCoupon.code}):
              </span>
              <span className='font-semibold'>
                -<ProductPrice price={couponDiscount} plain />
              </span>
            </div>
          )}
          <div className='flex justify-between border-t pt-3 text-base font-bold'>
            <span>Order Total:</span>
            <span>
              <ProductPrice price={finalTotalPrice} plain />
            </span>
          </div>
        </div>

        <Button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className='mt-5 w-full gap-2 rounded-full font-bold'
        >
          <Lock className='h-4 w-4' />
          {isPlacingOrder ? 'Placing Order…' : 'Place Your Order'}
        </Button>

        <div className='mt-4 flex items-start gap-2 border-t pt-4 text-xs text-muted-foreground'>
          <ShieldCheck className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
          Secure checkout · 100% protected payments. Free &amp; easy 30-day
          returns.
        </div>
      </CardContent>
    </div>
    )
  }

  const steps = [
    { num: 1, label: 'Address', done: isAddressSelected },
    { num: 2, label: 'Payment', done: isPaymentMethodSelected },
    { num: 3, label: 'Review', done: canReview },
  ]
  const currentStep =
    steps.every((s) => s.done) ? 3 : steps.findIndex((s) => !s.done) + 1

  return (
    <main className='mx-auto max-w-7xl px-4 pb-12 highlight-link sm:px-6 lg:px-8'>
      <div className='flex flex-wrap items-center justify-between gap-3 py-6 md:py-8'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight md:text-3xl'>
            Checkout
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Almost there — review your order and complete payment.
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => router.push('/cart')}
          className='gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to cart
        </Button>
      </div>

      <ol className='mb-6 flex items-center gap-2 overflow-x-auto sm:gap-3'>
        {steps.map((s) => {
          const active = s.num === currentStep
          return (
            <li
              key={s.num}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold sm:px-4 sm:text-sm ${
                s.done
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : active
                    ? 'border-primary bg-primary text-white'
                    : 'border-border text-muted-foreground'
              }`}
            >
              <span>
                {s.done ? <Check className='h-3.5 w-3.5' /> : s.num}
              </span>
              <span className='whitespace-nowrap'>{s.label}</span>
            </li>
          )
        })}
      </ol>

      <div className='mb-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-gold/10 to-transparent p-4 shadow-sm'>
        <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-md'>
          <Truck className='h-5 w-5' />
        </span>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-wide text-primary'>
            Estimated Delivery
          </p>
          <p className='text-sm font-bold text-foreground'>
            {formatDateTime(calculateFutureDate(DELIVERY_DAYS)).dateOnly}
            <span className='font-medium text-muted-foreground'>
              {' '}
              · delivered in {DELIVERY_DAYS} days
            </span>
          </p>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <div className='space-y-6 md:col-span-2'>
          {/* Step 1: Shipping Address */}
          <SectionCard>
            <StepHeading
              step={1}
              title='Shipping Address'
              done={isAddressSelected && !!shippingAddress}
              active={!isAddressSelected}
            />
            {isAddressSelected && shippingAddress ? (
              <div className='mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex gap-3'>
                    <span className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                      <MapPin className='h-4 w-4' />
                    </span>
                    <div className='text-sm'>
                      <p className='font-bold'>{shippingAddress.fullName}</p>
                      <p className='mt-0.5 text-muted-foreground'>
                        {shippingAddress.street}
                      </p>
                      <p className='text-muted-foreground'>
                        {shippingAddress.city}, {shippingAddress.province}{' '}
                        {shippingAddress.postalCode},{' '}
                        {shippingAddress.country}
                      </p>
                      <p className='text-muted-foreground'>
                        {shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleEditAddress}
                    className='shrink-0 gap-1.5'
                  >
                    <Pencil className='h-3.5 w-3.5' />
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {savedAddresses.length > 0 && (
                  <>
                    <p className='mb-3 mt-4 text-sm text-muted-foreground'>
                      Select a saved address or add a new one
                    </p>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      {savedAddresses.map((address) => (
                        <AddressCard
                          key={address._id.toString()}
                          address={address}
                          selected={
                            selectedAddressId === address._id.toString()
                          }
                          onSelect={selectSavedAddress}
                        />
                      ))}
                      <button
                        type='button'
                        onClick={() => setShowManualAddressForm(true)}
                        className='flex min-h-[7.5rem] items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary'
                      >
                        <Plus className='h-4 w-4' />
                        Add new address
                      </button>
                    </div>
                  </>
                )}
                {showManualAddressForm && savedAddresses.length > 0 && (
                  <NewAddressForm
                    onCancel={() => setShowManualAddressForm(false)}
                  />
                )}
                {savedAddresses.length === 0 && (
                  <>
                    <p className='mb-1 mt-4 text-sm text-muted-foreground'>
                      You have no saved addresses yet. Add one below to
                      continue.
                    </p>
                    <NewAddressForm />
                  </>
                )}
              </>
            )}
          </SectionCard>

          {/* Step 2: Payment Method */}
          <SectionCard>
            <StepHeading
              step={2}
              title='Payment Method'
              done={isPaymentMethodSelected}
              active={!isPaymentMethodSelected}
            />
            <p className='mb-3 mt-4 text-sm text-muted-foreground'>
              Choose how you want to pay
            </p>
            <div className='space-y-3'>
              {availablePaymentMethods.map((pm) => (
                <PaymentRow
                  key={pm.name}
                  name={pm.name}
                  commission={pm.commission}
                  selected={paymentMethod === pm.name}
                  onClick={() => {
                    setPaymentMethod(pm.name)
                    setIsPaymentMethodSelected(true)
                  }}
                />
              ))}
            </div>
          </SectionCard>

          {/* Step 3: Review & Place Order */}
          <SectionCard>
            <div className='mb-3 flex items-center justify-between'>
              <p className='text-sm font-bold'>Your Items</p>
              <Badge
                variant='secondary'
                className='rounded-full px-2 py-0.5 text-xs'
              >
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </Badge>
            </div>
            <div className='space-y-3'>
                  {items.map((item) => (
                    <div
                      key={item.clientId}
                      className='flex gap-3 rounded-xl border border-border/60 p-3'
                    >
                      <ItemThumb item={item} className='h-16 w-16' />
                      <div className='flex min-w-0 flex-1 flex-col'>
                        <div className='flex items-start justify-between gap-3'>
                          <p className='truncate text-sm font-semibold'>
                            {item.name}
                          </p>
                          <p className='shrink-0 text-sm font-bold'>
                            <ProductPrice price={item.price} plain />
                          </p>
                        </div>
                        <p className='mt-0.5 flex items-center gap-2 text-xs text-muted-foreground'>
                          {item.color && <span>{item.color}</span>}
                          {item.size && (
                            <Badge
                              variant='outline'
                              className='h-5 px-1.5 text-[10px]'
                            >
                              {item.size}
                            </Badge>
                          )}
                        </p>
                        <div className='mt-2 flex items-center justify-between gap-3'>
                          <div className='flex items-center gap-2'>
                            <div className='inline-flex items-center rounded-full border border-border bg-background'>
                              <button
                                type='button'
                                aria-label='Decrease quantity'
                                disabled={item.quantity <= 1}
                                onClick={() =>
                                  updateItem(item, Math.max(1, item.quantity - 1))
                                }
                                className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary disabled:opacity-40'
                              >
                                <Minus className='h-4 w-4' />
                              </button>
                              <span className='w-8 text-center text-sm font-semibold text-foreground'>
                                {item.quantity}
                              </span>
                              <button
                                type='button'
                                aria-label='Increase quantity'
                                disabled={item.quantity >= item.countInStock}
                                onClick={() =>
                                  updateItem(
                                    item,
                                    Math.min(item.countInStock, item.quantity + 1)
                                  )
                                }
                                className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary disabled:opacity-40'
                              >
                                <Plus className='h-4 w-4' />
                              </button>
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => removeItem(item)}
                              className='gap-1.5 text-muted-foreground hover:text-destructive'
                            >
                              <Trash2 className='h-4 w-4' />
                              <span className='hidden sm:inline'>Remove</span>
                            </Button>
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            Line total:{' '}
                            <span className='font-semibold text-foreground'>
                              <ProductPrice
                                price={item.price * item.quantity}
                                plain
                              />
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-6 border-t pt-5'>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className='w-full gap-2 rounded-full py-3 font-bold'
                  >
                    <Lock className='h-4 w-4' />
                    {isPlacingOrder ? 'Placing Order…' : 'Place Your Order'}
                  </Button>
                  <p className='mt-3 text-center text-xs text-muted-foreground'>
                    By placing your order, you agree to {site.name}&apos;s{' '}
                    <Link
                      href='/privacy-policy'
                      className='underline underline-offset-2'
                    >
                      privacy notice
                    </Link>{' '}
                    and{' '}
                    <Link
                      href='/terms-and-conditions'
                      className='underline underline-offset-2'
                    >
                      conditions of use
                    </Link>
                    .
                  </p>
                </div>
          </SectionCard>

          <div className='md:hidden'>{OrderSummary()}</div>

          <CheckoutFooter />
        </div>

        <aside className='hidden md:block'>
          <div className='sticky top-24'>{OrderSummary()}</div>
        </aside>
      </div>
    </main>
  )
}
export default CheckoutForm