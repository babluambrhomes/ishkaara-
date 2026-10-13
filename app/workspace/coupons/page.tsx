'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Ticket,
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
import { useDebouncedValue } from '@/hooks/use-debounce'
import { useToast } from '@/hooks/use-toast'
import {
  createCoupon,
  deleteCoupon,
  CouponListData,
  getAllCouponsForAdmin,
  toggleCouponStatus,
  updateCoupon,
} from '@/lib/actions/coupon.actions'
import { ICoupon } from '@/lib/models/coupon.model'
import { CouponInputSchema } from '@/lib/validator'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'

type CouponFormValues = z.infer<typeof CouponInputSchema>

const emptyCouponValues: CouponFormValues = {
  code: '',
  value: 0,
  status: 'Active',
  expiresAt: '',
  minAmount: 0,
}

export default function WorkspaceCouponsPage() {
  const { toast } = useToast()
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [data, setData] = useState<CouponListData>()
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebouncedValue(query, 500)

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(CouponInputSchema),
    defaultValues: emptyCouponValues,
  })

  const loadData = useCallback(
    (searchQuery: string, pageNumber: number, status: string) => {
      startTransition(async () => {
        try {
          const res = await getAllCouponsForAdmin({
            page: pageNumber,
            query: searchQuery,
            status,
          })
          setData(res)
        } catch (error) {
          toast({
            variant: 'destructive',
            description:
              error instanceof Error ? error.message : 'Failed to load coupons',
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
    setEditingCoupon(null)
    form.reset(emptyCouponValues)
    setDialogOpen(true)
  }

  const openEditDialog = (coupon: ICoupon) => {
    setEditingCoupon(coupon)
    form.reset({
      code: coupon.code,
      value: coupon.value,
      status: coupon.status,
      expiresAt: String(coupon.expiresAt).slice(0, 10),
      minAmount: coupon.minAmount ?? 0,
    })
    setDialogOpen(true)
  }

  const onSubmitCoupon = async (values: CouponFormValues) => {
    setIsSaving(true)
    try {
      const res = editingCoupon
        ? await updateCoupon({
            ...values,
            _id: editingCoupon._id as string,
          })
        : await createCoupon(values)

      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        setDialogOpen(false)
        form.reset(emptyCouponValues)
        loadData(debouncedQuery, page, statusFilter)
      }
    } catch {
      toast({
        variant: 'destructive',
        description: 'Failed to save coupon',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleCouponStatus(id)
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        loadData(debouncedQuery, page, statusFilter)
      }
    } catch {
      toast({
        variant: 'destructive',
        description: 'Failed to toggle coupon status',
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

  const isExpired = (coupon: ICoupon) =>
    new Date(coupon.expiresAt).getTime() < Date.now()

  return (
    <div className='space-y-4'>
      {/* Page Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-bold tracking-tight'>Coupons</h1>
            <Badge variant='outline' className='gap-1'>
              <Ticket className='h-3 w-3 text-gold' />
              {data?.activeCount ?? 0} Active
            </Badge>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Manage discount coupons customers can use at checkout
          </p>
        </div>

        <Button onClick={openCreateDialog} className='gap-1.5'>
          <Plus className='h-4 w-4' />
          Add Coupon
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
            placeholder='Search coupon code...'
          />
          <div className='flex items-center gap-1 rounded-lg bg-muted p-1'>
            {[
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
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
              {data?.totalCoupons ?? 0}{' '}
              {data?.totalCoupons === 1 ? 'Coupon' : 'Coupons'}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-lg border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[18%]'>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min. Order</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-[160px] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='h-32 text-center text-muted-foreground'
                >
                  No coupons found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((coupon) => (
                <TableRow key={coupon._id as string}>
                  <TableCell className='font-mono font-semibold align-top'>
                    {coupon.code}
                    <span className='block font-sans text-[11px] font-normal text-muted-foreground'>
                      Added {formatDateTime(coupon.createdAt).dateOnly}
                    </span>
                  </TableCell>
                  <TableCell className='align-top'>
                    {formatCurrency(coupon.value)} off
                  </TableCell>
                  <TableCell className='align-top'>
                    {coupon.minAmount > 0
                      ? formatCurrency(coupon.minAmount)
                      : '—'}
                  </TableCell>
                  <TableCell className='align-top'>
                    {formatDateTime(new Date(coupon.expiresAt)).dateOnly}
                    {isExpired(coupon) && (
                      <span className='block text-[11px] font-semibold text-red-500'>
                        Expired
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='align-top'>
                    {isExpired(coupon) ? (
                      <Badge className='bg-red-500/15 text-red-600 hover:bg-red-500/20 dark:text-red-400 border border-red-500/30'>
                        Expired
                      </Badge>
                    ) : coupon.status === 'Active' ? (
                      <Badge className='bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30'>
                        Active
                      </Badge>
                    ) : (
                      <Badge className='bg-slate-500/15 text-slate-700 hover:bg-slate-500/20 dark:text-slate-400 border border-slate-500/30'>
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-right align-top'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        title={
                          coupon.status === 'Active'
                            ? 'Deactivate coupon'
                            : 'Activate coupon'
                        }
                        onClick={() =>
                          handleToggleStatus(coupon._id as string)
                        }
                      >
                        {coupon.status === 'Active' ? (
                          <PowerOff className='h-4 w-4 text-muted-foreground' />
                        ) : (
                          <Power className='h-4 w-4 text-emerald-600' />
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openEditDialog(coupon)}
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </Button>
                      <DeleteDialog
                        id={coupon._id as string}
                        action={deleteCoupon}
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

      {/* Add / Edit Coupon Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? 'Update coupon details, value and validity.'
                : 'Create a discount coupon customers can use at checkout.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCoupon)} className='space-y-4'>
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. SAVE500'
                        className='font-mono uppercase'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      Customers will enter this code at checkout.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={1}
                          placeholder='e.g. 500'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='minAmount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min. Order Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          placeholder='e.g. 999'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className='text-xs'>
                        Minimum cart total to use this coupon.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='expiresAt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires On</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
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
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='Active'>Active</SelectItem>
                          <SelectItem value='Inactive'>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                    : editingCoupon
                    ? 'Save Changes'
                    : 'Create Coupon'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}