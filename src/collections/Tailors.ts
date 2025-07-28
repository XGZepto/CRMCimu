import type { CollectionConfig } from 'payload'

import { addressField } from '../fields/address'

export const Tailors: CollectionConfig = {
    slug: 'tailors',
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
        },
        addressField,
        {
            name: 'relatedItems',
            type: 'join',
            collection: 'items',
            on: 'assignedTailor',
        }
    ]
}