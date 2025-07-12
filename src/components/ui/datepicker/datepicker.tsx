"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Input } from "./input"
import { Label } from "./label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { es } from "date-fns/locale";

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Pick a date",
  className = "",
  label = "",
}: {
  value?: Date
  onChange?: (date: Date | undefined) => void
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  className?: string
  label?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState<string>(value ? format(value, "PPP", { locale: es }) : "")
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [month, setMonth] = React.useState<Date | undefined>(value)

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value)
      setInputValue(format(value, "PPP", { locale: es }))
      setMonth(value)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    const parsed = new Date(e.target.value)
    if (!isNaN(parsed.getTime())) {
      setSelectedDate(parsed)
      setMonth(parsed)
      if (onChange) onChange(parsed)
    } else {
      setSelectedDate(undefined)
      if (onChange) onChange(undefined)
    }
  }

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setInputValue(date ? format(date, "PPP", { locale: es }) : "")
    if (onChange) onChange(date)
    setOpen(false)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && <Label htmlFor="date" className="px-1 text-sm font-medium text-gray-700 mb-0">{label}</Label>}
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={inputValue}
          placeholder={placeholder}
          className="bg-background pr-10 py-5 mb-1"
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              tabIndex={-1}
              type="button"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0 bg-white rounded-xl shadow-lg border"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 