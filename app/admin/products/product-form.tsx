'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
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
import { generateSlug } from '@/lib/utils'
import { IProductInput } from '@/types'
import { TiptapEditor } from '@/components/editor/tiptap-editor'

const productDefaultValues: IProductInput = {
  name: '',
  slug: '',
  category: '',
  images: [],
  siteBanner: '',
  brand: '',
  description: '',
  price: 0,
  listPrice: 0,
  countInStock: 0,
  numReviews: 0,
  avgRating: 0,
  numSales: 0,
  status: 'draft',
  tags: [],
  sizes: [],
  colors: [],
  ratingDistribution: [],
  reviews: [],
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
      product && type === 'Update' ? product : productDefaultValues,
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
        router.push(`/admin/products`)
      }
    }
    if (type === 'Update') {
      if (!productId) {
        router.push(`/admin/products`)
        return
      }
      const res = await updateProduct({ ...values, _id: productId })
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        router.push(`/admin/products`)
      }
    }
  }
  const images = form.watch('images')
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
                        form.setValue('slug', generateSlug(form.getValues('name')))
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
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='listPrice'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>List Price</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product list price' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Net Price</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product price' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='countInStock'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Count In Stock</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='Enter product count in stock'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex gap-5'>
          <FormField
            control={form.control}
            name='images'
            render={() => (
              <FormItem className='w-full'>
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className='mt-2 min-h-24'>
                    <FormControl>
                      <MultiImageUpload
                        entity='product'
                        value={images}
                        onChange={(keys) => form.setValue('images', keys)}
                      />
                    </FormControl>
                  </CardContent>
                </Card>

                <FormMessage />
              </FormItem>
            )}
          />
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
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Product `}
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
