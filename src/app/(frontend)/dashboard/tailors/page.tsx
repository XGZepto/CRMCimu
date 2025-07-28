import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Scissors, Plus, Phone, MapPin, ChevronRight } from "lucide-react"

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

async function getTailors() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/tailors`)
  }

  try {
    const tailors = await payload.find({
      collection: 'tailors',
      depth: 1,
      limit: 100,
      sort: '-createdAt'
    })
    
    // Get items count for each tailor
    const tailorsWithItems = await Promise.all(
      tailors.docs.map(async (tailor) => {
        const items = await payload.find({
          collection: 'items',
          where: {
            assignedTailor: {
              equals: tailor.id
            }
          },
          limit: 0 // Just get count
        })
        return {
          ...tailor,
          itemsCount: items.totalDocs
        }
      })
    )
    
    return tailorsWithItems || []
  } catch (error) {
    console.error('Error fetching tailors:', error)
    return []
  }
}

export default async function TailorsPage() {
  const tailors = await getTailors()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tailors</h1>
        <p className="text-sm text-muted-foreground">
          Manage your tailor network and assignments
        </p>
      </div>

      {/* Tailors List */}
      {tailors.length > 0 ? (
        <div className="space-y-6">
          {tailors.map((tailor) => (
            <Link key={tailor.id} href={`/dashboard/tailors/${tailor.id}`} className="block">
              <Card className="hover:shadow-md hover:bg-muted/30 transition-all duration-200 cursor-pointer group touch-manipulation active:scale-[0.98]">
                <CardContent className="px-4 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Tailor Name & ID */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mb-3">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                          {tailor.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded w-fit">
                          ID: {tailor.id}
                        </p>
                      </div>

                      {/* Contact & Address Row */}
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Phone */}
                        {tailor.phoneNumber && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">
                              {formatPhoneNumber(tailor.phoneNumber)}
                            </span>
                          </div>
                        )}
                        
                        {/* Address */}
                        {tailor.address && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground sm:col-span-1 lg:col-span-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {tailor.address.street}
                              {tailor.address.apt && `, ${tailor.address.apt}`}
                              {', '}
                              {tailor.address.city}, {tailor.address.state} {tailor.address.zip}
                            </span>
                          </div>
                        )}
                        
                        {/* Empty div to maintain grid when no address */}
                        {!tailor.address && tailor.phoneNumber && (
                          <div className="sm:col-span-1 lg:col-span-2"></div>
                        )}
                      </div>
                    </div>

                    {/* Right: Items Badge & Chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className="text-xs font-medium">
                        {tailor.itemsCount} item{tailor.itemsCount !== 1 ? 's' : ''}
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
            <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No tailors found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first tailor to get started.
            </p>
            <Link href="/dashboard/tailors/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Tailor
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Floating Add Tailor Button */}
      <Link href="/dashboard/tailors/new">
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation active:scale-95 z-40">
          <Plus className="h-6 w-6" />
        </button>
      </Link>
    </div>
  )
}