'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Mail,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebouncedValue } from '@/hooks/use-debounce'
import { useToast } from '@/hooks/use-toast'
import {
  deleteNewsletterSubscriber,
  getAllActiveSubscriberEmails,
  getAllNewsletterSubscribers,
  NewsletterSubscriberListData,
  toggleNewsletterSubscription,
} from '@/lib/actions/newsletter.actions'
import { cn, formatDateTime } from '@/lib/utils'

export default function WorkspaceNewsletterPage() {
  const { toast } = useToast()
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [data, setData] = useState<NewsletterSubscriberListData>()
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebouncedValue(query, 500)
  const [isCopying, setIsCopying] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  const loadData = useCallback(
    (searchQuery: string, pageNumber: number, status: string) => {
      startTransition(async () => {
        try {
          const res = await getAllNewsletterSubscribers({
            page: pageNumber,
            query: searchQuery,
            status,
          })
          setData(res)
        } catch (error) {
          toast({
            variant: 'destructive',
            description:
              error instanceof Error
                ? error.message
                : 'Failed to load newsletter subscribers',
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

  const handleToggle = async (id: string) => {
    try {
      const res = await toggleNewsletterSubscription(id)
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        loadData(debouncedQuery, page, statusFilter)
      }
    } catch {
      toast({
        variant: 'destructive',
        description: 'Failed to update subscriber status',
      })
    }
  }

  const handleCopyEmails = async () => {
    setIsCopying(true)
    try {
      const emails = await getAllActiveSubscriberEmails()
      if (!emails.length) {
        toast({ description: 'No active subscribers found to copy.' })
        return
      }
      await navigator.clipboard.writeText(emails.join(', '))
      setCopied(true)
      toast({
        description: `Copied ${emails.length} active email address${
          emails.length > 1 ? 'es' : ''
        } to clipboard!`,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        variant: 'destructive',
        description: 'Failed to copy emails to clipboard.',
      })
    } finally {
      setIsCopying(false)
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
          <h1 className='text-2xl font-bold tracking-tight'>Newsletter Subscribers</h1>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Manage your email subscribers and marketing contacts
          </p>
        </div>
        <Button
          onClick={handleCopyEmails}
          disabled={isCopying}
          variant='outline'
          className='self-start sm:self-auto gap-2'
        >
          {copied ? (
            <Check className='h-4 w-4 text-green-600' />
          ) : (
            <Copy className='h-4 w-4' />
          )}
          {copied ? 'Copied Emails!' : 'Copy Active Emails'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <div className='rounded-lg border bg-card p-4'>
          <div className='flex items-center gap-2 text-muted-foreground text-xs font-medium'>
            <Users className='h-4 w-4' />
            <span>Total Subscribers</span>
          </div>
          <div className='mt-2 text-2xl font-bold'>
            {data?.totalSubscribers ?? 0}
          </div>
        </div>

        <div className='rounded-lg border bg-card p-4'>
          <div className='flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium'>
            <UserCheck className='h-4 w-4' />
            <span>Active Subscriptions</span>
          </div>
          <div className='mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
            {data?.activeSubscribers ?? 0}
          </div>
        </div>

        <div className='rounded-lg border bg-card p-4'>
          <div className='flex items-center gap-2 text-muted-foreground text-xs font-medium'>
            <UserX className='h-4 w-4' />
            <span>Unsubscribed</span>
          </div>
          <div className='mt-2 text-2xl font-bold text-muted-foreground'>
            {(data?.totalSubscribers ?? 0) - (data?.activeSubscribers ?? 0)}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            className='w-full sm:max-w-xs'
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search email...'
          />
          <div className='flex items-center gap-1 rounded-lg bg-muted p-1'>
            {[
              { label: 'All', value: 'all' },
              { label: 'Subscribed', value: 'subscribed' },
              { label: 'Unsubscribed', value: 'unsubscribed' },
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
              {data?.totalSubscribers ?? 0}{' '}
              {data?.totalSubscribers === 1 ? 'subscriber' : 'subscribers'}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-lg border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed Date</TableHead>
              <TableHead className='w-[180px] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='h-32 text-center text-muted-foreground'>
                  No subscribers found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((sub) => (
                <TableRow key={String(sub._id)}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-muted-foreground' />
                      <a
                        href={`mailto:${sub.email}`}
                        className='font-medium text-foreground hover:text-primary hover:underline'
                      >
                        {sub.email}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sub.isSubscribed ? (
                      <Badge className='bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30'>
                        Subscribed
                      </Badge>
                    ) : (
                      <Badge className='bg-slate-500/15 text-slate-700 hover:bg-slate-500/20 dark:text-slate-400 border border-slate-500/30'>
                        Unsubscribed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    {formatDateTime(sub.createdAt).dateTime}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1.5'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleToggle(String(sub._id))}
                      >
                        {sub.isSubscribed ? 'Deactivate' : 'Activate'}
                      </Button>
                      <DeleteDialog
                        id={String(sub._id)}
                        action={deleteNewsletterSubscriber}
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
    </div>
  )
}
