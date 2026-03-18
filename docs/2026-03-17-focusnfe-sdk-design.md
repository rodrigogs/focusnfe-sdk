# FocusNFe SDK — Design Spec

**Date**: 2026-03-17
**Status**: Approved
**Repository**: `~/Workspace/focusnfe-sdk` (standalone, like asaas-sdk)
**Package**: `@rodrigogs/focusnfe-sdk`

## Overview

TypeScript SDK for the FocusNFe API v2 — a Brazilian electronic fiscal document platform. Covers all 13 API domains with full type safety. Follows the same architecture as `@rodrigogs/asaas-sdk`.

**Source API**: https://focusnfe.com.br/doc/
**Raw docs**: `docs/raw/` (26 files, 832KB downloaded from source)

## Architecture

### Pattern: Mirror asaas-sdk

Same architecture as the proven asaas-sdk:
- `FocusNFeClient` entry point with lazy service getters
- `BaseService` base class with `_request<T>()` and `_requestBinary()`
- Domain-organized service directories: `service.ts` + `types.ts` + `index.ts`
- Core infrastructure: HTTP layer, error hierarchy, constants, types

### Key Differences from Asaas

| Concern | Asaas | FocusNFe |
|---------|-------|----------|
| Auth | `access_token` header | HTTP Basic Auth (`token:` base64) |
| Resource identity | Server-generated IDs | User-provided `ref` strings |
| Processing | Mostly sync | Mostly async (poll or webhook) |
| Pagination | `offset`/`limit` with `PaginatedList` | No pagination abstraction needed |
| File downloads | Rare (payment docs) | Common (XML, DANFE, DACTe PDFs) |
| Multipart uploads | Payment document upload | Not needed |

## Core Infrastructure

### `core/constants.ts`

```ts
FocusNFeEnvironment = 'HOMOLOGACAO' | 'PRODUCTION'

FOCUSNFE_BASE_URLS: Record<FocusNFeEnvironment, string> = {
  HOMOLOGACAO: 'https://homologacao.focusnfe.com.br',
  PRODUCTION: 'https://api.focusnfe.com.br',
}

FOCUSNFE_DEFAULT_TIMEOUT = 30_000
FOCUSNFE_DEFAULT_ENVIRONMENT: FocusNFeEnvironment = 'PRODUCTION'
```

### `core/types.ts`

```ts
interface FocusNFeClientOptions {
  token: string
  environment?: FocusNFeEnvironment
  baseUrl?: string
  timeout?: number
  fetch?: typeof globalThis.fetch
  userAgent?: string
}

interface NormalizedOptions {
  token: string
  baseUrl: string
  timeout: number
  fetch: typeof globalThis.fetch
  userAgent: string
}
```

### `core/errors.ts`

```ts
FocusNFeError (base)
├── FocusNFeApiError {
│     status: number
│     body: unknown
│     codigo: string          // FocusNFe error code
│     mensagem: string        // FocusNFe error message
│     erros: FocusNFeErrorDetail[]  // Optional field-level errors
│   }
├── FocusNFeConnectionError
└── FocusNFeTimeoutError

interface FocusNFeErrorDetail {
  codigo?: string
  mensagem?: string
  campo?: string
}
```

Error helpers:
- `isAuth` — status 401 or 403
- `isRateLimit` — status 429
- `isServer` — status >= 500
- `isRetryable` — rate limit or server error

### `core/http.ts`

```ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestConfig {
  method: HttpMethod
  path: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

interface BinaryResponse {
  contentType: string
  content: ArrayBuffer
}

function request<T>(options: NormalizedOptions, config: RequestConfig): Promise<T>
function requestBinary(options: NormalizedOptions, config: RequestConfig): Promise<BinaryResponse>
```

Auth implementation: `Authorization: Basic ${btoa(token + ':')}` header on every request.

### `core/base-service.ts`

```ts
class BaseService {
  constructor(protected readonly options: NormalizedOptions)

  protected _request<T>(config: RequestConfig): Promise<T>
  protected _requestBinary(config: RequestConfig): Promise<BinaryResponse>
}
```

No `_list()` pagination helper — FocusNFe doesn't use offset/limit pagination.

## Services

### Directory Structure

```
src/services/
├── nfe/              # NFe (async)
├── nfce/             # NFCe (sync)
├── nfse/             # NFSe (async, municipal)
├── nfse-nacional/    # NFSe Nacional (async, national standard)
├── cte/              # CTe + CTe OS
├── mdfe/             # MDFe
├── nfcom/            # NFCom
├── nfe-recebidas/    # Received NFe + manifestation
├── cte-recebidas/    # Received CTe + desacordo
├── nfse-recebidas/   # Received NFSe
├── empresas/         # Company management
├── webhooks/         # Gatilhos/Webhooks
└── consultas/        # All utility lookups
```

Each directory contains: `service.ts`, `types.ts`, `index.ts`, `service.spec.ts`

### Excluded from v1

- **Comunicador Offline** — Desktop app integration, not API consumer concern
- **NFSe por Arquivo** — Niche file-upload flow, can be added later

### NfeService

```
POST   /v2/nfe?ref=REF                          create(ref, params)
GET    /v2/nfe/REF(?completa=1)                  get(ref, completa?)
DELETE /v2/nfe/REF                               cancel(ref, params)
POST   /v2/nfe/REF/carta_correcao                cartaCorrecao(ref, params)
POST   /v2/nfe/REF/ator_interessado              atorInteressado(ref, params)
POST   /v2/nfe/REF/insucesso_entrega             insucessoEntrega(ref, params)
DELETE /v2/nfe/REF/insucesso_entrega              cancelInsucessoEntrega(ref)
POST   /v2/nfe/REF/email                         email(ref, params)
POST   /v2/nfe/inutilizacao                      inutilizar(params)
GET    /v2/nfe/inutilizacoes                      inutilizacoes()
POST   /v2/nfe/importacao?ref=REF                importar(ref, params)
POST   /v2/nfe/danfe                             danfePreview(params)
POST   /v2/nfe/REF/econf                         econf(ref, params)
GET    /v2/nfe/REF/econf/NUMERO_PROTOCOLO        getEconf(ref, protocolo)
DELETE /v2/nfe/REF/econf/NUMERO_PROTOCOLO        cancelEconf(ref, protocolo)
POST   /v2/nfe/REF/hook                          resendWebhook(ref)
```

### NfceService

```
POST   /v2/nfce?ref=REF                         create(ref, params)
GET    /v2/nfce/REF(?completa=1)                 get(ref, completa?)
DELETE /v2/nfce/REF                              cancel(ref, params)
POST   /v2/nfce/REF/email                        email(ref, params)
POST   /v2/nfce/inutilizacao                     inutilizar(params)
GET    /v2/nfce/inutilizacoes                     inutilizacoes()
POST   /v2/nfce/REF/econf                        econf(ref, params)
GET    /v2/nfce/REF/econf/NUMERO_PROTOCOLO       getEconf(ref, protocolo)
DELETE /v2/nfce/REF/econf/NUMERO_PROTOCOLO       cancelEconf(ref, protocolo)
POST   /v2/nfce/REF/hook                         resendWebhook(ref)
```

### NfseService

```
POST   /v2/nfse?ref=REF                         create(ref, params)
GET    /v2/nfse/REF                              get(ref)
DELETE /v2/nfse/REF                              cancel(ref)
POST   /v2/nfse/REF/email                        email(ref, params)
POST   /v2/nfse/REF/hook                         resendWebhook(ref)
```

### NfseNacionalService

```
POST   /v2/nfsen?ref=REF                        create(ref, params)
GET    /v2/nfsen/REF                             get(ref)
DELETE /v2/nfsen/REF                             cancel(ref)
POST   /v2/nfsen/REF/hook                        resendWebhook(ref)
```

### CteService

```
POST   /v2/cte?ref=REF                          create(ref, params)
POST   /v2/cte_os?ref=REF                       createOs(ref, params)
GET    /v2/cte/REF(?completa=1)                  get(ref, completa?)
DELETE /v2/cte/REF                               cancel(ref, params)
POST   /v2/cte/REF/carta_correcao                cartaCorrecao(ref, params)
POST   /v2/cte/REF/desacordo                     desacordo(ref, params)
POST   /v2/cte/REF/registro_multimodal           registroMultimodal(ref, params)
POST   /v2/cte/REF/dados_gtv                     dadosGtv(ref, params)
POST   /v2/cte/REF/hook                          resendWebhook(ref)
```

### MdfeService

```
POST   /v2/mdfe?ref=REF                         create(ref, params)
GET    /v2/mdfe/REF(?completa=1)                 get(ref, completa?)
DELETE /v2/mdfe/REF                              cancel(ref, params)
POST   /v2/mdfe/REF/inclusao_condutor            incluirCondutor(ref, params)
POST   /v2/mdfe/REF/inclusao_dfe                 incluirDfe(ref, params)
POST   /v2/mdfe/REF/encerrar                     encerrar(ref, params)
POST   /v2/mdfe/REF/hook                         resendWebhook(ref)
```

### NfcomService

```
POST   /v2/nfcom?ref=REF                        create(ref, params)
GET    /v2/nfcom/REF                             get(ref)
DELETE /v2/nfcom/REF                             cancel(ref, params)
POST   /v2/nfcom/REF/hook                        resendWebhook(ref)
```

### NfeRecebidasService

```
GET    /v2/nfes_recebidas?cnpj=X                 list(params)
GET    /v2/nfes_recebidas/CHAVE.json             get(chave)
GET    /v2/nfes_recebidas/CHAVE.xml              getXml(chave)
GET    /v2/nfes_recebidas/CHAVE/cancelamento.xml getCancelamentoXml(chave)
GET    /v2/nfes_recebidas/CHAVE/carta_correcao.xml getCartaCorrecaoXml(chave)
POST   /v2/nfes_recebidas/CHAVE/manifesto        manifestar(chave, params)
GET    /v2/nfes_recebidas/CHAVE/manifesto         getManifestacao(chave)
```

### CteRecebidasService

```
GET    /v2/ctes_recebidas?cnpj=X                 list(params)
GET    /v2/ctes_recebidas/CHAVE.json             get(chave)
GET    /v2/ctes_recebidas/CHAVE.xml              getXml(chave)
GET    /v2/ctes_recebidas/CHAVE/cancelamento.xml getCancelamentoXml(chave)
GET    /v2/ctes_recebidas/CHAVE/carta_correcao.xml getCartaCorrecaoXml(chave)
POST   /v2/ctes_recebidas/CHAVE/desacordo        desacordo(chave, params)
GET    /v2/ctes_recebidas/CHAVE/desacordo         getDesacordo(chave)
```

### NfseRecebidasService

```
GET    /v2/nfses_recebidas?cnpj=X                list(params)
GET    /v2/nfses_recebidas/CHAVE                 get(chave)
```

### EmpresasService

```
POST   /v2/empresas                              create(params)
GET    /v2/empresas                              list()
GET    /v2/empresas/ID                           get(id)
PUT    /v2/empresas/ID                           update(id, params)
DELETE /v2/empresas/ID                           remove(id)
```

### WebhooksService

```
POST   /v2/hooks                                 create(params)
GET    /v2/hooks                                 list()
GET    /v2/hooks/ID                              get(id)
DELETE /v2/hooks/ID                              remove(id)
```

### ConsultasService

```
GET    /v2/ncms                                  ncm(params)
GET    /v2/cfops                                 cfop(params)
GET    /v2/ceps                                  cep(params)
GET    /v2/ceps/CODIGO_CEP                       cepByCodigo(cep)
GET    /v2/codigos_cnae                          cnae(params)
GET    /v2/municipios                            municipios(params)
GET    /v2/municipios/CODIGO                     municipio(codigo)
GET    /v2/municipios/CODIGO/itens_lista_servico itensListaServico(codigoMunicipio, params?)
GET    /v2/municipios/CODIGO/codigos_tributarios_municipio codigosTributariosMunicipio(codigoMunicipio, params?)
GET    /v2/cnpjs/CNPJ                            cnpj(cnpj)
GET    /v2/blocked_emails/EMAIL                  blockedEmail(email)
DELETE /v2/blocked_emails/EMAIL                  unblockEmail(email)
GET    /v2/backups/CNPJ.json                     backups(cnpj)
```

## Client Class

```ts
class FocusNFeClient {
  constructor(options: FocusNFeClientOptions)

  // Fiscal document services
  get nfe(): NfeService
  get nfce(): NfceService
  get nfse(): NfseService
  get nfseNacional(): NfseNacionalService
  get cte(): CteService
  get mdfe(): MdfeService
  get nfcom(): NfcomService

  // Received document services
  get nfeRecebidas(): NfeRecebidasService
  get cteRecebidas(): CteRecebidasService
  get nfseRecebidas(): NfseRecebidasService

  // Management services
  get empresas(): EmpresasService
  get webhooks(): WebhooksService
  get consultas(): ConsultasService

  // Escape hatch
  request<T>(config: RequestConfig): Promise<T>
  requestBinary(config: RequestConfig): Promise<BinaryResponse>
}
```

All service getters use lazy initialization (`??=` pattern).

## Project Structure

```
~/Workspace/focusnfe-sdk/
├── docs/
│   ├── raw/                         # 26 raw API doc files (832KB)
│   └── 2026-03-17-focusnfe-sdk-design.md  # This spec
├── src/
│   ├── client.ts
│   ├── client.spec.ts
│   ├── index.ts
│   ├── index.spec.ts
│   ├── types.ts
│   ├── core/
│   │   ├── base-service.ts
│   │   ├── base-service.spec.ts
│   │   ├── constants.ts
│   │   ├── errors.ts
│   │   ├── errors.spec.ts
│   │   ├── http.ts
│   │   ├── http.spec.ts
│   │   ├── test-helpers.ts
│   │   ├── test-helpers.spec.ts
│   │   └── types.ts
│   └── services/
│       ├── nfe/
│       ├── nfce/
│       ├── nfse/
│       ├── nfse-nacional/
│       ├── cte/
│       ├── mdfe/
│       ├── nfcom/
│       ├── nfe-recebidas/
│       ├── cte-recebidas/
│       ├── nfse-recebidas/
│       ├── empresas/
│       ├── webhooks/
│       └── consultas/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── eslint.config.ts
```

## Tooling

Identical to asaas-sdk:

- **TypeScript**: strict, ESM, `module: "nodenext"`, `target: "es2022"`
- **Vitest**: unit (`*.spec.ts`), integration (`*.test.ts`)
- **ESLint**: `typescript-eslint` + prettier + simple-import-sort + import-x
- **Coverage**: 100% threshold on runtime files (excluding types, index re-exports)
- **Node**: `>= 20`
- **License**: Apache-2.0

## Testing Strategy

- Mock `fetch` via `test-helpers.ts` with `createMockFetch()` utility
- Each `service.spec.ts` validates: correct HTTP method, path, query params, and body sent
- Error classes tested for correct properties and helper methods
- `http.spec.ts` tests auth header generation, URL building, error parsing
- No integration tests hitting real API in v1

## Type Design Notes

- Request param types named `{Resource}{Action}Params` (e.g., `NfeCreateParams`, `NfeCancelParams`)
- Response types named `{Resource}Response` or `{Resource}{Action}Response`
- All fiscal document request bodies use FocusNFe's snake_case field names (not camelCase) — the SDK passes them through as-is to match API docs
- Types are intentionally loose (`string` for dates, `number | string` for decimal values) to match FocusNFe's flexible API — the API accepts both string and number for many fields
