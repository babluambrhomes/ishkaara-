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
import {
  createBlogPost,
  updateBlogPost,
} from '@/lib/actions/blog.actions'
import {
  createCategory,
  getCategoriesByType,
} from '@/lib/actions/category.actions'
import { IPost } from '@/lib/models/blog-post.model'
import { ICategory } from '@/lib/models/category.model'
import { ImageUpload } from '@/components/shared/image-upload'
import { BlogPostInputSchema } from '@/lib/validator'
import { generateSlug } from '@/lib/utils'
import { IPostInput } from '@/types'
import { TiptapEditor } from '@/components/editor/tiptap-editor'

const postDefaultValues: IPostInput = {
  title: '',
  slug: '',
  image: '',
  category: '',
  tags: [],
  excerpt: '',
  content: '',
  date: new Date().toISOString().slice(0, 10),
  author: 'Ishkaara',
  status: 'draft',
}

type QuickCategoryFormValues = {
  name: string
}

const PostForm = ({
  type,
  post,
  postId,
  categories,
}: {
  type: 'Create' | 'Update'
  post?: IPost
  postId?: string
  categories: ICategory[]
}) => {
  const router = useRouter()
  const [categoryList, setCategoryList] = useState<ICategory[]>(categories)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickSaving, setQuickSaving] = useState(false)

  const quickCategoryForm = useForm<QuickCategoryFormValues>({
    defaultValues: {
      name: '',
    },
  })

  const form = useForm<IPostInput>({
    resolver: zodResolver(BlogPostInputSchema),
    defaultValues:
      post && type === 'Update'
        ? {
            title: post.title,
            slug: post.slug,
            image: post.image,
            category: post.category,
            tags: post.tags,
            excerpt: post.excerpt,
            content: post.content,
            date: post.date,
            author: post.author,
            status: post.status,
          }
        : postDefaultValues,
  })

  const { toast } = useToast()
  const image = form.watch('image')

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
      type: 'blog',
      description: '',
      imageUrl: '',
      status: 'public',
    })
    setQuickSaving(false)
    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
      return
    }
    toast({ description: res.message })
    const list = await getCategoriesByType('blog')
    setCategoryList(list)
    const created = list.find((c) => c.name === name)
    if (created) form.setValue('category', created._id)
    setQuickAddOpen(false)
    quickCategoryForm.reset({ name: '' })
  }

  async function onSubmit(values: IPostInput) {
    if (type === 'Create') {
      const res = await createBlogPost(values)
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        toast({
          description: res.message,
        })
        router.push('/admin/blog/posts')
      }
    }
    if (type === 'Update') {
      if (!postId) {
        router.push('/admin/blog/posts')
        return
      }
      const res = await updateBlogPost({ ...values, _id: postId })
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        toast({
          description: res.message,
        })
        router.push('/admin/blog/posts')
      }
    }
  }

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
            name='title'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder='Enter post title' {...field} />
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
                      placeholder='Enter post slug'
                      className='pl-8'
                      {...field}
                    />
                    <button
                      type='button'
                      onClick={() => {
                        form.setValue('slug', generateSlug(form.getValues('title')))
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
            name='tags'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Comma separated, e.g. style, new-arrival'
                    value={field.value.join(', ')}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                      )
                    }
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
            name='author'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder='Enter author name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='date'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Publish Date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div>
          <FormField
            control={form.control}
            name='image'
            render={() => (
              <FormItem className='w-full'>
                <FormLabel>Cover Image</FormLabel>
                <Card>
                  <CardContent className='mt-2 min-h-24'>
                    <FormControl>
                      <ImageUpload
                        entity='blog'
                        value={image}
                        onChange={(key) => form.setValue('image', key)}
                        label='Upload image'
                      />
                    </FormControl>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='excerpt'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <TiptapEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder='Short summary shown on the blog listing'
                    entity='blog'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

       

        <div>
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <TiptapEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder='Write your post content...'
                    entity='blog'
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
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Post`}
          </Button>
        </div>
      </form>
      </Form>

      <Dialog
        open={quickAddOpen}
        onOpenChange={(open) => {
          setQuickAddOpen(open)
          if (!open) {
            quickCategoryForm.reset({ name: '' })
          }
        }}
      >
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>New Blog Category</DialogTitle>
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

export default PostForm