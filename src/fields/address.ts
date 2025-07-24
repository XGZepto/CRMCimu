import type { Field } from 'payload'
import { states } from './utils/constants'
import { APIError } from 'payload'

export const addressField: Field = {
  name: 'address',
  type: 'group',
  fields: [
    {
        type: 'row',
        fields: [
            {
                name: 'street',
                type: 'text',
                required: true,
            },
            {
                name: 'apt',
                type: 'text',
            },
            {
                name: 'city',
                type: 'text',
                required: true,
            },
            {
                name: 'state',
                type: 'select',
                options: states,
                required: true,
            },
            {
                name: 'zip',
                type: 'text',
                required: true,
            },
        ]
    }
  ],
  hooks: {
    beforeChange: [
        ( {value} ) => {
            const { zip } = value
            if (zip && isNaN(parseInt(zip))) {
                throw new APIError('Zip code must be a number')
            }
            return value
        },
    ]
  }
}