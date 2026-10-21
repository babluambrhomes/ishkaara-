
'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import ImageHover from '../product/image-hover'
import { getImageUrl } from '@/lib/image-url'

export type HomeFilterSectionItem = {
  name?: string
  imgurl: string[]
  redirect?: string
  details?: string
}

export type HomeFilterData = {
  _id?: string
  title?: string
  section: HomeFilterSectionItem[]
  redirect?: string
  order?: number
  details?: string
}

export function HomeFilterSection({
  filters,
}: {
  filters: HomeFilterData[]
}) {
  if (!filters?.length) return null

  return (
    <div className="flex flex-col gap-10">
      {filters.map((filter, filterIndex) => (
        <section
          key={filter._id ?? filter.title ?? filterIndex}
          className="w-full bg-white"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              {filter.title && (
                <h2 className="premium-title text-xl lg:text-2xl">
                  {filter.title}
                </h2>
              )}

              {filter.title && filter.redirect && (
                <Link
                  className="premium-title shrink-0 text-sm lg:text-base"
                  href={filter.redirect}
                >
                  See All
                </Link>
              )}
            </div>

            {filter.details && (
              <p className="mt-1 text-sm text-muted-foreground">
                {filter.details}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filter.section?.map((item, index) => {
              const images = item.imgurl ?? []

              const card = (
                <div className="group flex flex-col gap-3">
                  <div className="relative aspect-square w-full overflow-hidden border border-border/60 bg-muted">
                    {images.length > 1 ? (
                      <ImageHover
                        src={getImageUrl(images[0])}
                        hoverSrc={getImageUrl(images[1])}
                        alt={item.name ?? ''}
                      />
                    ) : images.length === 1 ? (
                      <Image
                        src={getImageUrl(images[0])}
                        alt={item.name ?? ''}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-xs text-muted-foreground">
                          {item.name ?? 'No image'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    {item.name && (
                      <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                        {item.name}
                      </p>
                    )}

                    {item.details && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.details}
                      </p>
                    )}
                  </div>
                </div>
              )

              return item.redirect ? (
                <Link
                  key={item.redirect + index}
                  href={`${item.redirect}`}
                  className="block min-w-0"
                >
                  {card}
                </Link>
              ) : (
                <div key={item.name ?? index} className="min-w-0">
                  {card}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
