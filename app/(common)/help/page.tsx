import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  CreditCard,
  HelpCircle,
  Mail,
  MessageSquareText,
  Package,
  Phone,
  RefreshCw,
  Truck,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'
import HelpSearch, { type HelpTopic } from './help-search'

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Find answers about orders, shipping, returns, payments and your account. Search help topics or reach our support team.',
}

const categories = [
  {
    Icon: Package,
    title: 'Orders & Tracking',
    text: 'Place, track, modify or cancel an order and understand order statuses.',
    href: '/faq',
    keywords: 'order track status cancel my orders history invoice',
  },
  {
    Icon: Truck,
    title: 'Shipping & Delivery',
    text: 'Delivery timelines, shipping charges, free shipping and serviceable areas.',
    href: '/faq',
    keywords: 'shipping delivery timeline charges free shipping courier pincode',
  },
  {
    Icon: RefreshCw,
    title: 'Returns & Refunds',
    text: 'Return an item, check eligibility and know how long refunds take.',
    href: '/returns-policy',
    keywords: 'return refund exchange replace policy money back',
  },
  {
    Icon: CreditCard,
    title: 'Payments & Pricing',
    text: 'Payment methods, secure checkout, COD availability and coupons.',
    href: '/faq',
    keywords: 'payment cod cash on delivery card upi coupon discount secure checkout',
  },
  {
    Icon: UserRound,
    title: 'Account & Profile',
    text: 'Sign in, update details, manage addresses, wishlist and password.',
    href: '/faq',
    keywords: 'account profile login sign in address wishlist password email phone',
  },
  {
    Icon: HelpCircle,
    title: 'FAQs',
    text: 'Browse the most common questions asked by our customers.',
    href: '/faq',
    keywords: 'faq questions answers help common',
  },
]

const popularTopics: HelpTopic[] = [
  {
    title: 'How do I track my order?',
    description: 'See live status from your account under My Orders.',
    href: '/faq',
    keywords: 'track order shipping status delivery',
  },
  {
    title: 'How do I return or replace an item?',
    description: 'Start a return within the eligible timeframe.',
    href: '/returns-policy',
    keywords: 'return replace exchange refund policy',
  },
  {
    title: 'What payment methods can I use?',
    description: 'Cards, UPI, net banking and Cash on Delivery.',
    href: '/faq',
    keywords: 'payment card upi cod net banking methods',
  },
  {
    title: 'How long does delivery take?',
    description: 'Standard and express delivery timelines explained.',
    href: '/faq',
    keywords: 'delivery time days shipping express standard',
  },
  {
    title: 'How do I update my address?',
    description: 'Manage saved addresses from your account.',
    href: '/account/addresses',
    keywords: 'address update change saved delivery account',
  },
  {
    title: 'When will I get my refund?',
    description: 'Refund timelines after a return is approved.',
    href: '/returns-policy',
    keywords: 'refund money back timeline when',
  },
]

const steps = [
  {
    title: 'Browse & add to cart',
    text: 'Explore categories, compare products and add your favourites to the cart.',
  },
  {
    title: 'Checkout securely',
    text: 'Enter your shipping details and pick a payment method that suits you.',
  },
  {
    title: 'Track your order',
    text: 'Follow your parcel in real time from your account under My Orders.',
  },
  {
    title: 'Get help if needed',
    text: 'Not happy with something? Returns are simple and our team is one message away.',
  },
]

export default async function HelpPage() {
  const {
    site: { email, phone },
  } = await getSetting()

  return (
    <div className='w-full'>
      {/* Hero with search */}
      <section className='border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-gold/[0.12]'>
        <div className='mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16'>
          <p className='text-center text-xs font-semibold uppercase tracking-[0.28em] text-gold'>
            We&apos;re here to help
          </p>
          <h1 className='premium-title w-full mt-2 text-center text-3xl font-bold tracking-tight md:text-4xl'>
            Help Center
          </h1>
          <p className='mx-auto mt-3 max-w-2xl text-center text-muted-foreground md:text-lg'>
            Answers about orders, shipping, returns, payments and your account.
            Search a topic below or browse by category.
          </p>
          <HelpSearch topics={popularTopics} />
        </div>
      </section>

      {/* Categories */}
      <section className='mx-auto max-w-6xl px-4 py-12 md:px-8'>
        <h2 className='premium-title text-xl md:text-2xl'>Browse by topic</h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          Pick a category to jump straight to the help you need.
        </p>

        <div className='mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {categories.map(({ Icon, title, text, href }) => (
            <Link
              key={title}
              href={href}
              className='group card-hover flex h-full flex-col border border-border/60 bg-card p-6 shadow-soft hover:border-primary/30'
            >
              <span className='flex h-12 w-12 items-center justify-center rounded-circle bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white'>
                <Icon className='h-6 w-6' />
              </span>
              <h3 className='mt-4 text-base font-bold tracking-tight'>
                {title}
              </h3>
              <p className='mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground'>
                {text}
              </p>
              <span className='mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary'>
                Learn more
                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular topics + steps */}
      <section className='border-y border-border/60 bg-muted/30'>
        <div className='mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 md:px-8 lg:grid-cols-2 lg:gap-14 lg:py-16'>
          <div>
            <h2 className='premium-title text-xl md:text-2xl'>
              Popular questions
            </h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              The questions our customers ask the most.
            </p>
            <ul className='mt-6 divide-y divide-border/60 border border-border/60 bg-card'>
              {popularTopics.map((topic) => (
                <li key={topic.title}>
                  <Link
                    href={topic.href}
                    className='flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-primary/5'
                  >
                    <span>
                      <span className='block text-sm font-semibold'>
                        {topic.title}
                      </span>
                      <span className='mt-0.5 block text-xs text-muted-foreground'>
                        {topic.description}
                      </span>
                    </span>
                    <ArrowRight className='h-4 w-4 shrink-0 text-gold' />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className='premium-title text-xl md:text-2xl'>
              Getting started
            </h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              New here? Here is how shopping works, start to finish.
            </p>
            <ol className='mt-6 space-y-5'>
              {steps.map((step, index) => (
                <li key={step.title} className='flex gap-4'>
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-circle bg-primary font-display text-sm font-bold text-white'>
                    {index + 1}
                  </span>
                  <div>
                    <h3 className='text-sm font-bold tracking-tight'>
                      {step.title}
                    </h3>
                    <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className='mx-auto max-w-6xl px-4 py-14 md:px-8'>
        <div className='grid grid-cols-1 gap-8 border border-primary/20 bg-gradient-to-br from-primary to-[#243526] p-8 text-white md:grid-cols-2 md:items-center md:p-10'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-gold'>
              Need more help?
            </p>
            <h2 className='mt-2 text-2xl font-bold tracking-tight md:text-3xl'>
              Talk to our support team
            </h2>
            <p className='mt-3 max-w-md text-white/80'>
              Can&apos;t find what you need? We respond to every message within
              24 hours on business days.
            </p>
            <Button
              asChild
              size='lg'
              className='mt-6 rounded-circle bg-white px-7 text-white hover:bg-gold hover:text-[#0f0d0d]'
            >
              <Link href='/contact-us'>
                <MessageSquareText className='h-4 w-4' />
                Contact Us
              </Link>
            </Button>
          </div>

          <div className='space-y-3'>
            <a
              href={`mailto:${email}`}
              className='flex items-center gap-4 border border-white/15 bg-white/5 px-5 py-4 transition-colors hover:bg-white/10'
            >
              <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-circle bg-white/10 text-gold'>
                <Mail className='h-5 w-5' />
              </span>
              <span>
                <span className='block text-xs font-semibold uppercase tracking-[0.16em] text-white/60'>
                  Email
                </span>
                <span className='block font-semibold'>{email}</span>
              </span>
            </a>
            <a
              href={`tel:${phone}`}
              className='flex items-center gap-4 border border-white/15 bg-white/5 px-5 py-4 transition-colors hover:bg-white/10'
            >
              <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-circle bg-white/10 text-gold'>
                <Phone className='h-5 w-5' />
              </span>
              <span>
                <span className='block text-xs font-semibold uppercase tracking-[0.16em] text-white/60'>
                  Phone
                </span>
                <span className='block font-semibold'>{phone}</span>
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
