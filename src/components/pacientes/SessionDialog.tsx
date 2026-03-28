import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format, parseISO } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import { Session } from '@/types'
import { generateId } from '@/lib/utils'
import { PixDialog } from '@/components/financeiro/PixDialog'

const schema = z
  .object({
    patientId: z.string().optional(),
    title: z.string().optional(),
    date: z.string().min(1, 'Data é obrigatória'),
    status: z.enum(['Realizada', 'Agendada', 'Cancelada']),
    type: z.string().min(1, 'Tipo é obrigatório'),
    theme: z.string().optional(),
    feedback: z.string().optional(),
    therapistFeedback: z.string().optional(),
    possiblePaths: z.string().optional(),
    locationId: z.string().optional(),
    categoryId: z.string().optional(),
  })
  .refine(
    (data) => {
      if ((data.type === 'Paciente' || data.type === 'Sessão Individual') && !data.patientId) {
        return false
      }
      return true
    },
    { message: 'Paciente é obrigatório para este tipo', path: ['patientId'] },
  )
  .refine(
    (data) => {
      if (data.type !== 'Paciente' && data.type !== 'Sessão Individual' && !data.title) {
        return false
      }
      return true
    },
    { message: 'Título ou descrição é obrigatório', path: ['title'] },
  )

type FormValues = z.infer<typeof schema>

interface SessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session?: Session | null
  defaultPatientId?: string
  defaultDate?: Date | null
  initialType?: string
}

export function SessionDialog({
  open,
  onOpenChange,
  session,
  defaultPatientId,
  defaultDate,
  initialType,
}: SessionDialogProps) {
  const { patients, settings, addSession, updateSession } = useAppStore()
  const { toast } = useToast()

  const [showChargePrompt, setShowChargePrompt] = useState(false)
  const [showPixDialog, setShowPixDialog] = useState(false)
  const [pendingPixData, setPendingPixData] = useState({
    patientId: '',
    amount: 0,
    description: '',
  })

  const locations = settings.locations || []
  const categories = settings.serviceCategories || []

  const formatForInput = (isoString?: string) => {
    if (!isoString) return ''
    try {
      return format(parseISO(isoString), "yyyy-MM-dd'T'HH:mm")
    } catch {
      return ''
    }
  }

  const defaultType = initialType === 'Outros' ? 'Bloqueio de Agenda' : initialType || 'Paciente'

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: defaultPatientId || '',
      title: '',
      date: formatForInput(defaultDate ? defaultDate.toISOString() : new Date().toISOString()),
      status: 'Agendada',
      type: defaultType,
      theme: '',
      feedback: '',
      therapistFeedback: '',
      possiblePaths: '',
      locationId: locations.length > 0 ? locations[0].id : '',
      categoryId: categories.length > 0 ? categories[0].id : '',
    },
  })

  useEffect(() => {
    if (open) {
      if (session) {
        form.reset({
          patientId: session.patientId || '',
          title: session.title || '',
          date: formatForInput(session.date),
          status: session.status,
          type: session.type,
          theme: session.theme || '',
          feedback: session.feedback || '',
          therapistFeedback: session.therapistFeedback || '',
          possiblePaths: session.possiblePaths || '',
          locationId: session.locationId || (locations.length > 0 ? locations[0].id : ''),
          categoryId: session.categoryId || (categories.length > 0 ? categories[0].id : ''),
        })
      } else {
        form.reset({
          patientId: defaultPatientId || '',
          title: '',
          date: formatForInput(defaultDate ? defaultDate.toISOString() : new Date().toISOString()),
          status: 'Agendada',
          type: initialType === 'Outros' ? 'Bloqueio de Agenda' : initialType || 'Paciente',
          theme: '',
          feedback: '',
          therapistFeedback: '',
          possiblePaths: '',
          locationId: locations.length > 0 ? locations[0].id : '',
          categoryId: categories.length > 0 ? categories[0].id : '',
        })
      }
    }
  }, [open, session, defaultPatientId, defaultDate, initialType, form, locations, categories])

  const watchType = form.watch('type')
  const isPatient = watchType === 'Paciente' || watchType === 'Sessão Individual'
  const isOther = ['Bloqueio de Agenda', 'Ausência', 'Curso'].includes(watchType)

  const onSubmit = (data: FormValues) => {
    const sessionData = {
      ...data,
      date: new Date(data.date).toISOString(),
      duration: session?.duration || 50,
    }

    if (!isPatient) {
      sessionData.patientId = undefined
      sessionData.therapistFeedback = undefined
      sessionData.possiblePaths = undefined
    }
    if (isOther) {
      sessionData.theme = undefined
      sessionData.feedback = undefined
      sessionData.locationId = undefined
      sessionData.categoryId = undefined
    }

    const isNewlyRealized = session?.status !== 'Realizada' && data.status === 'Realizada'

    if (session) {
      updateSession(session.id, sessionData)
      toast({ title: 'Sessão atualizada', description: 'Os dados foram salvos com sucesso.' })
    } else {
      addSession({ id: generateId(), ...sessionData })
      toast({
        title: 'Agendamento salvo',
        description: 'O compromisso foi adicionado com sucesso.',
      })
    }

    if (isPatient && isNewlyRealized && data.patientId) {
      const p = patients.find((pat) => pat.id === data.patientId)
      setPendingPixData({
        patientId: data.patientId,
        amount: p?.sessionValue || 0,
        description: `Sessão de Psicoterapia - ${format(new Date(data.date), 'dd/MM')}`,
      })
      setShowChargePrompt(true)
    } else {
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{session ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para registrar este compromisso.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Paciente">Sessão com Paciente</SelectItem>
                          <SelectItem value="Sessão Individual">
                            Sessão Individual (Legado)
                          </SelectItem>
                          <SelectItem value="Grupo de Estudos">Grupo de Estudos</SelectItem>
                          <SelectItem value="Supervisão">Supervisão</SelectItem>
                          <SelectItem value="Bloqueio de Agenda">Bloqueio de Agenda</SelectItem>
                          <SelectItem value="Ausência">Ausência</SelectItem>
                          <SelectItem value="Curso">Curso</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Agendada">Agendada</SelectItem>
                          <SelectItem value="Realizada">Realizada</SelectItem>
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isPatient && (
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!defaultPatientId && !session}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!isPatient && (
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchType === 'Grupo de Estudos'
                          ? 'Nome do Grupo / Tema'
                          : watchType === 'Supervisão'
                            ? 'Nome do Supervisionando / Caso'
                            : 'Descrição do Evento'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Descreva brevemente..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className={isOther ? 'md:col-span-2' : ''}>
                      <FormLabel>Data e Hora</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isOther && locations.length > 0 && (
                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Local" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name} {loc.isOnline ? '(Online)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {isPatient && categories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Serviço / Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {!isOther && (
                <>
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema Principal</FormLabel>
                        <FormControl>
                          <Input placeholder="Assunto..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anotações / Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Registro geral..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {isPatient && (
                <>
                  <FormField
                    control={form.control}
                    name="therapistFeedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Devolução Terapeuta</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Intervenções realizadas..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="possiblePaths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caminhos Possíveis</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Direcionamentos futuros..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showChargePrompt}
        onOpenChange={(v) => {
          if (!v) {
            setShowChargePrompt(false)
            onOpenChange(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja gerar uma cobrança?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta sessão foi marcada como "Realizada". Você deseja gerar um link ou QR Code Pix
              para enviar ao paciente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                setShowChargePrompt(false)
                setShowPixDialog(true)
              }}
            >
              Sim, Gerar Cobrança
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PixDialog
        open={showPixDialog}
        onOpenChange={(v) => {
          setShowPixDialog(v)
          if (!v) onOpenChange(false)
        }}
        defaultPatientId={pendingPixData.patientId}
        defaultAmount={pendingPixData.amount}
        defaultDescription={pendingPixData.description}
      />
    </>
  )
}
