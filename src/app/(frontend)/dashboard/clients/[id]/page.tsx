import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Phone, MapPin, Calendar, Package, Clock, CheckCircle, XCircle, Truck, ExternalLink, FileText, Plus } from "lucide-react"

function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return ''
  
  // If it starts with +1, format as US number
  if (phoneNumber.startsWith('+1') && phoneNumber.length === 12) {
    const number = phoneNumber.slice(2)
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
  }
  
  // For other international numbers, just return as is
  return phoneNumber
}

function getPhoneLink(phoneNumber: string): string {
  return `tel:${phoneNumber}`
}

function getMapsLink(address: any): string {
  if (!address) return ''
  const addressString = `${address.street}${address.apt ? ' ' + address.apt : ''}, ${address.city}, ${address.state} ${address.zip}`
  return `https://maps.apple.com/?q=${encodeURIComponent(addressString)}`
}

async function getCustomer(id: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/clients/${id}`)
  }

  try {
    const customer = await payload.findByID({
      collection: 'customers',
      id,
      depth: 1
    })

    // Get orders for this customer
    const orders = await payload.find({
      collection: 'orders',
      where: {
        customer: {
          equals: id
        }
      },
      depth: 2,
      sort: '-createdAt'
    })

    return {
      customer,
      orders: orders.docs || []
    }
  } catch (error) {
    console.error('Error fetching customer:', error)
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

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getCustomer(id)
  
  if (!data) {
    notFound()
  }

  const { customer, orders } = data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{customer.name}</h1>
        <p className="text-sm text-muted-foreground">Client ID: {customer.id}</p>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {customer.phoneNumber && (
              <a href={getPhoneLink(customer.phoneNumber)} className="block">
                <div className="flex items-center space-x-3 p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation group">
                  <div className="flex-shrink-0">
                    <Phone className="h-5 w-5 text-green-600 group-hover:text-green-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone • Tap to call</p>
                    <p className="text-sm font-medium truncate group-hover:text-green-700">{formatPhoneNumber(customer.phoneNumber)}</p>
                  </div>
                </div>
              </a>
            )}

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Member Since</p>
                <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Orders</p>
                <p className="text-sm font-medium">{orders.length}</p>
              </div>
            </div>
          </div>

          {customer.address && (
            <div className="mt-6 pt-6 border-t">
              <a href={getMapsLink(customer.address)} target="_blank" rel="noopener noreferrer" className="block">
                <div className="flex items-start space-x-3 p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation group">
                  <div className="flex-shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600 group-hover:text-blue-700 mt-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Address • Tap for directions</p>
                    <div className="text-sm space-y-1">
                      <p className="font-medium group-hover:text-blue-700">{customer.address.street}</p>
                      {customer.address.apt && <p className="text-muted-foreground">{customer.address.apt}</p>}
                      <p className="text-muted-foreground">
                        {customer.address.city}, {customer.address.state} {customer.address.zip}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Additional Information */}
      {customer.dataPoints && customer.dataPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Additional Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customer.dataPoints.map((item: any, index: number) => (
                <div key={index} className="bg-muted/50 p-4 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{item.dataPoint}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span>Orders ({orders.length})</span>
              </CardTitle>
              <CardDescription>
                Order history and current status for this client.
              </CardDescription>
            </div>
            {orders.length > 0 && (
              <Link href={`/dashboard/orders/new?customer=${customer.id}`}>
                <Button size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Order Intent</span>
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const config = statusConfig[order.status as keyof typeof statusConfig]
                const StatusIcon = config.icon
                
                return (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${config.color} text-white`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {formatDate(order.createdAt)}
                          </p>
                          {order.scheduledVisit && (
                            <p className="text-sm text-muted-foreground">
                              Scheduled: {formatDateTime(order.scheduledVisit)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {order.items && order.items.length > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <Badge variant={config.badgeVariant}>{config.label}</Badge>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This client hasn't placed any orders yet.
              </p>
              <Link href={`/dashboard/orders/new?customer=${customer.id}`}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create First Order Intent</span>
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pb-6">
        <Link href={`/dashboard/clients/${customer.id}/edit`} className="flex-1">
          <Button variant="outline" className="w-full flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Edit Client</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}