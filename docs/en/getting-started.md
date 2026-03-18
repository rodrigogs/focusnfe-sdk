# Getting Started

This guide covers the basics of getting up and running with `@rodrigogs/focusnfe-sdk`, a complete TypeScript SDK for the Focus NFe API -- a platform for issuing Brazilian electronic fiscal documents (NFe, NFCe, NFSe, CTe, MDFe, NFCom).

## Prerequisites

Before you begin, ensure you have:

- **Node.js >= 18** -- Required for native `fetch`, `AbortSignal.timeout`, and `btoa`
- **A Focus NFe account** -- Homologacao (staging) or production environment
- **An access token** -- Obtained by enabling the API for your company in the Focus NFe dashboard

## Installation

Install the package via npm:

```bash
npm install @rodrigogs/focusnfe-sdk
```

Or using other package managers:

```bash
# Yarn
yarn add @rodrigogs/focusnfe-sdk

# pnpm
pnpm add @rodrigogs/focusnfe-sdk
```

## Creating the Client

The first step is to instantiate `FocusNFeClient` with your access token:

```ts
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'HOMOLOGACAO', // or 'PRODUCTION' (default)
})
```

The client is now ready to make requests to the Focus NFe API.

## Configuration Options

The `FocusNFeClient` constructor accepts the following options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `token` | `string` | Yes | - | Your Focus NFe access token |
| `environment` | `'HOMOLOGACAO'` \| `'PRODUCTION'` | No | `'PRODUCTION'` | API environment to use |
| `baseUrl` | `string` | No | Auto-detected | Override the base URL entirely |
| `timeout` | `number` | No | `30000` | Request timeout in milliseconds |
| `fetch` | `typeof globalThis.fetch` | No | `globalThis.fetch` | Custom fetch implementation |
| `userAgent` | `string` | No | - | Custom User-Agent header suffix |

**Example with advanced configuration:**

```ts
const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'HOMOLOGACAO',
  timeout: 60000, // 60 seconds
  userAgent: 'MyApp/1.0.0',
})
```

## Authentication

The Focus NFe API uses **HTTP Basic Auth** for authentication. The SDK handles this automatically: when you provide the `token`, it is sent as the username in the `Authorization` header, with the password left blank.

Internally, the SDK generates the header as follows:

```
Authorization: Basic base64(token + ":")
```

You don't need to worry about encoding -- just provide the token when creating the client.

## Your First Request

Let's issue a sample NFe (Nota Fiscal Eletronica). NFe issuance is asynchronous: you submit the data, the API accepts it for processing, and then you check the status.

```ts
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'HOMOLOGACAO',
})

async function example() {
  // 1. Create (submit) an NFe for processing
  const ref = 'nfe-001' // unique reference in your application
  const nfe = await client.nfe.create(ref, {
    natureza_operacao: 'Venda de mercadoria',
    data_emissao: '2026-03-18T10:00:00-03:00',
    tipo_documento: 1,
    local_destino: 1,
    finalidade_emissao: 1,
    consumidor_final: 1,
    presenca_comprador: 1,
    modalidade_frete: 9,
    nome_destinatario: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
    cpf_destinatario: '12345678909',
    indicador_inscricao_estadual_destinatario: 9,
    logradouro_destinatario: 'Avenida Paulista',
    numero_destinatario: '1000',
    bairro_destinatario: 'Bela Vista',
    municipio_destinatario: 'Sao Paulo',
    uf_destinatario: 'SP',
    cep_destinatario: '01310100',
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
    formas_pagamento: [
      {
        forma_pagamento: '01',
        valor_pagamento: 100.0,
      },
    ],
  })

  console.log('NFe submitted for processing:', nfe.status)
  console.log('Reference:', nfe.ref)

  // 2. Check the NFe status
  const status = await client.nfe.get(ref)

  console.log('Status:', status.status)
  if (status.status === 'autorizado') {
    console.log('NFe key:', status.chave_nfe)
    console.log('DANFE:', status.caminho_danfe)
  }
}

example().catch(console.error)
```

**Note on references:** The reference (`ref`) is the unique identifier for the issuance in your application. It must be unique per access token. It is common to use the record ID from your database. A reference can only be reused if the previous issuance resulted in an error.

## Environments

Focus NFe offers two distinct environments:

### Homologacao (Staging)

- **URL:** `https://homologacao.focusnfe.com.br`
- **Purpose:** Development and testing
- **Characteristics:**
  - Issued documents have no fiscal validity
  - Allows simulating complete issuance flows
  - Ideal for validating your integration before going to production

### Production

- **URL:** `https://api.focusnfe.com.br`
- **Purpose:** Production applications
- **Characteristics:**
  - Issued documents have full fiscal and tax validity
  - All issuances have real impact
  - Use only when you are ready to issue valid documents

**Recommendation:** Always develop and test in the **HOMOLOGACAO** environment before moving to production.

```ts
// Development
const clientDev = new FocusNFeClient({
  token: process.env.FOCUSNFE_HOMOLOGACAO_TOKEN!,
  environment: 'HOMOLOGACAO',
})

// Production
const clientProd = new FocusNFeClient({
  token: process.env.FOCUSNFE_PRODUCTION_TOKEN!,
  environment: 'PRODUCTION', // or omit (default)
})
```

## Using a Custom Fetch

You can provide a custom `fetch` implementation for special cases such as testing, mocking, or using alternative libraries:

```ts
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'
import { fetch as undiciFetch } from 'undici'

// Example: using undici
const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  fetch: undiciFetch as typeof globalThis.fetch,
})

// Example: mock for testing
const mockFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  return new Response(JSON.stringify({ status: 'autorizado' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

const clientMock = new FocusNFeClient({
  token: 'test-token',
  fetch: mockFetch,
})
```

## Available Services

The `FocusNFeClient` exposes the following services for interacting with the Focus NFe API:

| Service | Description |
|---------|-------------|
| `nfe` | Issuance, retrieval, cancellation, and operations for NFe (electronic invoice) |
| `nfce` | Issuance, retrieval, cancellation, and operations for NFCe (consumer electronic invoice) |
| `nfse` | Issuance, retrieval, and cancellation of NFSe (electronic service invoice) |
| `nfseNacional` | NFSe using the national standardized system |
| `cte` | Issuance, retrieval, and cancellation of CTe / CTe OS (electronic transport document) |
| `mdfe` | Issuance, retrieval, and operations for MDFe (electronic fiscal document manifest) |
| `nfcom` | Issuance, retrieval, and cancellation of NFCom (electronic communication service invoice) |
| `nfeRecebidas` | Retrieval and recipient acknowledgment of received NFe documents |
| `cteRecebidas` | Retrieval of received CTe documents |
| `nfseRecebidas` | Retrieval of received NFSe documents |
| `empresas` | Registration and management of issuing companies |
| `webhooks` | Webhook (trigger) management |
| `consultas` | Auxiliary lookups (CEP, CNPJ, NCM, CFOP, municipalities) |

Each service provides specific methods for its operations. All methods return typed Promises.

## What's Next

Now that you have configured the client and made your first request, explore the advanced guides:

- [Error Handling](./error-handling.md) -- How to handle API errors
- [Webhooks](./webhooks.md) -- Receiving real-time notifications
- [Rate Limits](./rate-limits.md) -- Understanding API rate limits

For additional questions, contact Focus NFe support at suporte@focusnfe.com.br.
