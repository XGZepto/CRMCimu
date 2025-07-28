import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { EditTailorForm } from './edit-tailor-form'

async function getTailor(id: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/tailors/${id}/edit`)
  }

  try {
    const tailor = await payload.findByID({
      collection: 'tailors',
      id,
      depth: 1
    })

    return tailor
  } catch (error) {
    console.error('Error fetching tailor:', error)
    return null
  }
}

export default async function EditTailorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tailor = await getTailor(id)
  
  if (!tailor) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/tailors/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tailor
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Tailor</h1>
          <p className="text-sm text-muted-foreground">
            Update {tailor.name}'s information
          </p>
        </div>
      </div>

      {/* Form */}
      <EditTailorForm tailor={tailor} />
    </div>
  )
}