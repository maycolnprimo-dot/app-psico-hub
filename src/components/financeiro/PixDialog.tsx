import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import { generateId } from '@/lib/utils'
import { Copy, Check, QrCode } from 'lucide-react'

const schema = z.object({
  patientId: z.string().min(1, 'Selecione o paciente'),
  amount: z.coerce.number().min(1, 'Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
})

type FormValues = z.infer<typeof schema>

interface PixDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultPatientId?: string
  defaultAmount?: number
  defaultDescription?: string
}

export function PixDialog({
  open,
  onOpenChange,
  defaultPatientId,
  defaultAmount,
  defaultDescription,
}: PixDialogProps) {
  const { patients, addCharge, settings } = useAppStore()
  const { toast } = useToast()
  const [step, setStep] = useState<'form' | 'result'>('form')
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: defaultPatientId || '',
      amount: defaultAmount || 0,
      description: defaultDescription || 'Sessão de Psicoterapia',
    },
  })

  useEffect(() => {
    if (open) {
      setStep('form')
      setCopied(false)
      form.reset({
        patientId: defaultPatientId || '',
        amount: defaultAmount || 0,
        description: defaultDescription || 'Sessão de Psicoterapia',
      })
    }
  }, [open, defaultPatientId, defaultAmount, defaultDescription, form])

  const onSubmit = (data: FormValues) => {
    const uniqueId = generateId()
    const sanitizedAmount = data.amount.toFixed(2).replace('.', '')
    const pixCodeString = `00020126580014br.gov.bcb.pix0136${uniqueId}-pix5204000053039865404${sanitizedAmount}5802BR5913${settings?.professionalName?.substring(0, 13) || 'PROFISSIONAL'}6008SAO PAULO62070503***6304${uniqueId.substring(0, 4)}`

    setGeneratedCode(pixCodeString)

    addCharge({
      id: uniqueId,
      patientId: data.patientId,
      amount: data.amount,
      description: data.description,
      status: 'Pendente',
      date: new Date().toISOString(),
      pixCode: pixCodeString,
    })

    setStep('result')
    toast({
      title: 'Cobrança gerada',
      description: 'O código Pix foi gerado com sucesso.',
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: 'Código copiado',
      description: 'Pix Copia e Cola adicionado à área de transferência.',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Gerar Cobrança Pix</DialogTitle>
          <DialogDescription>
            {step === 'form'
              ? 'Preencha os detalhes para gerar o QR Code e o Pix Copia e Cola.'
              : 'Cobrança gerada com sucesso. Envie para o paciente.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        const p = patients.find((p) => p.id === val)
                        if (p && !form.getValues('amount')) {
                          form.setValue('amount', p.sessionValue || 0)
                        }
                      }}
                      value={field.value}
                      disabled={!!defaultPatientId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente..." />
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
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Cobrança</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sessão de Psicoterapia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gap-2">
                  <QrCode className="w-4 h-4" /> Gerar Pix
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="flex flex-col items-center space-y-6 py-4 animate-fade-in">
            <div className="bg-muted/30 p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center gap-4 w-full">
              <img
                src={`https://img.usecurling.com/i?q=qrcode&shape=fill&color=gray`}
                alt="QR Code"
                className="w-48 h-48 rounded-lg"
              />
              <div className="w-full relative">
                <Input
                  value={generatedCode}
                  readOnly
                  className="pr-12 text-xs text-muted-foreground font-mono"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8 text-primary hover:text-primary/80"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <DialogFooter className="w-full sm:justify-center">
              <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto px-8">
                Concluir
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
