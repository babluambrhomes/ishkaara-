// Shared vocabulary for the search page filters and the admin redirect
// builder. Kept dependency-free so a server component (the search page) and a
// client component (the redirect builder) can both import it.

import { toSlug } from './utils'

export const SEARCH_SORT_ORDERS = [
  { value: 'price-low-to-high', name: 'Price: Low to high' },
  { value: 'price-high-to-low', name: 'Price: High to low' },
  { value: 'newest-arrivals', name: 'Newest arrivals' },
  { value: 'avg-customer-review', name: 'Avg. customer review' },
  { value: 'best-selling', name: 'Best selling' },
]

export const SEARCH_RATING_OPTIONS = [
  { value: '4', label: '4 & Up' },
  { value: '3', label: '3 & Up' },
  { value: '2', label: '2 & Up' },
  { value: '1', label: '1 & Up' },
]

export const DEFAULT_SEARCH_SORT = 'best-selling'

export type SearchFilterState = {
  q: string
  category: string
  brand: string
  price: string
  rating: string
  size: string
  tag: string
  sort: string
}

export const emptySearchFilterState: SearchFilterState = {
  q: '',
  category: 'all',
  brand: 'all',
  price: 'all',
  rating: 'all',
  size: 'all',
  tag: 'all',
  sort: DEFAULT_SEARCH_SORT,
}

export const isSearchUrl = (url: string) =>
  !!url && (url === '/search' || url.startsWith('/search?'))

// Builds a `/search?...` URL the search page can actually interpret.
export const buildSearchUrl = (state: SearchFilterState) => {
  const params = new URLSearchParams()
  if (state.q && state.q.trim()) params.set('q', state.q.trim())
  if (state.category && state.category !== 'all')
    params.set('category', state.category)
  if (state.brand && state.brand !== 'all') params.set('brand', state.brand)
  if (state.price && state.price !== 'all') params.set('price', state.price)
  if (state.rating && state.rating !== 'all')
    params.set('rating', state.rating)
  if (state.size && state.size !== 'all') params.set('size', state.size)
  if (state.tag && state.tag !== 'all') params.set('tag', toSlug(state.tag))
  // The search page falls back to "best-selling" when no sort is given, so the
  // default is left out of the URL entirely.
  if (state.sort && state.sort !== 'all' && state.sort !== DEFAULT_SEARCH_SORT)
    params.set('sort', state.sort)
  const qs = params.toString()
  return qs ? `/search?${qs}` : '/search'
}

// Reads a `/search?...` URL back into filter state. Any other URL returns the
// empty state so the builder can fall back to treating it as a custom URL.
export const parseSearchUrl = (url: string): SearchFilterState => {
  const state = { ...emptySearchFilterState }
  if (!isSearchUrl(url)) return state
  try {
    const u = new URL(url, 'http://local')
    state.q = u.searchParams.get('q') ?? ''
    state.category = u.searchParams.get('category') ?? 'all'
    state.brand = u.searchParams.get('brand') ?? 'all'
    state.price = u.searchParams.get('price') ?? 'all'
    state.rating = u.searchParams.get('rating') ?? 'all'
    state.size = u.searchParams.get('size') ?? 'all'
    state.tag = u.searchParams.get('tag') ?? 'all'
    state.sort = u.searchParams.get('sort') ?? DEFAULT_SEARCH_SORT
  } catch {
    return { ...emptySearchFilterState }
  }
  return state
}
