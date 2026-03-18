# @rodrigogs/focusnfe-sdk

[![CI](https://github.com/rodrigogs/focusnfe-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/rodrigogs/focusnfe-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40rodrigogs%2Ffocusnfe-sdk)](https://www.npmjs.com/package/@rodrigogs/focusnfe-sdk)
[![npm downloads](https://img.shields.io/npm/dm/%40rodrigogs%2Ffocusnfe-sdk)](https://www.npmjs.com/package/@rodrigogs/focusnfe-sdk)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
[![Coverage](https://img.shields.io/badge/coverage-100%25-2ea44f)](./vitest.config.ts)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/)
[![ESM only](https://img.shields.io/badge/module-ESM-1f6feb)](https://nodejs.org/api/esm.html)
[![Zero runtime deps](https://img.shields.io/badge/dependencies-zero_runtime-2ea44f)](./package.json)

TypeScript SDK for the FocusNFe API for issuing Brazilian electronic fiscal documents (NFe, NFCe, NFSe, CTe, MDFe, NFCom).

> **Note:** This is an independent open-source project and is **not an official FocusNFe implementation**. It is not affiliated with, endorsed by, or supported by FocusNFe or its related companies. For the official API documentation, see [focusnfe.com.br/doc](https://focusnfe.com.br/doc/).

[Versao em Portugues](./README.md)

## Features

- **Zero runtime dependencies** - Minimal footprint using native Node.js APIs
- **TypeScript-first** - Full typing with union types for statuses and events
- **ESM-only** - Modern module system for optimal tree-shaking
- **Error handling** - Structured error hierarchy with retry detection
- **Lazy-loaded services** - Efficient on-demand initialization
- **Configurable environments** - Simple switching between HOMOLOGACAO and PRODUCTION
- **Native fetch** - No external HTTP client dependencies
- **100% coverage** - Statements, branches, functions and lines

## Installation

```bash
npm install @rodrigogs/focusnfe-sdk
```

**Requirements:** Node.js >= 20

## Quick Start

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'HOMOLOGACAO', // Optional: HOMOLOGACAO or PRODUCTION (default)
})

// Issue an NFe
const nfe = await client.nfe.create('ref-001', {
  natureza_operacao: 'Venda de produto',
  data_emissao: '2026-03-18T10:00:00-03:00',
  tipo_documento: 1,
  finalidade_emissao: 1,
  consumidor_final: 1,
  presenca_comprador: 1,
  cnpj_emitente: '51916585000125',
  items: [
    {
      numero_item: 1,
      codigo_produto: 'PROD001',
      descricao: 'Peca automotiva',
      cfop: '5102',
      codigo_ncm: '87089990',
      quantidade_comercial: 1,
      valor_unitario_comercial: 150.0,
      unidade_comercial: 'UN',
      icms_origem: 0,
      icms_situacao_tributaria: '102',
    },
  ],
  formas_pagamento: [
    { forma_pagamento: '01', valor_pagamento: '150.00' },
  ],
})

console.log('Status:', nfe.status)
console.log('Ref:', nfe.ref)
```

## Configuration

```typescript
const client = new FocusNFeClient({
  token: 'your_api_token',              // Required
  environment: 'PRODUCTION',             // Optional: HOMOLOGACAO | PRODUCTION (default)
  timeout: 30000,                        // Optional: Timeout in ms (default: 30000)
  baseUrl: 'https://custom.api.com',     // Optional: Override base URL
  userAgent: 'MyApp/1.0.0',             // Optional: Custom user agent
  fetch: customFetch,                    // Optional: Custom fetch implementation
})
```

### Environment URLs

- **HOMOLOGACAO**: `https://homologacao.focusnfe.com.br`
- **PRODUCTION**: `https://api.focusnfe.com.br`

## Services

| Service | Description | Example |
|---------|-------------|---------|
| `nfe` | Electronic Invoice (model 55) | `client.nfe.create(ref, params)` |
| `nfce` | Electronic Consumer Invoice (model 65) | `client.nfce.create(ref, params)` |
| `nfse` | Electronic Service Invoice (municipal) | `client.nfse.create(ref, params)` |
| `nfseNacional` | National NFSe (national standard) | `client.nfseNacional.create(ref, params)` |
| `cte` | Electronic Transport Document + CTe OS | `client.cte.create(ref, params)` |
| `mdfe` | Electronic Fiscal Document Manifest | `client.mdfe.create(ref, params)` |
| `nfcom` | Communication Service Invoice | `client.nfcom.create(ref, params)` |
| `nfeRecebidas` | Received NFe + recipient manifestation | `client.nfeRecebidas.list(params)` |
| `cteRecebidas` | Received CTe + disagreement | `client.cteRecebidas.list(params)` |
| `nfseRecebidas` | Received NFSe | `client.nfseRecebidas.list(params)` |
| `empresas` | Company management | `client.empresas.create(params)` |
| `webhooks` | Triggers/webhooks | `client.webhooks.create(params)` |
| `consultas` | NCM, CFOP, CEP, CNAE, Municipalities, CNPJ, Emails, Backups | `client.consultas.ncm(params)` |

## Error Handling

All errors extend `FocusNFeError` with specific types for different scenarios:

```typescript
import {
  FocusNFeApiError,
  FocusNFeConnectionError,
} from '@rodrigogs/focusnfe-sdk'

try {
  const nfe = await client.nfe.create('ref-001', { /* ... */ })
} catch (error) {
  if (error instanceof FocusNFeApiError) {
    console.error('API error:', error.status, error.mensagem)
    console.error('Details:', error.erros)

    if (error.isAuth) {
      console.error('Invalid token or insufficient permissions')
    } else if (error.isRateLimit) {
      console.error('Rate limit exceeded')
    } else if (error.isRetryable) {
      console.error('Retryable error, try again')
    }
  } else if (error instanceof FocusNFeConnectionError) {
    console.error('Network error:', error.message)
  }
}
```

## Status Types

The SDK exports union types for the statuses of each document type:

```typescript
import type { NfeStatus, NfceStatus, CteStatus, MdfeStatus } from '@rodrigogs/focusnfe-sdk'

// NfeStatus = 'processando_autorizacao' | 'autorizado' | 'cancelado' | 'erro_autorizacao' | 'denegado'
// NfceStatus = 'processando_autorizacao' | 'autorizado' | 'cancelado' | 'erro_autorizacao'
// MdfeStatus = ... | 'encerrado'  (additional status for MDFe)
```

## Webhooks

```typescript
// Create webhook
const hook = await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfe',
  url: 'https://mysite.com/webhook/nfe',
})

// List, get, remove
const hooks = await client.webhooks.list()
const hook = await client.webhooks.get('hook_id')
await client.webhooks.remove('hook_id')

// Resend webhook for a specific document
await client.nfe.resendWebhook('ref-001')
```

## Utility Lookups

```typescript
// Search NCM by description
const ncms = await client.consultas.ncm({ descricao: 'pecas' })

// Look up ZIP code
const cep = await client.consultas.cepByCodigo('01001000')

// Check NFSe status for a municipality
const municipios = await client.consultas.municipios({
  sigla_uf: 'SP',
  status_nfse: 'ativo',
})

// Look up CNPJ
const empresa = await client.consultas.cnpj('51916585000125')
```

## Documentation

### Guides
- [Getting Started](./docs/pt/getting-started.md)
- [Error Handling](./docs/pt/error-handling.md)
- [Webhooks](./docs/pt/webhooks.md)
- [Rate Limits](./docs/pt/rate-limits.md)

### Services
- [NFe](./docs/pt/services/nfe.md) - Electronic Invoice
- [NFCe](./docs/pt/services/nfce.md) - Electronic Consumer Invoice
- [NFSe](./docs/pt/services/nfse.md) - Electronic Service Invoice (municipal)
- [NFSe Nacional](./docs/pt/services/nfse-nacional.md) - National NFSe standard
- [CTe](./docs/pt/services/cte.md) - Electronic Transport Document + CTe OS
- [MDFe](./docs/pt/services/mdfe.md) - Electronic Fiscal Document Manifest
- [NFCom](./docs/pt/services/nfcom.md) - Communication Service Invoice
- [Received Documents](./docs/pt/services/recebidas.md) - Received NFe, CTe and NFSe
- [Companies](./docs/pt/services/empresas.md) - Company management
- [Lookups](./docs/pt/services/consultas.md) - NCM, CFOP, CEP, CNAE, Municipalities, CNPJ

- [Official FocusNFe Documentation](https://focusnfe.com.br/doc/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

[Apache License 2.0](./LICENSE)
