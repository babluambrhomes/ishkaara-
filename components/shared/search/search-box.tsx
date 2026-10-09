'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

type SearchFormValues = {
  q: string
}

export default function SearchBox({
  defaultValue = '',
  placeholder = 'Search products...',
}: {
  defaultValue?: string
  placeholder?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { register, handleSubmit, reset } = useForm<SearchFormValues>({
    defaultValues: {
      q: defaultValue,
    },
  })

  useEffect(() => {
    reset({ q: defaultValue })
  }, [defaultValue, reset])

  const onSubmit = (data: SearchFormValues) => {
    const params = new URLSearchParams(searchParams.toString())
    const q = (data.q || '').trim()
    if (q) params.set('q', q)
    else params.delete('q')
    params.delete('page')
    router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex w-full gap-2'>
      <div className='relative flex-1'>
        <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          {...register('q')}
          placeholder={placeholder}
          className='h-12 rounded-full border-border/70 bg-white pl-11 shadow-inner-soft'
        />
      </div>
      <Button type='submit' size='lg' className='h-12 rounded-full px-7'>
        Search
      </Button>
    </form>
  )
}