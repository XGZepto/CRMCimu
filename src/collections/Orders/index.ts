import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
    slug: 'orders',
    fields: [
        {
            name: 'status',
            type: 'select',
            options: ['intent', 'inProgress', 'completed', 'cancelled'],
            defaultValue: 'intent',
        },
        {
            name: 'scheduledVisit',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                }
            }
        },
        {
            name: 'actualVisit',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                }
            }
        },
        {
            name: 'customer',
            type: 'relationship',
            relationTo: 'customers',
        },
        {
            name: 'items',
            type: 'relationship',
            relationTo: 'items',
            hasMany: true,
        },
    ]
}