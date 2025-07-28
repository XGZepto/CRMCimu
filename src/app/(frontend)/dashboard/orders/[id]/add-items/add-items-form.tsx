"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Package, Save, DollarSign } from "lucide-react"
import type { Order as PayloadOrder } from '@/payload-types'
import { MultiImageUploader } from "@/components/ui/multi-image-uploader"

type OrderForForm = PayloadOrder & {
  items?: any[] | null
}

interface ItemFormData {
  name: string
  images: File[]
  quotedPrice: string
  actionPoints: string[]
  tempId: string
}

interface AddItemsFormProps {
  order: OrderForForm
}

export function AddItemsForm({ order }: AddItemsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<ItemFormData[]>([
    {
      name: '',
      images: [],
      quotedPrice: '',
      actionPoints: [''],
      tempId: Math.random().toString(36).substr(2, 9)
    }
  ])

  const addNewItem = () => {
    setItems([...items, {
      name: '',
      images: [],
      quotedPrice: '',
      actionPoints: [''],
      tempId: Math.random().toString(36).substr(2, 9)
    }])
  }

  const uploadImages = async (images: File[]) => {
    const uploadPromises = images.map(async (image) => {
      const formData = new FormData()
      formData.append('file', image)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const result = await response.json()
      return result.doc.id
    })

    return Promise.all(uploadPromises)
  }

  const removeItem = (tempId: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.tempId !== tempId))
    }
  }

  const updateItem = (tempId: string, field: keyof ItemFormData, value: any) => {
    setItems(items.map(item =>
      item.tempId === tempId
        ? { ...item, [field]: value }
        : item
    ))
  }

  const updateActionPoint = (tempId: string, index: number, value: string) => {
    setItems(items.map(item =>
      item.tempId === tempId
        ? {
            ...item,
            actionPoints: item.actionPoints.map((point, i) => i === index ? value : point)
          }
        : item
    ))
  }

  const addActionPoint = (tempId: string) => {
    setItems(items.map(item =>
      item.tempId === tempId
        ? { ...item, actionPoints: [...item.actionPoints, ''] }
        : item
    ))
  }

  const removeActionPoint = (tempId: string, index: number) => {
    setItems(items.map(item =>
      item.tempId === tempId
        ? {
            ...item,
            actionPoints: item.actionPoints.filter((_, i) => i !== index)
          }
        : item
    ))
  }

  const isFormValid = useMemo(() => {
    return items.every(item =>
      item.name.trim() &&
      item.images.length > 0 &&
      item.quotedPrice.trim() &&
      item.actionPoints.some(pt => pt.trim())
    )
  }, [items])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      alert('Each item must have a name, at least one image, a quote, and at least one action point.')
      return
    }

    setIsLoading(true)

    try {
      const itemPromises = items.map(async (item) => {
        const imageIds = await uploadImages(item.images)

        const itemData = {
          name: item.name.trim(),
          status: 'pendingTailor',
          price: Math.round(parseFloat(item.quotedPrice) * 100),
          attachedImages: imageIds.map(id => ({ image: id })),
          actionPoints: item.actionPoints
            .filter(point => point.trim())
            .map(point => ({ actionPoint: point.trim() }))
        }

        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })

        if (!response.ok) throw new Error(`Failed to create item: ${item.name}`)
        const result = await response.json()
        return result.doc.id
      })

      const createdItemIds = await Promise.all(itemPromises)

      const existingItems = order.items || []
      const updatedItems = [...existingItems.map((i: any) => i.id || i), ...createdItemIds]

      const orderResponse = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      })

      if (!orderResponse.ok) throw new Error('Failed to update order with new items')

      router.push(`/dashboard/orders/${order.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error creating items:', error)
      alert('Failed to create items. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/orders/${order.id}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        {items.map((item, itemIndex) => (
          <Card key={item.tempId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Item {itemIndex + 1}</span>
                </CardTitle>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.tempId)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor={`item-name-${item.tempId}`}>Item Name *</Label>
                <Input
                  id={`item-name-${item.tempId}`}
                  placeholder="e.g., Navy suit jacket, Wedding dress..."
                  value={item.name}
                  onChange={(e) => updateItem(item.tempId, 'name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Images *</Label>
                <MultiImageUploader
                  value={item.images}
                  onChange={(files) => updateItem(item.tempId, 'images', files)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`price-${item.tempId}`}>Quoted Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id={`price-${item.tempId}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.quotedPrice}
                    onChange={(e) => updateItem(item.tempId, 'quotedPrice', e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Action Points / Notes *</Label>
                {item.actionPoints.map((point, pointIndex) => (
                  <div key={pointIndex} className="flex items-start space-x-2">
                    <Textarea
                      placeholder="e.g., Hem pants to 30 inches..."
                      value={point}
                      onChange={(e) => updateActionPoint(item.tempId, pointIndex, e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                    {item.actionPoints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeActionPoint(item.tempId, pointIndex)}
                        className="shrink-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addActionPoint(item.tempId)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action Point
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={addNewItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Item
        </Button>

        {items.some(item => item.quotedPrice && parseFloat(item.quotedPrice) > 0) && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Quotation:</span>
              <span className="font-bold text-lg text-primary">
                ${items.reduce((sum, item) => sum + (parseFloat(item.quotedPrice) || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                <span>Creating Items...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Save className="h-4 w-4 mr-2" />
                <span>Save Items</span>
              </div>
            )}
          </Button>
          <Button asChild variant="outline" type="button" className="w-full">
            <Link href={`/dashboard/orders/${order.id}`}>
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  )
}