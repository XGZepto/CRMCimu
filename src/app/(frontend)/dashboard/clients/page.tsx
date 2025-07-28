import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { ClientsClient } from './clients-client'

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

  return <ClientsClient clients={clients} />
}