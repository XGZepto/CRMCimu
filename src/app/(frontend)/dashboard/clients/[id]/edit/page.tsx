import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { EditClientForm } from "./edit-client-form"

async function getCustomer(id: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/clients/${id}/edit`)
  }

  try {
    const customer = await payload.findByID({
      collection: 'customers',
      id,
      depth: 1
    })

    return customer
  } catch (error) {
    console.error('Error fetching customer:', error)
    return null
  }
}

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await getCustomer(id)
  
  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href={`/dashboard/clients/${customer.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Client</h1>
        <p className="text-muted-foreground">Update {customer.name}'s information</p>
      </div>

      <EditClientForm customer={customer} />
    </div>
  )
}