# Error Handling

The `@rodrigogs/focusnfe-sdk` package provides a structured error hierarchy to help you handle different failure scenarios when interacting with the Focus NFe API.

## Error Hierarchy

```
FocusNFeError (base)
├── FocusNFeApiError        (HTTP errors from the API)
└── FocusNFeConnectionError (network failures)
```

All errors extend the native `Error` class and are exported from the main package:

```typescript
import {
  FocusNFeError,
  FocusNFeApiError,
  FocusNFeConnectionError,
} from '@rodrigogs/focusnfe-sdk'
```

## FocusNFeApiError

The most common error type. Thrown when the Focus NFe API returns an HTTP error response (4xx or 5xx status codes).

### Properties

- `status` (number) -- HTTP status code
- `body` (unknown) -- Raw response body from the API
- `codigo` (string) -- Error code returned by the API (e.g., `"nao_encontrado"`, `"requisicao_invalida"`)
- `mensagem` (string) -- Detailed error description
- `erros` (FocusNFeErrorDetail[]) -- Array of error details
  - Each detail has optional `mensagem` and `campo` fields
- `message` (string) -- Joined error messages, or `mensagem`, or `"HTTP {status}"` as fallback

### Convenience Getters

- `isAuth` -- `true` when the status is 401 or 403
- `isRateLimit` -- `true` when the status is 429
- `isServer` -- `true` when the status is >= 500
- `isRetryable` -- `true` when `isRateLimit` or `isServer`

### Examples

#### Basic Try/Catch

```typescript
import { FocusNFeClient, FocusNFeApiError } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({ token: process.env.FOCUSNFE_TOKEN! })

try {
  const nfe = await client.nfe.create('ref-001', {
    natureza_operacao: 'Venda de mercadoria',
    items: [
      {
        numero_item: 1,
        codigo_produto: 'PROD-001',
        descricao: 'Produto de teste',
        cfop: 5102,
        codigo_ncm: '62044200',
        quantidade_comercial: 1,
        valor_unitario_comercial: 100.0,
        unidade_comercial: 'UN',
        icms_origem: 0,
        icms_situacao_tributaria: '102',
      },
    ],
  })
} catch (error) {
  if (error instanceof FocusNFeApiError) {
    console.error(`API Error (${error.status}):`, error.message)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

#### Checking the Error Type

```typescript
try {
  const nfe = await client.nfe.get('ref-001')
} catch (error) {
  if (error instanceof FocusNFeApiError) {
    if (error.isAuth) {
      console.error('Authentication failed. Check your access token.')
    } else if (error.isRateLimit) {
      console.error('Rate limit exceeded. Wait before retrying.')
    } else if (error.isServer) {
      console.error('Focus NFe server error. Try again later.')
    } else {
      console.error('Client error:', error.message)
    }
  }
}
```

#### Using Getters for Retry Logic

```typescript
async function createNfeWithRetry(ref: string, params: any, maxRetries = 3) {
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      return await client.nfe.create(ref, params)
    } catch (error) {
      if (error instanceof FocusNFeApiError && error.isRetryable) {
        attempt++
        if (attempt >= maxRetries) {
          throw error
        }

        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
        console.log(`Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error // Not retryable, fail immediately
      }
    }
  }
}
```

#### Accessing Validation Details

When submitting invalid data, the API may return multiple validation errors in the `erros` array:

```typescript
try {
  const nfe = await client.nfe.create('ref-001', {
    items: [], // no items -- invalid
  })
} catch (error) {
  if (error instanceof FocusNFeApiError) {
    console.error(`Code: ${error.codigo}`)
    console.error(`Message: ${error.mensagem}`)

    error.erros.forEach((detail, index) => {
      console.error(`  ${index + 1}. [${detail.campo || 'N/A'}] ${detail.mensagem}`)
    })

    // Example output:
    // Code: requisicao_invalida
    // Message: Dados invalidos
    //   1. [items] Deve conter ao menos um item
  }
}
```

#### Checking Specific Error Codes

The Focus NFe API returns semantic error codes in the `codigo` field. You can use them for conditional logic:

```typescript
try {
  await client.nfe.cancel('ref-001', { justificativa: 'Erro de digitacao' })
} catch (error) {
  if (error instanceof FocusNFeApiError) {
    switch (error.codigo) {
      case 'nao_encontrado':
        console.error('NFe not found with this reference.')
        break
      case 'nfe_nao_autorizada':
        console.error('NFe has not been authorized yet. Cannot cancel.')
        break
      case 'nfe_cancelada':
        console.error('NFe has already been cancelled.')
        break
      case 'permissao_negada':
        console.error('Token does not have permission for this operation.')
        break
      default:
        console.error(`Error: ${error.mensagem}`)
    }
  }
}
```

## FocusNFeConnectionError

Thrown when the request fails due to network issues such as DNS resolution failure, connection refused, timeout, or other transport-level errors. The original error is available via the `cause` property.

**Note:** Unlike some SDKs, `@rodrigogs/focusnfe-sdk` does not have a separate `FocusNFeTimeoutError` class. Request timeouts (`AbortSignal.timeout`) are caught and thrown as `FocusNFeConnectionError`, with the original error's message and `cause`.

### Example

```typescript
import { FocusNFeClient, FocusNFeConnectionError } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  timeout: 10000, // 10 seconds
})

try {
  const nfe = await client.nfe.get('ref-001')
} catch (error) {
  if (error instanceof FocusNFeConnectionError) {
    console.error('Network connection failed:', error.message)

    // Access the original error for more details
    if (error.cause) {
      console.error('Cause:', error.cause)
    }

    // Possible causes:
    // - No internet connection
    // - Request timeout exceeded
    // - DNS resolution failure
    // - Firewall blocking the request
    // - Focus NFe API unreachable
  }
}
```

## API HTTP Status Codes

The table below lists the HTTP status codes that the Focus NFe API may return:

| HTTP Code | Meaning | Description |
|-----------|---------|-------------|
| 200 | OK | Query completed successfully |
| 201 | Created | Request accepted for processing |
| 400 | Bad Request | Missing information or invalid data |
| 403 | Forbidden | Problem with the access token |
| 404 | Not Found | Requested resource not found |
| 415 | Unsupported Media Type | Invalid JSON format (syntax error) |
| 422 | Unprocessable Entity | Semantic error (e.g., cancelling an already cancelled document) |
| 429 | Too Many Requests | Per-minute request limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

**Important:** A success HTTP code (200, 201) does not mean the document was authorized. The API may accept a document for processing (201) and, once processed by SEFAZ (state tax authority) or the municipal government, the authorization may fail. HTTP codes indicate the success of communication with the API, not with SEFAZ.

## Best Practices

1. **Always handle FocusNFeApiError** -- It is the most common error type and contains detailed information.

2. **Check the `codigo` field for semantic errors** -- Codes like `nfe_nao_autorizada`, `nfe_cancelada`, and `em_processamento` indicate specific document states.

3. **Use `isRetryable` for automatic retry decisions** -- The getter identifies transient errors (rate limit and server errors) that can be retried.

4. **Handle authentication errors** -- Use `error.isAuth` to detect invalid or blocked tokens.

5. **Log the full `body` for debugging** -- The raw response body may contain additional context.

6. **Respect rate limits** -- When encountering 429 errors, implement exponential backoff. See the [Rate Limits](./rate-limits.md) guide.

7. **Monitor server errors** -- If you encounter frequent 500+ errors, contact Focus NFe support at suporte@focusnfe.com.br.

### Example: Comprehensive Error Handler

```typescript
import {
  FocusNFeApiError,
  FocusNFeConnectionError,
} from '@rodrigogs/focusnfe-sdk'

async function handleFocusNFeOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof FocusNFeApiError) {
      // Log full details for debugging
      console.error('Focus NFe API Error:', {
        status: error.status,
        codigo: error.codigo,
        mensagem: error.mensagem,
        erros: error.erros,
        body: error.body,
      })

      // Handle specific cases
      if (error.isAuth) {
        throw new Error('Invalid access token. Check your credentials.')
      }

      if (error.isRateLimit) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      if (error.isServer) {
        throw new Error('Focus NFe service temporarily unavailable. Please retry.')
      }

      // Client errors (4xx) -- show validation messages
      if (error.erros.length > 0) {
        const messages = error.erros
          .map(e => e.mensagem)
          .filter(Boolean)
          .join('; ')
        throw new Error(`Validation failed: ${messages}`)
      }

      throw new Error(`API error: ${error.mensagem || error.message}`)
    } else if (error instanceof FocusNFeConnectionError) {
      console.error('Connection error:', error.message, error.cause)
      throw new Error('Network connection failed. Check your internet connection.')
    } else {
      // Unexpected error
      console.error('Unexpected error:', error)
      throw error
    }
  }
}

// Usage
const nfe = await handleFocusNFeOperation(() =>
  client.nfe.create('ref-001', {
    natureza_operacao: 'Venda de mercadoria',
    items: [/* ... */],
  })
)
```
