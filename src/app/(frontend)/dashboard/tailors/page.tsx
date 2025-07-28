import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { TailorsClient } from './tailors-client'

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

  return <TailorsClient tailors={tailors} />
}