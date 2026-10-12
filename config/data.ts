import { Data,  } from '@/types'

export const SENDER_NAME = process.env.SENDER_NAME || 'support'
export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev'

export const USER_ROLES = ['Admin', 'User']

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
        name: 'Ishkaara',
        description:
          'Ishkaara is a modern beauty & fashion e-commerce platform. Curated styles, timeless elegance.',
        keywords: 'Ishkaara, Beauty, Fashion, Clothing, Accessories, Ecommerce',
        url: 'https://ishkaara.com',
        logo: '/logo.avif',
        slogan: 'Elegance in every detail.',
        author: 'Ishkaara',
        copyright: '2000-2025, Ishkaara. All rights reserved.',
        email: 'admin@example.com',
        address: '123, Main Street, Anytown, CA, Zip 12345',
        phone: '+1 (123) 456-7890',
      },
  
      availablePaymentMethods: [
        { name: 'PayPal', commission: 0 },
        { name: 'Stripe', commission: 0 },
        { name: 'Cash On Delivery', commission: 0 },
      ],
      defaultPaymentMethod: 'PayPal',
    },
  ],
}

export default data
