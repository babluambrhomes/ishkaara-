'use client'
import {
  ArrowUpRight,
  BadgeDollarSign,
  Barcode,
  CreditCard,
  Users,
} from 'lucide-react'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, calculatePastDate, formatDateTime, formatNumber } from '@/lib/utils'

import SalesCategoryPieChart from './sales-category-pie-chart'

import React, { useEffect, useState, useTransition } from 'react'
import { DateRange } from 'react-day-picker'
import { getOrderSummary } from '@/lib/actions/order.actions'
import SalesAreaChart from './sales-area-chart'
import { CalendarDateRangePicker } from './date-range-picker'
import { IOrderList } from '@/types'
import ProductPrice from '@/components/shared/product/product-price'
import { Skeleton } from '@/components/ui/skeleton'
import TableChart from './table-chart'

function StatCard({
  title,
  value,
  icon: Icon,
  linkHref,
  linkLabel,
  tint,
  glow,
}: {
  title: string
  value: React.ReactNode
  icon: React.ElementType
  linkHref: string
  linkLabel: string
  tint: string
  glow: string
}) {
  return (
    <Card className='group relative overflow-hidden rounded-2xl border-border/60 transition-all duration-300 hover:-translate-y-0.5 '>
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-circle blur-2xl',
          glow
        )}
      />
      <CardHeader className='relative flex flex-row items-center justify-between space-y-0 pb-3'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            tint
          )}
        >
          <Icon className='h-5 w-5' />
        </span>
      </CardHeader>
      <CardContent className='relative'>
        <div className='text-2xl font-bold tracking-tight lg:text-3xl'>
          {value}
        </div>
        <Link
          href={linkHref}
          className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline'
        >
          {linkLabel}
          <ArrowUpRight className='h-3 w-3' />
        </Link>
      </CardContent>
    </Card>
  )
}

export default function OverviewReport({ isAdmin }: { isAdmin: boolean }) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ [key: string]: any }>()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition()
  useEffect(() => {
    if (date) {
      startTransition(async () => {
        setData(await getOrderSummary(date))
      })
    }
  }, [date])

  if (!data)
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-9 w-40 rounded-lg' />
          <Skeleton className='h-10 w-56 rounded-lg' />
        </div>

        {/* First Row */}
        <div
          className={cn(
            'grid grid-cols-2 gap-4',
            isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          )}
        >
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className='h-36 rounded-2xl' />
          ))}
        </div>

        {/* Second Row */}
        {isAdmin && <Skeleton className='h-[30rem] rounded-2xl' />}

        {/* Third Row */}
        <div className={cn('grid gap-4', isAdmin && 'md:grid-cols-2')}>
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className='h-72 rounded-2xl' />
          ))}
        </div>

        {/* Fourth Row */}
        <div className='grid gap-4 md:grid-cols-2'>
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className='h-72 rounded-2xl' />
          ))}
        </div>
      </div>
    )

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='h1-bold'>Dashboard</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Overview of your store performance
          </p>
        </div>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>

      <div
        className={cn(
          'grid grid-cols-2 gap-4',
          isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        )}
      >
        {isAdmin && (
          <StatCard
            title='Total Revenue'
            value={<ProductPrice price={data.totalSales} plain />}
            icon={BadgeDollarSign}
            linkHref='/workspace/orders'
            linkLabel='View revenue'
            tint='bg-primary/10 text-primary'
            glow='bg-primary/20'
          />
        )}
        <StatCard
          title='Sales'
          value={formatNumber(data.ordersCount)}
          icon={CreditCard}
          linkHref='/workspace/orders'
          linkLabel='View orders'
          tint='bg-gold/15 text-gold'
          glow='bg-gold/20'
        />
        <StatCard
          title='Customers'
          value={data.usersCount}
          icon={Users}
          linkHref='/workspace/users'
          linkLabel='View customers'
          tint='bg-emerald-500/10 text-emerald-600'
          glow='bg-emerald-500/20'
        />
        <StatCard
          title='Products'
          value={data.productsCount}
          icon={Barcode}
          linkHref='/workspace/products'
          linkLabel='View products'
          tint='bg-sky-500/10 text-sky-600'
          glow='bg-sky-500/20'
        />
      </div>

      {isAdmin && (
        <Card className='rounded-2xl border-border/60'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0'>
            <div className='space-y-1'>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                Daily revenue for the selected period
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <SalesAreaChart data={data.salesChartData} />
          </CardContent>
        </Card>
      )}

      <div className={cn('grid gap-4', isAdmin && 'md:grid-cols-2')}>
        {isAdmin && (
          <Card className='rounded-2xl border-border/60'>
            <CardHeader>
              <CardTitle>How much you’re earning</CardTitle>
              <CardDescription>Estimated · Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <TableChart data={data.monthlySales} labelType='month' />
            </CardContent>
          </Card>
        )}
        <Card className='rounded-2xl border-border/60'>
          <CardHeader>
            <CardTitle>Product performance</CardTitle>
            <CardDescription>
              {formatDateTime(date!.from!).dateOnly} to{' '}
              {formatDateTime(date!.to!).dateOnly}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableChart data={data.topSalesProducts} labelType='product' />
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='rounded-2xl border-border/60'>
          <CardHeader>
            <CardTitle>Best-Selling Categories</CardTitle>
            <CardDescription>Share of total sales</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesCategoryPieChart data={data.topSalesCategories} />
          </CardContent>
        </Card>
        <Card className='rounded-2xl border-border/60'>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest orders in this period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='text-right'>Total</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.latestOrders.map((order: IOrderList) => (
                  <TableRow key={order._id}>
                    <TableCell className='font-medium'>
                      {order.user ? order.user.name : 'Deleted User'}
                    </TableCell>

                    <TableCell className='text-muted-foreground'>
                      {formatDateTime(order.createdAt).dateOnly}
                    </TableCell>
                    <TableCell className='text-right'>
                      <ProductPrice price={order.totalPrice} plain />
                    </TableCell>

                    <TableCell className='text-right'>
                      <Link
                        href={`/workspace/orders/${order._id}`}
                        className='text-sm font-medium text-primary hover:underline'
                      >
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
