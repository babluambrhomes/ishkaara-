import type { Metadata } from 'next'
import Image from 'next/image'
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react'

import ContactForm from '@/components/shared/contact-form'
import { getSetting } from '@/lib/actions/setting.actions'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Lemon Fashion team. We are here to help with orders, products, returns and feedback.',
}

const socialLinks = [
  { Icon: Facebook, label: 'Facebook' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Youtube, label: 'YouTube' },
]

export default async function ContactUsPage() {
  const {
    site: { email, phone, address, name },
  } = await getSetting()

  const infoCards = [
    {
      Icon: Mail,
      title: 'Email Us',
      value: email,
      sub: 'We reply within 24 hours.',
    },
    {
      Icon: Phone,
      title: 'Call Us',
      value: phone,
      sub: 'Mon–Fri, 9 AM – 6 PM.',
    },
    {
      Icon: Clock,
      title: 'Support Hours',
      value: '9:00 AM – 6:00 PM',
      sub: 'Monday to Friday · Live chat & email',
    },
    {
      Icon: MapPin,
      title: 'Visit Us',
      value: address,
      sub: 'Find us on the map below.',
    },
  ]

  return (
    <div className='w-full  py-8 px-3'>
      <div className='relative h-56 overflow-hidden rounded-2xl shadow-soft md:h-72'>
        <Image
          src='/images/banner1.jpg'
          alt='Contact us'
          fill
          priority
          sizes='100vw'
          className='object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-transparent' />
        <div className='absolute inset-0 flex items-center px-8 md:px-12'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-[#f0d9a8]'>
              Get in touch
            </p>
            <h1 className='mt-2 text-3xl font-bold tracking-tight text-white md:text-5xl'>
              Contact Us
            </h1>
            <p className='mt-3 text-white/85'>
              We&apos;d love to hear from you. Questions about an order, a
              product, or returns? Our customer care team is here to help.
            </p>
          </div>
        </div>
      </div>

      <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {infoCards.map(({ Icon, title, value, sub }) => (
          <div
            key={title}
            className='rounded-2xl border border-border/60 bg-card p-5 shadow-soft'
          >
            <div className='mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10'>
              <Icon className='h-5 w-5 text-primary' />
            </div>
            <h2 className='text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
              {title}
            </h2>
            <p className='mt-1 font-semibold leading-snug'>{value}</p>
            <p className='mt-1 text-sm text-muted-foreground'>{sub}</p>
          </div>
        ))}
      </div>

      <div className='mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <ContactForm />

        <div className='space-y-6'>
          <div className='overflow-hidden rounded-2xl border border-border/60 shadow-soft'>
            <iframe
              title={`${name} location map`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              className='h-80 w-full'
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
            />
          </div>

          <div className='rounded-2xl border border-border/60 bg-card p-5 shadow-soft'>
            <h2 className='text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
              Follow us
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Stay updated on new arrivals, deals and behind-the-scenes.
            </p>
            <div className='mt-4 flex items-center gap-2'>
              {socialLinks.map(({ Icon, label }) => (
                <a
                  key={label}
                  href='#'
                  aria-label={label}
                  className='flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-white text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-lift'
                >
                  <Icon className='h-4 w-4' />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}