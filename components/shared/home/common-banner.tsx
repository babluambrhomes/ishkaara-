import Image from 'next/image'
import Link from 'next/link'

import { getImageUrl } from '@/lib/image-url'
import type { HeroBannerItem } from './home-carousel'

export default function CommonBanner({ banner }: { banner: HeroBannerItem }) {
  const image = getImageUrl(banner.bannerUrl)
  if (!image) return null

  return (
    <Link
      href={`/product/${banner.productSlug}`}
      className='block w-full overflow-hidden rounded-2xl bg-white'
    >
      <div className='relative h-[40vh] w-full'>
        <Image
          src={image}
          alt={banner.productSlug}
          fill
          sizes='100vw'
          className='object-cover'
        />
      </div>
    </Link>
  )
}
