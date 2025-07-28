import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Phone, MapPin, ChevronRight } from "lucide-react"

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

async function getCustomers() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/clients`)
  }

  try {
    const customers = await payload.find({
      collection: 'customers',
      depth: 1,
      limit: 100,
      sort: '-createdAt'
    })
    
    // Get orders count for each customer
    const customersWithOrders = await Promise.all(
      customers.docs.map(async (customer) => {
        const orders = await payload.find({
          collection: 'orders',
          where: {
            customer: {
              equals: customer.id
            }
          },
          limit: 0 // Just get count
        })
        return {
          ...customer,
          ordersCount: orders.totalDocs
        }
      })
    )
    
    return customersWithOrders || []
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

export default async function ClientsPage() {
  const clients = await getCustomers()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">
          Manage your customer database and relationships
        </p>
      </div>

      {/* Clients List */}
      {clients.length > 0 ? (
        <div className="space-y-6">
          {clients.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="block">
              <Card className="hover:shadow-md hover:bg-muted/30 transition-all duration-200 cursor-pointer group touch-manipulation active:scale-[0.98]">
                <CardContent className="px-4 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Client Name & ID */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mb-3">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                          {client.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded w-fit">
                          ID: {client.id}
                        </p>
                      </div>

                      {/* Contact & Address Row */}
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Phone */}
                        {client.phoneNumber && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">
                              {formatPhoneNumber(client.phoneNumber)}
                            </span>
                          </div>
                        )}
                        
                        {/* Address */}
                        {client.address && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground sm:col-span-1 lg:col-span-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {client.address.street}
                              {client.address.apt && `, ${client.address.apt}`}
                              {', '}
                              {client.address.city}, {client.address.state} {client.address.zip}
                            </span>
                          </div>
                        )}
                        
                        {/* Empty div to maintain grid when no address */}
                        {!client.address && client.phoneNumber && (
                          <div className="sm:col-span-1 lg:col-span-2"></div>
                        )}
                      </div>
                    </div>

                    {/* Right: Orders Badge & Chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className="text-xs font-medium">
                        {client.ordersCount} order{client.ordersCount !== 1 ? 's' : ''}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No clients found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first client to get started.
            </p>
            <Link href="/dashboard/clients/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Floating Add Client Button */}
      <Link href="/dashboard/clients/new">
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation active:scale-95 z-40">
          <Plus className="h-6 w-6" />
        </button>
      </Link>
    </div>
  )
}