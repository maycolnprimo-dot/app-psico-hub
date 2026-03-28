import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import { Patient } from '@/types'
import { generateId } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().optional(),
  documentType: z.enum(['RG', 'CPF', 'Ambos', 'Nenhum', '']).optional(),
  documentRg: z.string().optional(),
  documentCpf: z.string().optional(),
  sessionValue: z.coerce.number().min(0, 'Valor deve ser positivo'),
  paymentDay: z.coerce.number().min(1).max(31),
  paymentMethod: z.string().min(1, 'Método é obrigatório'),
  requiresReceipt: z.boolean().default(false),
  sessionType: z.enum(['Online', 'Presencial']).optional(),
  sessionLocationId: z.string().optional(),
  sessionAddress: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface PacienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient | null
}

export function PacienteDialog({ open, onOpenChange, patient }: PacienteDialogProps) {
  const { addPatient, updatePatient, settings } = useAppStore()
  const { toast } = useToast()

  const clinics = settings.locations?.filter((l) => !l.isOnline) || []

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      documentType: 'Nenhum',
      documentRg: '',
      documentCpf: '',
      sessionValue: 0,
      paymentDay: 5,
      paymentMethod: '',
      requiresReceipt: false,
      sessionType: 'Online',
      sessionLocationId: '',
      sessionAddress: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (patient) {
        form.reset({
          name: patient.name || '',
          email: patient.email || '',
          phone: patient.phone || '',
          documentType: patient.documentType || 'Nenhum',
          documentRg: patient.documentRg || '',
          documentCpf: patient.documentCpf || '',
          sessionValue: patient.sessionValue || 0,
          paymentDay: patient.paymentDay || 5,
          paymentMethod: patient.paymentMethod || '',
          requiresReceipt: patient.requiresReceipt || false,
          sessionType: patient.sessionType || 'Online',
          sessionLocationId: patient.sessionLocationId || '',
          sessionAddress: patient.sessionAddress || '',
        })
      } else {
        form.reset({
          name: '',
          email: '',
          phone: '',
          documentType: 'Nenhum',
          documentRg: '',
          documentCpf: '',
          sessionValue: 0,
          paymentDay: 5,
          paymentMethod: '',
          requiresReceipt: false,
          sessionType: 'Online',
          sessionLocationId: '',
          sessionAddress: '',
        })
      }
    }
  }, [open, patient, form])

  const onSubmit = (data: FormValues) => {
    if (patient) {
      updatePatient(patient.id, data)
      toast({ title: 'Paciente atualizado', description: 'Os dados foram salvos com sucesso.' })
    } else {
      const firstName = data.name.split(' ')[0] || ''
      const isFemale = /a$/i.test(firstName)
      const gender = isFemale ? 'female' : 'male'

      addPatient({
        id: generateId(),
        status: 'Ativo',
        avatarUrl: `https://img.usecurling.com/ppl/thumbnail?gender=${gender}&seed=${Math.floor(Math.random() * 100)}`,
        ...data,
      })
      toast({ title: 'Paciente cadastrado', description: 'O paciente foi adicionado com sucesso.' })
    }
    onOpenChange(false)
  }

  const documentType = form.watch('documentType')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
          <DialogDescription>
            {patient
              ? 'Altere os dados do paciente abaixo.'
              : 'Preencha os dados para cadastrar um novo paciente.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="joao@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-3 rounded-xl border border-border/50">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'Nenhum'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nenhum">Nenhum</SelectItem>
                        <SelectItem value="RG">RG</SelectItem>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="Ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(documentType === 'RG' || documentType === 'Ambos') && (
                <FormField
                  control={form.control}
                  name="documentRg"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000-X" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {(documentType === 'CPF' || documentType === 'Ambos') && (
                <FormField
                  control={form.control}
                  name="documentCpf"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sessionValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Sessão (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Pagamento</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="31" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: PIX, Transferência..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requiresReceipt"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    Exige Recibo/Nota Fiscal
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-3 rounded-xl border border-border/50">
              <FormField
                control={form.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidade</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        if (val === 'Online') {
                          form.setValue('sessionLocationId', '')
                          form.setValue('sessionAddress', '')
                        }
                      }}
                      value={field.value || 'Online'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Presencial">Presencial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('sessionType') === 'Presencial' && (
                <FormField
                  control={form.control}
                  name="sessionLocationId"
                  render={({ field }) => (
                    <FormItem className="animate-fade-in">
                      <FormLabel>Selecionar Clínica</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val)
                          const loc = clinics.find((c) => c.id === val)
                          if (loc) {
                            form.setValue('sessionAddress', loc.address || '')
                          }
                        }}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha uma clínica..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clinics.length === 0 ? (
                            <SelectItem value="none" disabled>
                              Nenhuma cadastrada
                            </SelectItem>
                          ) : (
                            clinics.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="sessionAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Número, Bairro, Cidade..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
