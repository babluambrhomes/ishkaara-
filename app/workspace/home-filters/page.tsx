'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import DeleteDialog from '@/components/shared/delete-dialog'
import { ImageUpload } from '@/components/shared/image-upload'
import {
  RedirectFilterBuilder,
  parseSearchUrl,
} from '@/components/shared/redirect-filter-builder'
import { useToast } from '@/hooks/use-toast'
import {
  createHomeFilter,
  deleteHomeFilter,
  getAllHomeFiltersForAdmin,
  updateHomeFilter,
} from '@/lib/actions/home-filter.actions'
import { getAllCategories, getAllTags } from '@/lib/actions/product.actions'
import { getImageUrl } from '@/lib/image-url'
import { HomeFilterInputSchema } from '@/lib/validator'

const FormSchema = HomeFilterInputSchema.extend({})

type FormValues = z.infer<typeof FormSchema>

type FilterListData = {
  filters: FormValues[]
  totalPages: number
  totalFilters: number
  from: number
  to: number
}

type FilterListItem = FormValues & { _id: string }

const emptyValues: FormValues = {
  title: '',
  section: [],
  redirect: '',
  order: 0,
  details: '',
}

const emptySection = {
  name: '',
  imgurl: [],
  redirect: '',
  details: '',
}

export default function WorkspaceHomeFiltersPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [data, setData] = useState<FilterListData>()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FilterListItem | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    let active = true
    Promise.all([getAllCategories(), getAllTags()]).then(([cats, tagList]) => {
      if (!active) return
      setCategories(cats.map((c) => c.name))
      setTags(tagList)
    })
    return () => {
      active = false
    }
  }, [])

  const loadData = useCallback(
    (pageNumber: number) => {
      startTransition(async () => {
        const result = await getAllHomeFiltersForAdmin({ page: pageNumber })
        setData(result)
      })
    },
    [startTransition]
  )

  useEffect(() => {
    loadData(page)
  }, [page, loadData])

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: emptyValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'section',
  })

  const refresh = () => loadData(page)

  const handlePageChange = (changeType: 'next' | 'prev') => {
    setPage((prev) => (changeType === 'next' ? prev + 1 : prev - 1))
  }

  const openCreate = () => {
    setEditing(null)
    form.reset(emptyValues)
    setDialogOpen(true)
  }

  const openEdit = (filter: FilterListItem) => {
    setEditing(filter)
    const sections = (filter.section ?? []).map((s) => ({
      name: s.name ?? '',
      imgurl: s.imgurl ?? [],
      redirect: s.redirect ?? '',
      details: s.details ?? '',
    }))
    form.reset({
      title: filter.title ?? '',
      section: sections,
      redirect: filter.redirect ?? '',
      order: filter.order ?? 0,
      details: filter.details ?? '',
    })
    setDialogOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    const res = editing
      ? await updateHomeFilter({ ...values, _id: editing._id })
      : await createHomeFilter(values)
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
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='font-bold text-lg'>Home Filters</h1>
          {isPending ? (
            <p className='text-sm text-muted-foreground'>Loading...</p>
          ) : (
            <p className='text-sm text-muted-foreground'>
              {data?.totalFilters === 0
                ? 'No'
                : `${data?.from}-${data?.to} of ${data?.totalFilters}`}
              {' results'}
            </p>
          )}
        </div>
        <Button
          size='icon'
          onClick={openCreate}
          aria-label='Create home filter'
          data-tooltip='Create home filter'
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      <div>
        {!data ? (
          <p className='text-sm text-muted-foreground'>Loading...</p>
        ) : data.filters.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No home filters found. Create one to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className='w-[120px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.filters.map((filter) => (
                <TableRow key={(filter as FilterListItem)._id}>
                  <TableCell className='font-medium'>{filter.title || '—'}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                      {filter.section?.length ?? 0} items
                    </Badge>
                  </TableCell>
                  <TableCell>{filter.order}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={() => openEdit(filter as FilterListItem)}
                        aria-label='Edit home filter'
                        data-tooltip='Edit'
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <DeleteDialog
                        id={(filter as FilterListItem)._id}
                        action={deleteHomeFilter}
                        callbackAction={refresh}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {(data?.totalPages ?? 0) > 1 && (
          <div className='mt-4 flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => handlePageChange('prev')}
              disabled={Number(page) <= 1}
              className='w-24'
            >
              <ChevronLeft /> Previous
            </Button>
            Page {page} of {data?.totalPages}
            <Button
              variant='outline'
              onClick={() => handlePageChange('next')}
              disabled={Number(page) >= (data?.totalPages ?? 0)}
              className='w-24'
            >
              Next <ChevronRight />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Home Filter' : 'Create Home Filter'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. Shop by Category' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='order'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='redirect'
                render={({ field }) => (
                  <FormItem>
                    <RedirectFilterBuilder
                      categories={categories}
                      tags={tags}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      label='Section Redirect (optional)'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='details'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='Short description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section repeater */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <FormLabel>Sections</FormLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => append({ ...emptySection })}
                  >
                    <Plus className='h-4 w-4 mr-1' /> Add Section
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className='text-sm text-muted-foreground'>
                    No sections added yet.
                  </p>
                )}

                {fields.map((field, index) => {
                  return (
                  <Card key={field.id}>
                    <CardContent className='space-y-3 p-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-semibold'>
                          Section {index + 1}
                        </span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => remove(index)}
                          aria-label='Remove section'
                        >
                          <Trash2 className='h-4 w-4 text-destructive' />
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`section.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder='e.g. Shirts' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`section.${index}.redirect`}
                        render={({ field }) => (
                          <FormItem>
                            <RedirectFilterBuilder
                              categories={categories}
                              tags={tags}
                              value={field.value ?? ''}
                              onChange={field.onChange}
                              label='Redirect URL'
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`section.${index}.details`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Details (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder='Short text' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Multi image */}
                      <FormField
                        control={form.control}
                        name={`section.${index}.imgurl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Images</FormLabel>
                            <div className='flex flex-wrap gap-2'>
                              {(field.value ?? []).map((img, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  className='relative h-20 w-32 overflow-hidden rounded-md border'
                                >
                                  <Image
                                    src={getImageUrl(img)}
                                    alt={`section-${index}-img-${imgIndex}`}
                                    fill
                                    className='object-cover'
                                  />
                                  <button
                                    type='button'
                                    onClick={() =>
                                      field.onChange(
                                        (field.value ?? []).filter(
                                          (_, i) => i !== imgIndex
                                        )
                                      )
                                    }
                                    className='absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white'
                                    aria-label='Remove image'
                                  >
                                    <X className='h-3 w-3' />
                                  </button>
                                </div>
                              ))}
                              {(field.value ?? []).length === 0 && (
                                <div className='flex h-20 w-32 items-center justify-center rounded-md bg-muted'>
                                  <ImageIcon className='h-5 w-5 text-muted-foreground' />
                                </div>
                              )}
                            </div>
                            <ImageUpload
                              entity='home-filter'
                              value=''
                              onChange={(key) =>
                                field.onChange([...(field.value ?? []), key])
                              }
                              label='Add image'
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  )
                })}
              </div>

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
