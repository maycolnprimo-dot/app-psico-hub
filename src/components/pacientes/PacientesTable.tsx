import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MoreHorizontal, Search, Plus } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { Patient } from '@/types'
import { PacienteDialog } from './PacienteDialog'
import { SessionDialog } from './SessionDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatBRL } from '@/lib/utils'

export function PacientesTable() {
  const { patients } = useAppStore()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [patientDialogOpen, setPatientDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)
  const [sessionPatientId, setSessionPatientId] = useState<string>('')

  const filteredPatients = patients.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPatient(patient)
    setPatientDialogOpen(true)
  }

  const handleNewPatient = () => {
    setSelectedPatient(null)
    setPatientDialogOpen(true)
  }

  const handleNewSession = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessionPatientId(patientId)
    setSessionDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou contato..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleNewPatient} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Novo Paciente
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Valor/Sessão</TableHead>
              <TableHead>Última Sessão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/pacientes/${patient.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={patient.avatarUrl} />
                        <AvatarFallback>
                          {(patient.name || '?').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {patient.name || 'Sem Nome'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {patient.email || 'Sem email'}
                      </span>
                      <span className="text-sm">{patient.phone || 'Sem telefone'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatBRL(patient.sessionValue || 0)}</TableCell>
                  <TableCell>
                    {patient.lastSessionDate
                      ? (() => {
                          const d = parseISO(patient.lastSessionDate)
                          return isValid(d)
                            ? format(d, 'dd/MM/yyyy', { locale: ptBR })
                            : 'Data inválida'
                        })()
                      : 'Nenhuma'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={patient.status === 'Ativo' ? 'default' : 'secondary'}
                      className={
                        patient.status === 'Ativo' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                      }
                    >
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/pacientes/${patient.id}`)}>
                          Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleEdit(patient, e)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleNewSession(patient.id, e)}>
                          Agendar Sessão
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PacienteDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        patient={selectedPatient}
      />
      <SessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        defaultPatientId={sessionPatientId}
      />
    </div>
  )
}
