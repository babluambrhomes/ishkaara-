'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FolderTree, Pencil, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import DeleteDialog from '@/components/shared/delete-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  createCategory,
  deleteCategory,
  getAllCategoriesForAdmin,
  updateCategory,
} from '@/lib/actions/category.actions'
import { ICategory } from '@/lib/models/category.model'
import { CategoryInputSchema } from '@/lib/validator'
import { ImageUpload } from '@/components/shared/image-upload'
import { getImageUrl } from '@/lib/image-url'
import { cn } from '@/lib/utils'

type FormValues = z.infer<typeof CategoryInputSchema>
type TypeFilter = 'all' | 'product' | 'blog'

const emptyValues: FormValues = {
  name: '',
  type: 'product',
  description: '',
  imageUrl: '',
  status: 'public',
}

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'product', label: 'Products' },
  { value: 'blog', label: 'Blog' },
]

export default function WorkspaceCategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<ICategory[] | null>(null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ICategory | null>(null)

  const refresh = async () => {
    setCategories(await getAllCategoriesForAdmin())
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (categories ?? []).filter(
      (c) =>
        (typeFilter === 'all' || c.type === typeFilter) &&
        (!q || c.name.toLowerCase().includes(q))
    )
  }, [categories, typeFilter, query])

  const form = useForm<FormValues>({
    resolver: zodResolver(CategoryInputSchema),
    defaultValues: emptyValues,
  })

  const imageUrl = form.watch('imageUrl')

  const openCreate = () => {
    setEditing(null)
    form.reset({
      ...emptyValues,
      type: typeFilter === 'all' ? 'product' : typeFilter,
    })
    setDialogOpen(true)
  }

  const openEdit = (category: ICategory) => {
    setEditing(category)
    form.reset({
      name: category.name,
      type: category.type,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
      status: category.status,
    })
    setDialogOpen(true)
  }

  const onCategorySubmit = async (values: FormValues) => {
    const res = editing
      ? await updateCategory({ ...values, _id: editing._id })
      : await createCategory(values)
    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
    } else {
      toast({ description: res.message })
      setDialogOpen(false)
      refresh()
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <h1 className='font-bold text-lg'>Categories</h1>
          <div className='flex items-center gap-1 rounded-lg bg-muted p-1'>
            {typeFilters.map((t) => (
              <button
                key={t.value}
                type='button'
                onClick={() => setTypeFilter(t.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  typeFilter === t.value
                    ? 'bg-background font-semibold '
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search category...'
              className='w-56 pl-8'
            />
          </div>
          <Button
            size='icon'
            onClick={openCreate}
            data-tooltip='Create category'
            aria-label='Create category'
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div>
        {categories === null ? (
          <p className='text-sm text-muted-foreground'>Loading...</p>
        ) : filtered.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No categories found. Create one to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className='w-[130px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    {category.imageUrl ? (
                      <Image
                        src={getImageUrl(category.imageUrl)}
                        alt={category.name}
                        width={48}
                        height={48}
                        className='h-12 w-12 rounded-md object-cover'
                      />
                    ) : (
                      <div className='flex h-12 w-12 items-center justify-center rounded-md bg-muted'>
                        <FolderTree className='h-5 w-5 text-muted-foreground' />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {category.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='capitalize'>
                      {category.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        category.status === 'public'
                          ? 'default'
                          : category.status === 'delete'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className='capitalize'
                    >
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-[260px] truncate text-muted-foreground'>
                    {category.description || '—'}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={() => openEdit(category)}
                        data-tooltip='Edit'
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <DeleteDialog
                        id={category._id}
                        action={deleteCategory}
                        callbackAction={refresh}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCategorySubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Fashion' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!editing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='product'>Product</SelectItem>
                        <SelectItem value='blog'>Blog</SelectItem>
                      </SelectContent>
                    </Select>
                    {editing && (
                      <p className='text-xs text-muted-foreground'>
                        Type cannot be changed after creation.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Optional short description'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='imageUrl'
                render={() => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <Card>
                      <CardContent className='mt-2 min-h-24'>
                        <FormControl>
                          <ImageUpload
                            entity='category'
                            value={imageUrl}
                            onChange={(key) => form.setValue('imageUrl', key)}
                            label='Upload image'
                          />
                        </FormControl>
                      </CardContent>
                    </Card>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? 'Saving...'
                    : editing
                      ? 'Save Changes'
                      : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
