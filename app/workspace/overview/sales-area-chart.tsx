/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import ProductPrice from '@/components/shared/product/product-price'
import { formatDateTime } from '@/lib/utils'
import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-xl border border-border/60 bg-card px-3 py-2 '>
        <p className='text-xs font-medium text-muted-foreground'>
          {label && formatDateTime(new Date(label)).dateOnly}
        </p>
        <p className='text-primary mt-0.5 text-lg font-bold'>
          <ProductPrice price={payload[0].value} plain />
        </p>
      </div>
    )
  }
  return null
}

const CustomXAxisTick: React.FC<any> = ({ x, y, payload }) => {
  return (
    <text
      x={x}
      y={y + 12}
      textAnchor='middle'
      fill='hsl(var(--muted-foreground))'
      className='text-[11px]'
    >
      {formatDateTime(new Date(payload.value)).dateOnly}
    </text>
  )
}

export default function SalesAreaChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width='100%' height={400}>
      <AreaChart
        data={data}
        margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id='salesFill' x1='0' y1='0' x2='0' y2='1'>
            <stop
              offset='0%'
              stopColor='hsl(var(--primary))'
              stopOpacity={0.35}
            />
            <stop
              offset='100%'
              stopColor='hsl(var(--primary))'
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke='hsl(var(--border))'
          strokeDasharray='4 4'
        />
        <XAxis
          dataKey='date'
          tick={<CustomXAxisTick />}
          interval={3}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `$${value}`}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          width={56}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'hsl(var(--primary) / 0.35)', strokeWidth: 1 }}
        />
        <Area
          type='monotone'
          dataKey='totalSales'
          stroke='hsl(var(--primary))'
          strokeWidth={2.5}
          fill='url(#salesFill)'
          activeDot={{
            r: 5,
            stroke: 'hsl(var(--card))',
            strokeWidth: 2,
            fill: 'hsl(var(--primary))',
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
