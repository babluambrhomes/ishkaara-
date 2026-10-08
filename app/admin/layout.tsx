import React from 'react'
import Menu from '@/components/shared/header/menu'
import { AdminShell } from './admin-shell'
import { getSetting } from '@/lib/actions/setting.actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = await getSetting()
  return (
    <AdminShell siteLogo={site.logo} menu={<Menu forAdmin />}>
      {children}
    </AdminShell>
  )
}
