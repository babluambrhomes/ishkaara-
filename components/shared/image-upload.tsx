'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getImageUrl } from '@/lib/image-url'
import { uploadImageFile } from '@/lib/upload-client'
import type { UploadEntity } from '@/lib/upload-client'
import { cn } from '@/lib/utils'

export function ImageUpload({
  value,
  onChange,
  entity,
  label = 'Upload image',
  className,
  disabled,
}: {
  value?: string
  onChange: (key: string) => void
  entity: UploadEntity
  label?: string
  className?: string
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', description: 'Only images are allowed' })
      return
    }
    setUploading(true)
    try {
      const key = await uploadImageFile(file, entity)
      onChange(key)
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Upload failed',
      })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('flex items-start gap-3', className)}>
      {value ? (
        <>
          <div className='relative h-24 w-40 overflow-hidden rounded-md border'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(value)}
              alt='upload preview'
              className='h-full w-full object-cover'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <button
              type='button'
              disabled={uploading || disabled}
              onClick={() => inputRef.current?.click()}
              className='text-left text-sm font-medium text-primary hover:underline disabled:opacity-50'
            >
              {uploading ? 'Uploading...' : 'Replace'}
            </button>
            <button
              type='button'
              disabled={uploading || disabled}
              onClick={() => onChange('')}
              className='text-left text-sm text-muted-foreground hover:text-destructive'
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          disabled={uploading || disabled}
          className={cn(
            'inline-flex h-24 w-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50',
            className
          )}
        >
          {uploading ? (
            <span className='h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent' />
          ) : (
            <Upload className='h-5 w-5' />
          )}
          <span>{uploading ? 'Uploading...' : label}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}

export function MultiImageUpload({
  value,
  onChange,
  entity,
  max = 5,
  className,
  disabled,
}: {
  value: string[]
  onChange: (keys: string[]) => void
  entity: UploadEntity
  max?: number
  className?: string
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFiles = async (files: FileList) => {
    const room = max - value.length
    if (room <= 0) {
      toast({ description: `You can upload up to ${max} images` })
      return
    }
    setUploading(true)
    const added: string[] = []
    try {
      for (const file of Array.from(files).slice(0, room)) {
        if (!file.type.startsWith('image/')) continue
        try {
          added.push(await uploadImageFile(file, entity))
        } catch (error) {
          toast({
            variant: 'destructive',
            description:
              error instanceof Error ? error.message : 'Upload failed',
          })
        }
      }
      if (added.length) onChange([...value, ...added])
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {value.map((key) => (
        <div key={key} className='group relative'>
          <Image
            src={getImageUrl(key)}
            alt='product image'
            width={80}
            height={80}
            className='h-20 w-20 rounded-sm object-cover object-center'
          />
          <button
            type='button'
            onClick={() => onChange(value.filter((k) => k !== key))}
            className='absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white group-hover:flex'
            aria-label='Remove image'
          >
            ×
          </button>
        </div>
      ))}

      {value.length < max && (
        <button
          type='button'
          disabled={uploading || disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40',
            className
          )}
          aria-label='Add image'
        >
          {uploading ? (
            <span className='h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent' />
          ) : (
            <Plus className='h-5 w-5' />
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept='image/*'
        multiple
        className='hidden'
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
        }}
      />
    </div>
  )
}
