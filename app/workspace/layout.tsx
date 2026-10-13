import React from 'react'
import { redirect } from 'next/navigation'

import Menu from '@/components/shared/header/menu'
import { WorkspaceShell } from './workspace-shell'
import { auth } from '@/auth'
import { isAdminRole, isStaffRole } from '@/lib/roles'
import { getSetting } from '@/lib/actions/setting.actions'

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = session?.user?.role
  if (!isStaffRole(role)) redirect('/')

  const { site } = await getSetting()
  return (
    <WorkspaceShell
      siteLogo={site.logo}
      menu={<Menu forAdmin />}
      isAdmin={isAdminRole(role)}
    >
      {children}
    </WorkspaceShell>
  )
}
