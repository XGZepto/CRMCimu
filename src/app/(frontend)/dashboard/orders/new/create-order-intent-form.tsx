"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, User, FileText, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: string
  name: string
  phoneNumber?: string
  address: {
    street: string
    apt?: string
    city: string
    state: string
    zip: string
  }
}

interface CreateOrderIntentFormProps {
  customers: Customer[]
}

export function CreateOrderIntentForm({ customers }: CreateOrderIntentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [scheduledVisit, setScheduledVisit] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId || !scheduledVisit) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'intent',
          customer: selectedCustomerId,
          scheduledVisit,
          additionalNotes: additionalNotes || undefined,
          items: []
        }),
      })

      if (response.ok) {
        const order = await response.json()
        router.push(`/dashboard/orders/${order.doc.id}`)
      } else {
        throw new Error('Failed to create order intent')
      }
    } catch (error) {
      console.error('Error creating order intent:', error)
      alert('Failed to create order intent. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Format datetime-local input value
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Set minimum datetime to now
  const minDateTime = formatDateTimeLocal(new Date())

  const isFormValid = selectedCustomerId && scheduledVisit

  return (
    <div className="space-y-4 px-4 md:px-0">
      {/* Back Button */}
      <Link href="/dashboard/orders">
        <Button variant="ghost" className="mb-4 w-full md:w-auto justify-start">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <User className="h-5 w-5" />
              <span>Select Customer</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Choose the customer for this order intent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-sm font-medium">Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex flex-col py-1">
                        <span className="font-medium">{customer.name}</span>
                        {customer.phoneNumber && (
                          <span className="text-sm text-muted-foreground">{customer.phoneNumber}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <p className="font-medium text-base">{selectedCustomer.name}</p>
                  {selectedCustomer.phoneNumber && (
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phoneNumber}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.address.street}
                    {selectedCustomer.address.apt && `, ${selectedCustomer.address.apt}`}, {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zip}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pickup Schedule */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Calendar className="h-5 w-5" />
              <span>Schedule Pickup</span>
            </CardTitle>
            <CardDescription className="text-sm">
              When do you plan to visit the customer?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledVisit" className="text-sm font-medium">Pickup Date & Time</Label>
              <Input
                id="scheduledVisit"
                type="datetime-local"
                value={scheduledVisit}
                min={minDateTime}
                onChange={(e) => setScheduledVisit(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <FileText className="h-5 w-5" />
              <span>Additional Notes</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Any special instructions for this pickup visit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes" className="text-sm font-medium">Notes (optional)</Label>
              <Textarea
                id="additionalNotes"
                placeholder="e.g., Ring doorbell twice, items in basement, prefers morning visits..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                className="text-base resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col space-y-3 pt-4">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full h-12 text-base"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Creating Intent...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5" />
                <span>Create Order Intent</span>
              </div>
            )}
          </Button>
          <Link href="/dashboard/orders">
            <Button variant="outline" type="button" className="w-full h-12 text-base">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}