# Webhooks

## Visao Geral

A Focus NFe envia notificacoes via webhook (gatilhos) para seu endpoint quando documentos fiscais mudam de status -- autorizacao, cancelamento, erro de emissao, entre outros. Isso elimina a necessidade de fazer polling constante para verificar o status de processamento.

Quando um evento ocorre, a API envia os dados do documento no formato JSON para uma URL da sua escolha atraves do metodo HTTP POST. Cada acionamento contem os dados de apenas um documento.

## Gerenciamento de Webhooks

O SDK oferece metodos completos para criar, listar, consultar e excluir webhooks atraves do servico `client.webhooks`.

### Criar um Webhook

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'PRODUCTION',
})

// Criar um webhook para eventos de NFe de uma empresa especifica
const webhook = await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfe',
  url: 'https://seuapp.com/webhooks/nfe',
})

console.log('Webhook criado:', webhook.id)
// { id: "Vj5rmkBq", url: "https://seuapp.com/webhooks/nfe", event: "nfe", cnpj: "51916585000125" }
```

#### Parametros de Criacao

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `cnpj` | `string` | Nao | CNPJ da empresa. Se omitido, o gatilho e acionado para todas as emissoes do token. |
| `cpf` | `string` | Nao | CPF da empresa/prestador. Mutuamente excludente com `cnpj`. |
| `event` | `WebhookEvent` | Sim | Tipo de evento a ser escutado. |
| `url` | `string` | Sim | URL de destino para o POST quando o gatilho for ativado. |
| `authorization` | `string` | Nao | Valor enviado no header de autorizacao a cada acionamento. |
| `authorization_header` | `string` | Nao | Nome do header HTTP para o campo `authorization`. Padrao: `"Authorization"`. |

**Nota:** E permitido criar ate 5 webhooks por empresa para o mesmo evento. Os campos `cnpj` e `cpf` sao mutuamente excludentes.

#### Usando Autorizacao Customizada

Para garantir que apenas a API da Focus NFe acione sua URL, use o campo `authorization`:

```typescript
// Usando um token secreto simples
const webhook = await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfe',
  url: 'https://seuapp.com/webhooks/nfe',
  authorization: 'lFNVw8q5WMeR3U9FOVOABTp36zrkvtaa',
})
// A API enviara: Authorization: lFNVw8q5WMeR3U9FOVOABTp36zrkvtaa

// Usando um header customizado
const webhookCustom = await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfse',
  url: 'https://seuapp.com/webhooks/nfse',
  authorization: 'IlzJYBLJBxQT1FUGNRxhFO1ASpNKfj8z',
  authorization_header: 'X-ApiKey',
})
// A API enviara: X-ApiKey: IlzJYBLJBxQT1FUGNRxhFO1ASpNKfj8z
```

### Listar Webhooks

```typescript
// Listar todos os webhooks de todas as empresas do token
const webhooks = await client.webhooks.list()

webhooks.forEach(hook => {
  console.log(`[${hook.event}] ${hook.url} (${hook.cnpj || 'global'})`)
})
```

### Consultar um Webhook

```typescript
// Consultar um webhook individual pelo ID
const webhook = await client.webhooks.get('Vj5rmkBq')

console.log('URL:', webhook.url)
console.log('Evento:', webhook.event)
console.log('Empresa:', webhook.cnpj)
```

### Excluir um Webhook

```typescript
const result = await client.webhooks.remove('Vj5rmkBq')

if (result.deleted) {
  console.log('Webhook excluido com sucesso')
}
```

## Eventos Suportados

O tipo `WebhookEvent` define todos os eventos disponiveis:

| Evento | Descricao |
|--------|-----------|
| `nfe` | NFe autorizada, com erro ou inutilizada |
| `nfce_contingencia` | NFCe em contingencia, efetivada ou cancelada |
| `nfse` | NFSe autorizada ou com erro |
| `nfsen` | NFSe nacional autorizada ou com erro |
| `cte` | CTe autorizada, com erro ou denegada |
| `mdfe` | MDFe autorizada, com erro ou denegada |
| `nfcom` | NFCom autorizada, com erro ou denegada |
| `nfe_recebida` | Nova NFe recebida (manifestacao) |
| `nfe_recebida_falha_consulta` | Falha na consulta de NFe recebidas |
| `cte_recebida` | Nova CTe recebida |
| `nfse_recebida` | Nova NFSe recebida |
| `inutilizacao` | Inutilizacao de faixa de numeracao |

### Exemplo: Criando Webhooks para Multiplos Eventos

```typescript
const eventos = ['nfe', 'nfse', 'cte'] as const

for (const event of eventos) {
  await client.webhooks.create({
    cnpj: '51916585000125',
    event,
    url: `https://seuapp.com/webhooks/${event}`,
    authorization: process.env.WEBHOOK_SECRET!,
  })
}
```

## Reenvio de Notificacoes

Para testes ou para recuperar notificacoes perdidas, voce pode solicitar o reenvio de uma notificacao para todos os gatilhos cadastrados. Cada servico de documento expoe um metodo `resendWebhook`:

```typescript
// Reenviar webhook de uma NFe
await client.nfe.resendWebhook('ref-001')

// Reenviar webhook de uma NFSe
await client.nfse.resendWebhook('ref-002')

// Reenviar webhook de uma NFSe Nacional
await client.nfseNacional.resendWebhook('ref-003')

// Reenviar webhook de uma CTe
await client.cte.resendWebhook('ref-004')

// Reenviar webhook de uma NFe recebida (usa a chave da NFe)
await client.nfeRecebidas.resendWebhook('35260312345678000195550010000001231234567890')

// Reenviar webhook de uma NFCom
await client.nfcom.resendWebhook('ref-005')
```

O corpo da requisicao POST pode ser vazio. Se o documento for encontrado, a API reenvia a notificacao para todos os gatilhos cadastrados para aquele tipo de evento.

## Payload do Webhook

A estrutura do payload varia conforme o tipo de documento. Abaixo um exemplo de payload enviado para uma NFe autorizada:

```json
{
  "cnpj_emitente": "07504505000132",
  "ref": "sua_referencia",
  "status": "autorizado",
  "status_sefaz": "100",
  "mensagem_sefaz": "Autorizado o uso da NF-e",
  "chave_nfe": "NFe35260307504505000132550010000001231234567890",
  "numero": "123",
  "serie": "1",
  "caminho_xml_nota_fiscal": "/arquivos/.../nfe.xml",
  "caminho_danfe": "/arquivos/.../danfe.pdf"
}
```

### Status por Tipo de Documento

**NFe e CTe:**

- `processando_autorizacao` -- Ainda em processamento pela SEFAZ
- `autorizado` -- Documento autorizado com sucesso
- `cancelado` -- Documento cancelado
- `erro_autorizacao` -- Erro na autorizacao pela SEFAZ
- `denegado` -- Documento denegado pela SEFAZ

**NFSe:**

- `processando_autorizacao` -- Ainda em processamento pela Prefeitura
- `autorizado` -- Nota autorizada com sucesso
- `cancelado` -- Nota cancelada
- `erro_autorizacao` -- Erro na autorizacao pela Prefeitura

## Comportamento de Retry

Na ocorrencia de falha na execucao do POST para sua URL (servidor fora do ar ou resposta HTTP diferente de 2xx), a API tenta reenvios nos seguintes intervalos:

| Tentativa | Intervalo |
|-----------|-----------|
| 1 | 1 minuto |
| 2 | 30 minutos |
| 3 | 1 hora |
| 4 | 3 horas |
| 5 | 24 horas |
| -- | Desiste do acionamento |

## Monitoramento de Reputacao

A API monitora ativamente a reputacao dos endpoints de entrega, considerando uma janela de avaliacao rolante dos ultimos 2 dias. Se um webhook acumular majoritariamente falhas por 7 dias consecutivos, ele sera **desativado automaticamente**.

Webhooks saudaveis que enfrentem eventuais problemas, mas voltem a ter entregas bem-sucedidas, nao sao afetados.

## Boas Praticas

### Seguranca

- **Sempre use o campo `authorization`** ao criar webhooks. Verifique o token em cada requisicao recebida para garantir que apenas a API da Focus NFe acione sua URL.
- Armazene o segredo do webhook como variavel de ambiente, nunca no codigo.
- Use endpoints HTTPS em producao.

### Performance

- **Retorne HTTP 200 rapidamente** -- A Focus NFe espera uma resposta rapida. Processe eventos de forma assincrona se sua logica de negocio for demorada.
- Considere usar uma fila (Redis, SQS, etc.) para processar webhooks:

```typescript
import express from 'express'

const app = express()

app.post('/webhooks/nfe', (req, res) => {
  const authorization = req.headers['authorization']

  if (authorization !== process.env.FOCUSNFE_WEBHOOK_SECRET) {
    return res.status(401).send('Unauthorized')
  }

  // Enfileirar o evento para processamento assincrono
  queue.add('focusnfe-webhook', req.body)

  // Retornar imediatamente
  res.status(200).send('OK')
})
```

### Confiabilidade

- **Implemente idempotencia** usando a combinacao de `ref` + `status` como chave de deduplicacao. A Focus NFe pode reenviar o mesmo evento se seu endpoint nao responder com sucesso.

```typescript
const processedEvents = new Set<string>()

app.post('/webhooks/nfe', (req, res) => {
  const event = req.body
  const eventKey = `${event.ref}:${event.status}`

  if (processedEvents.has(eventKey)) {
    return res.status(200).send('OK')
  }

  // Processar evento...
  processedEvents.add(eventKey)

  res.status(200).send('OK')
})
```

- **Monitore a saude dos seus endpoints** -- Webhooks com falhas persistentes serao desativados automaticamente apos 7 dias.
- Registre todos os webhooks recebidos para debugging e auditoria.

### Next.js Route Handler

```typescript
export async function POST(request: Request) {
  const authorization = request.headers.get('authorization')

  if (authorization !== process.env.FOCUSNFE_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = await request.json()

  // Processar evento conforme o status
  switch (event.status) {
    case 'autorizado':
      await handleAutorizado(event)
      break
    case 'erro_autorizacao':
      await handleErro(event)
      break
    case 'cancelado':
      await handleCancelamento(event)
      break
  }

  return new Response('OK', { status: 200 })
}
```

## Testando Webhooks Localmente

Para desenvolvimento local, voce pode usar ferramentas como ngrok ou localtunnel para expor seu servidor local a internet:

```bash
# Usando ngrok
ngrok http 3000

# Usando localtunnel
npx localtunnel --port 3000
```

Entao configure o webhook na Focus NFe apontando para a URL publica gerada (ex.: `https://abc123.ngrok.io/webhooks/nfe`).

Como alternativa, use o ambiente de homologacao da Focus NFe para testar sem impacto fiscal, e utilize o metodo `resendWebhook` para reacionar notificacoes durante o desenvolvimento.
