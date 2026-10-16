import { Data,  } from '@/types'

export const SENDER_NAME = process.env.SENDER_NAME || 'support'
export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev'

export { USER_ROLES } from '@/lib/roles'

export const FREE_SHIPPING_MIN_PRICE = 999
export const SHIPPING_PRICE = 49
export const TAX_RATE = 0.05
export const DELIVERY_DAYS = 7

const data: Data = {
 
  headerMenus: [
    {
      name: "Today's Deal",
      href: '/search?tag=todays-deal',
    },
    {
      name: 'New Arrivals',
      href: '/search?tag=new-arrival',
    },
    // {
    //   name: 'Featured Products',
    //   href: '/search?tag=featured',
    // },
    // {
    //   name: 'Best Sellers',
    //   href: '/search?tag=best-seller',
    // },
   
    // {
    //   name: 'About Us',
    //   href: '/about-us',
    // },
    // {
    //   name: 'Contact Us',
    //   href: '/contact-us',
    // },
  ],
 
  settings: [
    {
      common: {
        freeShippingMinPrice: 35,
        isMaintenanceMode: false,
        pageSize: 9,
      },
      site: {
        name: 'Lemon Fashion',
        description:
          'Lemon Fashion is a modern beauty & fashion e-commerce platform. Curated styles, timeless elegance.',
        keywords: 'Lemon Fashion, Beauty, Fashion, Clothing, Accessories, Ecommerce',
        url: 'https://lemonfashion.com',
        logoWhite: '/logo-white.png',
        logoGreen: '/logo-green.png',
        slogan: 'Elegance in every detail.',
        author: 'Lemon Fashion',
        copyright: '2000-2025, Lemon Fashion. All rights reserved.',
        email: 'admin@example.com',
        address: '123, Main Street, Anytown, CA, Zip 12345',
        phone: '+1 (123) 456-7890',
        whatsapp: '9217205968',
      },
  
      availablePaymentMethods: [
        { name: 'Razorpay', commission: 15 },
        { name: 'Cash On Delivery', commission: 0 },
      ],
      defaultPaymentMethod: 'Razorpay',
    },
  ],
}

export default data
