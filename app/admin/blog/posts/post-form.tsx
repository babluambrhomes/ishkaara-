'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  createBlogPost,
  updateBlogPost,
} from '@/lib/actions/blog.actions'
import { IPost } from '@/lib/db/models/blog-post.model'
import { UploadButton } from '@/lib/uploadthing'
import {
  BlogPostInputSchema,
  BlogPostUpdateSchema,
} from '@/lib/validator'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/utils'
import { IPostInput } from '@/types'

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
  isPublished: false,
}

const PostForm = ({
  type,
  post,
  postId,
}: {
  type: 'Create' | 'Update'
  post?: IPost
  postId?: string
}) => {
  const router = useRouter()

  const form = useForm<IPostInput>({
    resolver:
      type === 'Update'
        ? zodResolver(BlogPostUpdateSchema)
        : zodResolver(BlogPostInputSchema),
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
            isPublished: post.isPublished,
          }
        : postDefaultValues,
  })

  const { toast } = useToast()
  const image = form.watch('image')

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
                        form.setValue('slug', toSlug(form.getValues('title')))
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
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder='e.g. Fashion' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='excerpt'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Short summary shown on the blog listing'
                    className='resize-none'
                    {...field}
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
            name='image'
            render={() => (
              <FormItem className='w-full'>
                <FormLabel>Cover Image</FormLabel>
                <Card>
                  <CardContent className='mt-2 min-h-32 space-y-2'>
                    {image ? (
                      <div className='flex items-start gap-3'>
                        <Image
                          src={image}
                          alt='cover image'
                          className='h-32 w-32 rounded-sm object-cover object-center'
                          width={200}
                          height={200}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => form.setValue('image', '')}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <FormControl>
                        <UploadButton
                          endpoint='imageUploader'
                          onClientUploadComplete={(res: { url: string }[]) => {
                            form.setValue('image', res[0].url)
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              variant: 'destructive',
                              description: `ERROR! ${error.message}`,
                            })
                          }}
                        />
                      </FormControl>
                    )}
                  </CardContent>
                </Card>
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
                  <Textarea
                    placeholder='Write your post content (Markdown supported)'
                    className='min-h-[320px] resize-y'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Supports Markdown: **bold**, [links](/blog), - lists, and # headings.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name='isPublished'
            render={({ field }) => (
              <FormItem className='space-x-2 items-center'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Is Published?</FormLabel>
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
  )
}

export default PostForm