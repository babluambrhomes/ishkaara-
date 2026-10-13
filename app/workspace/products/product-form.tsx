'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createProduct, updateProduct } from '@/lib/actions/product.actions'
import {
  createCategory,
  getCategoriesByType,
} from '@/lib/actions/category.actions'
import { IProduct } from '@/lib/models/product.model'
import { ICategory } from '@/lib/models/category.model'
import { ImageUpload, MultiImageUpload } from '@/components/shared/image-upload'
import { ProductInputSchema, ProductUpdateSchema } from '@/lib/validator'
import { cn, generateSlug } from '@/lib/utils'
import { IProductInput } from '@/types'
import { TiptapEditor } from '@/components/editor/tiptap-editor'

const PRESET_TAGS = ['todays-deal', 'new-arrival', 'best-seller', 'featured']

const productDefaultValues: IProductInput = {
  name: '',
  slug: '',
  category: '',
  siteBanner: '',
  brand: '',
  description: '',
  status: 'draft',
  tags: [],
  variants: [
    {
      price: 0,
      listPrice: 0,
      images: [],
      size: [],
      countInStock: 0,
    },
  ],
  numReviews: 0,
  avgRating: 0,
  numSales: 0,
  ratingDistribution: [],
  reviews: [],
}

function SizesInput({
  value,
  onChange,
}: {
  value?: string[] | string
  onChange: (value: string[]) => void
}) {
  const toArray = (v?: string[] | string): string[] =>
    Array.isArray(v)
      ? v
      : typeof v === 'string' && v.length > 0
        ? [v]
        : []

  const [draft, setDraft] = useState(() =>
    Array.isArray(value) ? value.join(', ') : value || ''
  )
  const lastEmitted = useRef(value)

  useEffect(() => {
    const joined = Array.isArray(value) ? value.join(', ') : value || ''
    if (
      JSON.stringify(toArray(value)) !==
      JSON.stringify(toArray(lastEmitted.current))
    ) {
      lastEmitted.current = value
      setDraft(joined)
    }
  }, [value])

  return (
    <Input
      value={draft}
      placeholder='e.g. S, M, L (comma separated)'
      onChange={(e) => {
        setDraft(e.target.value)
        const sizes = e.target.value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        lastEmitted.current = sizes
        onChange(sizes)
      }}
    />
  )
}

function TagsInput({
  value,
  onChange,
}: {
  value?: string[]
  onChange: (value: string[]) => void
}) {
  const toArray = (v?: string[]): string[] => v ?? []
  const text = (tags: string[]): string => tags.join(', ')

  const [draft, setDraft] = useState(() => text(toArray(value)))
  const lastEmitted = useRef<string[]>(toArray(value))

  useEffect(() => {
    const current = toArray(value)
    if (JSON.stringify(current) !== JSON.stringify(lastEmitted.current)) {
      lastEmitted.current = current
      setDraft(text(current))
    }
  }, [value])

  const togglePreset = (tag: string) => {
    const current = toArray(value)
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag]
    lastEmitted.current = next
    setDraft(text(next))
    onChange(next)
  }

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap gap-2'>
        {PRESET_TAGS.map((tag) => {
          const active = toArray(value).includes(tag)
          return (
            <button
              key={tag}
              type='button'
              onClick={() => togglePreset(tag)}
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {tag}
            </button>
          )
        })}
      </div>
      <Input
        value={draft}
        placeholder='e.g. new, summer, premium (comma separated)'
        onChange={(e) => {
          setDraft(e.target.value)
          const tags = e.target.value
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
          lastEmitted.current = tags
          onChange(tags)
        }}
      />
    </div>
  )
}

type QuickCategoryFormValues = {
  name: string
  imageUrl: string
}

const ProductForm = ({
  type,
  product,
  productId,
  categories,
}: {
  type: 'Create' | 'Update'
  product?: IProduct
  productId?: string
  categories: ICategory[]
}) => {
  const router = useRouter()
  const [categoryList, setCategoryList] = useState<ICategory[]>(categories)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickSaving, setQuickSaving] = useState(false)

  const quickCategoryForm = useForm<QuickCategoryFormValues>({
    defaultValues: {
      name: '',
      imageUrl: '',
    },
  })
  const quickImage = quickCategoryForm.watch('imageUrl')

  const form = useForm<IProductInput>({
    resolver:
      type === 'Update'
        ? zodResolver(ProductUpdateSchema)
        : zodResolver(ProductInputSchema),
    defaultValues:
      product && type === 'Update'
        ? {
            ...product,
            variants:
              product.variants?.length > 0
                ? product.variants
                : productDefaultValues.variants,
          }
        : productDefaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const { toast } = useToast()

  const handleQuickAdd = async (data: QuickCategoryFormValues) => {
    const name = data.name.trim()
    if (name.length < 2) {
      toast({
        variant: 'destructive',
        description: 'Name must be at least 2 characters',
      })
      return
    }
    setQuickSaving(true)
    const res = await createCategory({
      name,
      type: 'product',
      description: '',
      imageUrl: data.imageUrl || '',
      status: 'public',
    })
    setQuickSaving(false)
    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
      return
    }
    toast({ description: res.message })
    const list = await getCategoriesByType('product')
    setCategoryList(list)
    const created = list.find((c) => c.name === name)
    if (created) form.setValue('category', created._id)
    setQuickAddOpen(false)
    quickCategoryForm.reset({ name: '', imageUrl: '' })
  }

  async function onSubmit(values: IProductInput) {
    if (type === 'Create') {
      const res = await createProduct(values)
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        toast({
          description: res.message,
        })
        router.push(`/workspace/products`)
      }
    }
    if (type === 'Update') {
      if (!productId) {
        router.push(`/workspace/products`)
        return
      }
      const res = await updateProduct({ ...values, _id: productId })
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        router.push(`/workspace/products`)
      }
    }
  }
  const siteBanner = form.watch('siteBanner')

  return (
    <>
      <Form {...form}>
        <form
          method='post'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8'
        >
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter product name' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='slug'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Slug</FormLabel>

                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='Enter product slug'
                        className='pl-8'
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => {
                          form.setValue(
                            'slug',
                            generateSlug(form.getValues('name'))
                          )
                        }}
                        className='absolute right-2 top-2.5'
                      >
                        Generate
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => {
                return (
                  <FormItem className='w-full'>
                    <FormLabel>Category</FormLabel>
                    <div className='flex items-center gap-2'>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryList.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type='button'
                        size='icon'
                        variant='outline'
                        onClick={() => setQuickAddOpen(true)}
                        data-tooltip='New category'
                        aria-label='New category'
                        className='shrink-0'
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name='brand'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter product brand' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Variants */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-bold'>Variants</h2>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  append({
                    price: 0,
                    listPrice: 0,
                    images: [],
                    size: [],
                    countInStock: 0,
                  })
                }
              >
                <Plus className='h-4 w-4' /> Add Variant
              </Button>
            </div>

            {fields.map((variantField, index) => (
              <Card key={variantField.id}>
                <CardContent className='space-y-4 pt-6'>
                  <div className='flex items-center justify-between'>
                    <p className='font-semibold'>Variant {index + 1}</p>
                    {fields.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='text-destructive hover:text-destructive'
                        onClick={() => remove(index)}
                      >
                        <Trash2 className='h-4 w-4' /> Remove
                      </Button>
                    )}
                  </div>

                  <div className='flex flex-col gap-5 md:flex-row'>
                    <FormField
                      control={form.control}
                      name={`variants.${index}.size`}
                      render={({ field }) => (
                        <FormItem className='w-full'>
                          <FormLabel>Size (optional)</FormLabel>
                          <FormControl>
                            <SizesInput
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='flex flex-col gap-5 md:flex-row'>
                    <FormField
                      control={form.control}
                      name={`variants.${index}.listPrice`}
                      render={({ field }) => (
                        <FormItem className='w-full'>
                          <FormLabel>List Price</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Enter list price'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <FormItem className='w-full'>
                          <FormLabel>Net Price</FormLabel>
                          <FormControl>
                            <Input placeholder='Enter price' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.countInStock`}
                      render={({ field }) => (
                        <FormItem className='w-full'>
                          <FormLabel>Count In Stock</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              placeholder='Enter count in stock'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`variants.${index}.images`}
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <FormLabel>Images</FormLabel>
                        <Card>
                          <CardContent className='mt-2 min-h-24'>
                            <FormControl>
                              <MultiImageUpload
                                entity='product'
                                value={field.value ?? []}
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </CardContent>
                        </Card>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className='max-w-md'>
            <FormField
              control={form.control}
              name='tags'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex gap-5'>
            <div className='w-full max-w-[200px]'>
              <FormField
                control={form.control}
                name='siteBanner'
                render={() => (
                  <FormItem className='w-full'>
                    <FormLabel>Site Banner (Home Hero)</FormLabel>
                    <Card>
                      <CardContent className='mt-2 min-h-24'>
                        <FormControl>
                          <ImageUpload
                            entity='product'
                            value={siteBanner}
                            onChange={(key) => form.setValue('siteBanner', key)}
                            label='Upload banner'
                          />
                        </FormControl>
                      </CardContent>
                    </Card>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <TiptapEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder='Write property description...'
                      entity='product'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='max-w-xs'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='public'>Public</SelectItem>
                      <SelectItem value='draft'>Draft</SelectItem>
                      <SelectItem value='delete'>Delete</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <Button
              type='submit'
              size='lg'
              disabled={form.formState.isSubmitting}
              className='button col-span-2 w-full'
            >
              {form.formState.isSubmitting
                ? 'Submitting...'
                : `${type} Product `}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog
        open={quickAddOpen}
        onOpenChange={(open) => {
          setQuickAddOpen(open)
          if (!open) {
            quickCategoryForm.reset({ name: '', imageUrl: '' })
          }
        }}
      >
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>New Product Category</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={quickCategoryForm.handleSubmit(handleQuickAdd)}
            className='space-y-4'
          >
            <Input
              autoFocus
              placeholder='Category name'
              {...quickCategoryForm.register('name')}
            />
            <ImageUpload
              entity='category'
              value={quickImage}
              onChange={(key) => quickCategoryForm.setValue('imageUrl', key)}
              label='Upload image'
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setQuickAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={quickSaving}>
                {quickSaving ? 'Adding...' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProductForm
