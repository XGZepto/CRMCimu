"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { ImageGallery } from "@/components/ui/image-gallery"
import { ContactInfo } from "@/components/ui/contact-info"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  DollarSign,
  Truck,
  FileText,
  Package,
  MapPin,
  Phone,
  Save,
  UserCheck,
  Calculator,
  Camera,
  AlertCircle,
  PlayCircle,
  CheckSquare,
  UserPlus,
  ExternalLink,
  ArrowRight,
  Timer,
  CalendarDays,
  Edit3
} from "lucide-react"

const statusConfig = {
  pendingTailor: {
    label: "Pending Tailor",
    icon: User,
    color: "bg-orange-500",
    badgeVariant: "secondary" as const
  },
  inProgress: {
    label: "In Progress", 
    icon: Clock,
    color: "bg-blue-500",
    badgeVariant: "default" as const
  },
  completed: {
    label: "Completed",
    icon: CheckCircle, 
    color: "bg-green-500",
    badgeVariant: "outline" as const
  },
  delivered: {
    label: "Delivered",
    icon: Truck,
    color: "bg-emerald-500",
    badgeVariant: "outline" as const
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-500", 
    badgeVariant: "destructive" as const
  }
}

export function ItemDetailClient({ item, tailors }: { item: any, tailors: any[] }) {
  const [assignedTailor, setAssignedTailor] = useState(item.assignedTailor?.id || "")
  const [price, setPrice] = useState(item.price ? (item.price / 100).toString() : "")
  const [tailorPayout, setTailorPayout] = useState(item.tailorPayout ? item.tailorPayout.toString() : "")
  
  // Helper function to convert UTC date string to Date object
  const parseUTCDate = (dateString: string | Date): Date | undefined => {
    if (!dateString) return undefined
    return new Date(dateString)
  }

  // Helper function to convert Date object to UTC ISO string for API
  const toUTCISOString = (date: Date | undefined): string => {
    if (!date) return ""
    return date.toISOString()
  }

  // Get user's timezone for labels
  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  const [scheduledDelivery, setScheduledDelivery] = useState<Date | undefined>(
    parseUTCDate(item.scheduledDelivery)
  )
  const [actualDelivery, setActualDelivery] = useState<Date | undefined>(
    parseUTCDate(item.actualDelivery)
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [isEditingPayout, setIsEditingPayout] = useState(false)
  const [payoutDisplay, setPayoutDisplay] = useState(item.tailorPayout ? (item.tailorPayout / 100).toString() : "")

  const config = statusConfig[item.status as keyof typeof statusConfig]
  const StatusIcon = config.icon

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow = date.toDateString() === tomorrow.toDateString()
    
    if (isToday) return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}`
    if (isTomorrow) return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}`
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const getCurrentDateTime = () => {
    return new Date()
  }

  const updateItemStatus = async (newStatus: string, additionalData: any = {}) => {
    setIsProcessing(true)
    try {
      // Convert any datetime fields to UTC before sending to API
      const dataToSend: any = { status: newStatus }
      
      if (scheduledDelivery) {
        dataToSend.scheduledDelivery = toUTCISOString(scheduledDelivery)
      }
      
      if (actualDelivery) {
        dataToSend.actualDelivery = toUTCISOString(actualDelivery)
      }

      const updates = {
        status: newStatus,
        ...dataToSend
      }
      
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update item')
      }

      // Refresh page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAssignTailor = async () => {
    if (!assignedTailor || !tailorPayout) {
      alert('Please select a tailor and set payout amount')
      return
    }
    
    await updateItemStatus('inProgress', {
      assignedTailor,
      tailorPayout: parseFloat(tailorPayout)
    })
  }

  const handleUpdatePayout = async () => {
    if (!tailorPayout) {
      alert('Please enter a payout amount')
      return
    }
    
    await updateItemStatus(item.status, {
      tailorPayout: parseFloat(tailorPayout)
    })
    setIsEditingPayout(false)
  }

  const handleUpdateSchedule = async () => {
    if (!scheduledDelivery) return

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDelivery: toUTCISOString(scheduledDelivery)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update item')
      }

      // Refresh page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item. Please try again.')
    } finally {
      setIsEditingSchedule(false)
    }
  }

  const handleMarkDelivered = async () => {
    const deliveryTime = actualDelivery || getCurrentDateTime()
    const dataToSend: any = { 
      status: 'delivered',
      actualDelivery: toUTCISOString(deliveryTime)
    }

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        throw new Error('Failed to update item')
      }

      // Refresh page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item. Please try again.')
    }
  }

  const relatedOrder = item.relatedOrder
  const customer = relatedOrder?.docs?.[0]?.customer

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-3 rounded-full ${config.color} text-white`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
              <p className="text-muted-foreground">
                Created {formatDate(item.createdAt)}
              </p>
            </div>
          </div>
          {/* Parent Order Link */}
          {relatedOrder && (
            <Link href={`/dashboard/orders/${relatedOrder.docs[0].id}`}>
              <Button variant="outline" size="sm" className="mt-2">
                <Package className="h-4 w-4 mr-2" />
                View Parent Order #{relatedOrder.docs[0].id.slice(-8)}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
        <Badge variant={config.badgeVariant} className="text-sm px-3 py-1">
          {config.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Actions */}
          {item.status === 'pendingTailor' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Assign Tailor & Set Payout</span>
                </CardTitle>
                <CardDescription>
                  Select a tailor and set their payout to move this item to progress.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tailor">Select Tailor</Label>
                    <Select value={assignedTailor} onValueChange={setAssignedTailor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tailor" />
                      </SelectTrigger>
                      <SelectContent>
                        {tailors.map((tailor) => (
                          <SelectItem key={tailor.id} value={tailor.id}>
                            {tailor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payout">Tailor Payout ($)</Label>
                    <Input
                      id="payout"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={payoutDisplay}
                      onChange={(e) => {
                        setPayoutDisplay(e.target.value)
                        setTailorPayout((parseFloat(e.target.value || "0") * 100).toString())
                      }}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAssignTailor} 
                  className="w-full" 
                  disabled={!assignedTailor || !tailorPayout || isProcessing}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Assigning...' : 'Assign Tailor & Start Progress'}
                </Button>
              </CardContent>
            </Card>
          )}

          {item.status === 'inProgress' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Work in Progress</span>
                </CardTitle>
                <CardDescription>Mark as completed when tailor finishes the work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => updateItemStatus('completed')} 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Updating...' : 'Mark as Completed'}
                </Button>
              </CardContent>
            </Card>
          )}

          {item.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5" />
                  <span>Ready for Delivery</span>
                </CardTitle>
                <CardDescription>Schedule delivery and mark as delivered when item reaches the customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!item.scheduledDelivery && (
                  <div>
                    <Label htmlFor="scheduled">Schedule Delivery ({getUserTimezone()})</Label>
                    <DateTimePicker
                      value={scheduledDelivery}
                      onChange={setScheduledDelivery}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Set when this item should be delivered to the customer (in your local time)
                    </p>
                  </div>
                )}

                {scheduledDelivery && !item.scheduledDelivery && (
                  <Button 
                    onClick={handleUpdateSchedule} 
                    className="w-full" 
                    disabled={!scheduledDelivery || isProcessing}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Saving...' : 'Save Scheduled Delivery'}
                  </Button>
                )}

                {item.scheduledDelivery && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Timer className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Scheduled Delivery</p>
                          <p className="text-sm text-muted-foreground">{formatDateFull(item.scheduledDelivery)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingSchedule(true)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isEditingSchedule && (
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="scheduled-edit">Update Delivery Time ({getUserTimezone()})</Label>
                        <DateTimePicker
                          value={scheduledDelivery}
                          onChange={setScheduledDelivery}
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleUpdateSchedule}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setIsEditingSchedule(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {item.scheduledDelivery && (
                  <div>
                    <Label htmlFor="actual">Actual Delivery Time ({getUserTimezone()})</Label>
                    <div className="flex space-x-2 mt-1">
                      <div className="flex-1">
                        <DateTimePicker
                          value={actualDelivery}
                          onChange={setActualDelivery}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActualDelivery(getCurrentDateTime())}
                      >
                        Now
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to use scheduled time, or set actual delivery time
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleMarkDelivered} 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Marking as Delivered...' : 'Mark as Delivered'}
                </Button>
              </CardContent>
            </Card>
          )}

          {item.status === 'delivered' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Item Delivered</h3>
                  <p className="text-muted-foreground mb-4">This item has been successfully delivered to the customer</p>
                  
                  {/* Delivery Timeline */}
                  <div className="bg-muted rounded-lg p-4 space-y-3 max-w-sm mx-auto">
                    {item.scheduledDelivery && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Scheduled:</span>
                        <span>{formatDateFull(item.scheduledDelivery)}</span>
                      </div>
                    )}
                    {item.actualDelivery && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivered:</span>
                        <span className="font-semibold text-green-600">{formatDateFull(item.actualDelivery)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {item.status === 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Item Cancelled</span>
                </CardTitle>
                <CardDescription>
                  This item has been cancelled.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">This item was cancelled</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Points */}
          {item.actionPoints && item.actionPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Action Points</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.actionPoints.map((point: any, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm">{point.actionPoint}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attached Images */}
          {item.attachedImages && item.attachedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Attached Images ({item.attachedImages.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageGallery 
                  images={item.attachedImages.map((img: any) => ({
                    url: img.image?.url,
                    filename: img.image?.filename,
                    alt: img.image?.alt || 'Attached image'
                  }))}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* When completed: Customer first (for delivery), When in progress: Tailor first (for work status) */}
          {item.status === 'completed' || item.status === 'delivered' ? (
            <>
              {/* Customer Contact - Priority when ready for delivery */}
              {customer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Customer {item.status === 'completed' ? '(Delivery Details)' : ''}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Link href={`/dashboard/clients/${customer.id}`}>
                        <h3 className="font-semibold hover:underline transition-all flex items-center space-x-1">
                          <span>{customer.name}</span>
                          <ExternalLink className="h-3 w-3" />
                        </h3>
                      </Link>
                    </div>

                    <ContactInfo
                      phoneNumber={customer.phoneNumber}
                      address={customer.address}
                      phoneLabel={item.status === 'completed' ? 'Phone • Tap to call for delivery' : 'Phone • Tap to call'}
                      addressLabel={item.status === 'completed' ? 'Delivery Address • Tap for directions' : 'Address • Tap for directions'}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Tailor Details - Secondary when completed */}
              {(item.assignedTailor || assignedTailor) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5" />
                      <span>Assigned Tailor</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const tailorId = item.assignedTailor?.id || assignedTailor
                      const tailor = tailors.find(t => t.id === tailorId) || item.assignedTailor
                      return tailor ? (
                        <>
                          <div>
                            <Link href={`/dashboard/tailors/${tailor.id}`}>
                              <h3 className="font-semibold hover:underline transition-all flex items-center space-x-1">
                                <span>{tailor.name}</span>
                                <ExternalLink className="h-3 w-3" />
                              </h3>
                            </Link>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-muted-foreground">
                                Payout: ${(item.tailorPayout || tailorPayout) / 100}
                              </span>
                            </div>
                          </div>
                          
                          <ContactInfo
                            phoneNumber={tailor.phoneNumber}
                            address={tailor.address}
                            showLabels={false}
                          />
                        </>
                      ) : null
                    })()}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              {/* Tailor Details - Priority when work is active */}
              {(item.assignedTailor || assignedTailor) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5" />
                      <span>Assigned Tailor</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const tailorId = item.assignedTailor?.id || assignedTailor
                      const tailor = tailors.find(t => t.id === tailorId) || item.assignedTailor
                      return tailor ? (
                        <>
                          <div>
                            <Link href={`/dashboard/tailors/${tailor.id}`}>
                              <h3 className="font-semibold hover:underline transition-all flex items-center space-x-1">
                                <span>{tailor.name}</span>
                                <ExternalLink className="h-3 w-3" />
                              </h3>
                            </Link>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-muted-foreground">
                                Payout: ${(item.tailorPayout || tailorPayout) / 100}
                              </span>
                              {item.status === 'pendingTailor' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setPayoutDisplay(((item.tailorPayout || parseFloat(tailorPayout)) / 100).toString())
                                    setIsEditingPayout(true)
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            {isEditingPayout && (
                              <div className="mt-2 space-y-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={payoutDisplay}
                                  onChange={(e) => {
                                    setPayoutDisplay(e.target.value)
                                    setTailorPayout((parseFloat(e.target.value || "0") * 100).toString())
                                  }}
                                  placeholder="0.00"
                                />
                                <div className="flex space-x-2">
                                  <Button size="sm" onClick={handleUpdatePayout}>
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => setIsEditingPayout(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <ContactInfo
                            phoneNumber={tailor.phoneNumber}
                            address={tailor.address}
                            showLabels={false}
                          />
                        </>
                      ) : null
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Customer Contact - Secondary when work is active */}
              {customer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Customer</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Link href={`/dashboard/clients/${customer.id}`}>
                        <h3 className="font-semibold hover:underline transition-all flex items-center space-x-1">
                          <span>{customer.name}</span>
                          <ExternalLink className="h-3 w-3" />
                        </h3>
                      </Link>
                    </div>

                    <ContactInfo
                      phoneNumber={customer.phoneNumber}
                      address={customer.address}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Financial Summary */}
          {(item.price || item.tailorPayout) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Financial Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.price && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">Customer Quote:</span>
                    <span className="font-semibold">${item.price / 100}</span>
                  </div>
                )}
                
                {item.tailorPayout && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">Tailor Payout:</span>
                    <span className="font-semibold">${item.tailorPayout / 100}</span>
                  </div>
                )}

                {item.price && item.tailorPayout && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded border-t">
                    <span className="text-sm text-muted-foreground">Profit Margin:</span>
                    <span className="text-lg font-bold">
                      ${((parseFloat(item.price) - parseFloat(item.tailorPayout)) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}