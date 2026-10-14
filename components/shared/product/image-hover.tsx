'use client'
import Image from 'next/image'
import { getImageUrl } from '@/lib/image-url'

const ImageHover = ({
  src,
  hoverSrc,
  alt,
}: {
  src: string
  hoverSrc: string
  alt: string
}) => {
  return (
    <div className='relative h-full w-full overflow-hidden'>
      <Image
        src={getImageUrl(src)}
        alt={alt}
        fill
        sizes='80vw'
        className='object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:-translate-y-full motion-reduce:transition-none'
      />
      <Image
        src={getImageUrl(hoverSrc)}
        alt={alt}
        fill
        sizes='80vw'
        className='absolute inset-0 object-contain mix-blend-multiply translate-y-full transition-transform duration-700 ease-out group-hover:translate-y-0 motion-reduce:transition-none'
      />
    </div>
  )
}

export default ImageHover
