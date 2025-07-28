'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, Clock, CheckCircle2, User, Navigation } from "lucide-react"
import Link from 'next/link'

interface ActivityEventProps {
  title: string
  subtitle: string
  time: string
  type: 'pickup' | 'delivery' | 'call' | 'visit'
  address?: string
  phoneNumber?: string
  id: string
  baseUrl: string
  isOverdue?: boolean
  priority?: 'urgent' | 'normal' | 'low'
}

export function ActivityEvent({ 
  title, 
  subtitle, 
  time, 
  type, 
  address,
  phoneNumber,
  id,
  baseUrl,
  isOverdue = false,
  priority = 'normal'
}: ActivityEventProps) {
  const typeConfig = {
    pickup: { 
      icon: MapPin, 
      iconColor: "text-blue-600",
      label: isOverdue ? "Overdue Pickup" : "Pickup"
    },
    delivery: { 
      icon: CheckCircle2,
      iconColor: "text-green-600",
      label: isOverdue ? "Overdue Delivery" : "Delivery"
    },
    call: {
      icon: Phone,
      iconColor: "text-orange-600",
      label: "Call"
    },
    visit: {
      icon: User,
      iconColor: "text-purple-600",
      label: "Visit"
    }
  }
  
  const config = typeConfig[type]
  const Icon = config.icon
  
  const formatAddress = (addr: string) => {
    const parts = addr.split(', ')
    return parts.length > 2 ? `${parts[0]}, ${parts[parts.length-1]}` : addr
  }
  
  const openMaps = (address: string) => {
    const encoded = encodeURIComponent(address)
    window.open(`https://maps.google.com/?q=${encoded}`, '_blank')
  }
  
  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }
  
  return (
    <div className={`bg-card border rounded-lg hover:shadow-sm transition-all ${
      priority === 'urgent' ? 'ring-2 ring-red-200 shadow-md' : 
      isOverdue ? 'ring-1 ring-red-200' : ''
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-2 rounded-full bg-muted flex-shrink-0">
              <Icon className={`h-4 w-4 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-sm">{title}</h3>
                {priority === 'urgent' && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-1">{subtitle}</p>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className={isOverdue ? 'font-medium' : ''}>{time}</span>
              </div>
            </div>
          </div>
          <Badge variant={isOverdue ? "destructive" : "outline"} className="text-xs">
            {config.label}
          </Badge>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {phoneNumber && (
              <Button
                size="icon"
                variant="ghost"
                className="text-green-600 hover:text-green-700"
                onClick={() => makeCall(phoneNumber)}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {address && (
              <Button
                size="icon"
                variant="ghost"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => openMaps(address)}
              >
                <Navigation className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button asChild size="sm" variant="link" className="px-0 text-primary">
            <Link href={`${baseUrl}/${id}`}>Details</Link>
          </Button>
        </div>
        
        {address && (
          <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 inline mr-1" />
            {formatAddress(address)}
          </div>
        )}
      </div>
    </div>
  )
}