import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/stores/useAppStore'
import { Plus, Trash2, Clock } from 'lucide-react'

const DAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

export function AvailabilitySetup() {
  const { settings, updateSettings } = useAppStore()
  const availability = settings.availability || []
  const locations = settings.locations || []
  const categories = settings.serviceCategories || []

  const addSlot = (dayOfWeek: number) => {
    updateSettings({
      availability: [...availability, { dayOfWeek, startTime: '08:00', endTime: '18:00' }],
    })
  }

  const updateSlot = (index: number, data: any) => {
    const newAv = [...availability]
    newAv[index] = { ...newAv[index], ...data }
    updateSettings({ availability: newAv })
  }

  const removeSlot = (index: number) => {
    updateSettings({
      availability: availability.filter((_, i) => i !== index),
    })
  }

  return (
    <Card className="animate-fade-in shadow-sm border-t-4 border-t-amber-500">
      <CardHeader className="bg-amber-50/30 border-b">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" /> Disponibilidade da Agenda
        </CardTitle>
        <CardDescription>
          Defina os horários em que você está disponível para atendimento. Essa configuração é
          utilizada para calcular sua taxa de ocupação diária e semanal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          {DAYS.map((dayName, dayIndex) => {
            const daySlots = availability
              .map((a, i) => ({ ...a, originalIndex: i }))
              .filter((a) => a.dayOfWeek === dayIndex)
            return (
              <div
                key={dayIndex}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start p-4 border-b last:border-0 hover:bg-muted/10 transition-colors"
              >
                <div className="md:col-span-1 font-semibold text-foreground pt-2">{dayName}</div>
                <div className="md:col-span-3 space-y-3">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.originalIndex}
                      className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg border w-full lg:w-fit"
                    >
                      <div className="flex items-center gap-3">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateSlot(slot.originalIndex, { startTime: e.target.value })
                          }
                          className="w-32 bg-background"
                        />
                        <span className="text-muted-foreground text-sm font-medium">até</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            updateSlot(slot.originalIndex, { endTime: e.target.value })
                          }
                          className="w-32 bg-background"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlot(slot.originalIndex)}
                          className="text-destructive hover:bg-destructive/10 h-10 w-10 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Select
                          value={slot.locationId || 'none'}
                          onValueChange={(val) =>
                            updateSlot(slot.originalIndex, {
                              locationId: val === 'none' ? undefined : val,
                            })
                          }
                        >
                          <SelectTrigger className="h-9 text-xs w-full sm:w-[150px] bg-background">
                            <SelectValue placeholder="Local (Opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum Local</SelectItem>
                            {locations.map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={slot.categoryId || 'none'}
                          onValueChange={(val) =>
                            updateSlot(slot.originalIndex, {
                              categoryId: val === 'none' ? undefined : val,
                            })
                          }
                        >
                          <SelectTrigger className="h-9 text-xs w-full sm:w-[150px] bg-background">
                            <SelectValue placeholder="Categoria (Opc.)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma Cat.</SelectItem>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => addSlot(dayIndex)}
                    className="px-0 gap-1 h-auto text-primary hover:text-primary/80"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Horário
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
