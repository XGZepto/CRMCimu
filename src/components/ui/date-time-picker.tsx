"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { TimePicker } from "@/components/ui/time-picker"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date?: Date) => void
  className?: string
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [localDate, setLocalDate] = React.useState<Date | undefined>(value)

  React.useEffect(() => {
    setLocalDate(value)
  }, [value])

  const handleDateChange = (d?: Date) => {
    setLocalDate(d)
    onChange?.(d)
  }

  const formatted = localDate
    ? localDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Pick date & time"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !localDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatted}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-popover shadow-lg rounded-md w-fit" align="start" side="bottom">
        <div className="flex">
          <Calendar
            mode="single"
            selected={localDate}
            onSelect={(d) => {
              if (!d) return handleDateChange(undefined)
              const newDate = localDate ? new Date(localDate) : new Date()
              newDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
              handleDateChange(newDate)
            }}
            initialFocus
          />
          <div className="p-4 border-l border-border flex items-center">
            <TimePicker date={localDate} setDate={handleDateChange} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
