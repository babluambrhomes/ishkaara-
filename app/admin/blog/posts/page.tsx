import { Metadata } from 'next'
import PostList from './post-list'

export const metadata: Metadata = {
  title: 'Admin Blog Posts',
}

export default async function AdminBlog() {
  return <PostList />
}