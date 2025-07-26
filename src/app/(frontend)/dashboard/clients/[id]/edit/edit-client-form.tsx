'use client'

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save } from "lucide-react"
import { states } from "@/fields/utils/constants"

type FormData = {
  name: string
  phoneNumber: string
  address: {
    street: string
    apt: string
    city: string
    state: string
    zip: string
  }
  dataPoints: Array<{
    dataPoint: string
  }>
}

interface EditClientFormProps {
  customer: any
}

export function EditClientForm({ customer }: EditClientFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: customer.name || '',
      phoneNumber: customer.phoneNumber || '',
      address: {
        street: customer.address?.street || '',
        apt: customer.address?.apt || '',
        city: customer.address?.city || '',
        state: customer.address?.state || '',
        zip: customer.address?.zip || ''
      },
      dataPoints: customer.dataPoints || []
    }
  })

  const dataPoints = watch('dataPoints') || []

  const addDataPoint = () => {
    setValue('dataPoints', [...dataPoints, { dataPoint: '' }])
  }

  const removeDataPoint = (index: number) => {
    const newDataPoints = dataPoints.filter((_, i) => i !== index)
    setValue('dataPoints', newDataPoints)
  }

  const updateDataPoint = (index: number, value: string) => {
    const newDataPoints = [...dataPoints]
    newDataPoints[index] = { dataPoint: value }
    setValue('dataPoints', newDataPoints)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          phoneNumber: data.phoneNumber || undefined,
          address: data.address.street ? {
            street: data.address.street,
            apt: data.address.apt || undefined,
            city: data.address.city,
            state: data.address.state,
            zip: data.address.zip
          } : undefined,
          dataPoints: data.dataPoints.filter(dp => dp.dataPoint.trim() !== '')
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update client')
      }

      router.push(`/dashboard/clients/${customer.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the client's basic contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Client's full name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                {...register('phoneNumber')}
                placeholder="+17025702347"
              />
              <p className="text-xs text-muted-foreground">Enter with country code (e.g., +17025702347)</p>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>
              Update the client's address information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  {...register('address.street')}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="apt">Apartment/Unit</Label>
                <Input
                  id="apt"
                  {...register('address.apt')}
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('address.city')}
                  placeholder="New York"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  {...register('address.state')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  {...register('address.zip')}
                  placeholder="10001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Update any additional notes or information about the client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataPoints.map((dataPoint, index) => (
                <div key={index} className="flex gap-3">
                  <Textarea
                    value={dataPoint.dataPoint}
                    onChange={(e) => updateDataPoint(index, e.target.value)}
                    placeholder="Enter additional information..."
                    className="flex-1 min-h-[80px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDataPoint(index)}
                    className="self-start flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDataPoint}
                className="w-full mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Information
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto order-1 sm:order-2">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}