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

SDK TypeScript para a API FocusNFe de emissao de documentos fiscais eletronicos brasileiros (NFe, NFCe, NFSe, CTe, MDFe, NFCom).

> **Nota:** Este e um projeto open-source independente e **nao e uma implementacao oficial** da FocusNFe. Nao possui afiliacao, endosso ou suporte da FocusNFe ou de suas empresas relacionadas. Para a documentacao oficial da API, consulte [focusnfe.com.br/doc](https://focusnfe.com.br/doc/).

[English version](./README.en.md) (coming soon)

## Features

- **Zero runtime dependencies** - Footprint minimo usando APIs nativas do Node.js
- **TypeScript-first** - Tipagem completa com union types para status e eventos
- **ESM-only** - Sistema de modulos moderno para tree-shaking otimo
- **Error handling** - Hierarquia de erros estruturada com deteccao de retry
- **Lazy-loaded services** - Inicializacao eficiente sob demanda
- **Ambientes configuraveis** - Troca simples entre HOMOLOGACAO e PRODUCTION
- **Native fetch** - Sem dependencias de cliente HTTP externo
- **100% coverage** - Statements, branches, functions e lines

## Instalacao

```bash
npm install @rodrigogs/focusnfe-sdk
```

**Requisitos:** Node.js >= 20

## Quick Start

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'HOMOLOGACAO', // Opcional: HOMOLOGACAO ou PRODUCTION (default)
})

// Emitir uma NFe
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

## Configuracao

```typescript
const client = new FocusNFeClient({
  token: 'seu_token_api',           // Obrigatorio
  environment: 'PRODUCTION',         // Opcional: HOMOLOGACAO | PRODUCTION (default)
  timeout: 30000,                    // Opcional: Timeout em ms (default: 30000)
  baseUrl: 'https://custom.api.com', // Opcional: Sobrescrever URL base
  userAgent: 'MinhaApp/1.0.0',      // Opcional: User agent customizado
  fetch: customFetch,                // Opcional: Implementacao de fetch customizada
})
```

### URLs dos Ambientes

- **HOMOLOGACAO**: `https://homologacao.focusnfe.com.br`
- **PRODUCTION**: `https://api.focusnfe.com.br`

## Servicos

| Servico | Descricao | Exemplo |
|---------|-----------|---------|
| `nfe` | Nota Fiscal Eletronica (modelo 55) | `client.nfe.create(ref, params)` |
| `nfce` | Nota Fiscal de Consumidor Eletronica (modelo 65) | `client.nfce.create(ref, params)` |
| `nfse` | Nota Fiscal de Servicos Eletronica (municipal) | `client.nfse.create(ref, params)` |
| `nfseNacional` | NFSe Nacional (padrao nacional) | `client.nfseNacional.create(ref, params)` |
| `cte` | Conhecimento de Transporte Eletronico + CTe OS | `client.cte.create(ref, params)` |
| `mdfe` | Manifesto Eletronico de Documentos Fiscais | `client.mdfe.create(ref, params)` |
| `nfcom` | Nota Fiscal Fatura de Servico de Comunicacao | `client.nfcom.create(ref, params)` |
| `nfeRecebidas` | NFe recebidas + manifestacao do destinatario | `client.nfeRecebidas.list(params)` |
| `cteRecebidas` | CTe recebidos + desacordo | `client.cteRecebidas.list(params)` |
| `nfseRecebidas` | NFSe recebidas | `client.nfseRecebidas.list(params)` |
| `empresas` | Gerenciamento de empresas | `client.empresas.create(params)` |
| `webhooks` | Gatilhos/webhooks | `client.webhooks.create(params)` |
| `consultas` | NCM, CFOP, CEP, CNAE, Municipios, CNPJ, Emails, Backups | `client.consultas.ncm(params)` |

## Error Handling

Todos os erros estendem `FocusNFeError` com tipos especificos para diferentes cenarios:

```typescript
import {
  FocusNFeApiError,
  FocusNFeConnectionError,
} from '@rodrigogs/focusnfe-sdk'

try {
  const nfe = await client.nfe.create('ref-001', { /* ... */ })
} catch (error) {
  if (error instanceof FocusNFeApiError) {
    console.error('Erro da API:', error.status, error.mensagem)
    console.error('Detalhes:', error.erros)

    if (error.isAuth) {
      console.error('Token invalido ou sem permissao')
    } else if (error.isRateLimit) {
      console.error('Limite de requisicoes excedido')
    } else if (error.isRetryable) {
      console.error('Erro retentavel, tente novamente')
    }
  } else if (error instanceof FocusNFeConnectionError) {
    console.error('Erro de rede:', error.message)
  }
}
```

## Status Types

O SDK exporta union types para os status de cada tipo de documento:

```typescript
import type { NfeStatus, NfceStatus, CteStatus, MdfeStatus } from '@rodrigogs/focusnfe-sdk'

// NfeStatus = 'processando_autorizacao' | 'autorizado' | 'cancelado' | 'erro_autorizacao' | 'denegado'
// NfceStatus = 'processando_autorizacao' | 'autorizado' | 'cancelado' | 'erro_autorizacao'
// MdfeStatus = ... | 'encerrado'  (status adicional para MDFe)
```

## Webhooks

```typescript
// Criar webhook
const hook = await client.webhooks.create({
  cnpj: '51916585000125',
  event: 'nfe',
  url: 'https://meusite.com/webhook/nfe',
})

// Listar, consultar, remover
const hooks = await client.webhooks.list()
const hook = await client.webhooks.get('hook_id')
await client.webhooks.remove('hook_id')

// Reenviar webhook de um documento especifico
await client.nfe.resendWebhook('ref-001')
```

## Consultas Utilitarias

```typescript
// Buscar NCM por descricao
const ncms = await client.consultas.ncm({ descricao: 'pecas' })

// Consultar CEP
const cep = await client.consultas.cepByCodigo('01001000')

// Verificar status NFSe de um municipio
const municipios = await client.consultas.municipios({
  sigla_uf: 'SP',
  status_nfse: 'ativo',
})

// Consultar CNPJ
const empresa = await client.consultas.cnpj('51916585000125')
```

## Documentacao

### Guias
- [Primeiros Passos](./docs/pt/getting-started.md)
- [Tratamento de Erros](./docs/pt/error-handling.md)
- [Webhooks](./docs/pt/webhooks.md)
- [Limites de Requisicao](./docs/pt/rate-limits.md)

### Servicos
- [NFe](./docs/pt/services/nfe.md) - Nota Fiscal Eletronica
- [NFCe](./docs/pt/services/nfce.md) - Nota Fiscal de Consumidor
- [NFSe](./docs/pt/services/nfse.md) - Nota Fiscal de Servicos (municipal)
- [NFSe Nacional](./docs/pt/services/nfse-nacional.md) - NFSe padrao nacional
- [CTe](./docs/pt/services/cte.md) - Conhecimento de Transporte + CTe OS
- [MDFe](./docs/pt/services/mdfe.md) - Manifesto de Documentos Fiscais
- [NFCom](./docs/pt/services/nfcom.md) - Nota Fiscal de Comunicacao
- [Documentos Recebidos](./docs/pt/services/recebidas.md) - NFe, CTe e NFSe recebidas
- [Empresas](./docs/pt/services/empresas.md) - Gerenciamento de empresas
- [Consultas](./docs/pt/services/consultas.md) - NCM, CFOP, CEP, CNAE, Municipios, CNPJ

- [Documentacao Oficial FocusNFe](https://focusnfe.com.br/doc/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

[Apache License 2.0](./LICENSE)
