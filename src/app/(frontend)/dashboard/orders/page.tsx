import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Package, Plus } from "lucide-react"
import { OrdersClient } from "./orders-client"

async function getOrders() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/orders`)
  }

  try {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage and track customer orders through their lifecycle.
        </p>
      </div>

      <OrdersClient orders={orders} />

      {/* Floating Add Order Intent Button */}
      <Link href="/dashboard/orders/new">
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation active:scale-95 z-40">
          <Plus className="h-6 w-6" />
        </button>
      </Link>
    </div>
  )
}