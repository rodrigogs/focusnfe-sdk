# Limites de Requisicoes

Este guia cobre os mecanismos de limitacao de taxa da API Focus NFe e estrategias para lidar com eles em sua integracao.

## Visao Geral

A API da Focus NFe e limitada a **100 creditos por minuto** por token de acesso. Cada requisicao consome 1 credito, independentemente do tipo de documento fiscal ou metodo HTTP utilizado.

Exceder esse limite resulta em uma resposta `HTTP 429 Too Many Requests`.

## Headers de Rate Limit

Todas as respostas da API incluem os seguintes headers que descrevem os limites atuais da sua aplicacao:

| Header | Descricao |
|--------|-----------|
| `Rate-Limit-Limit` | Numero de creditos para o periodo atual |
| `Rate-Limit-Remaining` | Numero de creditos restantes no periodo atual |
| `Rate-Limit-Reset` | Numero de segundos ate que o contador de creditos seja reinicializado |

**Exemplo de Resposta:**

```http
HTTP/1.1 200 OK
Rate-Limit-Limit: 100
Rate-Limit-Remaining: 72
Rate-Limit-Reset: 45
```

**Interpretacao:**

- Este token permite 100 requisicoes por janela de 1 minuto
- Voce tem 72 requisicoes restantes
- O limite reseta em 45 segundos

**Quando o Limite e Atingido:**

Quando `Rate-Limit-Remaining` chega a `0`, requisicoes subsequentes retornam:

```
HTTP 429 Too Many Requests
```

Sua aplicacao devera aguardar o termino do periodo (`Rate-Limit-Reset`) para poder fazer novas requisicoes.

## Detectando Limites de Taxa no SDK

O SDK fornece a classe `FocusNFeApiError` com um getter de conveniencia para detectar erros de rate limit:

```typescript
import { FocusNFeClient, FocusNFeApiError } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'PRODUCTION',
})

async function consultarNfe(ref: string) {
  try {
    return await client.nfe.get(ref)
  } catch (error) {
    if (error instanceof FocusNFeApiError && error.isRateLimit) {
      console.error('Limite de requisicoes excedido:', {
        status: error.status,
        message: error.message,
      })

      // Implementar logica de retry (veja proxima secao)
      throw error
    }

    throw error
  }
}
```

**Propriedades do FocusNFeApiError:**

- `error.isRateLimit` -- Retorna `true` quando o codigo de status e 429
- `error.isRetryable` -- Retorna `true` quando `isRateLimit` ou `isServer`
- `error.status` -- Codigo de status HTTP (429 para limites de taxa)
- `error.message` -- Mensagem de erro da API

**Importante:** `isRateLimit` e um getter de propriedade, nao um metodo. Use `error.isRateLimit`, nao `error.isRateLimit()`.

## Padrao de Retry

Quando limites de taxa sao excedidos, implementar logica de retry com exponential backoff e essencial para construir integracoes resilientes.

```typescript
import { FocusNFeApiError } from '@rodrigogs/focusnfe-sdk'

interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) break

      // Retentar apenas erros transitorios
      if (error instanceof FocusNFeApiError && error.isRetryable) {
        const delay = Math.min(
          initialDelayMs * Math.pow(2, attempt),
          maxDelayMs
        )
        // Adicionar jitter para evitar thundering herd
        const jitter = Math.random() * 0.3 * delay
        const finalDelay = delay + jitter

        console.warn(
          `Tentativa ${attempt + 1}/${maxRetries} falhou. ` +
          `Retentando em ${Math.round(finalDelay)}ms...`
        )

        await new Promise(resolve => setTimeout(resolve, finalDelay))
      } else {
        throw error // Nao retentavel, falhar imediatamente
      }
    }
  }

  throw lastError!
}
```

**Exemplo de Calculo de Backoff:**

Com configuracoes padrao (`initialDelayMs: 1000`):

```
Tentativa 1 falha → Espera ~1.000ms  (1s x 2^0)
Tentativa 2 falha → Espera ~2.000ms  (1s x 2^1)
Tentativa 3 falha → Espera ~4.000ms  (1s x 2^2)
Tentativa 4 falha → Lanca erro
```

Com jitter, os atrasos reais variarao em +30% para prevenir retries sincronizados entre multiplos clientes.

### Uso Basico

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
})

// Retry simples com defaults (3 retries, 1s delay inicial)
async function consultarNfe(ref: string) {
  return withRetry(() => client.nfe.get(ref))
}

// Retry com configuracao personalizada para operacoes criticas
async function emitirNfe(ref: string, dados: any) {
  return withRetry(
    () => client.nfe.create(ref, dados),
    {
      maxRetries: 5,
      initialDelayMs: 2000,
      maxDelayMs: 60000,
    }
  )
}
```

### Operacoes em Lote

```typescript
// Retry individual para cada item do lote
async function consultarMultiplasNfe(refs: string[]) {
  const results = await Promise.allSettled(
    refs.map(ref =>
      withRetry(() => client.nfe.get(ref))
    )
  )

  const sucesso = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => r.value)

  const falhas = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason)

  return { sucesso, falhas }
}
```

### Com Fallback

```typescript
async function consultarComFallback(ref: string) {
  try {
    return await withRetry(
      () => client.nfe.get(ref),
      { maxRetries: 3 }
    )
  } catch (error) {
    if (error instanceof FocusNFeApiError && error.isRateLimit) {
      console.error('Limite excedido apos todas as tentativas')
      // Buscar dados do cache ou agendar para depois
      return getCachedNfe(ref)
    }

    throw error
  }
}
```

## Melhores Praticas

### 1. Use Webhooks em Vez de Polling

A forma mais efetiva de evitar limites de taxa e usar webhooks para atualizacoes baseadas em eventos. A emissao de NFe e NFSe e assincrona -- em vez de consultar repetidamente o status, cadastre um webhook para ser notificado automaticamente.

**Anti-Padrao de Polling:**

```typescript
// Ruim: Consome requisicoes desnecessariamente
async function aguardarAutorizacao(ref: string) {
  const interval = setInterval(async () => {
    const nfe = await client.nfe.get(ref)

    if (nfe.status === 'autorizado' || nfe.status === 'erro_autorizacao') {
      clearInterval(interval)
      processarResultado(nfe)
    }
  }, 5000) // A cada 5 segundos = 12 req/min por nota
}
```

**Padrao com Webhook:**

```typescript
// Bom: 0 requisicoes de polling
// 1. Cadastre o webhook uma vez
await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfe',
  url: 'https://seuapp.com/webhooks/nfe',
  authorization: process.env.WEBHOOK_SECRET!,
})

// 2. Receba a notificacao automaticamente
app.post('/webhooks/nfe', async (req, res) => {
  const evento = req.body

  if (evento.status === 'autorizado') {
    await processarNfeAutorizada(evento)
  }

  res.status(200).send('OK')
})
```

### 2. Controle Concorrencia

Limite o numero de requisicoes simultaneas para nao estourar os 100 creditos/minuto:

```typescript
import pLimit from 'p-limit'

// Limitar a 10 requisicoes simultaneas
const limit = pLimit(10)

async function consultarLoteNfe(refs: string[]) {
  return Promise.all(
    refs.map(ref =>
      limit(() => withRetry(() => client.nfe.get(ref)))
    )
  )
}
```

### 3. Cache Respostas Quando Apropriado

Reduza chamadas a API cacheando dados que nao mudam frequentemente:

```typescript
import { LRUCache } from 'lru-cache'

const nfeCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutos
})

async function getNfe(ref: string) {
  const cached = nfeCache.get(ref)
  if (cached) return cached

  const nfe = await withRetry(() => client.nfe.get(ref))

  // Cachear apenas notas com status final
  if (nfe.status === 'autorizado' || nfe.status === 'cancelado') {
    nfeCache.set(ref, nfe)
  }

  return nfe
}
```

### 4. Monitore e Registre Erros de Rate Limit

Rastreie incidentes de rate limit para identificar padroes e otimizar sua integracao:

```typescript
import { FocusNFeApiError } from '@rodrigogs/focusnfe-sdk'

async function monitoredRequest<T>(
  name: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const start = Date.now()

  try {
    const result = await withRetry(requestFn)
    console.info('Requisicao bem-sucedida', { operation: name, durationMs: Date.now() - start })
    return result
  } catch (error) {
    if (error instanceof FocusNFeApiError && error.isRateLimit) {
      console.error('Limite de taxa excedido', {
        operation: name,
        durationMs: Date.now() - start,
      })
      // Enviar para sistema de monitoramento
      // metrics.increment('focusnfe.rate_limit_errors', { operation: name })
    }

    throw error
  }
}
```

## Resumo

| Aspecto | Detalhe |
|---------|---------|
| **Limite** | 100 creditos/minuto por token |
| **Custo** | 1 credito por requisicao |
| **Escopo** | Qualquer documento fiscal, qualquer metodo HTTP |
| **Deteccao** | Use `error.isRateLimit` (getter, nao metodo) |
| **Headers** | `Rate-Limit-Limit`, `Rate-Limit-Remaining`, `Rate-Limit-Reset` |
| **Retry** | Implemente exponential backoff com o helper `withRetry` |
| **Prevencao** | Use webhooks, cache dados, controle concorrencia |

Para duvidas ou problemas relacionados a limites de taxa, entre em contato com o suporte da Focus NFe em suporte@focusnfe.com.br.
