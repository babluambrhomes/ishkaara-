import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Award,
  BadgeCheck,
  CreditCard,
  Eye,
  Gem,
  HandHeart,
  Heart,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Target,
  Truck,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'
import { TiptapContent } from '@/components/editor/tiptap-content'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Discover the story behind our store — our mission, vision, journey and the values that drive every order we deliver.',
}

const stats = [
  { value: '500+', label: 'Curated Products' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '12+', label: 'Years of Excellence' },
  { value: '4.8/5', label: 'Average Rating' },
]

const pillars = [
  {
    Icon: Target,
    title: 'Our Mission',
    text: 'To make quality products accessible to everyone with a seamless, trusted and delightful shopping experience — from the first click to the final delivery.',
  },
  {
    Icon: Eye,
    title: 'Our Vision',
    text: 'To become the go-to destination for value, variety and service that shoppers love, trust and happily recommend to friends and family.',
  },
  {
    Icon: Heart,
    title: 'Our Values',
    text: 'Customers first, innovation always, and integrity in everything we sell and do. No shortcuts, no surprises — just honest value.',
  },
]

const features = [
  {
    Icon: Truck,
    title: 'Fast & Reliable Shipping',
    text: 'Orders dispatched within 24 hours and delivered across the country with real-time tracking on every parcel.',
  },
  {
    Icon: ShieldCheck,
    title: 'Secure Payments',
    text: 'Multiple safe payment options including cards, UPI and Cash on Delivery, protected by encrypted checkout.',
  },
  {
    Icon: RefreshCw,
    title: 'Easy Returns',
    text: 'A simple, no-hassle return process so you can shop with complete confidence and peace of mind.',
  },
]

const journey = [
  {
    year: '2013',
    title: 'The Beginning',
    text: 'We started as a small curated store with a simple idea — offer honest products at honest prices.',
  },
  {
    year: '2017',
    title: 'Going Digital',
    text: 'Launched our first online store and began shipping to customers far beyond our home city.',
  },
  {
    year: '2021',
    title: 'Growing Family',
    text: 'Crossed 25,000 happy customers and expanded our catalogue into fashion, watches and accessories.',
  },
  {
    year: '2026',
    title: 'Today',
    text: 'A trusted marketplace serving 50,000+ shoppers with 500+ curated products and counting.',
  },
]



const promises = [
  { Icon: BadgeCheck, text: '100% genuine products' },
  { Icon: PackageCheck, text: 'Quality checked before dispatch' },
  { Icon: CreditCard, text: 'Safe & encrypted checkout' },
  { Icon: HandHeart, text: 'Customer-first service' },
  { Icon: Award, text: 'Only trusted brands' },
]

export default async function AboutUsPage() {
  const {
    site: { name, slogan },
  } = await getSetting()

  const storyHtml = `<p>Welcome to <strong>${name}</strong>, your trusted destination for quality products and exceptional service.</p>

<p>Our journey began with a mission to bring you the best shopping experience by offering a wide range of products at competitive prices, all in one convenient platform.</p>

<p>We prioritise customer satisfaction and innovation. Our team works tirelessly to curate a diverse selection of items, from everyday essentials to exclusive deals, ensuring there is something for everyone. Fast shipping, secure payments and excellent support keep the whole experience seamless.</p>

<p>As we continue to grow, our commitment to quality and service remains unwavering. Thank you for choosing ${name} — we look forward to being a part of your journey and delivering value every step of the way.</p>`

  return (
    <div className='w-full px-3 py-8'>
      {/* Hero */}
      <div className='relative h-64 overflow-hidden md:h-80'>
        <Image
          src='/images/Luxe_Fest_Main_Banner_Web_0065511ae5.avif'
          alt={`About ${name}`}
          fill
          priority
          sizes='100vw'
          className='object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/20' />
        <div className='absolute inset-0 flex items-center px-6 md:px-12'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-[#d4d4d8]'>
              Our Story
            </p>
            <h1 className='mt-2 text-3xl font-bold tracking-tight text-white md:text-5xl'>
              About {name}
            </h1>
            <p className='mt-3 text-white/85'>{slogan}</p>
          
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='mt-6 grid grid-cols-2 gap-px overflow-hidden border border-border/60 bg-border/60 lg:grid-cols-4'>
        {stats.map((stat) => (
          <div key={stat.label} className='bg-card px-6 py-7 text-center'>
            <p className='font-display text-3xl font-bold tracking-tight text-primary md:text-4xl'>
              {stat.value}
            </p>
            <p className='mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Who we are */}
      <div className='mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14'>
        <div className='relative overflow-hidden shadow-soft'>
          <Image
            src='/images/watch_main_banners_web_156a722ff3.avif'
            alt={`${name} collection`}
            width={720}
            height={540}
            sizes='(min-width: 1024px) 45vw, 100vw'
            className='h-full w-full object-cover'
          />
          <div className='absolute bottom-0 left-0 flex items-center gap-3 bg-primary px-5 py-4 text-primary-foreground'>
            <Gem className='h-5 w-5 text-gold' />
            <span className='text-sm font-semibold uppercase tracking-[0.14em]'>
              Curated with care
            </span>
          </div>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>
            Who We Are
          </p>
          <h2 className='premium-title mt-2 text-2xl md:text-3xl'>
            Welcome to {name}
          </h2>
          <div className='web-page-content mt-4 text-justify text-base leading-relaxed md:text-lg'>
            <TiptapContent html={storyHtml} />
          </div>
          <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {promises.map(({ Icon, text }) => (
              <div key={text} className='flex items-center gap-2.5'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-circle bg-primary/10 text-primary'>
                  <Icon className='h-4 w-4' />
                </span>
                <span className='text-sm font-medium'>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission / Vision / Values */}
      <div className='mt-16 grid grid-cols-1 gap-6 md:grid-cols-3'>
        {pillars.map(({ Icon, title, text }) => (
          <div
            key={title}
            className='card-hover h-full border border-border/60 bg-card p-7 shadow-soft'
          >
            <div className='flex h-12 w-12 items-center justify-center rounded-circle bg-gradient-to-br from-primary to-[#5c7d5d] text-white'>
              <Icon className='h-6 w-6' />
            </div>
            <h3 className='mt-5 text-lg font-bold tracking-tight'>{title}</h3>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* Why choose us */}
      <div className='mt-16 text-center'>
        <p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>
          Why Choose Us
        </p>
        <h2 className='premium-title mt-2 text-2xl md:text-3xl'>
          A Shopping Experience You Can Trust
        </h2>
        <p className='mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base'>
          From browsing to delivery, every step is designed around you. Here is
          what makes shopping with {name} different.
        </p>
      </div>
      <div className='mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {features.map(({ Icon, title, text }) => (
          <div
            key={title}
            className='card-hover h-full border border-border/60 bg-card p-6 shadow-soft'
          >
            <span className='flex h-11 w-11 items-center justify-center rounded-circle bg-gold/15 text-[#8a6a2f]'>
              <Icon className='h-5 w-5' />
            </span>
            <h3 className='mt-4 text-base font-bold tracking-tight'>{title}</h3>
            <p className='mt-1.5 text-sm leading-relaxed text-muted-foreground'>
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* Journey */}
      <div className='mt-16 overflow-hidden bg-gradient-to-br from-[#344c35] to-[#243526] p-8 md:p-12'>
        <div className='text-center'>
          <p className='text-xs font-semibold uppercase tracking-[0.28em] text-gold'>
            Our Journey
          </p>
          <h2 className='mt-2 font-display text-2xl font-bold tracking-tight text-white md:text-3xl'>
            Milestones Along The Way
          </h2>
        </div>
        <div className='mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {journey.map((item) => (
            <div key={item.year} className='relative border-l border-white/15 pl-5'>
              <span className='absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-circle bg-gold' />
              <p className='font-display text-2xl font-bold text-gold'>
                {item.year}
              </p>
              <h3 className='mt-1 font-semibold text-white'>{item.title}</h3>
              <p className='mt-1.5 text-sm leading-relaxed text-white/70'>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      

      {/* CTA */}
      <div className='mt-16 flex flex-col items-center gap-6 border border-border/60 bg-card p-8 text-center shadow-soft md:flex-row md:justify-between md:p-10 md:text-left'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Ready to find something you&apos;ll love?
          </h2>
          <p className='mt-2 flex items-center justify-center gap-2 text-muted-foreground md:justify-start'>
            <Shirt className='h-4 w-4 text-primary' />
            Explore new arrivals, deals and best sellers.
          </p>
        </div>
        <div className='flex flex-col items-center gap-3 sm:flex-row'>
          <Button asChild className='rounded-circle px-8'>
            <Link href='/search'>Shop Now</Link>
          </Button>
          <Button
            asChild
            variant='outline'
            className='rounded-circle px-8'
          >
            <Link href='/contact-us'>
              <Users className='h-4 w-4' />
              Talk to Us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
