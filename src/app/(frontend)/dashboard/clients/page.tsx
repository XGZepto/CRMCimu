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
        <div className="space-y-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card className="hover:shadow-md hover:bg-muted/30 transition-all duration-200 cursor-pointer group touch-manipulation active:scale-[0.98]">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    {/* Client Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{client.name}</h3>
                        <p className="text-xs text-muted-foreground">ID: {client.id}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                        {client.phoneNumber && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-primary">{formatPhoneNumber(client.phoneNumber)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs font-medium">
                            {client.ordersCount} order{client.ordersCount !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>

                      {client.address && (
                        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {client.address.street}
                            {client.address.apt && `, ${client.address.apt}`}
                            {', '}
                            {client.address.city}, {client.address.state} {client.address.zip}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Chevron Icon */}
                    <div className="flex-shrink-0 ml-4">
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
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation active:scale-95 z-40">
          <Plus className="h-6 w-6" />
        </button>
      </Link>
    </div>
  )
}