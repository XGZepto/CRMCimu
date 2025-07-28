"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Scissors, Plus, Phone, MapPin, ChevronRight, Search, Filter } from "lucide-react"
import { states } from "@/fields/utils/constants"

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

export function TailorsClient({ tailors }: { tailors: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState<string>("all")

  const filteredTailors = tailors.filter(tailor => {
    const matchesSearch = tailor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesState = selectedState === "all" || 
      (tailor.address && tailor.address.state === selectedState)
    
    return matchesSearch && matchesState
  })

  const getUniqueStates = () => {
    const tailorStates = tailors
      .filter(tailor => tailor.address && tailor.address.state)
      .map(tailor => tailor.address.state)
    
    const uniqueStates = Array.from(new Set(tailorStates))
    return states.filter(state => uniqueStates.includes(state.value))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tailors</h1>
        <p className="text-sm text-muted-foreground">
          Manage your tailor network and assignments
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tailors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {getUniqueStates().map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTailors.length} of {tailors.length} tailors
      </div>

      {/* Tailors List */}
      {filteredTailors.length > 0 ? (
        <div className="space-y-6">
          {filteredTailors.map((tailor) => (
            <Link key={tailor.id} href={`/dashboard/tailors/${tailor.id}`} className="block">
              <Card className="hover:shadow-md hover:bg-muted/30 transition-all duration-200 cursor-pointer group touch-manipulation active:scale-[0.98]">
                <CardContent className="px-4 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Tailor Name & ID */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mb-3">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                          {tailor.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded w-fit">
                          ID: {tailor.id}
                        </p>
                      </div>

                      {/* Contact & Address Row */}
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Phone */}
                        {tailor.phoneNumber && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">
                              {formatPhoneNumber(tailor.phoneNumber)}
                            </span>
                          </div>
                        )}
                        
                        {/* Address */}
                        {tailor.address && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground sm:col-span-1 lg:col-span-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {tailor.address.street}
                              {tailor.address.apt && `, ${tailor.address.apt}`}
                              {', '}
                              {tailor.address.city}, {tailor.address.state} {tailor.address.zip}
                            </span>
                          </div>
                        )}
                        
                        {/* Empty div to maintain grid when no address */}
                        {!tailor.address && tailor.phoneNumber && (
                          <div className="sm:col-span-1 lg:col-span-2"></div>
                        )}
                      </div>
                    </div>

                    {/* Right: Items Badge & Chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className="text-xs font-medium">
                        {tailor.itemsCount} item{tailor.itemsCount !== 1 ? 's' : ''}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {tailors.length === 0 ? "No tailors found" : "No tailors match your search"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {tailors.length === 0 
                ? "Add your first tailor to get started."
                : "Try adjusting your search criteria."
              }
            </p>
            {tailors.length === 0 && (
              <Link href="/dashboard/tailors/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tailor
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Floating Add Tailor Button */}
      <Link href="/dashboard/tailors/new">
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation active:scale-95 z-40">
          <Plus className="h-6 w-6" />
        </button>
      </Link>
    </div>
  )
} 