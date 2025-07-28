import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { ItemsClient } from "./items-client"

async function getItems() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard/items`)
  }

  try {
    const items = await payload.find({
      collection: 'items',
      depth: 2,
      limit: 100,
      sort: '-createdAt'
    })
    
    return items.docs || []
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
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

export default async function ItemsPage() {
  const [items, tailors] = await Promise.all([
    getItems(),
    getTailors()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Items</h1>
        <p className="text-muted-foreground">
          Manage items, assign tailors, set quotes and track progress.
        </p>
      </div>

      <ItemsClient items={items} tailors={tailors} />
    </div>
  )
}