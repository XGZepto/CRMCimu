import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Phone, MapPin, Package, CheckCircle, Clock, Truck, XCircle, FileText, User, Scissors } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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

              {order.status === 'intent' && (
                <div className="pt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Pickup
                  </Button>
                  <Button size="sm" className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Mark as Picked Up
                  </Button>
                </div>
              )}
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
                  {order.status === 'intent' && (
                    <Button className="mt-4" size="sm">
                      Add Items During Pickup
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item: any, index: number) => {
                    const itemStatus = itemStatusConfig[item.status as keyof typeof itemStatusConfig]
                    return (
                      <div key={item.id || index}>
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold">{item.name}</h3>
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                                style={{ backgroundColor: itemStatus?.color }}
                              >
                                {itemStatus?.label || item.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              {item.price && (
                                <div>
                                  <span className="font-medium">Price:</span> ${item.price}
                                </div>
                              )}
                              {item.tailorPayout && (
                                <div>
                                  <span className="font-medium">Tailor Payout:</span> ${item.tailorPayout}
                                </div>
                              )}
                              {item.assignedTailor && (
                                <div className="flex items-center space-x-1">
                                  <Scissors className="h-3 w-3" />
                                  <span>{item.assignedTailor.name}</span>
                                </div>
                              )}
                            </div>

                            {item.scheduledDelivery && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <span className="font-medium">Scheduled Delivery:</span> {formatDateShort(item.scheduledDelivery)}
                              </div>
                            )}

                            {item.actualDelivery && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <span className="font-medium">Delivered:</span> {formatDateShort(item.actualDelivery)}
                              </div>
                            )}

                            {item.actionPoints && item.actionPoints.length > 0 && (
                              <div className="mt-3">
                                <h4 className="font-medium text-sm mb-1">Action Points:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {item.actionPoints.map((point: any, pointIndex: number) => (
                                    <li key={pointIndex}>• {point.actionPoint}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {item.attachedImages && item.attachedImages.length > 0 && (
                            <div className="ml-4">
                              <div className="flex flex-wrap gap-2">
                                {item.attachedImages.slice(0, 2).map((img: any, imgIndex: number) => (
                                  <div key={imgIndex} className="w-16 h-16 bg-muted rounded border">
                                    {/* Image placeholder - implement actual image display */}
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                      IMG
                                    </div>
                                  </div>
                                ))}
                                {item.attachedImages.length > 2 && (
                                  <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                                    +{item.attachedImages.length - 2}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {index < items.length - 1 && <Separator className="my-4" />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Action Buttons */}
              {order.status === 'inProgress' && (
                <div className="mt-6 pt-4 border-t">
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Items as Delivered
                  </Button>
                </div>
              )}

              {order.status === 'completed' && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold">
                      ${items.reduce((sum: number, item: any) => sum + (item.price || 0), 0)}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Send Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}