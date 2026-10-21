'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getImageUrl } from '@/lib/image-url'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

export default function ProductGallery({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className=' flex flex-col gap-3 '>
     

      <div className='relative overflow-hidden rounded-3xl  p-6 '>
        <Zoom>
          <div className='relative h-[380px] sm:h-[480px]'>
            <Image
              src={getImageUrl(images[selectedImage])}
              alt={'product image'}
              fill
              sizes='70vw'
              className='object-contain drop-shadow-sm'
              priority
            />
          </div>
        </Zoom>
      </div>
       <div className='flex flex-col gap-2 sm:gap-3'>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            onMouseOver={() => setSelectedImage(index)}
            aria-label={`View product image ${index + 1}`}
            className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white transition-all sm:h-[72px] sm:w-[72px] ${
              selectedImage === index
                ? 'ring-2 ring-gold ring-offset-2 ring-offset-background '
                : 'ring-1 ring-border hover:ring-primary/40'
            }`}
          >
            <Image
              src={getImageUrl(image)}
              alt='product image'
              width={56}
              height={56}
              className='object-contain'
            />
          </button>
        ))}
      </div>
    </div>
  )
}