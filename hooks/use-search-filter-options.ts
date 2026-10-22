'use client'

import { useEffect, useState } from 'react'

import {
  getAllBrands,
  getAllCategories,
  getAllSizes,
  getAllTags,
  getPriceBounds,
} from '@/lib/actions/product.actions'

// The admin home-layout form renders one redirect builder for the layout plus
// one per section, so the option lists are fetched once and cached per
// category instead of being re-queried by every builder on screen.
type ScopedOptions = { brands: string[]; tags: string[]; sizes: string[] }

const categoriesCache = new Map<string, Promise<string[]>>()
const priceBoundsCache = new Map<string, Promise<{ min: number; max: number }>>()
const scopedCache = new Map<string, Promise<ScopedOptions>>()

const scopedKey = (category: string) => category || 'all'

const fetchCategories = () => {
  const key = 'all'
  const cached = categoriesCache.get(key)
  if (cached) return cached
  const promise = getAllCategories().then((cats) => cats.map((c) => c.name))
  categoriesCache.set(key, promise)
  return promise
}

const fetchPriceBounds = () => {
  const key = 'all'
  const cached = priceBoundsCache.get(key)
  if (cached) return cached
  const promise = getPriceBounds()
  priceBoundsCache.set(key, promise)
  return promise
}

const fetchScoped = (category: string) => {
  const key = scopedKey(category)
  const cached = scopedCache.get(key)
  if (cached) return cached
  const promise = Promise.all([
    getAllBrands({ category }),
    getAllTags({ category }),
    getAllSizes({ category }),
  ]).then(([brands, tags, sizes]) => ({ brands, tags, sizes }))
  scopedCache.set(key, promise)
  return promise
}

export type SearchFilterOptions = {
  categories: string[]
  brands: string[]
  tags: string[]
  sizes: string[]
  priceBounds: { min: number; max: number }
  loading: boolean
}

export function useSearchFilterOptions(category = 'all') {
  const [options, setOptions] = useState<SearchFilterOptions>({
    categories: [],
    brands: [],
    tags: [],
    sizes: [],
    priceBounds: { min: 0, max: 1000 },
    loading: true,
  })

  useEffect(() => {
    let active = true

    const load = async () => {
      const [categories, priceBounds, scoped] = await Promise.all([
        fetchCategories(),
        fetchPriceBounds(),
        fetchScoped(category),
      ])

      if (!active) return
      setOptions({
        categories,
        brands: scoped.brands,
        tags: scoped.tags,
        sizes: scoped.sizes,
        priceBounds,
        loading: false,
      })
    }

    load()

    return () => {
      active = false
    }
  }, [category])

  return options
}

export default useSearchFilterOptions
