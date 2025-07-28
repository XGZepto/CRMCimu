"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Package, XCircle, AlertTriangle } from "lucide-react"
import type { Order as PayloadOrder } from "@/payload-types"
import { DateTimePicker } from "@/components/ui/date-time-picker"

type OrderWithItems = PayloadOrder & {
  items?: any[] | null
}

interface OrderStatusManagerProps {
  order: OrderWithItems
}

export function OrderStatusManager({ order }: OrderStatusManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [actualVisitTime, setActualVisitTime] = useState<Date | undefined>(new Date())

  useEffect(() => {
    if (pickupDialogOpen) {
      setActualVisitTime(new Date())
    }
  }, [pickupDialogOpen])

  const handlePickupSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'inProgress',
          actualVisit: actualVisitTime?.toISOString()
        }),
      })

      if (response.ok) {
        setPickupDialogOpen(false)
        router.refresh()
      } else {
        throw new Error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          cancelReason
        }),
      })

      if (response.ok) {
        setCancelDialogOpen(false)
        router.refresh()
      } else {
        throw new Error('Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Failed to cancel order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteOrder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed'
        }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        throw new Error('Failed to complete order')
      }
    } catch (error) {
      console.error('Error completing order:', error)
      alert('Failed to complete order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const allItemsDelivered = !!order.items && order.items.length > 0 && (order.items as any[]).every((item: any) => item.status === 'delivered')

  if (order.status === 'intent') {
    return (
      <div className="pt-2 space-y-2">
        {(!order.items || order.items.length === 0) && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Add items before proceeding</p>
              <p className="text-xs">
                Once items are added to this order, you can mark it as picked up.
              </p>
            </div>
          </div>
        )}

        <Dialog open={pickupDialogOpen} onOpenChange={setPickupDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full"
              disabled={!order.items || order.items.length === 0}
            >
              <Package className="h-4 w-4 mr-2" />
              Mark as Picked Up & Start Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start Order</DialogTitle>
              <DialogDescription>
                Confirming will transition this order to "In Progress" and log the pickup time.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pickup-time">Actual Pickup Time</Label>
                <DateTimePicker
                  value={actualVisitTime}
                  onChange={setActualVisitTime}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPickupDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePickupSubmit} disabled={isLoading}>
                {isLoading ? 'Starting...' : 'Confirm & Start Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This will permanently cancel this order intent. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Keep Order
              </Button>
              <Button variant="destructive" onClick={handleCancelOrder} disabled={isLoading}>
                {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (order.status === 'inProgress') {
    return (
      <div className="pt-2 space-y-2">
        {order.items && order.items.length === 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">No items added yet</p>
              <p className="text-xs">
                Add items to this order to continue processing.
              </p>
            </div>
          </div>
        )}

        {allItemsDelivered && (
          <Button onClick={handleCompleteOrder} disabled={isLoading} className="w-full">
            <Package className="h-4 w-4 mr-2" />
            {isLoading ? 'Completing...' : 'Mark Order Complete'}
          </Button>
        )}

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This will cancel the order and all associated items. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Reason for cancellation (required)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Keep Order
              </Button>
              <Button variant="destructive" onClick={handleCancelOrder} disabled={isLoading || !cancelReason.trim()}>
                {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (order.status === 'completed') {
    return (
      <div className="pt-2">
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          <Package className="h-5 w-5 flex-shrink-0" />
          <p className="font-medium">Order completed successfully</p>
        </div>
      </div>
    )
  }

  if (order.status === 'cancelled') {
    return (
      <div className="pt-2">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-medium">Order was cancelled</p>
        </div>
      </div>
    )
  }

  return null
}