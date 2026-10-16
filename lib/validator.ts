import { z } from 'zod'
import { formatNumberWithDecimal } from './utils'
import { USER_ROLES } from './roles'

// Common
const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid MongoDB ID' })

export const ContentStatusSchema = z.enum(['public', 'draft', 'delete'])

const Price = (field: string) =>
  z.coerce
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      `${field} must have exactly two decimal places (e.g., 49.99)`
    )

export const ReviewInputSchema = z.object({
  product: MongoId,
  user: MongoId,
  isVerifiedPurchase: z.boolean(),
  title: z.string().min(1, 'Title is required'),
  comment: z.string().min(1, 'Comment is required'),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
})

// Each product variant carries its own price, images and stock. Its identity is
// the image (plus optional sizes), so there is no separate name.
export const ProductVariantSchema = z.object({
  price: Price('Price'),
  listPrice: Price('List price'),
  images: z
    .array(z.string())
    .min(1, 'Each variant must have at least one image'),
  size: z.array(z.string()).optional(),
  countInStock: z.coerce
    .number()
    .int()
    .nonnegative('count in stock must be a non-negative number'),
})

export const ProductInputSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: MongoId,
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().min(1, 'Description is required'),
  status: ContentStatusSchema.default('draft'),
  variants: z
    .array(ProductVariantSchema)
    .min(1, 'Product must have at least one variant'),
  tags: z.array(z.string()).default([]),
  avgRating: z.coerce
    .number()
    .min(0, 'Average rating must be at least 0')
    .max(5, 'Average rating must be at most 5')
    .default(0),
  numReviews: z.coerce
    .number()
    .int()
    .nonnegative('Number of reviews must be a non-negative number')
    .default(0),
  ratingDistribution: z
    .array(z.object({ rating: z.number(), count: z.number() }))
    .max(5)
    .default([]),
  reviews: z.array(ReviewInputSchema).default([]),
  numSales: z.coerce
    .number()
    .int()
    .nonnegative('Number of sales must be a non-negative number')
    .default(0),
})

export const ProductUpdateSchema = ProductInputSchema.extend({
  _id: z.string(),
})

// Order Item — snapshot of a product/variant stored on an order line.
// `clientId` is intentionally NOT part of this shape: it only exists to
// identify a line while it lives in the cart.
export const OrderItemSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  variantId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z
    .number()
    .int()
    .nonnegative('Quantity must be a non-negative number'),
  countInStock: z
    .number()
    .int()
    .nonnegative('Quantity must be a non-negative number'),
  image: z.string().min(1, 'Image is required'),
  price: Price('Price'),
  listPrice: Price('List price').optional(),
  size: z.string().optional(),
  color: z.string().optional(),
})
// Cart Item — order item plus the client-generated line id that identifies the
// line inside the cart (used for update/remove before an order is created).
export const CartItemSchema = OrderItemSchema.extend({
  clientId: z.string().min(1, 'clientId is required'),
})

const Text = (field: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${field} must be at least ${min} characters`)
    .max(max, `${field} must be at most ${max} characters`)

const LetterText = (field: string, min: number, max: number) =>
  Text(field, min, max).regex(
    /^[\p{L}\p{N}\s.,'()&/-]+$/u,
    `${field} contains invalid characters`
  )

const PhoneInput = z
  .string()
  .trim()
  .min(7, 'Phone number is invalid')
  .max(20, 'Phone number is invalid')
  .regex(/^\+?[\d\s-]{7,20}$/, 'Phone number is invalid')

export const ShippingAddressSchema = z.object({
  fullName: LetterText('Full name', 2, 50),
  street: Text('Address', 3, 200),
  city: LetterText('City', 2, 60),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{4,10}$/, 'Postal code must be 4-10 digits'),
  province: LetterText('Province', 2, 60),
  phone: PhoneInput,
  country: LetterText('Country', 2, 60),
})

export const AddressSchema = ShippingAddressSchema.extend({
  label: z.enum(['Home', 'Office', 'Other']).default('Home'),
  isDefault: z.boolean().default(false),
})
export const AddressesSchema = z
  .array(AddressSchema)
  .max(10, 'Maximum 10 addresses allowed')
export const AddressUpdateSchema = AddressSchema.extend({
  _id: MongoId,
})
export const AddressInputSchema = AddressSchema.extend({
  _id: MongoId.optional(),
})

// Coupon snapshot applied to an order
export const CouponSnapshotSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  value: z.coerce.number().min(0, 'Discount value must be 0 or more'),
  minAmount: z.coerce.number().min(0, 'Minimum amount must be 0 or more'),
})

// Payment
export const PaymentStatusEnum = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded',
])

export const PaymentResultSchema = z.object({
  id: z.string().optional(),
  status: z.string().optional(),
  email_address: z.string().optional(),
  pricePaid: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
})

export const PaymentSchema = z.object({
  method: z.string().min(1, 'Payment method is required'),
  status: PaymentStatusEnum.default('pending'),
  result: PaymentResultSchema.optional(),
  paidAt: z.date().optional(),
})

// Order status + history
export const OrderStatusEnum = z.enum([
  'success',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
])

export const OrderStatusHistorySchema = z.object({
  status: OrderStatusEnum,
  at: z.date(),
  note: z.string().optional(),
  by: z.string().optional(),
})

export const CancellationSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
  date: z.date().optional(),
})

export const ReturnRequestSchema = z.object({
  reason: z.string().min(1, 'Return reason is required'),
  date: z.date().optional(),
})

// Order
export const OrderInputSchema = z.object({
  user: z.union([
    MongoId,
    z.object({
      _id: z.string().optional(),
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
    }),
  ]),
  items: z
    .array(OrderItemSchema)
    .min(1, 'Order must contain at least one item'),
  shippingAddress: ShippingAddressSchema,
  payment: PaymentSchema,
  coupon: CouponSnapshotSchema.optional(),
  itemsPrice: Price('Items price'),
  shippingPrice: Price('Shipping price'),
  taxPrice: Price('Tax price'),
  totalPrice: Price('Total price'),
  expectedDeliveryDate: z
    .date()
    .refine(
      (value) => value > new Date(),
      'Expected delivery date must be in the future'
    ),
  status: OrderStatusEnum.default('success'),
  statusHistory: z.array(OrderStatusHistorySchema).default([]),
  cancellation: CancellationSchema.optional(),
  returnRequest: ReturnRequestSchema.optional(),
})
// Cart

export const CartSchema = z.object({
  items: z
    .array(CartItemSchema)
    .min(1, 'Order must contain at least one item'),
  itemsPrice: z.number(),
  taxPrice: z.optional(z.number()),
  shippingPrice: z.optional(z.number()),
  totalPrice: z.number(),
  paymentMethod: z.optional(z.string()),
  coupon: CouponSnapshotSchema.optional(),
  shippingAddress: z.optional(ShippingAddressSchema),
  expectedDeliveryDate: z.optional(z.date()),
})

// USER
const UserName = z
  .string()
  .min(2, { message: 'Username must be at least 2 characters' })
  .max(50, { message: 'Username must be at most 30 characters' })
const Email = z.string().min(1, 'Email is required').email('Email is invalid')
const Phone = z
  .string()
  .min(7, 'Phone number is invalid')
  .max(15, 'Phone number is invalid')
  .regex(/^\+?[0-9]+$/, 'Phone number is invalid')
const Otp = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^[0-9]{6}$/, 'OTP must contain only digits')
const UserRole = z.enum(USER_ROLES)

export const UserUpdateSchema = z.object({
  _id: MongoId,
  name: UserName,
  email: Email.optional(),
  role: UserRole,
})

export const UserProfileUpdateSchema = z.object({
  name: UserName,
  email: Email.optional(),
  profile: z.string().optional(),
})

export const UserInputSchema = z.object({
  name: UserName,
  email: Email.optional(),
  image: z.string().optional(),
  emailVerified: z.boolean().optional(),
  googleId: z.string().optional(),
  phone: Phone.optional(),
  phoneVerified: z.boolean().optional(),
  role: UserRole,
  paymentMethod: z.string().optional(),
  address: z
    .object({
      fullName: z.string().min(1, 'Full name is required'),
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      province: z.string().min(1, 'Province is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().min(1, 'Country is required'),
      phone: z.string().min(1, 'Phone number is required'),
    })
    .optional(),
})

export const UserOtpSendSchema = z.object({
  phone: Phone,
})

export const UserSignInSchema = z.object({
  phone: Phone,
  otp: Otp,
})

export const PhoneVerifySchema = z.object({
  phone: Phone,
  otp: Otp,
})

export const UserNameSchema = z.object({
  name: UserName,
})

// BLOG POST
export const BlogPostInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  image: z.string().min(1, 'Cover image is required'),
  category: MongoId,
  tags: z.array(z.string()).default([]),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  author: z.string().min(1, 'Author is required').default('Lemon Fashion'),
  status: ContentStatusSchema.default('draft'),
})

export const BlogPostUpdateSchema = BlogPostInputSchema.extend({
  _id: z.string(),
})

// CATEGORY
export const CategoryInputSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters'),
  type: z.enum(['product', 'blog']),
  description: z.string().max(300, 'Too long').default(''),
  imageUrl: z.string().default(''),
  status: ContentStatusSchema.default('public'),
})

export const CategoryUpdateSchema = CategoryInputSchema.extend({
  _id: z.string(),
})

// HOME BANNER
export const HomeBannerInputSchema = z.object({
  productId: MongoId,
  productSlug: z.string().min(1, 'Product slug is required'),
  bannerUrl: z.string().default(''),
  bannerType: z.enum(['Hero', 'Common']).default('Common'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  expireAt: z
    .preprocess(
      (v) => (v === '' || v === undefined ? null : v),
      z.union([z.coerce.date(), z.null()])
    )
    .default(null),
})

export const HomeBannerUpdateSchema = HomeBannerInputSchema.extend({
  _id: z.string(),
})


// WEBPAGE
export const WebPageInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  content: z.string().min(1, 'Content is required'),
  isPublished: z.boolean(),
})

export const WebPageUpdateSchema = WebPageInputSchema.extend({
  _id: z.string(),
})

// Setting

export const CarouselSchema = z.object({
  title: z.string().min(1, 'title is required'),
  url: z.string().min(1, 'url is required'),
  image: z.string().min(1, 'image is required'),
  buttonCaption: z.string().min(1, 'buttonCaption is required'),
})

export const PaymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  commission: z.coerce.number().min(0, 'Commission must be at least 0'),
})

export const DeliveryDateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  daysToDeliver: z.number().min(0, 'Days to deliver must be at least 0'),
  shippingPrice: z.coerce.number().min(0, 'Shipping price must be at least 0'),
  freeShippingMinPrice: z.coerce
    .number()
    .min(0, 'Free shipping min amount must be at least 0'),
})

export const SettingInputSchema = z.object({
  // PROMPT: create fields
  // codeium, based on the mongoose schema for settings
  common: z.object({
    pageSize: z.coerce
      .number()
      .min(1, 'Page size must be at least 1')
      .default(9),
    isMaintenanceMode: z.boolean().default(false),
    freeShippingMinPrice: z.coerce
      .number()
      .min(0, 'Free shipping min price must be at least 0')
      .default(0),
  }),
  site: z.object({
    name: z.string().min(1, 'Name is required'),
    logoWhite: z.string().min(1, 'White logo is required'),
    logoGreen: z.string().min(1, 'Green logo is required'),
    slogan: z.string().min(1, 'Slogan is required'),
    description: z.string().min(1, 'Description is required'),
    keywords: z.string().min(1, 'Keywords is required'),
    url: z.string().min(1, 'Url is required'),
    email: z.string().min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone is required'),
    whatsapp: z.string().optional(),
    author: z.string().min(1, 'Author is required'),
    copyright: z.string().min(1, 'Copyright is required'),
    address: z.string().min(1, 'Address is required'),
  }),
  carousels: z
    .array(CarouselSchema)
    .optional(),
  availablePaymentMethods: z
    .array(PaymentMethodSchema)
    .min(1, 'At least one payment method is required'),
  defaultPaymentMethod: z.string().min(1, 'Payment method is required'),
})

// FAQ
export const FaqInputSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters'),
  answer: z.string().min(3, 'Answer must be at least 3 characters'),
  is_public: z.boolean().default(true),
})

export const FaqUpdateSchema = FaqInputSchema.extend({
  _id: z.string(),
})

// COUPON
export const CouponInputSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .transform((code) => code.trim().toUpperCase()),
  value: z.coerce.number().min(1, 'Discount value must be at least 1'),
  status: z.enum(['Active', 'Inactive']),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a valid expiry date'),
  minAmount: z.coerce.number().min(0, 'Minimum amount must be 0 or more'),
})

export const CouponUpdateSchema = CouponInputSchema.extend({
  _id: z.string(),
})
