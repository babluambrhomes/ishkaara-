import { auth } from '@/auth'
import { isAdminRole } from '@/lib/roles'
import UserList from './user-list'

export default async function AdminUsersPage() {
  const session = await auth()
  const isAdmin = isAdminRole(session?.user?.role)

  return <UserList isAdmin={isAdmin} />
}
