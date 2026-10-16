'use client'
import {
  ChevronUp,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import useSettingStore from '@/hooks/use-setting-store'
import NewsletterForm from './newsletter-form'

const socialLinks = [
  { Icon: Facebook, label: 'Facebook' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Youtube, label: 'YouTube' },
]

const footerLinkClass =
  'inline-block text-sm text-white/85 transition-all duration-200 hover:translate-x-1 hover:text-white'

export default function Footer() {
  const {
    setting: { site },
  } = useSettingStore()

  return (
    <footer className='bg-gradient-to-b from-[#243526] to-[#1a261b] text-white'>
      <div className='w-full'>
        <Button
          variant='ghost'
          className='w-full rounded-none bg-white/10 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-white/20 hover:text-white'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          Back to top
        </Button>

        <div className=' px-3 py-8'>
          <div className='grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4'>
            <div>
              <Image
                src={site.logoWhite}
                alt={`${site.name} logo`}
                width={96}
                height={48}
                className='h-auto w-24'
                style={{ maxWidth: '100%', objectFit: 'contain' }}
              />
              <p className='mt-4 line-clamp-3 text-sm leading-relaxed text-white/70'>
                {site.description}
              </p>
              <div className='mt-5 flex items-center gap-2'>
                {socialLinks.map(({ Icon, label }) => (
                  <a
                    key={label}
                    href='#'
                    aria-label={label}
                    className='flex h-9 w-9 items-center justify-center rounded-circle bg-white/10 text-white/85 transition-all duration-200 hover:bg-gold hover:text-[#0f0d0d] '
                  >
                    <Icon className='h-4 w-4' />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className='mb-5 border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d4d4d8]'>
                Shop
              </h3>
              <ul className='space-y-2.5'>
                <li>
                  <Link href='/search?tag=todays-deal' className={footerLinkClass}>
                    Today&apos;s Deals
                  </Link>
                </li>
                <li>
                  <Link href='/search?tag=new-arrival' className={footerLinkClass}>
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href='/search?tag=best-seller' className={footerLinkClass}>
                    Best Sellers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='mb-5 border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d4d4d8]'>
                Company
              </h3>
              <ul className='space-y-2.5'>
                <li>
                  <Link href='/about-us' className={footerLinkClass}>
                    About {site.name}
                  </Link>
                </li>
                <li>
                  <Link href='/blog' className={footerLinkClass}>
                    Our Blog
                  </Link>
                </li>
                <li>
                  <Link href='/contact-us' className={footerLinkClass}>
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href='/testimonials' className={footerLinkClass}>
                    Testimonials &amp; Reviews
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='mb-5 border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d4d4d8]'>
                Let Us Help You
              </h3>
              <ul className='space-y-2.5'>
                <li>
                  <Link href='/faq' className={footerLinkClass}>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href='/help' className={footerLinkClass}>
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href='/returns-policy' className={footerLinkClass}>
                    Returns &amp; Replacements
                  </Link>
                </li>
              </ul>
              <ul className='mt-5 space-y-2.5 border-t border-white/10 pt-4'>
                <li className='flex items-start gap-2 text-sm text-white/70'>
                  <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-[#d4d4d8]' />
                  {site.address}
                </li>
                <li className='flex items-center gap-2 text-sm text-white/70'>
                  <Phone className='h-4 w-4 shrink-0 text-[#d4d4d8]' />
                  {site.phone}
                </li>
                <li className='flex items-center gap-2 text-sm text-white/70'>
                  <Mail className='h-4 w-4 shrink-0 text-[#d4d4d8]' />
                  {site.email}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='border-t border-white/10 bg-white/[0.04]'>
          <div className=' px-3 py-8 flex  flex-col items-center justify-between gap-6 md:flex-row '>
            <div className='text-center md:text-left'>
              <h3 className='text-2xl font-bold tracking-tight'>
                Join the {site.name} list
              </h3>
              <p className='mt-1 text-sm text-white/70'>
                Exclusive deals, new arrivals and style inspiration. No spam,
                ever.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className='border-t border-white/10'>
          <div className='flex flex-col items-center justify-between gap-4  px-3 py-8 md:flex-row '>
            <Image
              src={site.logoWhite}
              alt={`${site.name} logo`}
              width={56}
              height={32}
              className='h-auto w-16'
              style={{ maxWidth: '100%', objectFit: 'contain' }}
            />
            <p className='text-sm text-white/70'> &copy; {site.copyright}</p>
            <div className='flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm'>
              <Link
                href='/terms-and-conditions'
                className='text-white/85 transition-colors hover:text-white'
              >
                Terms &amp; Conditions
              </Link>
              <span className='text-white/30'>|</span>
              <Link
                href='/privacy-policy'
                className='text-white/85 transition-colors hover:text-white'
              >
                Privacy Policy
              </Link>
              <span className='text-white/30'>|</span>
              <Link
                href='/help'
                className='text-white/85 transition-colors hover:text-white'
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
