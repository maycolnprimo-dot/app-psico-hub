import { useEffect, useRef } from 'react'
import { Patient } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Save, Camera } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import { compressImage } from '@/lib/image-utils'

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().optional(),
  documentType: z.enum(['RG', 'CPF', 'Ambos', 'Nenhum', '']).optional(),
  documentRg: z.string().optional(),
  documentCpf: z.string().optional(),
  patientAddress: z.string().optional(),
  sessionValue: z.coerce.number().min(0, 'Valor deve ser positivo'),
  paymentDay: z.coerce.number().min(1).max(31),
  paymentMethod: z.string().min(1, 'Método é obrigatório'),
  requiresReceipt: z.boolean().default(false),
  sessionType: z.enum(['Online', 'Presencial']).optional(),
  sessionLocationId: z.string().optional(),
  sessionAddress: z.string().optional(),
  usePatientAddress: z.boolean().default(false),
  takingMedication: z.boolean().default(false),
  medicationDetails: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  contractType: z.enum(['Mensal', 'Por Sessão']).optional(),
  contractFrequency: z.enum(['Semanal', 'Quinzenal']).optional(),
  contractDayOfWeek: z.coerce.number().min(0).max(6).optional(),
  contractTime: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function TabsCadastro({ patient }: { patient: Patient }) {
  const { settings, updatePatient } = useAppStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clinics = settings.locations?.filter((l) => !l.isOnline) || []

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      documentType: patient.documentType || 'Nenhum',
      documentRg: patient.documentRg || '',
      documentCpf: patient.documentCpf || '',
      patientAddress: patient.patientAddress || '',
      sessionValue: patient.sessionValue || 0,
      paymentDay: patient.paymentDay || 5,
      paymentMethod: patient.paymentMethod || '',
      requiresReceipt: patient.requiresReceipt || false,
      sessionType: patient.sessionType || 'Online',
      sessionLocationId: patient.sessionLocationId || '',
      sessionAddress: patient.sessionAddress || '',
      usePatientAddress: patient.usePatientAddress || false,
      takingMedication: patient.takingMedication || false,
      medicationDetails: patient.medicationDetails || '',
      emergencyContact: patient.emergencyContact || { name: '', email: '', phone: '', address: '' },
      contractType: patient.contractType || 'Por Sessão',
      contractFrequency: patient.contractFrequency || 'Semanal',
      contractDayOfWeek: patient.contractDayOfWeek ?? 1,
      contractTime: patient.contractTime || '14:00',
    },
  })

  const usePatAddress = form.watch('usePatientAddress')
  const patAddress = form.watch('patientAddress')

  useEffect(() => {
    if (usePatAddress && patAddress) {
      form.setValue('sessionAddress', patAddress)
    }
  }, [usePatAddress, patAddress, form])

  const onSubmit = (data: FormValues) => {
    updatePatient(patient.id, data)
    toast({ title: 'Alterações salvas', description: 'Dados do paciente atualizados com sucesso.' })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 0.85)
        updatePatient(patient.id, { avatarUrl: compressed })
        toast({
          title: 'Foto atualizada',
          description: 'A foto de perfil foi alterada e protegida no sistema.',
        })
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível processar a foto.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="relative h-16 w-16 rounded-full bg-background overflow-hidden border-2 border-primary/20 shadow-sm">
            {patient.avatarUrl && (
              <img src={patient.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-primary">Perfil do Paciente</h3>
            <p className="text-sm text-muted-foreground">
              Clique na imagem para alterar a foto do paciente.
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Dados Pessoais */}
          <Card className="border-t-4 border-t-primary/80 overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/20 pb-4 border-b">
              <CardTitle className="text-lg">Dados Pessoais & Documentação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-xl border border-border/50">
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
                    </FormItem>
                  )}
                />
                {(form.watch('documentType') === 'RG' ||
                  form.watch('documentType') === 'Ambos') && (
                  <FormField
                    control={form.control}
                    name="documentRg"
                    render={({ field }) => (
                      <FormItem className="animate-fade-in md:col-span-1">
                        <FormLabel>RG</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000-X" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                {(form.watch('documentType') === 'CPF' ||
                  form.watch('documentType') === 'Ambos') && (
                  <FormField
                    control={form.control}
                    name="documentCpf"
                    render={({ field }) => (
                      <FormItem className="animate-fade-in md:col-span-1">
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="patientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Residencial</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Acordo Financeiro */}
          <Card className="border-t-4 border-t-primary/80 overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/20 pb-4 border-b">
              <CardTitle className="text-lg">Acordo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Contrato</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mensal">Mensal</SelectItem>
                          <SelectItem value="Por Sessão">Por Sessão</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Semanal">Semanal</SelectItem>
                          <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contractDayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia da Semana</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Domingo</SelectItem>
                          <SelectItem value="1">Segunda-feira</SelectItem>
                          <SelectItem value="2">Terça-feira</SelectItem>
                          <SelectItem value="3">Quarta-feira</SelectItem>
                          <SelectItem value="4">Quinta-feira</SelectItem>
                          <SelectItem value="5">Sexta-feira</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário Padrão</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t mt-2">
                <FormField
                  control={form.control}
                  name="sessionValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia Venc.</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="31" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="requiresReceipt"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Emite Recibo/Nota Fiscal
                    </FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Local das Sessões */}
          <Card className="border-t-4 border-t-primary/80 overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/20 pb-4 border-b">
              <CardTitle className="text-lg">Local das Sessões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            if (!form.watch('usePatientAddress')) {
                              form.setValue('sessionAddress', '')
                            }
                          }
                        }}
                        value={field.value}
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
                              form.setValue('usePatientAddress', false)
                            }
                          }}
                          value={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma clínica..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clinics.length === 0 ? (
                              <SelectItem value="none" disabled>
                                Nenhuma clínica cadastrada
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
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="sessionAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch('sessionType') === 'Online'
                          ? 'Endereço onde realiza a sessão online'
                          : 'Endereço da Clínica / Consultório'}
                      </FormLabel>
                      <FormControl>
                        <Input disabled={usePatAddress} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="usePatientAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 bg-muted/30 p-3 rounded-lg border">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(val) => {
                            field.onChange(val)
                            if (val && patAddress) {
                              form.setValue('sessionAddress', patAddress)
                              if (form.watch('sessionType') === 'Presencial') {
                                form.setValue('sessionLocationId', '')
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-medium cursor-pointer text-xs text-foreground">
                        Usar endereço residencial do paciente
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contato e Saúde */}
          <div className="space-y-6">
            <Card className="border-t-4 border-t-primary/80 overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/20 pb-4 border-b">
                <CardTitle className="text-lg">Contato de Confiança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="emergencyContact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary/80 overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/20 pb-4 border-b">
                <CardTitle className="text-lg">Informações Médicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="takingMedication"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Faz uso de medicação psiquiátrica?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('takingMedication') && (
                  <FormField
                    control={form.control}
                    name="medicationDetails"
                    render={({ field }) => (
                      <FormItem className="animate-fade-in">
                        <FormLabel>Qual(is) medicação(ões)?</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Sertralina 50mg" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end sticky bottom-4 z-10">
          <Button
            type="submit"
            className="gap-2 shadow-elevation px-8 h-12 rounded-xl text-base font-semibold"
          >
            <Save className="w-5 h-5" /> Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  )
}
