import type { CollectionConfig } from 'payload'

export const Items: CollectionConfig = {
    slug: 'items',
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'status',
            type: 'select',
            options: ['pendingTailor', 'inProgress', 'completed', 'delivered', 'cancelled'],
            defaultValue: 'pendingTailor',
        },
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'attachedImages',
            type: 'array',
            fields: [
                {
                name: 'image',
                type: 'upload',
                relationTo: 'media',
                }
            ]
        },
        {
            name: 'actionPoints',
            type: 'array',
            fields: [
                {
                    name: 'actionPoint',
                    type: 'textarea',
                }
            ]
        },
        {
            name: 'assignedTailor',
            type: 'relationship',
            relationTo: 'tailors',
        },
        {
            name: 'scheduledDelivery',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                }
            }
        },
        {
            name: 'actualDelivery',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                }
            }
        },
        {
            name: 'price',
            type: 'number',
        },
        {
            name: 'tailorPayout',
            type: 'number',
        }
    ],
}