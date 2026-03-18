# Webhooks

## Overview

Focus NFe sends webhook notifications (called "gatilhos" / triggers) to your endpoint when fiscal documents change status -- authorization, cancellation, issuance error, among others. This eliminates the need for constant polling to check processing status.

When an event occurs, the API sends the document data in JSON format to a URL of your choice via an HTTP POST request. Each trigger contains the data of a single document.

## Webhook Management

The SDK provides full methods for creating, listing, retrieving, and deleting webhooks through the `client.webhooks` service.

### Create a Webhook

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'PRODUCTION',
})

// Create a webhook for NFe events of a specific company
const webhook = await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfe',
  url: 'https://yourapp.com/webhooks/nfe',
})

console.log('Webhook created:', webhook.id)
// { id: "Vj5rmkBq", url: "https://yourapp.com/webhooks/nfe", event: "nfe", cnpj: "51916585000125" }
```

#### Creation Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cnpj` | `string` | No | Company CNPJ. If omitted, the trigger fires for all issuances under the token. |
| `cpf` | `string` | No | Company/provider CPF. Mutually exclusive with `cnpj`. |
| `event` | `WebhookEvent` | Yes | Event type to listen to. |
| `url` | `string` | Yes | Destination URL for the POST when the trigger fires. |
| `authorization` | `string` | No | Value sent in the authorization header on each trigger. |
| `authorization_header` | `string` | No | HTTP header name for the `authorization` field. Default: `"Authorization"`. |

**Note:** Up to 5 webhooks can be created per company for the same event. The `cnpj` and `cpf` fields are mutually exclusive.

#### Using Custom Authorization

To ensure that only the Focus NFe API triggers your URL, use the `authorization` field:

```typescript
// Using a simple secret token
const webhook = await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfe',
  url: 'https://yourapp.com/webhooks/nfe',
  authorization: 'lFNVw8q5WMeR3U9FOVOABTp36zrkvtaa',
})
// The API will send: Authorization: lFNVw8q5WMeR3U9FOVOABTp36zrkvtaa

// Using a custom header
const webhookCustom = await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfse',
  url: 'https://yourapp.com/webhooks/nfse',
  authorization: 'IlzJYBLJBxQT1FUGNRxhFO1ASpNKfj8z',
  authorization_header: 'X-ApiKey',
})
// The API will send: X-ApiKey: IlzJYBLJBxQT1FUGNRxhFO1ASpNKfj8z
```

### List Webhooks

```typescript
// List all webhooks for all companies under the token
const webhooks = await client.webhooks.list()

webhooks.forEach(hook => {
  console.log(`[${hook.event}] ${hook.url} (${hook.cnpj || 'global'})`)
})
```

### Retrieve a Webhook

```typescript
// Retrieve an individual webhook by ID
const webhook = await client.webhooks.get('Vj5rmkBq')

console.log('URL:', webhook.url)
console.log('Event:', webhook.event)
console.log('Company:', webhook.cnpj)
```

### Delete a Webhook

```typescript
const result = await client.webhooks.remove('Vj5rmkBq')

if (result.deleted) {
  console.log('Webhook deleted successfully')
}
```

## Supported Events

The `WebhookEvent` type defines all available events:

| Event | Description |
|-------|-------------|
| `nfe` | NFe authorized, with error, or voided (inutilizada) |
| `nfce_contingencia` | NFCe in contingency, confirmed, or cancelled |
| `nfse` | NFSe authorized or with error |
| `nfsen` | NFSe Nacional authorized or with error |
| `cte` | CTe authorized, with error, or denied (denegada) |
| `mdfe` | MDFe authorized, with error, or denied |
| `nfcom` | NFCom authorized, with error, or denied |
| `nfe_recebida` | New received NFe (recipient acknowledgment) |
| `nfe_recebida_falha_consulta` | Failure when querying received NFe |
| `cte_recebida` | New received CTe |
| `nfse_recebida` | New received NFSe |
| `inutilizacao` | Number range voiding (inutilizacao) |

### Example: Creating Webhooks for Multiple Events

```typescript
const eventos = ['nfe', 'nfse', 'cte'] as const

for (const event of eventos) {
  await client.webhooks.create({
    cnpj: '51916585000125',
    event,
    url: `https://yourapp.com/webhooks/${event}`,
    authorization: process.env.WEBHOOK_SECRET!,
  })
}
```

## Resending Notifications

For testing or to recover missed notifications, you can request the resending of a notification to all registered triggers. Each document service exposes a `resendWebhook` method:

```typescript
// Resend webhook for an NFe
await client.nfe.resendWebhook('ref-001')

// Resend webhook for an NFSe
await client.nfse.resendWebhook('ref-002')

// Resend webhook for an NFSe Nacional
await client.nfseNacional.resendWebhook('ref-003')

// Resend webhook for a CTe
await client.cte.resendWebhook('ref-004')

// Resend webhook for a received NFe (uses the NFe access key)
await client.nfeRecebidas.resendWebhook('35260312345678000195550010000001231234567890')

// Resend webhook for an NFCom
await client.nfcom.resendWebhook('ref-005')
```

The POST request body can be empty. If the document is found, the API resends the notification to all triggers registered for that event type.

## Webhook Payload

The payload structure varies depending on the document type. Below is an example payload sent for an authorized NFe:

```json
{
  "cnpj_emitente": "07504505000132",
  "ref": "your_reference",
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

### Status Values by Document Type

**NFe and CTe:**

- `processando_autorizacao` -- Still being processed by SEFAZ
- `autorizado` -- Document authorized successfully
- `cancelado` -- Document cancelled
- `erro_autorizacao` -- Authorization error from SEFAZ
- `denegado` -- Document denied by SEFAZ

**NFSe:**

- `processando_autorizacao` -- Still being processed by the municipal government
- `autorizado` -- Invoice authorized successfully
- `cancelado` -- Invoice cancelled
- `erro_autorizacao` -- Authorization error from the municipal government

## Retry Behavior

When a POST to your URL fails (server down or non-2xx HTTP response), the API retries at the following intervals:

| Attempt | Interval |
|---------|----------|
| 1 | 1 minute |
| 2 | 30 minutes |
| 3 | 1 hour |
| 4 | 3 hours |
| 5 | 24 hours |
| -- | Gives up on delivery |

## Reputation Monitoring

The API actively monitors the health of delivery endpoints, using a rolling 2-day evaluation window. If a webhook accumulates a majority of failures for 7 consecutive days, it will be **automatically disabled**.

Healthy webhooks that experience occasional issues but resume successful deliveries are not affected.

## Best Practices

### Security

- **Always use the `authorization` field** when creating webhooks. Verify the token on each incoming request to ensure that only the Focus NFe API triggers your URL.
- Store the webhook secret as an environment variable, never in code.
- Use HTTPS endpoints in production.

### Performance

- **Return HTTP 200 quickly** -- Focus NFe expects a fast response. Process events asynchronously if your business logic is time-consuming.
- Consider using a queue (Redis, SQS, etc.) to process webhooks:

```typescript
import express from 'express'

const app = express()

app.post('/webhooks/nfe', (req, res) => {
  const authorization = req.headers['authorization']

  if (authorization !== process.env.FOCUSNFE_WEBHOOK_SECRET) {
    return res.status(401).send('Unauthorized')
  }

  // Queue the event for asynchronous processing
  queue.add('focusnfe-webhook', req.body)

  // Return immediately
  res.status(200).send('OK')
})
```

### Reliability

- **Implement idempotency** using the combination of `ref` + `status` as a deduplication key. Focus NFe may resend the same event if your endpoint doesn't respond successfully.

```typescript
const processedEvents = new Set<string>()

app.post('/webhooks/nfe', (req, res) => {
  const event = req.body
  const eventKey = `${event.ref}:${event.status}`

  if (processedEvents.has(eventKey)) {
    return res.status(200).send('OK')
  }

  // Process event...
  processedEvents.add(eventKey)

  res.status(200).send('OK')
})
```

- **Monitor the health of your endpoints** -- Webhooks with persistent failures will be automatically disabled after 7 days.
- Log all received webhooks for debugging and auditing purposes.

### Next.js Route Handler

```typescript
export async function POST(request: Request) {
  const authorization = request.headers.get('authorization')

  if (authorization !== process.env.FOCUSNFE_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = await request.json()

  // Process event based on status
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

## Testing Webhooks Locally

For local development, you can use tools like ngrok or localtunnel to expose your local server to the internet:

```bash
# Using ngrok
ngrok http 3000

# Using localtunnel
npx localtunnel --port 3000
```

Then configure the webhook in Focus NFe pointing to the generated public URL (e.g., `https://abc123.ngrok.io/webhooks/nfe`).

Alternatively, use the Focus NFe homologacao (staging) environment to test without fiscal impact, and use the `resendWebhook` method to re-trigger notifications during development.
