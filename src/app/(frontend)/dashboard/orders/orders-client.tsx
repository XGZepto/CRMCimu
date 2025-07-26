"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Phone,
  MapPin,
  Truck,
  FileText,
  ShoppingBag,
  ExternalLink
} from "lucide-react"

const statusConfig = {
  intent: {
    label: "Intent",
    icon: Clock,
    color: "bg-blue-500",
    badgeVariant: "secondary" as const
  },
  inProgress: {
    label: "In Progress", 
    icon: Truck,
    color: "bg-yellow-500",
    badgeVariant: "default" as const
  },
  completed: {
    label: "Completed",
    icon: CheckCircle, 
    color: "bg-green-500",
    badgeVariant: "outline" as const
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-500", 
    badgeVariant: "destructive" as const
  }
}

function OrderCard({ order }: { order: any }) {
  const config = statusConfig[order.status as keyof typeof statusConfig]
  const StatusIcon = config.icon

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const deliveredItems = order.items?.filter((item: any) => item.status === 'delivered') || []
  const totalItems = order.items?.length || 0
  const customer = order.customer

  return (
    <Link href={`/dashboard/orders/${order.id}`}>
      <Card className="w-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${config.color} text-white`}>
                <StatusIcon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{customer?.name || 'No customer assigned'}</CardTitle>
                {customer?.phoneNumber && (
                  <CardDescription className="flex items-center space-x-2">
                    <Phone className="h-3 w-3" />
                    <span>{customer.phoneNumber}</span>
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={config.badgeVariant}>{config.label}</Badge>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {customer?.address && (
            <div className="flex items-start space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {typeof customer.address === 'string' 
                  ? customer.address 
                  : `${customer.address.street}${customer.address.apt ? ', ' + customer.address.apt : ''}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}`
                }
              </span>
            </div>
          )}

          {order.status === 'intent' && (
            <div className="space-y-3">
              {order.scheduledVisit && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Scheduled: {formatDate(order.scheduledVisit)}</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Click to manage pickup and add items
              </div>
            </div>
          )}

          {order.status === 'inProgress' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Items Progress</span>
                <span className="font-medium">{deliveredItems.length}/{totalItems} delivered</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (deliveredItems.length / totalItems) * 100 : 0}%` }}
                />
              </div>
              <div className="space-y-2">
                {order.items?.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <ShoppingBag className="h-3 w-3" />
                      <span>{item.name}</span>
                    </span>
                    <Badge 
                      variant={item.status === 'delivered' ? 'outline' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
                {totalItems > 3 && (
                  <p className="text-xs text-muted-foreground">+{totalItems - 3} more items</p>
                )}
              </div>
            </div>
          )}

          {order.status === 'completed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span>{order.completedAt ? formatDate(order.completedAt) : formatDate(order.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              {order.totalAmount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">${order.totalAmount}</span>
                </div>
              )}
            </div>
          )}

          {order.status === 'cancelled' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cancelled</span>
                <span>{order.cancelledAt ? formatDate(order.cancelledAt) : formatDate(order.updatedAt)}</span>
              </div>
              {order.cancelReason && (
                <p className="text-sm text-muted-foreground italic">{order.cancelReason}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export function OrdersClient({ orders }: { orders: any[] }) {
  const [activeTab, setActiveTab] = useState("all")

  const filterOrders = (status?: string) => {
    if (!status || status === "all") return orders
    return orders.filter(order => order.status === status)
  }

  const getStatusCount = (status?: string) => {
    return filterOrders(status).length
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all" className="text-xs sm:text-sm">
          All ({getStatusCount()})
        </TabsTrigger>
        <TabsTrigger value="intent" className="text-xs sm:text-sm">
          Intent ({getStatusCount("intent")})
        </TabsTrigger>
        <TabsTrigger value="inProgress" className="text-xs sm:text-sm">
          In Progress ({getStatusCount("inProgress")})
        </TabsTrigger>
        <TabsTrigger value="completed" className="text-xs sm:text-sm">
          Completed ({getStatusCount("completed")})
        </TabsTrigger>
        <TabsTrigger value="cancelled" className="text-xs sm:text-sm">
          Cancelled ({getStatusCount("cancelled")})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterOrders().map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="intent" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterOrders("intent").map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="inProgress" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterOrders("inProgress").map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="completed" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterOrders("completed").map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="cancelled" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterOrders("cancelled").map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </TabsContent>

      {filterOrders(activeTab === "all" ? undefined : activeTab).length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No orders found</h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === "all" ? "Create your first order to get started." : `No ${activeTab} orders at the moment.`}
          </p>
        </div>
      )}
    </Tabs>
  )
}