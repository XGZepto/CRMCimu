import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ItemDetailClient } from './item-detail-client'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'

async function getItem(id: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/items/${id}`)
  }

  try {
    const item = await payload.findByID({
      collection: 'items',
      id,
      depth: 3 // Increased depth to get nested customer data
    })
    
    // If customer is still just an ID, fetch it separately
    if (item.relatedOrder?.docs?.[0] && typeof item.relatedOrder.docs[0] === 'object' && 
        item.relatedOrder.docs[0].customer && typeof item.relatedOrder.docs[0].customer === 'string') {
      try {
        const customer = await payload.findByID({
          collection: 'customers',
          id: item.relatedOrder.docs[0].customer,
          depth: 1
        })
        // Type assertion since we know it's an object at this point
        ;(item.relatedOrder.docs[0] as any).customer = customer
      } catch (customerError) {
        console.error('Error fetching customer:', customerError)
      }
    }
    
    return item
  } catch (error) {
    console.error('Error fetching item:', error)
    return null
  }
}

async function getTailors() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })

  try {
    const tailors = await payload.find({
      collection: 'tailors',
      depth: 1,
      limit: 100,
      sort: 'name'
    })
    
    return tailors.docs || []
  } catch (error) {
    console.error('Error fetching tailors:', error)
    return []
  }
}

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [item, tailors] = await Promise.all([
    getItem(id),
    getTailors()
  ])

  if (!item) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/items">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Items</span>
          </Button>
        </Link>
      </div>

      <ItemDetailClient item={item} tailors={tailors} />
    </div>
  )
}