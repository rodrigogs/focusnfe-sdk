# Rate Limits

This guide covers the rate limiting mechanisms of the Focus NFe API and strategies for handling them in your integration.

## Overview

The Focus NFe API is limited to **100 credits per minute** per access token. Each request consumes 1 credit, regardless of the fiscal document type or HTTP method used.

Exceeding this limit results in an `HTTP 429 Too Many Requests` response.

## Rate Limit Headers

All API responses include the following headers describing the current limits for your application:

| Header | Description |
|--------|-------------|
| `Rate-Limit-Limit` | Number of credits for the current period |
| `Rate-Limit-Remaining` | Number of credits remaining in the current period |
| `Rate-Limit-Reset` | Number of seconds until the credit counter resets |

**Example Response:**

```http
HTTP/1.1 200 OK
Rate-Limit-Limit: 100
Rate-Limit-Remaining: 72
Rate-Limit-Reset: 45
```

**Interpretation:**

- This token allows 100 requests per 1-minute window
- You have 72 requests remaining
- The limit resets in 45 seconds

**When the Limit Is Reached:**

When `Rate-Limit-Remaining` reaches `0`, subsequent requests return:

```
HTTP 429 Too Many Requests
```

Your application should wait for the period to end (`Rate-Limit-Reset`) before making new requests.

## Detecting Rate Limits in the SDK

The SDK provides the `FocusNFeApiError` class with a convenience getter for detecting rate limit errors:

```typescript
import { FocusNFeClient, FocusNFeApiError } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'PRODUCTION',
})

async function queryNfe(ref: string) {
  try {
    return await client.nfe.get(ref)
  } catch (error) {
    if (error instanceof FocusNFeApiError && error.isRateLimit) {
      console.error('Rate limit exceeded:', {
        status: error.status,
        message: error.message,
      })

      // Implement retry logic (see next section)
      throw error
    }

    throw error
  }
}
```

**FocusNFeApiError Properties:**

- `error.isRateLimit` -- Returns `true` when the status code is 429
- `error.isRetryable` -- Returns `true` when `isRateLimit` or `isServer`
- `error.status` -- HTTP status code (429 for rate limits)
- `error.message` -- API error message

**Important:** `isRateLimit` is a property getter, not a method. Use `error.isRateLimit`, not `error.isRateLimit()`.

## Retry Pattern

When rate limits are exceeded, implementing retry logic with exponential backoff is essential for building resilient integrations.

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

      // Only retry transient errors
      if (error instanceof FocusNFeApiError && error.isRetryable) {
        const delay = Math.min(
          initialDelayMs * Math.pow(2, attempt),
          maxDelayMs
        )
        // Add jitter to avoid thundering herd
        const jitter = Math.random() * 0.3 * delay
        const finalDelay = delay + jitter

        console.warn(
          `Attempt ${attempt + 1}/${maxRetries} failed. ` +
          `Retrying in ${Math.round(finalDelay)}ms...`
        )

        await new Promise(resolve => setTimeout(resolve, finalDelay))
      } else {
        throw error // Not retryable, fail immediately
      }
    }
  }

  throw lastError!
}
```

**Example Backoff Calculation:**

With default settings (`initialDelayMs: 1000`):

```
Attempt 1 fails → Wait ~1,000ms  (1s x 2^0)
Attempt 2 fails → Wait ~2,000ms  (1s x 2^1)
Attempt 3 fails → Wait ~4,000ms  (1s x 2^2)
Attempt 4 fails → Throws error
```

With jitter, actual delays will vary by up to +30% to prevent synchronized retries across multiple clients.

### Basic Usage

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
})

// Simple retry with defaults (3 retries, 1s initial delay)
async function queryNfe(ref: string) {
  return withRetry(() => client.nfe.get(ref))
}

// Retry with custom configuration for critical operations
async function issueNfe(ref: string, data: any) {
  return withRetry(
    () => client.nfe.create(ref, data),
    {
      maxRetries: 5,
      initialDelayMs: 2000,
      maxDelayMs: 60000,
    }
  )
}
```

### Batch Operations

```typescript
// Individual retry for each item in the batch
async function queryMultipleNfe(refs: string[]) {
  const results = await Promise.allSettled(
    refs.map(ref =>
      withRetry(() => client.nfe.get(ref))
    )
  )

  const succeeded = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => r.value)

  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason)

  return { succeeded, failed }
}
```

### With Fallback

```typescript
async function queryWithFallback(ref: string) {
  try {
    return await withRetry(
      () => client.nfe.get(ref),
      { maxRetries: 3 }
    )
  } catch (error) {
    if (error instanceof FocusNFeApiError && error.isRateLimit) {
      console.error('Limit exceeded after all attempts')
      // Fetch data from cache or schedule for later
      return getCachedNfe(ref)
    }

    throw error
  }
}
```

## Best Practices

### 1. Use Webhooks Instead of Polling

The most effective way to avoid rate limits is to use webhooks for event-based updates. NFe and NFSe issuance is asynchronous -- instead of repeatedly checking the status, register a webhook to be notified automatically.

**Anti-Pattern (Polling):**

```typescript
// Bad: Consumes requests unnecessarily
async function waitForAuthorization(ref: string) {
  const interval = setInterval(async () => {
    const nfe = await client.nfe.get(ref)

    if (nfe.status === 'autorizado' || nfe.status === 'erro_autorizacao') {
      clearInterval(interval)
      processResult(nfe)
    }
  }, 5000) // Every 5 seconds = 12 req/min per document
}
```

**Webhook Pattern:**

```typescript
// Good: 0 polling requests
// 1. Register the webhook once
await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfe',
  url: 'https://yourapp.com/webhooks/nfe',
  authorization: process.env.WEBHOOK_SECRET!,
})

// 2. Receive the notification automatically
app.post('/webhooks/nfe', async (req, res) => {
  const event = req.body

  if (event.status === 'autorizado') {
    await processAuthorizedNfe(event)
  }

  res.status(200).send('OK')
})
```

### 2. Control Concurrency

Limit the number of simultaneous requests to avoid exhausting the 100 credits/minute:

```typescript
import pLimit from 'p-limit'

// Limit to 10 simultaneous requests
const limit = pLimit(10)

async function queryNfeBatch(refs: string[]) {
  return Promise.all(
    refs.map(ref =>
      limit(() => withRetry(() => client.nfe.get(ref)))
    )
  )
}
```

### 3. Cache Responses When Appropriate

Reduce API calls by caching data that doesn't change frequently:

```typescript
import { LRUCache } from 'lru-cache'

const nfeCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
})

async function getNfe(ref: string) {
  const cached = nfeCache.get(ref)
  if (cached) return cached

  const nfe = await withRetry(() => client.nfe.get(ref))

  // Only cache documents in a final status
  if (nfe.status === 'autorizado' || nfe.status === 'cancelado') {
    nfeCache.set(ref, nfe)
  }

  return nfe
}
```

### 4. Monitor and Log Rate Limit Errors

Track rate limit incidents to identify patterns and optimize your integration:

```typescript
import { FocusNFeApiError } from '@rodrigogs/focusnfe-sdk'

async function monitoredRequest<T>(
  name: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const start = Date.now()

  try {
    const result = await withRetry(requestFn)
    console.info('Request succeeded', { operation: name, durationMs: Date.now() - start })
    return result
  } catch (error) {
    if (error instanceof FocusNFeApiError && error.isRateLimit) {
      console.error('Rate limit exceeded', {
        operation: name,
        durationMs: Date.now() - start,
      })
      // Send to monitoring system
      // metrics.increment('focusnfe.rate_limit_errors', { operation: name })
    }

    throw error
  }
}
```

## Summary

| Aspect | Detail |
|--------|--------|
| **Limit** | 100 credits/minute per token |
| **Cost** | 1 credit per request |
| **Scope** | Any fiscal document, any HTTP method |
| **Detection** | Use `error.isRateLimit` (getter, not method) |
| **Headers** | `Rate-Limit-Limit`, `Rate-Limit-Remaining`, `Rate-Limit-Reset` |
| **Retry** | Implement exponential backoff with the `withRetry` helper |
| **Prevention** | Use webhooks, cache data, control concurrency |

For questions or issues related to rate limits, contact Focus NFe support at suporte@focusnfe.com.br.
