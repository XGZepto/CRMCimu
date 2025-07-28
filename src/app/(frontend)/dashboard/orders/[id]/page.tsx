import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Phone, MapPin, Package, CheckCircle, Clock, Truck, XCircle, FileText, User, Scissors, CreditCard, Send, DollarSign, Receipt } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderStatusManager } from './order-status-manager'

async function getOrder(id: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/orders/${id}`)
  }

  try {
    const order = await payload.findByID({
      collection: 'orders',
      id,
      depth: 2
    })

    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

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

const itemStatusConfig = {
  pendingTailor: { label: "Pending Tailor", color: "bg-gray-500" },
  inProgress: { label: "In Progress", color: "bg-yellow-500" },
  completed: { label: "Completed", color: "bg-blue-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateShort(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const config = statusConfig[order.status as keyof typeof statusConfig]
  const StatusIcon = config.icon
  
  const customer = typeof order.customer === 'object' ? order.customer : null
  const items = order.items || []
  const deliveredItems = items.filter((item: any) => item.status === 'delivered')
  const totalItems = items.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-3 rounded-full ${config.color} text-white`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(-8)}</h1>
              <p className="text-muted-foreground">
                Created {formatDateShort(order.createdAt)}
              </p>
            </div>
          </div>
        </div>
        <Badge variant={config.badgeVariant} className="text-sm px-3 py-1">
          {config.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{customer?.name || 'No customer assigned'}</h3>
                {customer?.phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phoneNumber}</span>
                  </div>
                )}
              </div>
              
              {customer?.address && (
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {typeof customer.address === 'string' 
                      ? customer.address 
                      : `${customer.address.street}${customer.address.apt ? ', ' + customer.address.apt : ''}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}`
                    }
                  </span>
                </div>
              )}

              {customer?.dataPoints && customer.dataPoints.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Customer Notes</h4>
                  <div className="space-y-1">
                    {customer.dataPoints.map((point: any, index: number) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {point.dataPoint}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.scheduledVisit && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Scheduled Visit</h4>
                  <p className="text-sm">{formatDate(order.scheduledVisit)}</p>
                </div>
              )}
              
              {order.actualVisit && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Actual Visit</h4>
                  <p className="text-sm">{formatDate(order.actualVisit)}</p>
                </div>
              )}

              <OrderStatusManager order={order} />
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Items ({totalItems})</span>
                </CardTitle>
                {order.status === 'inProgress' && (
                  <div className="text-sm text-muted-foreground">
                    {deliveredItems.length}/{totalItems} delivered
                  </div>
                )}
              </div>
              {order.status === 'inProgress' && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalItems > 0 ? (deliveredItems.length / totalItems) * 100 : 0}%` }}
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No items added to this order yet.</p>
                  {(order.status === 'intent' || order.status === 'inProgress') && (
                    <Link href={`/dashboard/orders/${order.id}/add-items`}>
                      <Button className="mt-4" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Add Items
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item: any) => {
                    const itemStatus = itemStatusConfig[item.status as keyof typeof itemStatusConfig]
                    const primaryImage = item.attachedImages?.[0]?.image
                    
                    return (
                      <Link key={item.id} href={`/dashboard/items/${item.id}`} className="block group">
                        <Card className="transition-all duration-200 group-hover:shadow-md group-hover:border-primary/50 p-4">
                          <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                            {/* Image Column */}
                            <div className="aspect-square">
                              {primaryImage ? (
                                <img
                                  src={primaryImage.url || primaryImage.filename}
                                  alt={primaryImage.alt || `Image for ${item.name}`}
                                  className="w-full h-full object-cover rounded-md"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Details Column */}
                            <div className="flex flex-col justify-center">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                                  {item.name}
                                </h3>
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs whitespace-nowrap"
                                  style={{ 
                                    backgroundColor: itemStatus?.color,
                                    color: 'white' // Assuming dark colors, might need adjustment
                                  }}
                                >
                                  {itemStatus?.label || item.status}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1.5 text-xs text-muted-foreground">
                                {item.price && (
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>
                                      Price: <strong>${(item.price / 100).toFixed(2)}</strong>
                                    </span>
                                  </div>
                                )}
                                {item.assignedTailor && (
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3" />
                                    <span>
                                      Tailor: <strong>{item.assignedTailor.name}</strong>
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {item.scheduledDelivery && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    Delivery: <strong>{formatDateShort(item.scheduledDelivery)}</strong>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Action Buttons */}
              {(order.status === 'intent' || order.status === 'inProgress') && items.length > 0 && (
                <div className="mt-6 pt-4 border-t space-y-3">
                  <Link href={`/dashboard/orders/${order.id}/add-items`}>
                    <Button variant="outline" className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Add More Items
                    </Button>
                  </Link>
                </div>
              )}

              {order.status === 'completed' && (
                <div className="mt-6 pt-4 border-t">
                  <div className="space-y-4">
                    {/* Financial Summary */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Financial Summary</span>
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Customer Total:</span>
                          <span className="font-semibold">
                            ${(items.reduce((sum: number, item: any) => sum + (item.price || 0), 0) / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tailor Payouts:</span>
                          <span className="font-semibold text-orange-600">
                            -${(items.reduce((sum: number, item: any) => sum + (item.tailorPayout || 0), 0) / 100).toFixed(2)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between font-bold">
                          <span>Net Profit:</span>
                          <span className="text-green-600">
                            {`$${(((items.reduce((sum: number, item: any) => sum + (item.price || 0), 0) -
                               items.reduce((sum: number, item: any) => sum + (item.tailorPayout || 0), 0))) / 100).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stripe Actions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Payment & Invoicing</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button variant="default" className="w-full">
                          <Receipt className="h-4 w-4 mr-2" />
                          Create Invoice
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Send Invoice
                        </Button>
                      </div>
                      
                      <Button variant="secondary" className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Create Payment Link
                      </Button>
                      
                      <div className="text-xs text-muted-foreground">
                        <p>• Invoice will include all completed items</p>
                        <p>• Payment link allows customer to pay online</p>
                        <p>• All transactions processed via Stripe</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}