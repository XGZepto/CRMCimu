import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { CreateOrderIntentForm } from './create-order-intent-form'

async function getCustomers() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/orders/new`)
  }

  try {
    const customers = await payload.find({
      collection: 'customers',
      limit: 1000,
      sort: 'name'
    })
    
    return customers.docs || []
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

export default async function NewOrderPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ customer?: string }> 
}) {
  const { customer: preselectedCustomerId } = await searchParams
  const customers = await getCustomers()

  return (
    <div className="space-y-6 mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Order Intent</h1>
        <p className="text-muted-foreground">
          Schedule a pickup visit with a customer to create items for their order.
        </p>
      </div>

      <CreateOrderIntentForm customers={customers} preselectedCustomerId={preselectedCustomerId} />
    </div>
  )
}