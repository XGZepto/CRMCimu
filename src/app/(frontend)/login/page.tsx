import { GalleryVerticalEnd } from "lucide-react"
import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"
import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect } from "next/navigation"

// Component to handle search params
async function LoginPageContent({ searchParams }: { searchParams: { error?: string; redirect?: string } }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/dashboard?message=${encodeURIComponent('You are already logged in')}`)
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          CimuCRM
        </a>
        <LoginForm 
          errorMessage={searchParams.error ? decodeURIComponent(searchParams.error) : undefined}
          redirectPath={searchParams.redirect ? decodeURIComponent(searchParams.redirect) : undefined}
        />
      </div>
    </div>
  )
}

export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string; redirect?: string }> 
}) {
  const params = await searchParams
  
  return (
    <Suspense fallback={
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex items-center gap-2 self-center font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            CimuCRM
          </div>
          <div className="h-96 w-full animate-pulse bg-muted-foreground/20 rounded-lg" />
        </div>
      </div>
    }>
      <LoginPageContent searchParams={params} />
    </Suspense>
  )
}
