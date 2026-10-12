import {
  AddressSchema,
  BlogPostInputSchema,
  CarouselSchema,
  CartSchema,
  DeliveryDateSchema,
  OrderInputSchema,
  OrderItemSchema,
  PaymentMethodSchema,
  ProductInputSchema,
  ProductVariantSchema,
  ReviewInputSchema,
  SettingInputSchema,
  ShippingAddressSchema,
  UserInputSchema,
  UserNameSchema,
  UserOtpSendSchema,
  UserSignInSchema,
  WebPageInputSchema,
} from '@/lib/validator'
import { z } from 'zod'

export type IReviewInput = z.infer<typeof ReviewInputSchema>
export type IReviewDetails = IReviewInput & {
  _id: string
  createdAt: string
  user: {
    name: string
  }
}
export type IProductInput = z.infer<typeof ProductInputSchema>
export type IProductVariant = z.infer<typeof ProductVariantSchema> & {
  _id?: string
}

// Product shape returned to the storefront: the full document plus the
// flattened fields of the selected (or primary/first) variant, so existing
// cards/sliders can keep reading `price`, `images`, `countInStock`, etc.
export type IProductDisplay = Omit<IProductInput, 'variants'> & {
  _id: string
  categoryName: string
  variants: IProductVariant[]
  price: number
  listPrice: number
  images: string[]
  countInStock: number
  size?: string[]
  variantId?: string
  primaryVariant?: IProductVariant
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type Data = {
  settings: ISettingInput[]
 
  headerMenus: {
    name: string
    href: string
  }[]

}
// Order
export type IOrderInput = z.infer<typeof OrderInputSchema>
export type IOrderList = IOrderInput & {
  _id: string
  user: {
    name: string
    email: string
  }
  createdAt: Date
}
export type OrderItem = z.infer<typeof OrderItemSchema>
export type CartItem = OrderItem & { variantId?: string }
export type Cart = Omit<z.infer<typeof CartSchema>, 'items'> & {
  items: CartItem[]
}
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>
export type IAddress = z.infer<typeof AddressSchema>
export type IAddressWithId = IAddress & { _id: string }

// user
export type IUserInput = z.infer<typeof UserInputSchema>
export type IUserSignIn = z.infer<typeof UserSignInSchema>
export type IUserOtpSend = z.infer<typeof UserOtpSendSchema>
export type IUserName = z.infer<typeof UserNameSchema>

// webpage
export type IWebPageInput = z.infer<typeof WebPageInputSchema>

// blog post
export type IPostInput = z.infer<typeof BlogPostInputSchema>
export type IPostUpdate = IPostInput & { _id: string }

// setting
export type ICarousel = z.infer<typeof CarouselSchema>
export type ISettingInput = z.infer<typeof SettingInputSchema>
export type ClientSetting = ISettingInput
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type DeliveryDate = z.infer<typeof DeliveryDateSchema>
