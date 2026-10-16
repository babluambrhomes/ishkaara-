export default function LoadingPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4'>
      <div className='relative h-12 w-12'>
        <div className='absolute inset-0 rounded-circle border-4 border-primary/10' />
        <div className='absolute inset-0 animate-spin rounded-circle border-4 border-transparent border-t-gold' />
      </div>
      <span className='mt-4 text-sm font-medium text-muted-foreground'>
        Loading...
      </span>
    </div>
  )
}
