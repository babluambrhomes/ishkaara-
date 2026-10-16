'use client'

import { Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const NewsletterFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(100, 'Email must be at most 100 characters')
    .email('Please enter a valid email address'),
})

type NewsletterFormValues = z.infer<typeof NewsletterFormSchema>

export default function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState('')

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(NewsletterFormSchema),
    defaultValues: {
      email: '',
    },
  })

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
    reset,
  } = form

  const onSubmit = async (values: NewsletterFormValues) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      })
      const data = await res.json()
      setStatus(res.ok ? 'success' : 'error')
      setMessage(data.message || 'Something went wrong. Please try again.')
      if (res.ok) {
        reset()
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex w-full max-w-md flex-col gap-3'
    >
      <div className='flex items-stretch gap-2'>
        <Input
          type='email'
          placeholder='Enter your email'
          aria-label='Email address'
          maxLength={100}
          className='h-11 flex-1 rounded-full border-white/20 bg-white/95 text-black  placeholder:text-black/40 focus-visible:ring-gold/60'
          {...register('email')}
        />
        <Button
          type='submit'
          disabled={isSubmitting || status === 'loading'}
          className='h-11 rounded-full px-6'
        >
          <Send className='h-4 w-4' />
          {isSubmitting || status === 'loading'
            ? 'Subscribing…'
            : 'Subscribe'}
        </Button>
      </div>
      {errors.email && (
        <p className='text-sm font-medium text-rose-300'>
          {errors.email.message}
        </p>
      )}
      {message && (
        <p
          className={cn(
            'text-sm',
            status === 'success' ? 'text-emerald-300' : 'text-rose-300'
          )}
        >
          {message}
        </p>
      )}
    </form>
  )
}