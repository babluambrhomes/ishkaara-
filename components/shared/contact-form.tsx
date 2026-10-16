'use client'

import { Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const inputClass = 'bg-white focus-visible:ring-primary/30'

const ContactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(/^[\p{L}\s.'-]+$/u, 'Name contains invalid characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(100, 'Email must be at most 100 characters')
    .email('Email is invalid'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number is invalid')
    .max(20, 'Phone number is invalid')
    .regex(/^\+?[\d\s-]{7,20}$/, 'Phone number is invalid'),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(100, 'Subject must be at most 100 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be at most 1000 characters'),
})

type ContactFormValues = z.infer<typeof ContactFormSchema>

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState('')

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  })

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
    reset,
  } = form

  const fieldError = (name: keyof ContactFormValues) =>
    errors[name] ? (
      <p className='text-xs font-medium text-red-600'>{errors[name].message}</p>
    ) : null

  const onSubmit = async (values: ContactFormValues) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
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
    <Card className='rounded-2xl border-border/60 '>
      <CardContent className='p-5 md:p-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                placeholder='Your full name'
                maxLength={50}
                className={inputClass}
                {...register('name')}
              />
              {fieldError('name')}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                maxLength={100}
                className={inputClass}
                {...register('email')}
              />
              {fieldError('email')}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                type='tel'
                inputMode='tel'
                placeholder='Your phone number'
                maxLength={20}
                className={inputClass}
                {...register('phone')}
              />
              {fieldError('phone')}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='subject'>Subject</Label>
              <Input
                id='subject'
                placeholder='What is this regarding?'
                maxLength={100}
                className={inputClass}
                {...register('subject')}
              />
              {fieldError('subject')}
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              id='message'
              placeholder='Write your message here...'
              rows={5}
              maxLength={1000}
              className='bg-white'
              {...register('message')}
            />
            {fieldError('message')}
          </div>

          {message && (
            <p
              className={cn(
                'text-sm font-medium',
                status === 'success' ? 'text-emerald-700' : 'text-red-600'
              )}
            >
              {message}
            </p>
          )}

          <Button
            type='submit'
            disabled={isSubmitting || status === 'loading'}
            className='w-full rounded-full py-2.5'
          >
            <Send className='h-4 w-4' />
            {isSubmitting || status === 'loading'
              ? 'Sending…'
              : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}