import React from 'react'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className=' flex-1 px-3 py-8 '>
      <div className=' mx-auto space-y-4'>{children}</div>
    </div>
  )
}
