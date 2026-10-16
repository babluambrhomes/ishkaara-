
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
 
  [3, 3, 6],        // 25% - 25% - 50%
  [6, 3, 3],        // 50% - 25% - 25%
  [3, 6, 3],        // 25% - 50% - 25%

  [9, 3],           // 75% - 25%
  [3, 9],           // 25% - 75%
  [5, 7],           // 42% - 58%
  [7, 5],           // 58% - 42%

  [3, 3, 3, 3],     // 4 equal cards
  [2, 2, 4, 4],     // 17% - 17% - 33% - 33%
  [4, 2, 2, 4],     // 33% - 17% - 17% - 33%
  [2, 4, 4, 2],     // 17% - 33% - 33% - 17%

  [2, 2, 2, 6],     // 3 small + 1 large
  [6, 2, 2, 2],     // 1 large + 3 small
  [3, 3, 2, 4],     // Mixed 4 cards
  [4, 2, 3, 3],     // Mixed 4 cards

  [8, 2, 2],        // 1 large + 2 small
  [2, 8, 2],        // Center large
  [2, 2, 8],        // Last large
  [5, 4, 3],        // 42% - 33% - 25%
  [3, 4, 5],        // 25% - 33% - 42%
  [4, 5, 3],        // 33% - 42% - 25%
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
