import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Phone, MapPin, Calendar, Package, Clock, CheckCircle, XCircle, Truck, ExternalLink, Scissors } from "lucide-react"

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

async function getTailor(id: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/tailors/${id}`)
  }

  try {
    const tailor = await payload.findByID({
      collection: 'tailors',
      id,
      depth: 1
    })

    // Get items assigned to this tailor
    const items = await payload.find({
      collection: 'items',
      where: {
        assignedTailor: {
          equals: id
        }
      },
      depth: 2,
      sort: '-createdAt'
    })

    return {
      tailor,
      items: items.docs || []
    }
  } catch (error) {
    console.error('Error fetching tailor:', error)
    return null
  }
}

const itemStatusConfig = {
  pending: {
    label: "Pending",
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

export default async function TailorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getTailor(id)
  
  if (!data) {
    notFound()
  }

  const { tailor, items } = data

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
        <Link href="/dashboard/tailors">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tailors
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{tailor.name}</h1>
        <p className="text-sm text-muted-foreground">Tailor ID: {tailor.id}</p>
      </div>

      {/* Tailor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tailor.phoneNumber && (
              <a href={getPhoneLink(tailor.phoneNumber)} className="block">
                <div className="flex items-center space-x-3 p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation group">
                  <div className="flex-shrink-0">
                    <Phone className="h-5 w-5 text-green-600 group-hover:text-green-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone • Tap to call</p>
                    <p className="text-sm font-medium truncate group-hover:text-green-700">{formatPhoneNumber(tailor.phoneNumber)}</p>
                  </div>
                </div>
              </a>
            )}

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Joined</p>
                <p className="text-sm font-medium">{formatDate(tailor.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Scissors className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned Items</p>
                <p className="text-sm font-medium">{items.length}</p>
              </div>
            </div>
          </div>

          {tailor.address && (
            <div className="mt-6 pt-6 border-t">
              <a href={getMapsLink(tailor.address)} target="_blank" rel="noopener noreferrer" className="block">
                <div className="flex items-start space-x-3 p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation group">
                  <div className="flex-shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600 group-hover:text-blue-700 mt-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Address • Tap for directions</p>
                    <div className="text-sm space-y-1">
                      <p className="font-medium group-hover:text-blue-700">{tailor.address.street}</p>
                      {tailor.address.apt && <p className="text-muted-foreground">{tailor.address.apt}</p>}
                      <p className="text-muted-foreground">
                        {tailor.address.city}, {tailor.address.state} {tailor.address.zip}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Items Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <span>Assigned Items ({items.length})</span>
          </CardTitle>
          <CardDescription>
            Items currently assigned to this tailor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item: any) => {
                const config = itemStatusConfig[item.status as keyof typeof itemStatusConfig] || itemStatusConfig.pending
                const StatusIcon = config.icon
                
                return (
                  <Link key={item.id} href={`/dashboard/items/${item.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${config.color} text-white`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{item.title || `Item #${item.id}`}</p>
                          <p className="text-sm text-muted-foreground">
                            Assigned {formatDate(item.createdAt)}
                          </p>
                          {item.category && (
                            <p className="text-sm text-muted-foreground">
                              Category: {item.category}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={config.badgeVariant}>{config.label}</Badge>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No items assigned</h3>
              <p className="text-sm text-muted-foreground">
                This tailor doesn't have any items assigned yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Edit Button */}
      <Link href={`/dashboard/tailors/${tailor.id}/edit`}>
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation active:scale-95 z-40">
          <Edit className="h-5 w-5" />
        </button>
      </Link>
    </div>
  )
}