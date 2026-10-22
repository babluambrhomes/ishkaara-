
'use client'

import { useEffect, useState } from 'react'
import CommonBanner from './common-banner'
import useWindowSize from '@/hooks/use-window-size'

import type { HeroBannerItem } from './home-carousel'

type Banner = HeroBannerItem

type RandomBannerGridProps = {
  banners: Banner[]
}

type BannerRow = {
  banners: Banner[]
  columns: number[]
}

const desktopPatterns: number[][] = [
  [12],             // 100%
  [6, 6],           // 50% - 50%
  [4, 4, 4],        // 33% - 33% - 33%
  [5, 7],           // 42% - 58%
  [7, 5],           // 58% - 42%

]

const mobilePatterns: number[][] = [
  [12],             // 100%
  [6, 6],           // 50% - 50%
]

function generateLayout(banners: Banner[], isMobile: boolean): BannerRow[] {
  const rows: BannerRow[] = []
  let index = 0

  const patterns = isMobile ? mobilePatterns : desktopPatterns

  while (index < banners.length) {
    const remaining = banners.length - index

    const availablePatterns = patterns.filter(
      (pattern) => pattern.length <= remaining
    )

    const pattern =
      availablePatterns[
        Math.floor(Math.random() * availablePatterns.length)
      ]

    rows.push({
      banners: banners.slice(index, index + pattern.length),
      columns: pattern,
    })

    index += pattern.length
  }

  return rows
}

export default function RandomBannerGrid({
  banners,
}: RandomBannerGridProps) {
  const [rows, setRows] = useState<BannerRow[]>([])
  const { width } = useWindowSize()
  const isMobile = width <= 768

  useEffect(() => {
    setRows(generateLayout(banners, isMobile))
  }, [banners, isMobile])

  if (!banners.length) return null

  return (
    <div className="space-y-4">
      {rows.map((row, rowIndex) => (
        <div
          key={`${rowIndex}-${row.banners.map((b) => b._id).join('-')}`}
          className="grid grid-cols-12 gap-4"
        >
          {row.banners.map((banner, index) => (
            <div
              key={banner._id}
              className="col-span-1"
              style={{
                gridColumn: `span ${row.columns[index]} / span ${row.columns[index]}`,
              }}
            >
              <CommonBanner banner={banner} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
