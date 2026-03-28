import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAppStore } from '@/stores/useAppStore'
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, isValid } from 'date-fns'

export function OccupancyCard() {
  const { settings, sessions } = useAppStore()
  const availability = settings?.availability || []

  let totalAvailableHours = 0
  if (Array.isArray(availability)) {
    availability.forEach((slot) => {
      if (slot?.startTime && slot?.endTime) {
        const startParts = slot.startTime.split(':')
        const endParts = slot.endTime.split(':')

        if (startParts.length >= 2 && endParts.length >= 2) {
          const startH = parseInt(startParts[0], 10)
          const startM = parseInt(startParts[1], 10)
          const endH = parseInt(endParts[0], 10)
          const endM = parseInt(endParts[1], 10)

          if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
            const durationHours = endH + endM / 60 - (startH + startM / 60)
            if (durationHours > 0) {
              totalAvailableHours += durationHours
            }
          }
        }
      }
    })
  }

  if (totalAvailableHours === 0) {
    totalAvailableHours = 40
  }

  const now = new Date()
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)

  let scheduledHours = 0
  const safeSessions = Array.isArray(sessions) ? sessions : []

  safeSessions.forEach((s) => {
    if (s && s.status !== 'Cancelada' && s.date) {
      try {
        const sDate = parseISO(s.date)
        if (isValid(sDate) && isWithinInterval(sDate, { start: weekStart, end: weekEnd })) {
          const duration = typeof s.duration === 'number' && !isNaN(s.duration) ? s.duration : 50
          scheduledHours += duration / 60
        }
      } catch {
        // Safe to ignore invalid dates
      }
    }
  })

  let percentage = (scheduledHours / totalAvailableHours) * 100
  percentage = Math.min(Math.max(percentage, 0), 100) // clamp 0-100
  const displayPercentage = isNaN(percentage) ? 0 : Math.round(percentage)

  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayPercentage / 100) * circumference

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Taxa de Ocupação</CardTitle>
        <CardDescription>Capacidade da agenda (Semanal)</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-8">
        <div className="relative flex items-center justify-center">
          <svg className="h-40 w-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-muted"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={isNaN(offset) ? 0 : offset}
              className="text-primary transition-all duration-1000 ease-out animate-fade-in"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{displayPercentage}%</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
              Ocupado
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
