import Link from 'next/link'
import PostForm from '../post-form'
import { Metadata } from 'next'
import { getCategoriesByType } from '@/lib/actions/category.actions'

export const metadata: Metadata = {
  title: 'Create Blog Post',
}

const CreatePostPage = async () => {
  const categories = await getCategoriesByType('blog')
  return (
    <main className='max-w-full p-4'>
      <div className='flex mb-4'>
        <Link href='/admin/blog/posts'>Posts</Link>
        <span className='mx-1'>›</span>
        <Link href='/admin/blog/posts/create'>Create</Link>
      </div>

      <div className='my-8'>
        <PostForm type='Create' categories={categories} />
      </div>
    </main>
  )
}

export default CreatePostPage