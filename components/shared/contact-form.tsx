'use client'

import { Send } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const inputClass = 'bg-white focus-visible:ring-primary/30'

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState('')

  const update = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setStatus(res.ok ? 'success' : 'error')
      setMessage(data.message || 'Something went wrong. Please try again.')
      if (res.ok) {
        setForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <Card className='rounded-2xl border-border/60 shadow-soft'>
      <CardContent className='p-5 md:p-6'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={form.name}
                onChange={(e) => update('name')(e.target.value)}
                placeholder='Your full name'
                className={inputClass}
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={form.email}
                onChange={(e) => update('email')(e.target.value)}
                placeholder='you@example.com'
                className={inputClass}
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                type='tel'
                value={form.phone}
                onChange={(e) => update('phone')(e.target.value)}
                placeholder='+1 (123) 456-7890'
                className={inputClass}
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='subject'>Subject</Label>
              <Input
                id='subject'
                value={form.subject}
                onChange={(e) => update('subject')(e.target.value)}
                placeholder='What is this regarding?'
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              id='message'
              value={form.message}
              onChange={(e) => update('message')(e.target.value)}
              placeholder='Write your message here...'
              rows={5}
              className='bg-white'
              required
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
            disabled={status === 'loading'}
            className='w-full rounded-full py-2.5'
          >
            <Send className='h-4 w-4' />
            {status === 'loading' ? 'Sending…' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}