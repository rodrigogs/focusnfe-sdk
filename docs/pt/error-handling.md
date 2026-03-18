# Tratamento de Erros

O pacote `@rodrigogs/focusnfe-sdk` fornece uma hierarquia estruturada de erros para facilitar o tratamento de diferentes cenarios de falha ao interagir com a API da Focus NFe.

## Hierarquia de Erros

```
FocusNFeError (base)
├── FocusNFeApiError        (erros HTTP da API)
└── FocusNFeConnectionError (falhas de rede)
```

Todos os erros estendem a classe nativa `Error` e sao exportados pelo pacote principal:

```typescript
import {
  FocusNFeError,
  FocusNFeApiError,
  FocusNFeConnectionError,
} from '@rodrigogs/focusnfe-sdk'
```

## FocusNFeApiError

O tipo de erro mais comum. Lancado quando a API da Focus NFe retorna uma resposta HTTP de erro (status 4xx ou 5xx).

### Propriedades

- `status` (number) -- Codigo de status HTTP
- `body` (unknown) -- Corpo bruto da resposta da API
- `codigo` (string) -- Codigo do erro retornado pela API (ex.: `"nao_encontrado"`, `"requisicao_invalida"`)
- `mensagem` (string) -- Descricao detalhada do erro
- `erros` (FocusNFeErrorDetail[]) -- Array de detalhes do erro
  - Cada detalhe possui campos opcionais `mensagem` e `campo`
- `message` (string) -- Mensagens dos erros unidas, ou `mensagem`, ou `"HTTP {status}"` como fallback

### Getters de Conveniencia

- `isAuth` -- `true` quando o status e 401 ou 403
- `isRateLimit` -- `true` quando o status e 429
- `isServer` -- `true` quando o status e >= 500
- `isRetryable` -- `true` quando `isRateLimit` ou `isServer`

### Exemplos

#### Try/Catch Basico

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
    console.error(`Erro da API (${error.status}):`, error.message)
  } else {
    console.error('Erro inesperado:', error)
  }
}
```

#### Verificando o Tipo de Erro

```typescript
try {
  const nfe = await client.nfe.get('ref-001')
} catch (error) {
  if (error instanceof FocusNFeApiError) {
    if (error.isAuth) {
      console.error('Autenticacao falhou. Verifique seu token de acesso.')
    } else if (error.isRateLimit) {
      console.error('Limite de requisicoes excedido. Aguarde antes de tentar novamente.')
    } else if (error.isServer) {
      console.error('Erro no servidor da Focus NFe. Tente novamente mais tarde.')
    } else {
      console.error('Erro do cliente:', error.message)
    }
  }
}
```

#### Usando Getters para Logica de Retry

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

        const delay = Math.pow(2, attempt) * 1000 // Backoff exponencial
        console.log(`Retentando em ${delay}ms (tentativa ${attempt}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error // Nao retentavel, falhar imediatamente
      }
    }
  }
}
```

#### Acessando Detalhes de Validacao

Ao enviar dados invalidos, a API pode retornar multiplos erros de validacao no array `erros`:

```typescript
try {
  const nfe = await client.nfe.create('ref-001', {
    items: [], // sem itens -- invalido
  })
} catch (error) {
  if (error instanceof FocusNFeApiError) {
    console.error(`Codigo: ${error.codigo}`)
    console.error(`Mensagem: ${error.mensagem}`)

    error.erros.forEach((detalhe, index) => {
      console.error(`  ${index + 1}. [${detalhe.campo || 'N/A'}] ${detalhe.mensagem}`)
    })

    // Exemplo de saida:
    // Codigo: requisicao_invalida
    // Mensagem: Dados invalidos
    //   1. [items] Deve conter ao menos um item
  }
}
```

#### Verificando Codigos de Erro Especificos

A API da Focus NFe retorna codigos de erro semanticos no campo `codigo`. Voce pode usa-los para logica condicional:

```typescript
try {
  await client.nfe.cancel('ref-001', { justificativa: 'Erro de digitacao' })
} catch (error) {
  if (error instanceof FocusNFeApiError) {
    switch (error.codigo) {
      case 'nao_encontrado':
        console.error('NFe nao encontrada com esta referencia.')
        break
      case 'nfe_nao_autorizada':
        console.error('NFe ainda nao foi autorizada. Nao e possivel cancelar.')
        break
      case 'nfe_cancelada':
        console.error('NFe ja foi cancelada anteriormente.')
        break
      case 'permissao_negada':
        console.error('Token sem permissao para esta operacao.')
        break
      default:
        console.error(`Erro: ${error.mensagem}`)
    }
  }
}
```

## FocusNFeConnectionError

Lancado quando a requisicao falha por problemas de rede como falha na resolucao DNS, conexao recusada, timeout ou outros erros de transporte. O erro original esta disponivel na propriedade `cause`.

**Nota:** Diferente de alguns SDKs, o `@rodrigogs/focusnfe-sdk` nao possui uma classe separada `FocusNFeTimeoutError`. Timeouts de requisicao (`AbortSignal.timeout`) sao capturados e lancados como `FocusNFeConnectionError`, com a mensagem e `cause` do erro original.

### Exemplo

```typescript
import { FocusNFeClient, FocusNFeConnectionError } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  timeout: 10000, // 10 segundos
})

try {
  const nfe = await client.nfe.get('ref-001')
} catch (error) {
  if (error instanceof FocusNFeConnectionError) {
    console.error('Falha na conexao de rede:', error.message)

    // Acessar o erro original para mais detalhes
    if (error.cause) {
      console.error('Causa:', error.cause)
    }

    // Possiveis causas:
    // - Sem conexao com a internet
    // - Timeout da requisicao excedido
    // - Falha na resolucao DNS
    // - Firewall bloqueando a requisicao
    // - API da Focus NFe inacessivel
  }
}
```

## Codigos HTTP da API

A tabela abaixo lista os codigos HTTP que a API da Focus NFe pode devolver:

| Codigo HTTP | Significado | Descricao |
|-------------|-------------|-----------|
| 200 | Ok | Consulta realizada com sucesso |
| 201 | Criado | Requisicao aceita para processamento |
| 400 | Requisicao invalida | Faltou informacao ou dados invalidos |
| 403 | Permissao negada | Problema com o token de acesso |
| 404 | Nao encontrado | Recurso pesquisado nao encontrado |
| 415 | Midia invalida | Formato JSON invalido (erro de sintaxe) |
| 422 | Entidade improcessavel | Erro de semantica (ex.: cancelar nota ja cancelada) |
| 429 | Muitas requisicoes | Limite de requisicoes por minuto excedido |
| 500 | Erro interno | Erro inesperado no servidor |

**Importante:** Um codigo HTTP de sucesso (200, 201) nao significa que a nota foi autorizada. A API pode aceitar a nota para processamento (201) e, ao ser processada pela SEFAZ ou prefeitura, a autorizacao pode falhar. Os codigos HTTP indicam o sucesso da comunicacao com a API, nao com a SEFAZ.

## Boas Praticas

1. **Sempre trate FocusNFeApiError** -- E o tipo de erro mais comum e contem informacoes detalhadas.

2. **Verifique o campo `codigo` para erros semanticos** -- Codigos como `nfe_nao_autorizada`, `nfe_cancelada` e `em_processamento` indicam estados especificos do documento.

3. **Use `isRetryable` para decisoes automaticas de retry** -- O getter identifica erros que sao transitorios (rate limit e erros de servidor) e podem ser retentados.

4. **Trate erros de autenticacao** -- Use `error.isAuth` para detectar tokens invalidos ou bloqueados.

5. **Logue o `body` completo para debug** -- O corpo bruto da resposta pode conter contexto adicional.

6. **Respeite os rate limits** -- Ao encontrar erros 429, implemente backoff exponencial. Consulte o guia de [Limites de Requisicoes](./rate-limits.md).

7. **Monitore erros de servidor** -- Se encontrar erros 500+ frequentes, entre em contato com o suporte da Focus NFe em suporte@focusnfe.com.br.

### Exemplo: Handler Completo de Erros

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
      // Logar detalhes completos para debug
      console.error('Erro da API Focus NFe:', {
        status: error.status,
        codigo: error.codigo,
        mensagem: error.mensagem,
        erros: error.erros,
        body: error.body,
      })

      // Tratar casos especificos
      if (error.isAuth) {
        throw new Error('Token de acesso invalido. Verifique suas credenciais.')
      }

      if (error.isRateLimit) {
        throw new Error('Limite de requisicoes excedido. Tente novamente mais tarde.')
      }

      if (error.isServer) {
        throw new Error('Servico da Focus NFe temporariamente indisponivel. Retente.')
      }

      // Erros do cliente (4xx) -- mostrar mensagens de validacao
      if (error.erros.length > 0) {
        const messages = error.erros
          .map(e => e.mensagem)
          .filter(Boolean)
          .join('; ')
        throw new Error(`Validacao falhou: ${messages}`)
      }

      throw new Error(`Erro da API: ${error.mensagem || error.message}`)
    } else if (error instanceof FocusNFeConnectionError) {
      console.error('Erro de conexao:', error.message, error.cause)
      throw new Error('Falha na conexao de rede. Verifique sua internet.')
    } else {
      // Erro inesperado
      console.error('Erro inesperado:', error)
      throw error
    }
  }
}

// Uso
const nfe = await handleFocusNFeOperation(() =>
  client.nfe.create('ref-001', {
    natureza_operacao: 'Venda de mercadoria',
    items: [/* ... */],
  })
)
```
