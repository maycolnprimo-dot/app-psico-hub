import { useState } from 'react'
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isSameDay,
  parseISO,
  getISOWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'
import { Session } from '@/types'

interface CalendarGridProps {
  onEditSession?: (session: Session) => void
  onNewSession?: (date: Date, patientId?: string) => void
}

export function CalendarGrid({ onEditSession, onNewSession }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { sessions, patients, settings } = useAppStore()

  const nextMonth = () => setCurrentMonth(addDays(currentMonth, 30))
  const prevMonth = () => setCurrentMonth(addDays(currentMonth, -30))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const rows = []
  let days = []
  let day = startDate

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day
      const formattedDate = format(cloneDay, 'd')

      // Real Sessions mapped explicitly
      const daySessions = sessions.filter((s) => s.date && isSameDay(parseISO(s.date), cloneDay))

      // Virtual/Automated Sessions from Contract
      const virtualSessions = patients
        .filter(
          (p) =>
            p.status === 'Ativo' &&
            p.contractType &&
            p.contractDayOfWeek !== undefined &&
            p.contractTime &&
            p.contractDayOfWeek === cloneDay.getDay(),
        )
        .filter((p) => {
          if (p.contractFrequency === 'Quinzenal' && getISOWeek(cloneDay) % 2 !== 0) return false
          return !daySessions.some((s) => s.patientId === p.id)
        })

      // Availabilities setup for this day
      const dayAvailabilities = (settings.availability || []).filter(
        (a) => a.dayOfWeek === cloneDay.getDay(),
      )

      days.push(
        <div
          key={cloneDay.toString()}
          onClick={() => {
            if (onNewSession) {
              const d = new Date(cloneDay)
              d.setHours(new Date().getHours() + 1, 0, 0, 0)
              onNewSession(d)
            }
          }}
          className={`min-h-[110px] p-2 border border-border/50 bg-card hover:bg-muted/30 transition-colors cursor-pointer ${
            !isSameMonth(cloneDay, monthStart) ? 'text-muted-foreground opacity-50 bg-muted/10' : ''
          } ${isSameDay(cloneDay, new Date()) ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span
              className={`text-sm font-medium ${isSameDay(cloneDay, new Date()) ? 'text-primary' : ''}`}
            >
              {formattedDate}
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {dayAvailabilities.map((av, idx) => {
              const loc = settings.locations?.find((l) => l.id === av.locationId)
              const cat = settings.serviceCategories?.find((c) => c.id === av.categoryId)
              const color = loc?.color || cat?.color || 'currentColor'

              return (
                <div
                  key={`av-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onNewSession) {
                      const d = new Date(cloneDay)
                      const [hour, minute] = av.startTime.split(':')
                      d.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0)
                      onNewSession(d)
                    }
                  }}
                  className="text-[10px] px-1.5 py-1 rounded border border-dashed flex flex-col opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ borderColor: color, color: color }}
                  title={`Disponível: ${loc?.name || ''} - ${cat?.name || ''}`}
                >
                  <span className="font-semibold text-[9px] uppercase leading-none mb-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Livre
                  </span>
                  <span>
                    {av.startTime} - {av.endTime}
                  </span>
                </div>
              )
            })}
            {daySessions.map((s) => {
              const p = s.patientId ? patients.find((pt) => pt.id === s.patientId) : null
              const category = settings.serviceCategories?.find((c) => c.id === s.categoryId)
              const location = settings.locations?.find((l) => l.id === s.locationId)

              let bgColor = 'hsl(var(--primary))'
              let titleText = ''

              if (s.type === 'Paciente' || s.type === 'Sessão Individual') {
                bgColor = location?.color || category?.color || 'hsl(var(--primary))'
                titleText = p?.name?.split(' ')[0] || 'Desc.'
              } else if (s.type === 'Grupo de Estudos') {
                bgColor = '#9333ea' // Purple
                titleText = s.title || 'Grupo'
              } else if (s.type === 'Supervisão') {
                bgColor = '#4f46e5' // Indigo
                titleText = s.title || 'Supervisão'
              } else if (['Bloqueio de Agenda', 'Ausência', 'Curso'].includes(s.type)) {
                bgColor = s.type === 'Bloqueio de Agenda' ? '#ef4444' : '#64748b' // Red or Slate
                titleText = s.title || s.type
              } else {
                bgColor = location?.color || 'hsl(var(--primary))'
                titleText = s.title || p?.name?.split(' ')[0] || s.type
              }

              return (
                <div
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditSession?.(s)
                  }}
                  className="text-[11px] p-1.5 rounded-md text-white font-medium truncate cursor-pointer shadow-sm transition-opacity opacity-90 hover:opacity-100 flex items-center gap-1"
                  style={{ backgroundColor: bgColor }}
                  title={`${titleText} | ${location?.name || s.type}`}
                >
                  <span className="truncate">
                    {s.date ? format(parseISO(s.date), 'HH:mm') : ''} - {titleText}
                  </span>
                </div>
              )
            })}
            {virtualSessions.map((p) => (
              <div
                key={`v-${p.id}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (onNewSession && p.contractTime) {
                    const [hour, minute] = p.contractTime.split(':')
                    const d = new Date(cloneDay)
                    d.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0)
                    onNewSession(d, p.id)
                  }
                }}
                className="flex items-center gap-1 text-[11px] p-1.5 rounded-md bg-muted text-muted-foreground font-medium truncate cursor-pointer hover:bg-muted/80 border border-dashed border-border transition-colors"
                title={`${p.name} (Agendamento Automático)`}
              >
                <CalendarIcon className="w-3 h-3 shrink-0 opacity-50" />
                <span className="truncate">
                  {p.contractTime} - {p.name?.split(' ')[0] || 'Desc.'}
                </span>
              </div>
            ))}
          </div>
        </div>,
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div className="grid grid-cols-7 w-full" key={day.toString()}>
        {days}
      </div>,
    )
    days = []
  }

  return (
    <div className="rounded-xl border shadow-sm overflow-hidden bg-background flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <h2 className="text-lg font-bold capitalize flex items-center gap-2">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 bg-muted/40 p-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
        <div>Dom</div>
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sáb</div>
      </div>
      <div className="flex flex-col flex-1 overflow-auto">{rows}</div>
    </div>
  )
}
