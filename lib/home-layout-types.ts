// Shared home-layout vocabulary. Kept in a dependency-free module so the
// mongoose model, the zod validator, the storefront component and the admin
// select all read from the same list.
export const HOME_LAYOUT_TYPES = [
  'grid',
  'horizontal',
  'featured',
  'carousel',
  'carousel-square',
  'carousel-circle',
  'carousel-rectangle',
  'masonry',
] as const

export type HomeLayoutType = (typeof HOME_LAYOUT_TYPES)[number]

export const HOME_LAYOUT_LABELS: Record<HomeLayoutType, string> = {
  grid: 'Grid (tiles)',
  horizontal: 'Horizontal (scroll row)',
  featured: 'Featured (large + grid)',
  carousel: 'Carousel (auto-play)',
  'carousel-square': 'Carousel (square cards)',
  'carousel-circle': 'Carousel (circle chips)',
  'carousel-rectangle': 'Carousel (portrait cards)',
  masonry: 'Masonry (columns)',
}
