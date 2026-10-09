import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Heart, Shirt, Target, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'
import { TiptapContent } from '@/components/editor/tiptap-content'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Discover the story behind Ishkaara — our mission, vision and the values that drive every order we deliver.',
}

const values = [
  {
    Icon: Target,
    title: 'Our Mission',
    text: 'To make quality products accessible to everyone with a seamless, trusted and delightful shopping experience.',
  },
  {
    Icon: Eye,
    title: 'Our Vision',
    text: 'To become the go-to destination for value, variety and service that shoppers love and recommend.',
  },
  {
    Icon: Heart,
    title: 'Our Values',
    text: 'Customers first, innovation always, and integrity in everything we sell and do.',
  },
]

const stats = [
  { value: '500+', label: 'Curated Products' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '12+', label: 'Years of Excellence' },
  { value: '24/7', label: 'Customer Support' },
]

export default async function AboutUsPage() {
  const {
    site: { name, slogan },
  } = await getSetting()

  return (
    <div className='w-full  py-8 px-3'>
      <div className='relative h-56 overflow-hidden rounded-2xl shadow-soft md:h-72'>
        <Image
          src='/images/banner2.jpg'
          alt='About us'
          fill
          priority
          sizes='100vw'
          className='object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-transparent' />
        <div className='absolute inset-0 flex items-center px-8 md:px-12'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-[#f0d9a8]'>
              Our story
            </p>
            <h1 className='mt-2 text-3xl font-bold tracking-tight text-white md:text-5xl'>
              About Us
            </h1>
            <p className='mt-3 text-white/85'>{slogan}</p>
          </div>
        </div>
      </div>

      <div className='mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2'>
        <div className='relative overflow-hidden rounded-2xl shadow-soft'>
          <Image
            src='/images/wrist-watches.jpg'
            alt='Ishkaara collection'
            width={640}
            height={480}
            sizes='(min-width: 1024px) 40vw, 100vw'
            className='h-full w-full object-cover'
          />
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>
            Who we are
          </p>
          <h2 className='mt-2 text-2xl font-bold tracking-tight md:text-3xl'>
            Welcome to {name}
          </h2>
          <div className='mt-4 text-justify text-lg leading-relaxed web-page-content'>
            <TiptapContent
              html={`<p>Welcome to <strong>Ishkaara</strong>, your trusted destination for quality products and exceptional service.</p>

<p>Our journey began with a mission to bring you the best shopping experience by offering a wide range of products at competitive prices, all in one convenient platform.</p>

<p>At Ishkaara, we prioritize customer satisfaction and innovation. Our team works tirelessly to curate a diverse selection of items, from everyday essentials to exclusive deals, ensuring there's something for everyone. We also make your shopping experience seamless with fast shipping, secure payments, and excellent customer support.</p>

<p>As we continue to grow, our commitment to quality and service remains unwavering. Thank you for choosing Ishkaara - we look forward to being a part of your journey and delivering value every step of the way.</p>`}
            />
          </div>
        </div>
      </div>

      <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-3'>
        {values.map(({ Icon, title, text }) => (
          <div
            key={title}
            className='rounded-2xl border border-border/60 bg-card p-6 shadow-soft'
          >
            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
              <Icon className='h-6 w-6 text-primary' />
            </div>
            <h3 className='text-lg font-bold tracking-tight'>{title}</h3>
            <p className='mt-2 text-muted-foreground'>{text}</p>
          </div>
        ))}
      </div>

      <div className='mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-[#930202] to-[#560101] p-8 shadow-soft md:p-10'>
        <div className='grid grid-cols-2 gap-8 text-center lg:grid-cols-4'>
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className='text-3xl font-bold tracking-tight text-[#f0d9a8] md:text-4xl'>
                {stat.value}
              </p>
              <p className='mt-1 text-sm font-medium text-white/80 uppercase tracking-wider'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className='mt-12 flex flex-col items-center gap-6 rounded-2xl border border-border/60 bg-card p-8 text-center shadow-soft md:flex-row md:justify-between md:text-left'>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to find something you&apos;ll love?
          </h2>
          <p className='mt-2 flex items-center justify-center gap-2 text-muted-foreground md:justify-start'>
            <Shirt className='h-4 w-4' />
            Explore new arrivals, deals and best sellers.
          </p>
        </div>
        <div className='flex flex-col items-center gap-3 sm:flex-row'>
          <Button asChild className='rounded-full px-8'>
            <Link href='/search'>Shop Now</Link>
          </Button>
          <Button asChild variant='outline' className='rounded-full px-8'>
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