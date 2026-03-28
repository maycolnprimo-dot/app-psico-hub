import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function DailyAgenda() {
  const { sessions, patients } = useAppStore()
  const today = new Date()

  const safeSessions = Array.isArray(sessions) ? sessions : []
  const safePatients = Array.isArray(patients) ? patients : []

  const todaySessions = safeSessions
    .filter((s) => {
      if (!s?.date) return false
      try {
        const d = parseISO(s.date)
        if (!isValid(d)) return false
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        )
      } catch {
        return false
      }
    })
    .sort((a, b) => {
      try {
        const dateA = a?.date ? new Date(a.date).getTime() : 0
        const dateB = b?.date ? new Date(b.date).getTime() : 0
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB)
      } catch {
        return 0
      }
    })

  return (
    <Card className="col-span-1 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Agenda de Hoje</CardTitle>
          <CardDescription>{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</CardDescription>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full bg-primary/10 text-primary hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-6">
          {todaySessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma sessão agendada para hoje.
            </p>
          ) : (
            todaySessions.map((session, i) => {
              const patient = safePatients.find((p) => p?.id === session.patientId)
              return (
                <div
                  key={session.id || i}
                  className="flex gap-4 relative animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium w-12 text-right">
                      {(() => {
                        try {
                          const d = session.date ? parseISO(session.date) : null
                          return d && isValid(d) ? format(d, 'HH:mm') : '--:--'
                        } catch {
                          return '--:--'
                        }
                      })()}
                    </span>
                    {i !== todaySessions.length - 1 && (
                      <div className="w-px h-full bg-border my-2"></div>
                    )}
                  </div>
                  <div className="flex-1 rounded-xl border bg-card p-3 shadow-sm flex items-center gap-3 hover:border-primary/50 transition-colors cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={patient?.avatarUrl} />
                      <AvatarFallback>
                        {(patient?.name || '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">
                        {patient?.name || 'Paciente Não Encontrado'}
                      </h4>
                      <p className="text-xs text-muted-foreground">{session.type || 'Sessão'}</p>
                    </div>
                    <div
                      className={`h-2 w-2 rounded-full ${session.status === 'Realizada' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      title={session.status}
                    ></div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
