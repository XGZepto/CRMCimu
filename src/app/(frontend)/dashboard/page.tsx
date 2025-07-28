import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Package, Calendar as CalendarIcon, Scissors, Users, DollarSign, MapPin } from "lucide-react"
import { getPayload } from "payload"
import { redirect } from 'next/navigation'
import { HydrateClientUser } from '@/components/utils/HydrateClientUser'
import { ActivityEvent } from '@/components/dashboard/activity-event'
import Link from 'next/link'

// Custom Progress Bar Component
function ProgressBar({ value, max, className = "" }: { value: number, max: number, className?: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className={`w-full bg-secondary rounded-full h-2 ${className}`}>
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

// Simple Chart Component
function SimpleBarChart({ data, className = "" }: { data: { label: string, value: number, color?: string }[], className?: string }) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground">{item.value}</span>
          </div>
          <ProgressBar value={item.value} max={maxValue} />
        </div>
      ))}
    </div>
  )
}


export default async function DashboardPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard`,
    )
  }

  // Fetch real statistics
  const [customersResult, tailorsResult, itemsResult, ordersResult] = await Promise.all([
    payload.find({ collection: 'customers', limit: 0 }),
    payload.find({ collection: 'tailors', limit: 0 }),
    payload.find({ collection: 'items', limit: 0 }),
    payload.find({ collection: 'orders', limit: 0 })
  ])

  // Get detailed data for calculations
  const [itemsDetailed, ordersDetailed] = await Promise.all([
    payload.find({ 
      collection: 'items', 
      depth: 2,
      limit: 1000,
      sort: '-createdAt'
    }),
    payload.find({ 
      collection: 'orders', 
      depth: 2,
      limit: 1000,
      sort: '-createdAt'
    })
  ])

  // ------------------------------------------------------------
  // Resolve any customer references that are still only IDs
  // ------------------------------------------------------------
  const missingCustomerIds = new Set<string>()

  // Collect from orders
  ordersDetailed.docs.forEach((order: any) => {
    if (order?.customer && typeof order.customer === 'string') {
      missingCustomerIds.add(order.customer)
    }
  })

  // Collect from items (via relatedOrder)
  itemsDetailed.docs.forEach((item: any) => {
    const relatedOrder = item?.relatedOrder?.docs?.[0]
    if (relatedOrder?.customer && typeof relatedOrder.customer === 'string') {
      missingCustomerIds.add(relatedOrder.customer)
    }
  })

  const customersMap: Record<string, any> = {}
  if (missingCustomerIds.size > 0) {
    const customerDocs = await Promise.all(
      Array.from(missingCustomerIds).map(async (cid) => {
        try {
          return await payload.findByID({ collection: 'customers', id: cid, depth: 1 })
        } catch {
          return null
        }
      })
    )
    customerDocs.forEach((cust) => {
      if (cust) customersMap[cust.id] = cust
    })
  }

  const getCustomerObj = (customerRef: any) => {
    if (customerRef && typeof customerRef === 'object') return customerRef
    if (typeof customerRef === 'string') return customersMap[customerRef]
    return undefined
  }
  
  // Calculate statistics
  const totalCustomers = customersResult.totalDocs
  const totalTailors = tailorsResult.totalDocs
  const totalItems = itemsResult.totalDocs
  const totalOrders = ordersResult.totalDocs

  // Calculate revenue from completed/delivered items
  const completedItems = itemsDetailed.docs.filter(item => 
    item.status === 'delivered' && item.price
  )
  const monthlyRevenue = completedItems.reduce((sum, item) => sum + (item.price || 0), 0)

  // Calculate item status distribution
  const itemsByStatus = itemsDetailed.docs.reduce((acc, item) => {
    acc[item.status || 'unknown'] = (acc[item.status || 'unknown'] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate order status distribution
  const ordersByStatus = ordersDetailed.docs.reduce((acc, order) => {
    acc[order.status || 'unknown'] = (acc[order.status || 'unknown'] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get scheduled pickups (orders with status 'intent' and scheduledVisit)
  const scheduledPickups = ordersDetailed.docs
    .filter(order => 
      order.status === 'intent' && 
      order.scheduledVisit
      // Include both future and past scheduled visits (overdue pickups need attention too)
    )
    .sort((a, b) => new Date(a.scheduledVisit!).getTime() - new Date(b.scheduledVisit!).getTime())
    .slice(0, 10)

  // Get scheduled deliveries (items with status 'completed' and scheduledDelivery)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Start of today for better date comparison
  
  const scheduledDeliveries = itemsDetailed.docs
    .filter(item => {
      // Include all completed items with scheduledDelivery dates (both future and past)
      return item.status === 'completed' && item.scheduledDelivery
    })
    .sort((a, b) => new Date(a.scheduledDelivery!).getTime() - new Date(b.scheduledDelivery!).getTime())
    .slice(0, 10)

  // Prepare chart data
  const itemStatusData = [
    { label: 'Pending Tailor', value: itemsByStatus.pendingTailor || 0, color: 'bg-yellow-500' },
    { label: 'In Progress', value: itemsByStatus.inProgress || 0, color: 'bg-blue-500' },
    { label: 'Completed', value: itemsByStatus.completed || 0, color: 'bg-green-500' },
    { label: 'Delivered', value: itemsByStatus.delivered || 0, color: 'bg-purple-500' }
  ].filter(item => item.value > 0)

  const orderStatusData = [
    { label: 'Intents', value: ordersByStatus.intent || 0 },
    { label: 'In Progress', value: ordersByStatus.inProgress || 0 },
    { label: 'Completed', value: ordersByStatus.completed || 0 }
  ].filter(item => item.value > 0)

  // Combine all activities in chronological order
  const allActivities = [...scheduledPickups.map(order => {
    const customer = getCustomerObj(order.customer)
    const visitDate = new Date(order.scheduledVisit!)
    const isOverdue = visitDate < new Date()
    const timeStr = visitDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    
    return {
      id: order.id,
      baseUrl: "/dashboard/orders",
      title: customer?.name || 'Unknown Customer',
      subtitle: `Pickup - Order ${order.id.slice(-6)}`,
      time: timeStr,
      type: 'pickup' as const,
      isOverdue,
      priority: isOverdue ? 'urgent' as const : 'normal' as const,
      address: customer?.address ? `${customer.address.street}, ${customer.address.city}, ${customer.address.state}` : undefined,
      phoneNumber: customer?.phoneNumber ?? undefined,
      date: visitDate
    }
  }), ...scheduledDeliveries.map(item => {
    const orderObj: any = item.relatedOrder?.docs?.[0]
    const customer = getCustomerObj(orderObj?.customer)
    const deliveryDate = new Date(item.scheduledDelivery!)
    const isOverdue = deliveryDate < new Date()
    const timeStr = deliveryDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    
    return {
      id: item.id,
      baseUrl: "/dashboard/items",
      title: item.name,
      subtitle: `Delivery to ${customer?.name || 'Unknown Customer'}`,
      time: timeStr,
      type: 'delivery' as const,
      isOverdue,
      priority: isOverdue ? 'urgent' as const : 'normal' as const,
      address: customer?.address ? `${customer.address.street}, ${customer.address.city}, ${customer.address.state}` : undefined,
      phoneNumber: customer?.phoneNumber ?? undefined,
      date: deliveryDate
    }
  })].sort((a, b) => a.date.getTime() - b.date.getTime())
  
  // Separate urgent and normal activities
  const urgentActivities = allActivities.filter(a => a.priority === 'urgent')
  const normalActivities = allActivities.filter(a => a.priority === 'normal')

  return (
    <div className="space-y-6">
      <HydrateClientUser permissions={permissions as any} user={user} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Dashboard</h1>
          <p className="text-muted-foreground">
            {urgentActivities.length > 0 
              ? `${urgentActivities.length} urgent task${urgentActivities.length > 1 ? 's' : ''} require attention` 
              : "All activities are on track"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/dashboard/orders/new">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Pickup
            </Link>
          </Button>
        </div>
      </div>

      {/* Urgent Activities */}
      {urgentActivities.length > 0 && (
        <Card className="border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <Clock className="h-5 w-5" />
              <span>Urgent Activities</span>
              <Badge variant="destructive" className="ml-2">
                {urgentActivities.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              These activities require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentActivities.map((activity) => (
              <ActivityEvent
                key={`${activity.type}-${activity.id}`}
                {...activity}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Activities Timeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Upcoming Activities</span>
              </CardTitle>
              <CardDescription>
                Chronological view of all scheduled events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {normalActivities.length === 0 && urgentActivities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <h3 className="font-medium mb-2">No upcoming activities</h3>
                  <p className="text-sm mb-4">Start by scheduling a pickup or delivery</p>
                  <Button asChild>
                    <Link href="/dashboard/orders/new">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Schedule Pickup
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {normalActivities.map((activity) => (
                    <ActivityEvent
                      key={`${activity.type}-${activity.id}`}
                      {...activity}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-semibold text-foreground">{totalCustomers}</div>
                  <div className="text-xs text-muted-foreground">Clients</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-semibold text-foreground">{totalItems}</div>
                  <div className="text-xs text-muted-foreground">Items</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-semibold text-foreground">{totalTailors}</div>
                  <div className="text-xs text-muted-foreground">Tailors</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-semibold text-foreground">${monthlyRevenue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion Rate</span>
                    <span className="font-medium">
                      {totalItems > 0 ? Math.round(((itemsByStatus.delivered || 0) / totalItems) * 100) : 0}%
                    </span>
                  </div>
                  <ProgressBar 
                    value={itemsByStatus.delivered || 0} 
                    max={totalItems || 1} 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Active Work</span>
                    <span className="font-medium">{itemsByStatus.inProgress || 0}</span>
                  </div>
                  <ProgressBar 
                    value={itemsByStatus.inProgress || 0} 
                    max={Math.max(totalItems / 3, itemsByStatus.inProgress || 0)} 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pending Assignment</span>
                    <span className="font-medium">{itemsByStatus.pendingTailor || 0}</span>
                  </div>
                  <ProgressBar 
                    value={itemsByStatus.pendingTailor || 0} 
                    max={Math.max(totalItems / 3, itemsByStatus.pendingTailor || 0)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild className="w-full justify-start">
                  <Link href="/dashboard/orders/new">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule Pickup
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/clients">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Clients
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/items">
                    <Package className="h-4 w-4 mr-2" />
                    View Items
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/orders">
                    <MapPin className="h-4 w-4 mr-2" />
                    All Orders
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}