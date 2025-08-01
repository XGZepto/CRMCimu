import { addressField } from '@/fields/address'
import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
    slug: 'customers',
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'phoneNumber',
            type: 'text',
            required: true,
        },
        {
            name: 'dataPoints',
            type: 'array',
            fields: [
                {
                    name: 'dataPoint',
                    type: 'textarea',
                }
            ]
        },
        addressField,
        {
            name: 'placedOrders',
            type: 'join',
            collection: 'orders',
            on: 'customer',
        }
    ]
}