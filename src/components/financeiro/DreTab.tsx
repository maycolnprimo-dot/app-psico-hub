import { useAppStore } from '@/stores/useAppStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatBRL } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function DreTab() {
  const { finances } = useAppStore()

  // Basic Calculation for Current Year/Month (simplification)
  const incomes = finances.filter((f) => f.type === 'income')
  const expenses = finances.filter((f) => f.type === 'expense')

  const grossRevenue = incomes.reduce((acc, curr) => acc + curr.amount, 0)

  // Assume a 6% tax rate for receipts as deduction simulation
  const taxDeduction = incomes
    .filter((f) => f.requiresReceipt)
    .reduce((acc, curr) => acc + curr.amount * 0.06, 0)

  const netRevenue = grossRevenue - taxDeduction
  const operationalCosts = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const netProfit = netRevenue - operationalCosts

  const dreData = [
    {
      label: '(=) Receita Bruta Total',
      value: grossRevenue,
      type: 'header',
      color: 'text-foreground',
    },
    {
      label: '(-) Deduções e Impostos Estimados (6% ref. NF)',
      value: taxDeduction,
      type: 'item',
      color: 'text-destructive',
    },
    {
      label: '(=) Receita Líquida',
      value: netRevenue,
      type: 'subtotal',
      color: 'text-emerald-600',
    },
    {
      label: '(-) Custos Operacionais (Despesas)',
      value: operationalCosts,
      type: 'item',
      color: 'text-destructive',
    },
    {
      label: '(=) Lucro Líquido do Período',
      value: netProfit,
      type: 'total',
      color: netProfit >= 0 ? 'text-emerald-600' : 'text-destructive',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Demonstração do Resultado do Exercício (DRE)</CardTitle>
            <CardDescription>Resumo financeiro simplificado para o contador.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableBody>
                {dreData.map((row, index) => (
                  <TableRow
                    key={index}
                    className={`${
                      row.type === 'header'
                        ? 'bg-muted/50 font-bold'
                        : row.type === 'total'
                          ? 'bg-primary/5 text-lg font-bold border-t-2 border-primary/20'
                          : row.type === 'subtotal'
                            ? 'font-semibold border-t'
                            : ''
                    }`}
                  >
                    <TableCell className={row.type === 'item' ? 'pl-8' : ''}>{row.label}</TableCell>
                    <TableCell className={`text-right ${row.color}`}>
                      {formatBRL(row.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
