import { BadgeCheck, Hammer, Heart, MapPin } from 'lucide-react'

const usps = [
  {
    Icon: Hammer,
    title: 'Skilled Artisans',
    accent: 'bg-primary/10 text-primary',
  },
  {
    Icon: Heart,
    title: 'Handmade With Love',
    accent: 'bg-gold/15 text-gold',
  },
  {
    Icon: MapPin,
    title: 'Made In India',
    accent: 'bg-primary/10 text-primary',
  },
  {
    Icon: BadgeCheck,
    title: 'Quality Assured',
    accent: 'bg-gold/15 text-gold',
  },
]

export default function OurUsps() {
  return (
    <section className=''>
      <div className='mx-auto max-w-6xl px-4 py-10 md:px-8'>
        <div className='text-center'>
          <p className='text-xs font-semibold uppercase tracking-[0.28em] text-gold'>
            Why shop with us
          </p>
          <h2 className='premium-title mt-2 text-2xl md:text-3xl'>
            Our USP&apos;s
          </h2>
        </div>

        <div className='mt-8 grid grid-cols-2 gap-6 md:grid-cols-4'>
          {usps.map(({ Icon, title, accent }) => (
            <div
              key={title}
              className='group flex flex-col items-center gap-3 text-center'
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-circle transition-transform duration-300 group-hover:scale-110 ${accent}`}
              >
                <Icon className='h-7 w-7' />
              </span>
              <h3 className='text-sm font-bold tracking-tight md:text-base'>
                {title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
