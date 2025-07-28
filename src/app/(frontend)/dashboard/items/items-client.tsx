"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Label import no longer needed
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  DollarSign,
  Truck,
  Filter
} from "lucide-react"

// DropdownMenu imports removed

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

function ItemCard({ item }: { item: any }) {
  // Quote editing removed; quotes are read-only after creation

  const config = statusConfig[item.status as keyof typeof statusConfig]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Assign tailor functionality removed

  return (
    <Link href={`/dashboard/items/${item.id}`} className="block">
      <Card className="w-full hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{item.name}</CardTitle>
              <CardDescription className="text-xs">
                {item.assignedTailor ? `Tailor: ${item.assignedTailor.name}` : 'No tailor assigned'}
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={config.badgeVariant}>{config.label}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {item.price && (
            <div className="flex items-center text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
              <span>Quote: ${item.price}</span>
              {item.tailorPayout && (
                <span className="ml-2 text-muted-foreground">· Payout: ${item.tailorPayout}</span>
              )}
            </div>
          )}

          {item.scheduledDelivery && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" /> Scheduled: {formatDate(item.scheduledDelivery)}
            </div>
          )}

          {item.actualDelivery && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Truck className="h-3 w-3 mr-1" /> Delivered: {formatDate(item.actualDelivery)}
            </div>
          )}
        </CardContent>

        {/* Assign Tailor dialog removed */}
      </Card>
    </Link>
  )
}

export function ItemsClient({ items, tailors }: { items: any[], tailors: any[] }) {
  const [activeTab, setActiveTab] = useState("all")

  const filterItems = (status?: string) => {
    if (!status || status === "all") return items
    return items.filter(item => item.status === status)
  }

  const getStatusCount = (status?: string) => {
    return filterItems(status).length
  }

  const filterOptions = [
    { value: "all", label: "All", count: getStatusCount() },
    { value: "pendingTailor", label: "Pending Tailor", count: getStatusCount("pendingTailor") },
    { value: "inProgress", label: "In Progress", count: getStatusCount("inProgress") },
    { value: "completed", label: "Completed", count: getStatusCount("completed") },
    { value: "delivered", label: "Delivered", count: getStatusCount("delivered") },
    { value: "cancelled", label: "Cancelled", count: getStatusCount("cancelled") }
  ]

  // Assign tailor API removed

  return (
    <div className="w-full">
      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {filterOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value} className="text-sm">
                {option.label} ({option.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile Filter Select */}
      <div className="md:hidden mb-6">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter items" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  <Badge variant="secondary" className="ml-2">{option.count}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items Grid */}
      <div className="mt-6">
        {filterItems(activeTab === "all" ? undefined : activeTab).length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No items found</h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === "all" ? "Items are usually created through orders." : `No ${activeTab} items at the moment.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterItems(activeTab === "all" ? undefined : activeTab).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}