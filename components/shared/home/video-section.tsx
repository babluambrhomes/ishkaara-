import type { IVideo } from '@/lib/models/video.model'

export default function VideoSection({ videos }: { videos: IVideo[] }) {
  if (!videos?.length) return null

  console.log('videos', videos)

  return (
    <section className='w-full bg-white'>
      <div className='mb-6'>
        <h2 className='premium-title text-xl lg:text-2xl'>Reels & Videos</h2>
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {videos.map((video) => (
          <div
            key={video._id}
            className='overflow-hidden rounded-2xl border border-border/60 bg-black'
          >
            <div className='relative aspect-video w-full'>
              <iframe
                src={video.videoUrl}
                title={video.title || 'Video'}
                loading='lazy'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                className='absolute inset-0 h-full w-full'
              />
            </div>
           
          </div>
        ))}
      </div>
    </section>
  )
}
