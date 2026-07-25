// components/WeekHeader.tsx
'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WeekHeaderProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function WeekHeader({ selectedDate, onDateChange }: WeekHeaderProps) {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(selectedDate, { weekStartsOn: 1 }))

  useEffect(() => {
    setWeekStart(startOfWeek(selectedDate, { weekStartsOn: 1 }))
  }, [selectedDate])

  const getWeekDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i))
    }
    return days
  }

  const weekDays = getWeekDays()

  const prevWeek = () => {
    const newWeekStart = addDays(weekStart, -7)
    setWeekStart(newWeekStart)
    onDateChange(newWeekStart)
  }

  const nextWeek = () => {
    const newWeekStart = addDays(weekStart, 7)
    setWeekStart(newWeekStart)
    onDateChange(newWeekStart)
  }

  const goToToday = () => {
    const today = new Date()
    const newWeekStart = startOfWeek(today, { weekStartsOn: 1 })
    setWeekStart(newWeekStart)
    onDateChange(today)
  }

  const getMonthDisplay = () => {
    const start = weekDays[0]
    const end = weekDays[6]
    const startMonth = format(start, 'MM')
    const endMonth = format(end, 'MM')
    const year = format(start, 'yyyy')

    if (startMonth === endMonth) {
      return `Tháng ${format(start, 'M')} ${year}`
    }
    return `Tháng ${format(start, 'M')} - Tháng ${format(end, 'M')} ${year}`
  }

  const getDayLabel = (date: Date) => {
    const day = format(date, 'E', { locale: vi })
    return day.charAt(0).toUpperCase()
  }

  const getDayNumber = (date: Date) => {
    return format(date, 'd')
  }

  const isSelected = (date: Date) => {
    return isSameDay(date, selectedDate)
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-gray-900">
            {getMonthDisplay()}
          </h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevWeek}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs h-8 px-3"
            >
              Hôm nay
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextWeek}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date, index) => {
            const isSelectedDate = isSelected(date)
            const isTodayDate = isToday(date)
            
            return (
              <button
                key={index}
                onClick={() => onDateChange(date)}
                className={`
                  flex flex-col items-center py-2 rounded-lg transition-all
                  ${isSelectedDate 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isTodayDate 
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span className={`
                  text-xs font-medium uppercase
                  ${isSelectedDate ? 'text-blue-100' : 'text-gray-500'}
                `}>
                  {getDayLabel(date)}
                </span>
                <span className={`
                  text-lg font-semibold mt-0.5
                  ${isSelectedDate ? 'text-white' : 'text-gray-900'}
                `}>
                  {getDayNumber(date)}
                </span>
                {isTodayDate && !isSelectedDate && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}