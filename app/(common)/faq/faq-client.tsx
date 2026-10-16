'use client'

import { ChevronDown, Mail, Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IFaq } from '@/lib/models/faq.model'

export default function FaqClient({ initialFaqs }: { initialFaqs: IFaq[] }) {
  const [query, setQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return initialFaqs
    return initialFaqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    )
  }, [query, initialFaqs])

  const toggle = (index: number) =>
    setOpenIndex((current) => (current === index ? null : index))

  return (
    <div>
      {/* Hero / header band with search */}
      <div className='border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-gold/[0.12]'>
        <div className='mx-auto max-w-3xl px-4 py-10 md:px-8 lg:px-12 md:py-14'>
          <p className='mb-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold'>
            We&apos;re here to help
          </p>
          <h1 className='premium-title text-center text-3xl font-bold tracking-tight lg:text-4xl'>
            Frequently Asked Questions
          </h1>
          <p className='mx-auto mt-3 max-w-xl text-center text-muted-foreground'>
            Quick answers to the questions we get asked the most. Can&apos;t find
            what you&apos;re looking for? Just search below.
          </p>

          <div className='relative mx-auto mt-6 max-w-xl'>
            <Search className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpenIndex(null)
              }}
              placeholder='Search a question... e.g. shipping, return, payment'
              className='h-13 rounded-full border-border/70 pl-12 py-3.5 text-base  focus-visible:ring-gold/60'
            />
          </div>
        </div>
      </div>

      {/* FAQ accordion */}
      <div className='mx-auto max-w-3xl px-4 py-10 md:px-8 lg:px-12'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-sm font-bold uppercase tracking-[0.16em] text-primary'>
            {filtered.length} {filtered.length === 1 ? 'question' : 'questions'}
          </h2>
          {query && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setQuery('')}
              className='text-muted-foreground hover:text-primary'
            >
              Clear search
            </Button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className='space-y-4'>
            {filtered.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={faq._id ? String(faq._id) : faq.question}
                  className={`overflow-hidden rounded-2xl border bg-background transition-all duration-300 ${
                    isOpen
                      ? 'border-primary/40 '
                      : 'border-border/60  '
                  }`}
                >
                  <button
                    type='button'
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className='flex w-full items-center justify-between gap-4 px-5 py-4 text-left'
                  >
                    <span className='text-base font-semibold tracking-tight'>
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-gold transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className='border-t border-border/50 px-5 py-4 text-[15px] leading-relaxed text-muted-foreground whitespace-pre-wrap'>
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className='rounded-2xl border border-dashed border-border/70 py-16 text-center'>
            <Search className='mx-auto h-10 w-10 text-muted-foreground/40' />
            <h3 className='mt-3 text-lg font-semibold'>No answers found</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Try a different keyword, or reach out to our support team below.
            </p>
            <Button
              variant='outline'
              className='mt-5 rounded-full'
              onClick={() => setQuery('')}
            >
              Show all questions
            </Button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className='px-4 pb-12 md:px-8 lg:px-12'>
        <div className='mx-auto max-w-3xl overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-[#243526] text-white '>
          <div className='flex flex-col items-center gap-4 px-6 py-10 text-center md:px-10'>
            <Mail className='h-8 w-8 text-gold' />
            <h2 className='text-2xl font-bold tracking-tight'>
              Didn&apos;t solve your query?
            </h2>
            <p className='max-w-md text-white/80'>
              Our support team is here to help. Reach out to us and we&apos;ll
              get back to you as soon as possible.
            </p>
            <Button asChild size='lg' className='rounded-full text-white hover:bg-gold '>
              <Link href='/contact-us'>Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
