import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'
import { AddItemsForm } from './add-items-form'

async function getOrderAndTailors(id: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/orders/${id}/add-items`)
  }

  try {
    const [order, tailors] = await Promise.all([
      payload.findByID({
        collection: 'orders',
        id,
        depth: 2
      }),
      payload.find({
        collection: 'tailors',
        limit: 1000,
        sort: 'name'
      })
    ])

    return { order, tailors: tailors.docs || [] }
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

export default async function AddItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getOrderAndTailors(id)

  if (!data) {
    notFound()
  }

  const { order, tailors } = data

  // Allow adding items for order intents as well as in-progress orders
  if (order.status !== 'inProgress' && order.status !== 'intent') {
    redirect(`/dashboard/orders/${id}`)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Items to Order</h1>
        <p className="text-muted-foreground">
          {order.status === 'intent'
            ? `Add items that will be picked up from ${typeof order.customer === 'object' && order.customer ? order.customer.name : 'the customer'}.`
            : `Add items that were picked up from ${typeof order.customer === 'object' && order.customer ? order.customer.name : 'the customer'}.`}
        </p>
      </div>

      <AddItemsForm order={order} />
    </div>
  )
}