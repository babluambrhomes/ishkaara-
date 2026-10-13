'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  User,
  Eye,
} from 'lucide-react'

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
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'
import { useDebouncedValue } from '@/hooks/use-debounce'
import { useToast } from '@/hooks/use-toast'
import {
  ContactMessageListData,
  deleteContactMessage,
  getAllContactMessages,
  updateContactMessage,
} from '@/lib/actions/contact.actions'
import { IContactMessage } from '@/lib/models/contact-message.model'
import { cn, formatDateTime } from '@/lib/utils'

const STATUS_OPTIONS = ['New', 'In Progress', 'Resolved', 'Closed']

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'New':
      return (
        <Badge className='bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30'>
          New
        </Badge>
      )
    case 'In Progress':
      return (
        <Badge className='bg-blue-500/15 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400 border border-blue-500/30'>
          In Progress
        </Badge>
      )
    case 'Resolved':
      return (
        <Badge className='bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30'>
          Resolved
        </Badge>
      )
    case 'Closed':
      return (
        <Badge className='bg-slate-500/15 text-slate-700 hover:bg-slate-500/20 dark:text-slate-400 border border-slate-500/30'>
          Closed
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}

export default function WorkspaceMessagesPage() {
  const { toast } = useToast()
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [data, setData] = useState<ContactMessageListData>()
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebouncedValue(query, 500)

  // Details dialog state
  const [selectedMessage, setSelectedMessage] = useState<IContactMessage | null>(null)
  const [editStatus, setEditStatus] = useState<string>('New')
  const [editComments, setEditComments] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  const loadData = useCallback(
    (searchQuery: string, pageNumber: number, status: string) => {
      startTransition(async () => {
        try {
          const res = await getAllContactMessages({
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
                : 'Failed to load contact messages',
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

  const handleOpenDetails = (msg: IContactMessage) => {
    setSelectedMessage(msg)
    setEditStatus(msg.status || 'New')
    setEditComments(msg.comments || '')
  }

  const handleSaveStatus = async () => {
    if (!selectedMessage) return
    setIsUpdating(true)
    try {
      const res = await updateContactMessage({
        id: selectedMessage._id as string,
        status: editStatus,
        comments: editComments,
      })
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        setSelectedMessage(null)
        loadData(debouncedQuery, page, statusFilter)
      }
    } catch {
      toast({
        variant: 'destructive',
        description: 'Failed to update message status',
      })
    } finally {
      setIsUpdating(false)
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
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold tracking-tight'>Contact Messages</h1>
          {data?.newMessagesCount !== undefined && data.newMessagesCount > 0 && (
            <Badge className='bg-amber-600 text-white'>
              {data.newMessagesCount} New
            </Badge>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            className='w-full sm:max-w-xs'
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search name, email, phone, subject...'
          />
          <div className='flex items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1'>
            {['all', 'New', 'In Progress', 'Resolved', 'Closed'].map((s) => (
              <button
                key={s}
                type='button'
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                  statusFilter === s
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        <div className='text-sm text-muted-foreground'>
          {isPending ? (
            <span>Loading...</span>
          ) : (
            <span>
              {data?.totalMessages ?? 0}{' '}
              {data?.totalMessages === 1 ? 'message' : 'messages'}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-lg border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className='w-[140px] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-32 text-center text-muted-foreground'>
                  No messages found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((msg) => (
                <TableRow key={msg._id as string}>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='font-medium text-foreground'>{msg.name}</span>
                      <a
                        href={`mailto:${msg.email}`}
                        className='text-xs text-muted-foreground hover:text-primary hover:underline'
                      >
                        {msg.email}
                      </a>
                      <a
                        href={`tel:${msg.phone}`}
                        className='text-xs text-muted-foreground hover:text-primary hover:underline'
                      >
                        {msg.phone}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='max-w-[280px]'>
                      <div className='font-medium truncate'>{msg.subject}</div>
                      <div className='text-xs text-muted-foreground line-clamp-1'>
                        {msg.message}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(msg.status)}</TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    {formatDateTime(msg.createdAt).dateTime}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1.5'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleOpenDetails(msg)}
                      >
                        <Eye className='mr-1 h-3.5 w-3.5' />
                        View
                      </Button>
                      <DeleteDialog
                        id={msg._id as string}
                        action={deleteContactMessage}
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

      {/* Details & Action Modal */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center justify-between pr-4'>
                  <span>Message Details</span>
                  {getStatusBadge(selectedMessage.status)}
                </DialogTitle>
                <DialogDescription>
                  Received on {formatDateTime(selectedMessage.createdAt).dateTime}
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-2 text-sm'>
                {/* Sender Info Card */}
                <div className='rounded-lg border bg-muted/30 p-3 space-y-2'>
                  <div className='flex items-center gap-2 font-medium'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span>{selectedMessage.name}</span>
                  </div>
                  <div className='flex flex-wrap gap-4 text-xs text-muted-foreground'>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className='flex items-center gap-1 hover:text-primary hover:underline'
                    >
                      <Mail className='h-3.5 w-3.5' />
                      {selectedMessage.email}
                    </a>
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className='flex items-center gap-1 hover:text-primary hover:underline'
                    >
                      <Phone className='h-3.5 w-3.5' />
                      {selectedMessage.phone}
                    </a>
                  </div>
                </div>

                {/* Subject & Message */}
                <div>
                  <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1'>
                    Subject
                  </h4>
                  <p className='font-medium text-foreground'>
                    {selectedMessage.subject}
                  </p>
                </div>

                <div>
                  <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1'>
                    Message
                  </h4>
                  <div className='rounded-md border bg-background p-3 text-sm whitespace-pre-wrap leading-relaxed'>
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Quick Reply Links */}
                <div className='flex flex-wrap gap-2 pt-1'>
                  <Button asChild size='sm' variant='outline'>
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                        selectedMessage.subject
                      )}`}
                    >
                      <Mail className='mr-1.5 h-3.5 w-3.5' />
                      Reply via Email
                    </a>
                  </Button>
                  <Button asChild size='sm' variant='outline'>
                    <a href={`tel:${selectedMessage.phone}`}>
                      <Phone className='mr-1.5 h-3.5 w-3.5' />
                      Call {selectedMessage.phone}
                    </a>
                  </Button>
                </div>

                {/* Workspace Status & Notes Action */}
                <div className='border-t pt-4 space-y-3'>
                  <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    Workspace Action & Status
                  </h4>

                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium'>Status</label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium'>
                      Internal Notes / Comments
                    </label>
                    <Textarea
                      rows={3}
                      value={editComments}
                      onChange={(e) => setEditComments(e.target.value)}
                      placeholder='Add internal notes about this inquiry or follow-up status...'
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className='gap-2 sm:gap-0'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </Button>
                <Button
                  type='button'
                  disabled={isUpdating}
                  onClick={handleSaveStatus}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
