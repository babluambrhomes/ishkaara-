import { Metadata } from 'next'

import OverviewReport from './overview-report'
import { auth } from '@/auth'
import { isStaffRole } from '@/lib/roles'
export const metadata: Metadata = {
  title: 'Workspace Dashboard',
}
const DashboardPage = async () => {
  const session = await auth()
  if (!isStaffRole(session?.user.role))
    throw new Error('Staff permission required')

  return <OverviewReport />
}

export default DashboardPage
