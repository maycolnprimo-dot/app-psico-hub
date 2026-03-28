import { useAppStore } from '@/stores/useAppStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBRL, generateId } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function CobrancasTab() {
  const { charges, patients, updateCharge, addFinanceEntry } = useAppStore()
  const { toast } = useToast()

  const sortedCharges = [...(charges || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const handleMarkAsPaid = (charge: any) => {
    updateCharge(charge.id, { status: 'Pago' })
    addFinanceEntry({
      id: generateId(),
      description: charge.description || 'Pagamento Recebido',
      amount: charge.amount,
      type: 'income',
      date: new Date().toISOString(),
      category: 'Sessões',
      status: 'Pago',
      patientId: charge.patientId,
    })
    toast({
      title: 'Cobrança quitada',
      description: 'O status foi atualizado e o valor integrado ao Fluxo de Caixa.',
    })
  }

  const copyPix = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: 'Código Copiado',
      description: 'O Pix Copia e Cola foi transferido para sua área de transferência.',
    })
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Data / Criação</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCharges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma cobrança gerada até o momento.
                </TableCell>
              </TableRow>
            ) : (
              sortedCharges.map((charge) => {
                const patient = patients.find((p) => p.id === charge.patientId)
                return (
                  <TableRow key={charge.id}>
                    <TableCell className="whitespace-nowrap font-medium text-muted-foreground">
                      {format(parseISO(charge.date), 'dd MMM, yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {patient?.name || 'Paciente excluído'}
                    </TableCell>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell className="font-bold">{formatBRL(charge.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          charge.status === 'Pago'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : charge.status === 'Pendente'
                              ? 'bg-amber-100 text-amber-700 border-amber-300'
                              : 'bg-red-100 text-red-700 border-red-300'
                        }
                      >
                        {charge.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      {charge.status === 'Pendente' && charge.pixCode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-muted-foreground hover:text-primary"
                          onClick={() => copyPix(charge.pixCode!)}
                        >
                          <Copy className="w-4 h-4" /> Pix
                        </Button>
                      )}
                      {charge.status === 'Pendente' && (
                        <Button
                          size="sm"
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          onClick={() => handleMarkAsPaid(charge)}
                        >
                          <Check className="w-4 h-4" /> Marcar Pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
