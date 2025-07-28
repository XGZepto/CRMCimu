import React from 'react'

import { AuthProvider } from './_providers/Auth'
import { ThemeProvider } from '@/components/utils/ThemeProvider'

export const metadata = {
  description: '',
  title: 'CimuCRM',
}

import '@/styles/global.css'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider api="rest">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main>{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
