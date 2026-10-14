import { Metadata } from 'next'

import OverviewReport from './overview-report'
import { auth } from '@/auth'
import { isAdminRole, isStaffRole } from '@/lib/roles'
export const metadata: Metadata = {
  title: 'Workspace Dashboard',
}
const DashboardPage = async () => {
  const session = await auth()
  if (!isStaffRole(session?.user.role))
    throw new Error('Staff permission required')

  const isAdmin = isAdminRole(session?.user?.role)

  return <OverviewReport isAdmin={isAdmin} />
}

export default DashboardPage
