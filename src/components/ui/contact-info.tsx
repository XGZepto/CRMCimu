import React from 'react'
import { Phone, MapPin } from 'lucide-react'

interface Address {
  street: string
  apt?: string
  city: string
  state: string
  zip: string
}

interface ContactInfoProps {
  phoneNumber?: string
  address?: Address | string
  phoneLabel?: string
  addressLabel?: string
  showLabels?: boolean
}

function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return ''
  
  // If it starts with +1, format as US number
  if (phoneNumber.startsWith('+1') && phoneNumber.length === 12) {
    const number = phoneNumber.slice(2)
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
  }
  
  // For other international numbers, just return as is
  return phoneNumber
}

function getPhoneLink(phoneNumber: string): string {
  return `tel:${phoneNumber}`
}

function getMapsLink(address: Address | string): string {
  if (!address) return ''
  const addressString = typeof address === 'string' 
    ? address 
    : `${address.street}${address.apt ? ' ' + address.apt : ''}, ${address.city}, ${address.state} ${address.zip}`
  return `https://maps.apple.com/?q=${encodeURIComponent(addressString)}`
}

export function ContactInfo({ 
  phoneNumber, 
  address, 
  phoneLabel = "Phone • Tap to call",
  addressLabel = "Address • Tap for directions",
  showLabels = true 
}: ContactInfoProps) {
  return (
    <div className="space-y-4">
      {phoneNumber && (
        <a href={getPhoneLink(phoneNumber)} className="block">
          <div className="flex items-center space-x-3 p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation group">
            <div className="flex-shrink-0">
              <Phone className="h-5 w-5 text-green-600 group-hover:text-green-700" />
            </div>
            <div className="min-w-0">
              {showLabels && (
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {phoneLabel}
                </p>
              )}
              <p className="text-sm font-medium truncate group-hover:text-green-700">
                {formatPhoneNumber(phoneNumber)}
              </p>
            </div>
          </div>
        </a>
      )}

      {address && (
        <a href={getMapsLink(address)} target="_blank" rel="noopener noreferrer" className="block">
          <div className="flex items-start space-x-3 p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation group">
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-blue-600 group-hover:text-blue-700 mt-0.5" />
            </div>
            <div className="min-w-0">
              {showLabels && (
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  {addressLabel}
                </p>
              )}
              <div className="text-sm space-y-1">
                {typeof address === 'string' ? (
                  <p className="font-medium group-hover:text-blue-700">{address}</p>
                ) : (
                  <>
                    <p className="font-medium group-hover:text-blue-700">{address.street}</p>
                    {address.apt && <p className="text-muted-foreground">{address.apt}</p>}
                    <p className="text-muted-foreground">
                      {address.city}, {address.state} {address.zip}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </a>
      )}
    </div>
  )
}

// Alternative compact version for tight spaces
export function ContactInfoCompact({ 
  phoneNumber, 
  address, 
  phoneAction = "Call",
  addressAction = "Directions"
}: ContactInfoProps & { phoneAction?: string, addressAction?: string }) {
  return (
    <div className="space-y-3">
      {phoneNumber && (
        <a 
          href={getPhoneLink(phoneNumber)}
          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted transition-colors"
        >
          <Phone className="h-4 w-4 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">{phoneAction}</p>
            <p className="text-sm text-muted-foreground">{formatPhoneNumber(phoneNumber)}</p>
          </div>
        </a>
      )}

      {address && (
        <a
          href={getMapsLink(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted transition-colors"
        >
          <MapPin className="h-4 w-4 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">{addressAction}</p>
            <p className="text-sm text-muted-foreground">
              {typeof address === 'string' 
                ? address 
                : `${address.street}${address.apt ? ', ' + address.apt : ''}, ${address.city}, ${address.state} ${address.zip}`
              }
            </p>
          </div>
        </a>
      )}
    </div>
  )
} 