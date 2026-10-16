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
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Email is invalid'),
  phone: z.string().min(1, 'Phone number is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
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
    formState: { isSubmitting },
    reset,
  } = form

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
                className={inputClass}
                {...register('name')}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                className={inputClass}
                {...register('email')}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                type='tel'
                placeholder='Your phone number'
                className={inputClass}
                {...register('phone')}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='subject'>Subject</Label>
              <Input
                id='subject'
                placeholder='What is this regarding?'
                className={inputClass}
                {...register('subject')}
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              id='message'
              placeholder='Write your message here...'
              rows={5}
              className='bg-white'
              {...register('message')}
            />
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