import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function Topic7Content() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(window.location.origin)
    setCopied(true)
    toast({
      title: 'Copiado!',
      description: 'URI de redirecionamento copiada para a área de transferência.',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 text-foreground/90 font-sans mt-2">
      <p className="text-muted-foreground leading-relaxed">
        Siga este passo a passo detalhado para configurar a integração da sua agenda e vídeo
        chamadas (Google Meet), mesmo utilizando uma conta gratuita do Google (@gmail.com). Não é
        necessário conhecimento técnico prévio.
      </p>

      <div className="space-y-4">
        <section className="bg-muted/30 p-4 sm:p-5 rounded-xl border border-border/50 shadow-sm transition-colors hover:bg-muted/50">
          <h4 className="font-semibold text-foreground text-lg mb-2">Passo 1: Acesso ao Projeto</h4>
          <p className="text-muted-foreground leading-relaxed">
            Acesse o site{' '}
            <strong className="text-foreground font-medium">console.cloud.google.com</strong> e faça
            login com sua conta Google. Na parte superior da tela, certifique-se de que um projeto
            está selecionado (por exemplo, "My First Project"). Se não houver, crie um novo projeto
            clicando na lista suspensa no topo.
          </p>
        </section>

        <section className="bg-muted/30 p-4 sm:p-5 rounded-xl border border-border/50 shadow-sm transition-colors hover:bg-muted/50">
          <h4 className="font-semibold text-foreground text-lg mb-2">
            Passo 2: Navegando para APIs
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            Na tela inicial do Google Cloud, role a página até encontrar a seção{' '}
            <strong className="text-foreground font-medium">"Acesso rápido"</strong> e clique no
            cartão escrito{' '}
            <strong className="text-foreground font-medium">"APIs e serviços"</strong>.
          </p>
        </section>

        <section className="bg-muted/30 p-4 sm:p-5 rounded-xl border border-border/50 shadow-sm transition-colors hover:bg-muted/50">
          <h4 className="font-semibold text-foreground text-lg mb-2">
            Passo 3: Ativando as APIs necessárias
          </h4>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-primary leading-relaxed">
            <li>
              No menu superior, clique em{' '}
              <strong className="text-foreground font-medium">"Ativar APIs e Serviços"</strong> (com
              um ícone de +).
            </li>
            <li>
              Na barra de pesquisa, digite "Google Calendar API", clique no resultado e depois no
              botão azul <strong className="text-foreground font-medium">"Ativar"</strong>.
            </li>
            <li>
              Repita o processo: pesquise por "Google Meet API" (ou "Google Workspace SDK" para
              recursos do Meet) e clique em{' '}
              <strong className="text-foreground font-medium">"Ativar"</strong>.
            </li>
          </ul>
        </section>

        <section className="bg-muted/30 p-4 sm:p-5 rounded-xl border border-border/50 shadow-sm transition-colors hover:bg-muted/50">
          <h4 className="font-semibold text-foreground text-lg mb-2">
            Passo 4: Tela de permissão OAuth
          </h4>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            Essa etapa é apenas para dizer ao Google qual aplicativo vai acessar sua agenda.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-primary leading-relaxed">
            <li>
              No menu lateral esquerdo de "APIs e serviços", clique em{' '}
              <strong className="text-foreground font-medium">"Tela de permissão OAuth"</strong>.
            </li>
            <li>
              Escolha a opção <strong className="text-foreground font-medium">"Externo"</strong>{' '}
              (necessário para contas comuns gratuitas) e clique em "Criar".
            </li>
            <li>
              Preencha apenas os campos obrigatórios:{' '}
              <strong className="text-foreground font-medium">"Nome do app"</strong> (Psico Gestão
              Hub), <strong className="text-foreground font-medium">"E-mail de suporte"</strong> e{' '}
              <strong className="text-foreground font-medium">
                "Dados de contato do desenvolvedor"
              </strong>
              . Salve e continue até o final sem adicionar mais nada.
            </li>
          </ul>
        </section>

        <section className="bg-muted/30 p-4 sm:p-5 rounded-xl border border-border/50 shadow-sm transition-colors hover:bg-muted/50">
          <h4 className="font-semibold text-foreground text-lg mb-2">
            Passo 5: Criando suas Credenciais
          </h4>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground marker:text-primary leading-relaxed">
            <li>
              No menu lateral esquerdo, clique em{' '}
              <strong className="text-foreground font-medium">"Credenciais"</strong>.
            </li>
            <li>
              No topo, clique em{' '}
              <strong className="text-foreground font-medium">"Criar Credenciais"</strong> e depois
              escolha <strong className="text-foreground font-medium">"ID do cliente OAuth"</strong>
              .
            </li>
            <li>
              Em "Tipo de aplicativo", selecione{' '}
              <strong className="text-foreground font-medium">"Aplicativo da Web"</strong>.
            </li>
            <li className="pt-2">
              Role até "URIs de redirecionamento autorizados", clique em "Adicionar URI" e cole o
              endereço abaixo:
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3 mb-2 p-3 bg-background rounded-lg border shadow-sm max-w-xl">
                <code className="text-sm font-mono text-primary break-all flex-1 px-1 select-all">
                  {window.location.origin}
                </code>
                <Button
                  variant={copied ? 'default' : 'secondary'}
                  size="sm"
                  className={`h-9 shrink-0 sm:w-28 mt-2 sm:mt-0 transition-all ${copied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" /> Copiar URI
                    </>
                  )}
                </Button>
              </div>
            </li>
            <li>Clique em "Criar".</li>
          </ul>
        </section>

        <section className="bg-muted/30 p-4 sm:p-5 rounded-xl border border-border/50 shadow-sm transition-colors hover:bg-muted/50">
          <h4 className="font-semibold text-foreground text-lg mb-2">
            Passo 6: Finalizando a Configuração
          </h4>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            Uma janela aparecerá com suas credenciais recém-criadas. Copie o{' '}
            <strong className="text-foreground font-medium">"ID do cliente"</strong> (Client ID) e a{' '}
            <strong className="text-foreground font-medium">"Chave secreta do cliente"</strong>{' '}
            (Client Secret).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Por fim, volte ao Psico Gestão Hub, acesse o menu{' '}
            <strong className="text-foreground font-medium">"Meu Perfil"</strong> (na seção de
            Configurações de Integração), cole esses valores nos respectivos campos de Google
            Calendar & Meet e salve.
          </p>
        </section>
      </div>
    </div>
  )
}
