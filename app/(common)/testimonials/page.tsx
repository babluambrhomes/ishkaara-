import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Testimonials & Reviews',
  description:
    'See what our customers say about shopping with Lemon Fashion.',
}

const testimonials = [
  {
    name: 'Aarav Mehta',
    location: 'Mumbai',
    rating: 5,
    text: 'The quality is amazing and delivery was faster than expected. Lemon Fashion has become my go-to store for everything.',
  },
  {
    name: 'Sophia Bennett',
    location: 'London',
    rating: 5,
    text: 'Beautiful products and a seamless checkout experience. Customer support answered all my questions within minutes.',
  },
  {
    name: 'Daniel Kim',
    location: 'New York',
    rating: 4,
    text: 'Great selection and fair prices. Returns were hassle-free when I needed a different size. Highly recommend.',
  },
  {
    name: 'Priya Sharma',
    location: 'Delhi',
    rating: 5,
    text: 'I love how easy it is to browse and compare products. My orders always arrive neatly packed and on time.',
  },
  {
    name: 'Emma Wilson',
    location: 'Sydney',
    rating: 5,
    text: 'The deals are genuinely worth it. I have recommended Lemon Fashion to all my friends and family.',
  },
  {
    name: 'Lucas Ferreira',
    location: 'Sao Paulo',
    rating: 5,
    text: 'Exceptional service from start to finish. The free shipping threshold is easy to reach and always reliable.',
  },
]

export default function TestimonialsPage() {
  return (
    <div className='mx-auto w-full max-w-4xl p-4'>
      <h1 className='h1-bold py-4'>Testimonials & Reviews</h1>
      <p className='text-lg mb-6'>
        Real words from real customers. Your satisfaction drives everything we
        do at Lemon Fashion.
      </p>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {testimonials.map((t) => (
          <Card key={t.name} className='rounded-none'>
            <CardContent className='p-6'>
              <div className='flex gap-1 mb-3'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < t.rating
                        ? 'h-5 w-5 fill-primary text-primary'
                        : 'h-5 w-5 text-muted-foreground'
                    }
                  />
                ))}
              </div>
              <p className='text-foreground'>&ldquo;{t.text}&rdquo;</p>
              <div className='mt-4'>
                <p className='font-bold'>{t.name}</p>
                <p className='text-sm text-muted-foreground'>{t.location}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}