'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Pencil,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useDebouncedValue } from '@/hooks/use-debounce'
import { useToast } from '@/hooks/use-toast'
import {
  createFaq,
  deleteFaq,
  FaqListData,
  getAllFaqsForAdmin,
  toggleFaqPublic,
  updateFaq,
} from '@/lib/actions/faq.actions'
import { IFaq } from '@/lib/models/faq.model'
import { FaqInputSchema } from '@/lib/validator'
import { cn, formatDateTime } from '@/lib/utils'

type FaqFormValues = z.infer<typeof FaqInputSchema>

const emptyFaqValues: FaqFormValues = {
  question: '',
  answer: '',
  is_public: true,
}

export default function WorkspaceFaqsPage() {
  const { toast } = useToast()
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [data, setData] = useState<FaqListData>()
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebouncedValue(query, 500)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [editingFaq, setEditingFaq] = useState<IFaq | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // React Hook Form for FAQ create / edit
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(FaqInputSchema),
    defaultValues: emptyFaqValues,
  })

  const loadData = useCallback(
    (searchQuery: string, pageNumber: number, status: string) => {
      startTransition(async () => {
        try {
          const res = await getAllFaqsForAdmin({
            page: pageNumber,
            query: searchQuery,
            status,
          })
          setData(res)
        } catch (error) {
          toast({
            variant: 'destructive',
            description:
              error instanceof Error ? error.message : 'Failed to load FAQs',
          })
        }
      })
    },
    [startTransition, toast]
  )

  useEffect(() => {
    loadData(debouncedQuery, page, statusFilter)
  }, [debouncedQuery, page, statusFilter, loadData])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, statusFilter])

  const openCreateDialog = () => {
    setEditingFaq(null)
    form.reset(emptyFaqValues)
    setDialogOpen(true)
  }

  const openEditDialog = (faq: IFaq) => {
    setEditingFaq(faq)
    form.reset({
      question: faq.question,
      answer: faq.answer,
      is_public: faq.is_public,
    })
    setDialogOpen(true)
  }

  const onSubmitFaq = async (values: FaqFormValues) => {
    setIsSaving(true)
    try {
      const res = editingFaq
        ? await updateFaq({ ...values, _id: String(editingFaq._id) })
        : await createFaq(values)

      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        setDialogOpen(false)
        form.reset(emptyFaqValues)
        loadData(debouncedQuery, page, statusFilter)
      }
    } catch {
      toast({
        variant: 'destructive',
        description: 'Failed to save FAQ',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePublic = async (id: string) => {
    try {
      const res = await toggleFaqPublic(id)
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        loadData(debouncedQuery, page, statusFilter)
      }
    } catch {
      toast({
        variant: 'destructive',
        description: 'Failed to toggle FAQ visibility',
      })
    }
  }

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && page < (data?.totalPages ?? 0)) {
      setPage((prev) => prev + 1)
    } else if (direction === 'prev' && page > 1) {
      setPage((prev) => prev - 1)
    }
  }

  return (
    <div className='space-y-4'>
      {/* Page Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-bold tracking-tight'>FAQs</h1>
            <Badge variant='outline' className='gap-1'>
              <HelpCircle className='h-3 w-3 text-gold' />
              {data?.publicCount ?? 0} Public
            </Badge>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Manage frequently asked questions displayed on the customer FAQ page
          </p>
        </div>

        <Button onClick={openCreateDialog} className='gap-1.5'>
          <Plus className='h-4 w-4' />
          Add FAQ
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            className='w-full sm:max-w-xs'
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search question or answer...'
          />
          <div className='flex items-center gap-1 rounded-lg bg-muted p-1'>
            {[
              { label: 'All', value: 'all' },
              { label: 'Public', value: 'public' },
              { label: 'Hidden', value: 'private' },
            ].map((f) => (
              <button
                key={f.value}
                type='button'
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  statusFilter === f.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className='text-sm text-muted-foreground'>
          {isPending ? (
            <span>Loading...</span>
          ) : (
            <span>
              {data?.totalFaqs ?? 0} {data?.totalFaqs === 1 ? 'FAQ' : 'FAQs'}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-lg border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[35%]'>Question</TableHead>
              <TableHead className='w-[40%]'>Answer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-[160px] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='h-32 text-center text-muted-foreground'>
                  No FAQs found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((faq) => (
                <TableRow key={String(faq._id)}>
                  <TableCell className='font-medium align-top'>
                    <div className='line-clamp-2'>{faq.question}</div>
                    <span className='text-[11px] text-muted-foreground'>
                      Added {formatDateTime(faq.createdAt).dateOnly}
                    </span>
                  </TableCell>
                  <TableCell className='align-top'>
                    <div className='text-xs text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap'>
                      {faq.answer}
                    </div>
                  </TableCell>
                  <TableCell className='align-top'>
                    {faq.is_public ? (
                      <Badge className='bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30'>
                        Public
                      </Badge>
                    ) : (
                      <Badge className='bg-slate-500/15 text-slate-700 hover:bg-slate-500/20 dark:text-slate-400 border border-slate-500/30'>
                        Hidden
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-right align-top'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        title={faq.is_public ? 'Hide from public' : 'Publish'}
                        onClick={() => handleTogglePublic(String(faq._id))}
                      >
                        {faq.is_public ? (
                          <EyeOff className='h-4 w-4 text-muted-foreground' />
                        ) : (
                          <Eye className='h-4 w-4 text-emerald-600' />
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openEditDialog(faq)}
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </Button>
                      <DeleteDialog
                        id={String(faq._id)}
                        action={deleteFaq}
                        callbackAction={() =>
                          loadData(debouncedQuery, page, statusFilter)
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {(data?.totalPages ?? 0) > 1 && (
          <div className='flex items-center justify-between border-t p-4'>
            <div className='text-sm text-muted-foreground'>
              Page {page} of {data?.totalPages}
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange('prev')}
                disabled={Number(page) <= 1}
              >
                <ChevronLeft className='h-4 w-4' /> Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange('next')}
                disabled={Number(page) >= (data?.totalPages ?? 0)}
              >
                Next <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit FAQ Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
            <DialogDescription>
              {editingFaq
                ? 'Update question, answer and public visibility.'
                : 'Create a new question and answer to show on the customer FAQ page.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitFaq)} className='space-y-4'>
              <FormField
                control={form.control}
                name='question'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. How do I track my order?'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='answer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder='Provide a helpful and clear answer...'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='is_public'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm font-medium cursor-pointer'>
                        Publish to Public FAQ Page
                      </FormLabel>
                      <FormDescription className='text-xs'>
                        When checked, this FAQ will be visible to all store visitors.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className='gap-2 sm:gap-0 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isSaving}>
                  {isSaving
                    ? 'Saving...'
                    : editingFaq
                    ? 'Save Changes'
                    : 'Create FAQ'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
