'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, ImageIcon, Pencil, Plus, PowerOff } from 'lucide-react'

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
import { ImageUpload } from '@/components/shared/image-upload'
import { RedirectFilterBuilder } from '@/components/shared/redirect-filter-builder'
import { useToast } from '@/hooks/use-toast'
import {
  createHomeBanner,
  deactivateHomeBanner,
  deleteHomeBanner,
  getAllHomeBannersForAdmin,
  updateHomeBanner,
} from '@/lib/actions/home-banner.actions'
import type { IHomeBanner } from '@/lib/models/home-banner.model'
import { getImageUrl } from '@/lib/image-url'
import { useDebouncedValue } from '@/hooks/use-debounce'

const FormSchema = z.object({
  redirect: z.string().min(1, 'Redirect is required'),
  bannerUrl: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  expireAt: z.string(),
})

type FormValues = z.infer<typeof FormSchema>

type BannerListData = {
  banners: IHomeBanner[]
  totalPages: number
  totalBanners: number
  from: number
  to: number
}

const emptyValues: FormValues = {
  redirect: '',
  bannerUrl: '',
  status: 'ACTIVE',
  expireAt: '',
}

const toDateInput = (value: Date | string | null) => {
  if (!value) return ''
  const date = new Date(value)
  return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export default function WorkspaceHomeBannersPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [data, setData] = useState<BannerListData>()
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebouncedValue(query, 500)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<IHomeBanner | null>(null)

  const loadData = useCallback(
    (searchQuery: string, pageNumber: number) => {
      startTransition(async () => {
        const result = await getAllHomeBannersForAdmin({
          query: searchQuery,
          page: pageNumber,
        })
        setData(result)
      })
    },
    [startTransition]
  )

  useEffect(() => {
    setPage(1)
    loadData(debouncedQuery, 1)
  }, [debouncedQuery, loadData])

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: emptyValues,
  })

  const bannerUrl = form.watch('bannerUrl')

  const refresh = () => loadData(debouncedQuery, page)

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    setPage(newPage)
    loadData(debouncedQuery, newPage)
  }

  const openCreate = () => {
    setEditing(null)
    form.reset(emptyValues)
    setDialogOpen(true)
  }

  const openEdit = (banner: IHomeBanner) => {
    setEditing(banner)
    form.reset({
      redirect: banner.redirect ?? '',
      bannerUrl: banner.bannerUrl ?? '',
      status: banner.status,
      expireAt: toDateInput(banner.expireAt),
    })
    setDialogOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    const payload = {
      redirect: values.redirect,
      bannerUrl: values.bannerUrl,
      bannerType: 'Hero' as const,
      status: values.status,
      expireAt: values.expireAt ? new Date(values.expireAt) : null,
    }
    const res = editing
      ? await updateHomeBanner({ ...payload, _id: editing._id })
      : await createHomeBanner(payload)
    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
    } else {
      toast({ description: res.message })
      setDialogOpen(false)
      refresh()
    }
  }

  const onDeactivate = async (id: string) => {
    const res = await deactivateHomeBanner(id)
    toast({
      description: res.message,
      variant: res.success ? 'default' : 'destructive',
    })
    if (res.success) refresh()
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='font-bold text-lg'>Home Banners</h1>
          <Input
            className='w-auto'
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Filter by redirect...'
          />
          {isPending ? (
            <p className='text-sm text-muted-foreground'>Loading...</p>
          ) : (
            <p className='text-sm text-muted-foreground'>
              {data?.totalBanners === 0
                ? 'No'
                : `${data?.from}-${data?.to} of ${data?.totalBanners}`}
              {' results'}
            </p>
          )}
        </div>
        <Button
          size='icon'
          onClick={openCreate}
          aria-label='Create banner'
          data-tooltip='Create banner'
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      <div>
        {!data ? (
          <p className='text-sm text-muted-foreground'>Loading...</p>
        ) : data.banners.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No banners found. Create one to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Redirect</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className='w-[180px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    {banner.bannerUrl ? (
                      <Image
                        src={getImageUrl(banner.bannerUrl)}
                        alt={banner.redirect}
                        width={80}
                        height={48}
                        className='h-12 w-20 rounded-md object-cover'
                      />
                    ) : (
                      <div className='flex h-12 w-20 items-center justify-center rounded-md bg-muted'>
                        <ImageIcon className='h-5 w-5 text-muted-foreground' />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {banner.redirect}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={banner.status === 'ACTIVE' ? 'default' : 'secondary'}
                    >
                      {banner.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {banner.expireAt ? toDateInput(banner.expireAt) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={() => openEdit(banner)}
                        aria-label='Edit banner'
                        data-tooltip='Edit'
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      {banner.status === 'ACTIVE' && (
                        <Button
                          size='icon'
                          variant='outline'
                          onClick={() => onDeactivate(banner._id)}
                          aria-label='Deactivate banner'
                          data-tooltip='Deactivate'
                        >
                          <PowerOff className='h-4 w-4' />
                        </Button>
                      )}
                      <DeleteDialog
                        id={banner._id}
                        action={deleteHomeBanner}
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
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Banner' : 'Create Banner'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='redirect'
                render={({ field }) => (
                  <FormItem>
                    <RedirectFilterBuilder
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      label='Redirect URL'
                      placeholder='/product/some-slug or /search?...'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bannerUrl'
                render={() => (
                  <FormItem>
                    <FormLabel>Banner</FormLabel>
                    <Card>
                      <CardContent className='mt-2 min-h-24'>
                        <FormControl>
                          <ImageUpload
                            entity='banner'
                            value={bannerUrl}
                            onChange={(key) => form.setValue('bannerUrl', key)}
                            label='Upload banner'
                          />
                        </FormControl>
                      </CardContent>
                    </Card>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='ACTIVE'>Active</SelectItem>
                          <SelectItem value='INACTIVE'>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='expireAt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires on (optional)</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
