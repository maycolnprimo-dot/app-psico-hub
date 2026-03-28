import { FinanceEntry, Patient, Session } from '@/types'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatBRL } from '@/lib/utils'
import { Calendar, Edit2, QrCode } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/stores/useAppStore'
import { PixDialog } from '@/components/financeiro/PixDialog'

export function TabsFinanceiro({
  finances,
  patient,
  sessions,
}: {
  finances: FinanceEntry[]
  patient: Patient
  sessions: Session[]
}) {
  const { updatePatient } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [pixDialogOpen, setPixDialogOpen] = useState(false)
  const [editExpected, setEditExpected] = useState<string>('')
  const [editHeld, setEditHeld] = useState<string>('')
  const [calcExpected, setCalcExpected] = useState(0)
  const [calcHeld, setCalcHeld] = useState(0)

  const patientFinances = finances.filter((f) => f.type === 'income')

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const totalReceived = patientFinances
    .filter((f) => f.status === 'Pago')
    .reduce((sum, f) => sum + (f.amount || 0), 0)

  const monthReceived = patientFinances
    .filter((f) => {
      if (f.status !== 'Pago' || !f.date) return false
      const d = new Date(f.date)
      if (isNaN(d.getTime())) return false
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, f) => sum + (f.amount || 0), 0)

  let remainingSessionsCard = null
  const monthKey = `${currentYear}-${currentMonth}`

  if (patient.contractType === 'Mensal' && patient.contractDayOfWeek !== undefined) {
    const overrides = patient.monthlyOverrides?.[monthKey] || {}

    let calculatedExpected = 0
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      if (new Date(currentYear, currentMonth, i).getDay() === patient.contractDayOfWeek) {
        calculatedExpected++
      }
    }

    if (patient.contractFrequency === 'Quinzenal') {
      calculatedExpected = Math.ceil(calculatedExpected / 2)
    }

    const expected = overrides.expected !== undefined ? overrides.expected : calculatedExpected

    const calculatedHeld = sessions.filter((s) => {
      if (s.status !== 'Realizada' || !s.date) return false
      const d = new Date(s.date)
      if (isNaN(d.getTime())) return false
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).length

    const held = overrides.held !== undefined ? overrides.held : calculatedHeld
    const remaining = Math.max(0, expected - held)

    const openEdit = () => {
      setCalcExpected(calculatedExpected)
      setCalcHeld(calculatedHeld)
      setEditExpected(overrides.expected !== undefined ? String(overrides.expected) : '')
      setEditHeld(overrides.held !== undefined ? String(overrides.held) : '')
      setIsEditing(true)
    }

    const handleEditSave = () => {
      const newOverrides = {
        ...(patient.monthlyOverrides || {}),
        [monthKey]: {
          expected: editExpected === '' ? undefined : Number(editExpected),
          held: editHeld === '' ? undefined : Number(editHeld),
        },
      }
      updatePatient(patient.id, { monthlyOverrides: newOverrides })
      setIsEditing(false)
    }

    remainingSessionsCard = (
      <>
        <Card className="bg-primary/5 border-primary/20 md:col-span-2 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Controle de Pacote Mensal (
              {format(new Date(), 'MMMM', { locale: ptBR })})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {remaining} {remaining === 1 ? 'sessão restante' : 'sessões restantes'}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Total previsto no mês: {expected} | Já realizadas: {held}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openEdit}
                className="gap-2 bg-background shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" /> Ajustar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Ajustar Pacote Mensal</DialogTitle>
              <DialogDescription>
                Edite manualmente a quantidade de sessões deste mês, caso haja exceções na
                frequência padrão.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expected" className="text-right col-span-2 text-sm">
                  Sessões Previstas
                </Label>
                <Input
                  id="expected"
                  type="number"
                  value={editExpected}
                  onChange={(e) => setEditExpected(e.target.value)}
                  placeholder={`Auto (${calcExpected})`}
                  className="col-span-2"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="held" className="text-right col-span-2 text-sm">
                  Sessões Realizadas
                </Label>
                <Input
                  id="held"
                  type="number"
                  value={editHeld}
                  onChange={(e) => setEditHeld(e.target.value)}
                  placeholder={`Auto (${calcHeld})`}
                  className="col-span-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditSave}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid gap-4 md:grid-cols-2">
        {remainingSessionsCard}
        <Card className="bg-emerald-50/80 border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-700">
              Total Recebido (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-800">{formatBRL(monthReceived)}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/80 border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Total Recebido (Histórico)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{formatBRL(totalReceived)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-4 border-t-primary/80 overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
          <Button size="sm" className="gap-2 shadow-sm" onClick={() => setPixDialogOpen(true)}>
            <QrCode className="w-4 h-4" /> Gerar Cobrança Pix
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientFinances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                    Nenhum registro financeiro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                patientFinances
                  .filter((f) => f.date)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => {
                    const d = parseISO(entry.date)
                    const safeDate = isValid(d)
                      ? format(d, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Data inválida'
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="pl-6 font-medium text-muted-foreground">
                          {safeDate}
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.description || 'Sem descrição'}
                        </TableCell>
                        <TableCell className="font-bold">{formatBRL(entry.amount || 0)}</TableCell>
                        <TableCell className="pr-6">
                          <Badge
                            variant="outline"
                            className={
                              entry.status === 'Pago'
                                ? 'text-emerald-700 border-emerald-300 bg-emerald-50 font-semibold'
                                : entry.status === 'Pendente'
                                  ? 'text-amber-700 border-amber-300 bg-amber-50 font-semibold'
                                  : ''
                            }
                          >
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PixDialog
        open={pixDialogOpen}
        onOpenChange={setPixDialogOpen}
        defaultPatientId={patient.id}
        defaultAmount={patient.sessionValue}
      />
    </div>
  )
}
