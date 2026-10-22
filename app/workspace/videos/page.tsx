'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, Pencil, Plus, PowerOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/hooks/use-toast'
import {
  createVideo,
  deactivateVideo,
  deleteVideo,
  getAllVideosForAdmin,
  updateVideo,
} from '@/lib/actions/video.actions'
import type { IVideo } from '@/lib/models/video.model'
import { useDebouncedValue } from '@/hooks/use-debounce'

const FormSchema = z.object({
  title: z.string().optional(),
  videoUrl: z.string().min(1, 'Video ID or URL is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  order: z.coerce.number().int().min(0),
  expireAt: z.string(),
})

type FormValues = z.infer<typeof FormSchema>

type VideoListData = {
  videos: IVideo[]
  totalPages: number
  totalVideos: number
  from: number
  to: number
}

const emptyValues: FormValues = {
  title: '',
  videoUrl: '',
  status: 'ACTIVE',
  order: 0,
  expireAt: '',
}

const toDateInput = (value: Date | string | null) => {
  if (!value) return ''
  const date = new Date(value)
  return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export default function WorkspaceVideosPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [data, setData] = useState<VideoListData>()
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebouncedValue(query, 500)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<IVideo | null>(null)

  const loadData = useCallback(
    (searchQuery: string, pageNumber: number) => {
      startTransition(async () => {
        const result = await getAllVideosForAdmin({
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

  const openEdit = (video: IVideo) => {
    setEditing(video)
    form.reset({
      title: video.title ?? '',
      videoUrl: video.videoUrl ?? '',
      status: video.status,
      order: video.order ?? 0,
      expireAt: toDateInput(video.expireAt),
    })
    setDialogOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title || undefined,
      videoUrl: values.videoUrl,
      status: values.status,
      order: values.order,
      expireAt: values.expireAt ? new Date(values.expireAt) : null,
    }
    const res = editing
      ? await updateVideo({ ...payload, _id: editing._id })
      : await createVideo(payload)
    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
    } else {
      toast({ description: res.message })
      setDialogOpen(false)
      refresh()
    }
  }

  const onDeactivate = async (id: string) => {
    const res = await deactivateVideo(id)
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
          <h1 className='font-bold text-lg'>Videos</h1>
          <Input
            className='w-auto'
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Filter videos...'
          />
          {isPending ? (
            <p className='text-sm text-muted-foreground'>Loading...</p>
          ) : (
            <p className='text-sm text-muted-foreground'>
              {data?.totalVideos === 0
                ? 'No'
                : `${data?.from}-${data?.to} of ${data?.totalVideos}`}
              {' results'}
            </p>
          )}
        </div>
        <Button
          size='icon'
          onClick={openCreate}
          aria-label='Create video'
          data-tooltip='Create video'
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      <div>
        {!data ? (
          <p className='text-sm text-muted-foreground'>Loading...</p>
        ) : data.videos.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No videos found. Create one to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Video URL</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className='w-[180px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.videos.map((video) => (
                <TableRow key={video._id}>
                  <TableCell className='font-medium'>
                    {video.title || '—'}
                  </TableCell>
                  <TableCell className='max-w-[240px] truncate text-muted-foreground'>
                    {video.videoUrl}
                  </TableCell>
                  <TableCell>{video.order}</TableCell>
                  <TableCell>
                    <Badge
                      variant={video.status === 'ACTIVE' ? 'default' : 'secondary'}
                    >
                      {video.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {video.expireAt ? toDateInput(video.expireAt) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={() => openEdit(video)}
                        aria-label='Edit video'
                        data-tooltip='Edit'
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      {video.status === 'ACTIVE' && (
                        <Button
                          size='icon'
                          variant='outline'
                          onClick={() => onDeactivate(video._id)}
                          aria-label='Deactivate video'
                          data-tooltip='Deactivate'
                        >
                          <PowerOff className='h-4 w-4' />
                        </Button>
                      )}
                      <DeleteDialog
                        id={video._id}
                        action={deleteVideo}
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
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Video' : 'Create Video'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='Summer lookbook' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='videoUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL (embed)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://www.youtube.com/embed/...'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='order'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input type='number' min={0} {...field} />
                      </FormControl>
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
              </div>

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

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={form.formState.isSubmitting}>
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
