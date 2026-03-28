import { DollarSign, Users, CalendarClock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBRL } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'

export function StatCards() {
  const { finances, sessions, patients } = useAppStore()

  const safeFinances = Array.isArray(finances) ? finances : []
  const safeSessions = Array.isArray(sessions) ? sessions : []
  const safePatients = Array.isArray(patients) ? patients : []

  const currentMonthIncomes = safeFinances
    .filter((f) => {
      if (!f || f.type !== 'income' || !f.date) return false
      try {
        const d = new Date(f.date)
        if (isNaN(d.getTime())) return false
        const today = new Date()
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      } catch {
        return false
      }
    })
    .reduce((acc, curr) => acc + (curr?.amount || 0), 0)

  const activePatientsCount = safePatients.filter((p) => p?.status === 'Ativo').length

  const todaySessionsCount = safeSessions.filter((s) => {
    if (!s?.date) return false
    try {
      const d = new Date(s.date)
      if (isNaN(d.getTime())) return false
      const today = new Date()
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      )
    } catch {
      return false
    }
  }).length

  const currentBalance = safeFinances.reduce(
    (acc, curr) => (curr?.type === 'income' ? acc + (curr.amount || 0) : acc - (curr?.amount || 0)),
    0,
  )

  const stats = [
    {
      title: 'Receita do Mês',
      value: formatBRL(currentMonthIncomes || 0),
      icon: TrendingUp,
      desc: '+12% em relação ao mês passado',
    },
    {
      title: 'Pacientes Ativos',
      value: (activePatientsCount || 0).toString(),
      icon: Users,
      desc: 'Base de pacientes ativos',
    },
    {
      title: 'Sessões Hoje',
      value: (todaySessionsCount || 0).toString(),
      icon: CalendarClock,
      desc: 'Atendimentos do dia',
    },
    {
      title: 'Saldo em Caixa',
      value: formatBRL(currentBalance || 0),
      icon: DollarSign,
      desc: 'Atualizado hoje',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className="animate-fade-in-up hover:-translate-y-1 transition-transform duration-300"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
