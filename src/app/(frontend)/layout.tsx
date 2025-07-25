import React from 'react'

import { AuthProvider } from './_providers/Auth'

export const metadata = {
  description: '',
  title: 'CimuCRM',
}

import '@/styles/global.css'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <AuthProvider api="rest">
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
