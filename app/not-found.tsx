'use client'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-primary/[0.04] to-gold/[0.08] px-4'>
      <span className='text-[110px] font-extrabold leading-none tracking-tight text-transparent lg:text-[140px]'>
        <span className='bg-clip-text bg-gradient-to-br from-gold to-destructive'>
          404
        </span>
      </span>
      <h1 className='mt-4 text-2xl font-bold tracking-tight lg:text-3xl'>
        Page not found
      </h1>
      <p className='mt-2 max-w-md text-center text-muted-foreground'>
        Sorry, the page you&apos;re looking for doesn&apos;t exist or may have
        been moved. Let&apos;s get you back to the good stuff.
      </p>
      <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
        <Button
          asChild
          size='lg'
          className='rounded-full bg-gradient-to-r from-primary to-[#560101] shadow-lift hover:shadow-soft'
        >
          <Link href='/'>Back to home</Link>
        </Button>
        <Button asChild size='lg' variant='outline' className='rounded-full'>
          <Link href='/search'>Browse all products</Link>
        </Button>
      </div>
    </div>
  )
}