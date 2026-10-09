import { Data,  } from '@/types'

export const SENDER_NAME = process.env.SENDER_NAME || 'support'
export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev'

export const USER_ROLES = ['Admin', 'User']

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
      carousels: [
        {
          title: 'Most Popular Shoes For Sale',
          buttonCaption: 'Shop Now',
          image: '/images/banner3.jpg',
          url: '/search?category=Shoes',
        },
        {
          title: 'Best Sellers in T-Shirts',
          buttonCaption: 'Shop Now',
          image: '/images/banner1.jpg',
          url: '/search?category=T-Shirts',
        },
        {
          title: 'Best Deals on Wrist Watches',
          buttonCaption: 'See More',
          image: '/images/banner2.jpg',
          url: '/search?category=Wrist Watches',
        },
      ],
      availablePaymentMethods: [
        { name: 'PayPal', commission: 0 },
        { name: 'Stripe', commission: 0 },
        { name: 'Cash On Delivery', commission: 0 },
      ],
      defaultPaymentMethod: 'PayPal',
      availableDeliveryDates: [
        {
          name: 'Tomorrow',
          daysToDeliver: 1,
          shippingPrice: 12.9,
          freeShippingMinPrice: 0,
        },
        {
          name: 'Next 3 Days',
          daysToDeliver: 3,
          shippingPrice: 6.9,
          freeShippingMinPrice: 0,
        },
        {
          name: 'Next 5 Days',
          daysToDeliver: 5,
          shippingPrice: 4.9,
          freeShippingMinPrice: 35,
        },
      ],
      defaultDeliveryDate: 'Next 5 Days',
    },
  ],
}

export default data
