import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Package, Plus } from "lucide-react"
import { OrdersClient } from "./orders-client"

async function getOrders() {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config })
    const { permissions, user } = await payload.auth({ headers })

    if (!user) {
      redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/orders`)
    }

    const orders = await payload.find({
      collection: 'orders',
      depth: 1,
      limit: 100,
      sort: '-createdAt'
    })
    
    return orders.docs || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export default async function OrderPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders through their lifecycle.
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Order Intent</span>
        </Button>
      </div>

      <OrdersClient orders={orders} />
    </div>
  )
}