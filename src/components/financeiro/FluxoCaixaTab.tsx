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
import { formatBRL } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function FluxoCaixaTab() {
  const { finances } = useAppStore()
  const sortedFinances = [...finances].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFinances.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap">
                  {format(parseISO(entry.date), 'dd MMM, yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell className="font-medium">{entry.description}</TableCell>
                <TableCell>{entry.category}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      entry.type === 'income'
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-destructive bg-destructive/10'
                    }
                  >
                    {entry.type === 'income' ? 'Receita' : 'Despesa'}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${entry.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}
                >
                  {entry.type === 'income' ? '+' : '-'}
                  {formatBRL(entry.amount)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      entry.status === 'Pago'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : ''
                    }
                  >
                    {entry.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
