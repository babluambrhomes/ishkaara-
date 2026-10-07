import { notFound } from 'next/navigation'

import { getBlogPostById } from '@/lib/actions/blog.actions'
import Link from 'next/link'
import PostForm from '../post-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Blog Post',
}

type UpdatePostProps = {
  params: Promise<{
    id: string
  }>
}

const UpdatePost = async (props: UpdatePostProps) => {
  const params = await props.params

  const { id } = params

  const post = await getBlogPostById(id)
  if (!post) notFound()
  return (
    <main className='max-w-full p-4'>
      <div className='flex mb-4'>
        <Link href='/admin/blog/posts'>Posts</Link>
        <span className='mx-1'>›</span>
        <Link href={`/admin/blog/posts/${post._id}`}>{post._id}</Link>
      </div>

      <div className='my-8'>
        <PostForm type='Update' post={post} postId={post._id} />
      </div>
    </main>
  )
}

export default UpdatePost