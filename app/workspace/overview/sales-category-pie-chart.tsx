/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
  TooltipProps,
} from 'recharts'

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--gold))',
  'hsl(12 76% 61%)',
  'hsl(173 58% 39%)',
  'hsl(197 45% 42%)',
  'hsl(340 65% 55%)',
]

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean
  payload?: { name?: string; value: number; payload?: { _id?: string } }[]
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className='rounded-xl border border-border/60 bg-card px-3 py-2 shadow-lift'>
        <p className='text-xs font-medium text-muted-foreground'>
          {item.payload?._id ?? item.name}
        </p>
        <p className='mt-0.5 text-lg font-bold text-foreground'>
          {item.value}{' '}
          <span className='text-xs font-medium text-muted-foreground'>
            sales
          </span>
        </p>
      </div>
    )
  }
  return null
}

export default function SalesCategoryPieChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className='flex h-[280px] items-center justify-center text-sm text-muted-foreground'>
        No category data for this period
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + (d.totalSales || 0), 0)

  return (
    <div className='flex flex-col items-center gap-6 sm:flex-row'>
      <div className='relative h-[260px] w-full sm:w-1/2'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data}
              dataKey='totalSales'
              nameKey='_id'
              cx='50%'
              cy='50%'
              innerRadius={62}
              outerRadius={100}
              paddingAngle={2}
              stroke='hsl(var(--card))'
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-xs font-medium text-muted-foreground'>
            Total
          </span>
          <span className='text-2xl font-bold tracking-tight'>{total}</span>
          <span className='text-[11px] text-muted-foreground'>sales</span>
        </div>
      </div>

      <ul className='w-full space-y-3 sm:w-1/2'>
        {data.map((entry, index) => {
          const pct = total
            ? Math.round((entry.totalSales / total) * 100)
            : 0
          return (
            <li key={entry._id} className='flex items-center gap-3'>
              <span
                className='h-3 w-3 shrink-0 rounded-full'
                style={{ background: COLORS[index % COLORS.length] }}
              />
              <span className='min-w-0 flex-1 truncate text-sm font-medium'>
                {entry._id}
              </span>
              <span className='text-sm font-semibold tabular-nums'>
                {entry.totalSales}
              </span>
              <span className='w-10 text-right text-xs text-muted-foreground tabular-nums'>
                {pct}%
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
