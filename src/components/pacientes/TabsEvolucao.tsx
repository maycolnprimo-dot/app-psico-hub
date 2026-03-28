import { useState, useMemo } from 'react'
import { Session } from '@/types'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Printer, FileText } from 'lucide-react'
import { SessionDialog } from './SessionDialog'
import { useAppStore } from '@/stores/useAppStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

const safeFormatDate = (dateStr: string | undefined, fmt: string) => {
  if (!dateStr) return 'Data não informada'
  const d = parseISO(dateStr)
  if (!isValid(d)) return 'Data inválida'
  try {
    return format(d, fmt, { locale: ptBR })
  } catch (e) {
    return 'Data inválida'
  }
}

export function TabsEvolucao({ sessions, patientId }: { sessions: Session[]; patientId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportOpinion, setReportOpinion] = useState('')
  const [includeSessions, setIncludeSessions] = useState(true)

  const { settings, patients } = useAppStore()

  const patient = patients.find((p) => p.id === patientId)

  // UseMemo to prevent sorting on every re-render (especially when typing in Textarea)
  const displaySessions = useMemo(() => {
    return [...sessions].sort(
      (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(),
    )
  }, [sessions])

  const handleNew = () => {
    setSelectedSession(null)
    setDialogOpen(true)
  }

  const handleEdit = (session: Session) => {
    setSelectedSession(session)
    setDialogOpen(true)
  }

  const generatePDF = (sessionsToPrint: Session[]) => {
    try {
      const win = window.open('', '_blank')
      setReportDialogOpen(false)

      if (!win) {
        alert('Por favor, permita a abertura de pop-ups neste site para gerar o relatório.')
        return
      }

      const formatPatientDocument = () => {
        if (!patient) return 'Não informado'
        if (patient.documentType === 'Ambos') {
          return `RG: ${patient.documentRg || 'Não inf.'} / CPF: ${patient.documentCpf || 'Não inf.'}`
        }
        if (patient.documentType === 'RG') {
          return `RG: ${patient.documentRg || 'Não inf.'}`
        }
        if (patient.documentType === 'CPF') {
          return `CPF: ${patient.documentCpf || 'Não inf.'}`
        }
        return patient.documentCpf
          ? `CPF: ${patient.documentCpf}`
          : patient.documentRg
            ? `RG: ${patient.documentRg}`
            : 'Não informado'
      }

      let html = `
        <html>
          <head>
            <title>Relatório Clínico - ${patient?.name || 'Paciente'}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              .header { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 20px; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { max-height: 60px; max-width: 200px; object-fit: contain; }
              .header-text { flex: 1; min-width: 260px; }
              .clinic-name { font-size: 24px; font-weight: bold; color: ${settings?.primaryColor || '#000'}; word-break: break-word; }
              .contact-info { font-size: 14px; color: #555; margin-top: 8px; line-height: 1.5; word-break: break-word; }
              .session { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; break-inside: avoid; }
              .date { font-size: 14px; color: #666; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .field { margin-bottom: 15px; }
              .label { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #888; margin-bottom: 4px; }
              .value { font-size: 14px; white-space: pre-wrap; word-break: break-word; }
              .signature-block { display: flex; justify-content: center; margin-top: 100px; page-break-inside: avoid; break-inside: avoid; text-align: center; }
              
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 20px; }
                .session { page-break-inside: avoid; break-inside: avoid; }
                .signature-block { page-break-inside: avoid; break-inside: avoid; }
                h2, h3, .header { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              ${settings?.logoUrl && !settings.logoUrl.startsWith('data:image/svg+xml') ? `<img src="${settings.logoUrl}" class="logo" />` : ''}
              <div class="header-text">
                <div class="clinic-name">${settings?.clinicName || 'Consultório'}</div>
                <div class="contact-info">
                  <strong>Profissional:</strong> ${settings?.professionalName || 'Não informado'}
                  ${settings?.crp ? `<br/><strong>Documento (CRP/CPF):</strong> ${settings.crp}` : ''}
                  ${settings?.whatsappNumber ? `<br/><strong>Telefone / WhatsApp:</strong> ${settings.whatsappNumber}` : ''}
                  ${settings?.googleEmail ? `<br/><strong>E-mail:</strong> ${settings.googleEmail}` : ''}
                </div>
              </div>
            </div>
            <h2 style="margin-bottom: 15px; font-size: 20px; color: #111;">Prontuário Clínico e Evolução</h2>
            <div style="margin-bottom: 30px; font-size: 14px; border-left: 4px solid ${settings?.primaryColor || '#4F46E5'}; background-color: #f8fafc; padding: 16px; border-radius: 0 8px 8px 0; word-break: break-word;">
              <div style="margin-bottom: 8px;"><strong>Paciente:</strong> <span style="font-size: 15px; color: #111;">${patient?.name || 'Não informado'}</span></div>
              <div style="margin-bottom: 8px;"><strong>Documento:</strong> <span style="color: #444;">${formatPatientDocument()}</span></div>
              <div><strong>Contato:</strong> <span style="color: #444;">${patient?.phone || 'Não informado'}</span></div>
            </div>
      `

      if (reportOpinion) {
        const formattedOpinion = reportOpinion.replace(/\n/g, '<br />')
        html += `
          <div class="session" style="background-color: #f8fafc; border-left: 4px solid ${settings?.primaryColor || '#4F46E5'};">
            <div class="field">
              <div class="label" style="color: ${settings?.primaryColor || '#4F46E5'}; font-size: 14px;">Parecer Psicológico Geral</div>
              <div class="value" style="margin-top: 8px;">${formattedOpinion}</div>
            </div>
          </div>
        `
      }

      if (includeSessions || sessionsToPrint.length === 1) {
        sessionsToPrint.forEach((s) => {
          const cat =
            settings?.serviceCategories?.find((c) => c.id === s.categoryId)?.name || s.type
          const loc =
            settings?.locations?.find((l) => l.id === s.locationId)?.name || 'Local não definido'
          const dateFormatted = safeFormatDate(s.date, "dd/MM/yyyy 'às' HH:mm")

          html += `
            <div class="session">
              <div class="date"><strong>Sessão:</strong> ${dateFormatted} - ${cat} - ${loc} (${s.status})</div>
              ${s.theme ? `<div class="field"><div class="label">Tema Principal</div><div class="value">${s.theme}</div></div>` : ''}
              ${s.feedback ? `<div class="field"><div class="label">Anotações</div><div class="value">${s.feedback}</div></div>` : ''}
              ${s.therapistFeedback ? `<div class="field"><div class="label">Devolução Terapeuta</div><div class="value">${s.therapistFeedback}</div></div>` : ''}
              ${s.possiblePaths ? `<div class="field"><div class="label">Caminhos Possíveis</div><div class="value">${s.possiblePaths}</div></div>` : ''}
            </div>
          `
        })
      }

      html += `
          <div class="signature-block">
            <div style="border-top: 1px solid #000; width: 400px; padding-top: 15px; text-align: center;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111;">${settings?.professionalName || 'Assinatura do Profissional'}</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #555;">Psicólogo(a) Clínico(a)</p>
              ${settings?.crp ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #555;">CRP: ${settings.crp}</p>` : ''}
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 800);
          </script>
        </body></html>`

      win.document.write(html)
      win.document.close()
      win.focus()
    } catch (e) {
      console.error('Failed to generate PDF:', e)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
        <div>
          <h3 className="text-lg font-semibold text-primary">Histórico de Sessões</h3>
          <p className="text-sm text-muted-foreground">
            Registre a evolução clínica e intervenções do paciente.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="gap-2 flex-1 sm:flex-none bg-background shadow-sm"
            onClick={() => setReportDialogOpen(true)}
          >
            <FileText className="w-4 h-4" /> Relatório Completo
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none shadow-md font-medium" onClick={handleNew}>
            <Plus className="w-4 h-4" /> Registrar Evolução
          </Button>
        </div>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {displaySessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 bg-muted/20 rounded-xl border border-dashed mx-auto max-w-lg">
            Nenhuma sessão registrada.
          </p>
        ) : (
          displaySessions.map((session, index) => {
            const category = settings?.serviceCategories?.find((c) => c.id === session.categoryId)
            const chronologicalIndex = index + 1

            return (
              <div
                key={session.id}
                className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow shrink-0 md:order-1 md:group-even:-translate-x-1/2 md:group-odd:translate-x-1/2 z-10 text-xs font-bold transition-transform group-hover:scale-110 ${session.status === 'Realizada' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {chronologicalIndex}
                </div>
                <Card
                  className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-all border-t-4 border-t-primary/60"
                  style={{ borderTopColor: category?.color || 'var(--primary)' }}
                >
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-muted/20 border-b">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {safeFormatDate(session.date, "dd 'de' MMM, yyyy")}
                        </span>
                        {session.status !== 'Realizada' && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium">
                            {session.status}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        {category?.name || session.type}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => generatePDF([session])}
                        title="Imprimir Sessão Individual"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleEdit(session)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5">
                    {session.theme && (
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                          Tema Principal
                        </span>
                        <p className="text-sm font-medium mt-1.5">{session.theme}</p>
                      </div>
                    )}
                    {session.feedback && (
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Anotações
                        </span>
                        <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap leading-relaxed">
                          {session.feedback}
                        </p>
                      </div>
                    )}
                    {session.therapistFeedback && (
                      <div className="pl-4 border-l-2 border-primary/40 bg-primary/5 py-2 pr-2 rounded-r-lg">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          Devolução Terapeuta
                        </span>
                        <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap">
                          {session.therapistFeedback}
                        </p>
                      </div>
                    )}
                    {session.possiblePaths && (
                      <div className="pl-4 border-l-2 border-emerald-500/40 bg-emerald-50 py-2 pr-2 rounded-r-lg">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          Caminhos Possíveis
                        </span>
                        <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap">
                          {session.possiblePaths}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })
        )}
      </div>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Configurar Relatório Clínico</DialogTitle>
            <DialogDescription>
              Personalize o que será incluído no PDF do prontuário deste paciente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-foreground">Parecer Psicológico (Opcional)</Label>
              <Textarea
                placeholder="Escreva um resumo ou parecer geral sobre a evolução e estado atual do paciente..."
                className="min-h-[140px] resize-y"
                value={reportOpinion}
                onChange={(e) => setReportOpinion(e.target.value)}
              />
            </div>
            <div className="flex flex-row items-center space-x-3 bg-muted/30 p-4 rounded-xl border border-muted-foreground/20">
              <Checkbox
                id="include-sessions"
                checked={includeSessions}
                onCheckedChange={(checked) => setIncludeSessions(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="include-sessions" className="cursor-pointer font-semibold">
                  Incluir histórico de sessões
                </Label>
                <p className="text-xs text-muted-foreground">
                  Se desmarcado, apenas o parecer psicológico acima será exportado.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => generatePDF(displaySessions)} className="gap-2 shadow-sm">
              <Printer className="w-4 h-4" /> Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        session={selectedSession}
        defaultPatientId={patientId}
      />
    </div>
  )
}
