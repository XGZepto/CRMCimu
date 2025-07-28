"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  className?: string
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const minutes = React.useMemo(() => [0, 15, 30, 45], [])

  const currentHour = date?.getHours() ?? null
  const currentMinute = date?.getMinutes() ?? null

  const selectHour = (h: number) => {
    const newDate = date ? new Date(date) : new Date()
    newDate.setHours(h)
    setDate(newDate)
  }

  const selectMinute = (m: number) => {
    const newDate = date ? new Date(date) : new Date()
    newDate.setMinutes(m)
    setDate(newDate)
  }

  const List = ({ values, selected, onSelect }: { values: number[]; selected: number | null; onSelect: (v: number) => void }) => (
    <ul
      role="listbox"
      className="h-48 w-16 overflow-y-auto rounded-md border"
    >
      {values.map((v) => {
        const isSelected = v === selected
        return (
          <li key={v} className="p-0.5">
            <button
              type="button"
              className={cn(
                "w-full rounded-sm py-1 text-sm hover:bg-muted/60",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary"
              )}
              onClick={() => onSelect(v)}
            >
              {v.toString().padStart(2, "0")}
            </button>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className={cn("flex gap-4", className)}>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium">Hours</span>
        <List values={hours} selected={currentHour} onSelect={selectHour} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium">Minutes</span>
        <List values={minutes} selected={currentMinute != null ? Math.round(currentMinute / 15) * 15 : null} onSelect={selectMinute} />
      </div>
    </div>
  )
} 