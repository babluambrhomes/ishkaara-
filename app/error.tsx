'use client'
import React from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const message =
    error?.message && error.message.trim().length > 0
      ? error.message
      : 'An unexpected response was received from the server.'

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-destructive/[0.04] to-gold/[0.08] px-4 py-12'>
      <div className='pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-circle bg-destructive/10 blur-3xl' />

      <div className='relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-white '>
        <div className='h-2 bg-gradient-to-r from-destructive via-[#b91c1c] to-gold' />

        <div className='flex flex-col items-center px-6 py-10 text-center sm:px-10'>
          <span className='flex h-20 w-20 items-center justify-center rounded-circle bg-red-50 text-destructive ring-8 ring-red-50/60'>
            <AlertTriangle className='h-11 w-11' />
          </span>

          <h1 className='mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl'>
            Something went wrong
          </h1>

          <p className='mt-2 max-w-md text-sm text-muted-foreground'>
            Something unexpected happened on our end. Please try again — this is
            usually temporary.
          </p>

          <div className='mt-6 w-full rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-left'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Technical details
            </p>
            <p className='mt-1 break-words text-sm text-destructive'>
              {message}
            </p>
            {error?.digest && (
              <p className='mt-1 text-xs text-muted-foreground'>
                Reference: {error.digest}
              </p>
            )}
          </div>

          <div className='mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button
              size='lg'
              onClick={() => reset()}
              className='h-11 gap-2 rounded-full font-bold motion-reduce:transition-none'
            >
              <RotateCcw className='h-4 w-4' />
              Try again
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='h-11 gap-2 rounded-full'
            >
              <Link href='/'>
                <Home className='h-4 w-4' />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
