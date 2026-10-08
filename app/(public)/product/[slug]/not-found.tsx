import { PackageSearch } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function ProductNotFound() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center bg-gradient-to-br from-background via-primary/[0.04] to-gold/[0.08] px-4 py-16'>
      <div className='flex h-24 w-24 items-center justify-center rounded-full border border-primary/15 bg-white shadow-soft'>
        <PackageSearch className='h-10 w-10 text-primary' />
      </div>
      <h1 className='premium-title mt-6 text-2xl font-bold tracking-tight lg:text-3xl'>
        This product is no longer available
      </h1>
      <p className='mt-2 max-w-md text-center text-muted-foreground'>
        We couldn&apos;t find the product you&apos;re looking for. It may have
        been sold out or removed from our collection.
      </p>
      <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
        <Button
          asChild
          size='lg'
          className='rounded-full bg-gradient-to-r from-primary to-[#560101] shadow-lift hover:shadow-soft'
        >
          <Link href='/search'>Browse all products</Link>
        </Button>
        <Button asChild size='lg' variant='outline' className='rounded-full'>
          <Link href='/'>Back to home</Link>
        </Button>
      </div>
    </div>
  )
}