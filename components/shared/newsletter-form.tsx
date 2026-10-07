'use client'

import { Send } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setStatus(res.ok ? 'success' : 'error')
      setMessage(data.message || 'Something went wrong. Please try again.')
      if (res.ok) setEmail('')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex w-full max-w-md flex-col gap-3'
    >
      <div className='flex items-stretch gap-2'>
        <Input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter your email'
          aria-label='Email address'
          className='h-11 flex-1 rounded-full border-white/20 bg-white/95 text-black shadow-soft placeholder:text-black/40 focus-visible:ring-gold/60'
        />
        <Button
          type='submit'
          disabled={status === 'loading'}
          className='h-11 rounded-full px-6'
        >
          <Send className='h-4 w-4' />
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
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