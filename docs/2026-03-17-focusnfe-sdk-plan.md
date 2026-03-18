# FocusNFe SDK Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-coverage TypeScript SDK for the FocusNFe API v2, mirroring `@rodrigogs/asaas-sdk` patterns.

**Architecture:** Client class with lazy service getters, BaseService base class, domain-organized services. HTTP Basic Auth, reference-based operations, binary downloads for XML/PDF files.

**Tech Stack:** TypeScript (strict ESM), Vitest, ESLint + Prettier, Node >= 20

**Spec:** `docs/2026-03-17-focusnfe-sdk-design.md`
**Reference:** `~/Workspace/asaas-sdk/`
**Raw API docs:** `docs/raw/`

---

## File Map

```
src/
├── client.ts                          # FocusNFeClient entry point
├── client.spec.ts                     # Client tests
├── index.ts                           # Public re-exports
├── index.spec.ts                      # Smoke test for exports
├── types.ts                           # Aggregated type re-exports
├── core/
│   ├── constants.ts                   # Base URLs, defaults
│   ├── types.ts                       # ClientOptions, NormalizedOptions
│   ├── errors.ts                      # Error hierarchy
│   ├── errors.spec.ts                 # Error class tests
│   ├── http.ts                        # request(), requestBinary()
│   ├── http.spec.ts                   # HTTP layer tests
│   ├── base-service.ts                # BaseService class
│   ├── base-service.spec.ts           # BaseService tests
│   ├── test-helpers.ts                # createMockFetch(), createTestOptions()
│   └── test-helpers.spec.ts           # Test helper tests
└── services/
    ├── nfe/
    │   ├── types.ts                   # NFe request/response types
    │   ├── service.ts                 # NfeService (16 methods)
    │   ├── service.spec.ts            # NFe service tests
    │   └── index.ts                   # Re-exports
    ├── nfce/                          # Same structure (10 methods)
    ├── nfse/                          # Same structure (5 methods)
    ├── nfse-nacional/                 # Same structure (4 methods)
    ├── cte/                           # Same structure (9 methods)
    ├── mdfe/                          # Same structure (7 methods)
    ├── nfcom/                         # Same structure (4 methods)
    ├── nfe-recebidas/                 # Same structure (7 methods)
    ├── cte-recebidas/                 # Same structure (7 methods)
    ├── nfse-recebidas/                # Same structure (2 methods)
    ├── empresas/                      # Same structure (5 methods)
    ├── webhooks/                      # Same structure (4 methods)
    └── consultas/                     # Same structure (13 methods)
```

Root config files: `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.ts`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `eslint.config.ts`

- [ ] **Step 1: Create `package.json`**

Copy from `~/Workspace/asaas-sdk/package.json` and adapt:

```json
{
  "name": "@rodrigogs/focusnfe-sdk",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rodrigogs/focusnfe-sdk.git"
  },
  "license": "Apache-2.0",
  "files": ["dist"],
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "rimraf dist && tsc --project tsconfig.json",
    "build:watch": "tsc --project tsconfig.json --watch",
    "clean": "rimraf dist coverage",
    "lint": "eslint .",
    "lint:fix": "npm run lint -- --fix",
    "test": "vitest run",
    "test:unit": "npm run test -- --project unit",
    "test:integration": "npm run test -- --project integration"
  },
  "devDependencies": {
    "@eslint/js": "^9.28.0",
    "@types/node": "^25.5.0",
    "@vitest/coverage-v8": "^4.0.18",
    "eslint": "^9.39.4",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-import-x": "^4.16.1",
    "eslint-plugin-prettier": "^5.5.5",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "jiti": "^2.4.2",
    "prettier": "^3.8.1",
    "rimraf": "^6.1.3",
    "typescript": "next",
    "typescript-eslint": "^8.56.1",
    "vitest": "^4.0.18"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

Copy from `~/Workspace/asaas-sdk/tsconfig.json` exactly:

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "lib": ["es2022"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "es2022",
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/core/test-helpers.ts",
    "node_modules",
    "dist"
  ]
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

Copy from `~/Workspace/asaas-sdk/vitest.config.ts` and update excludes:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          include: ['src/**/*.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        '**/types.ts',
        'src/services/*/index.ts',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
```

- [ ] **Step 4: Create `eslint.config.ts`**

Copy from `~/Workspace/asaas-sdk/eslint.config.ts` exactly.

- [ ] **Step 5: Install dependencies**

Run: `cd ~/Workspace/focusnfe-sdk && npm install`
Expected: Clean install, `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts eslint.config.ts
git commit -m "chore: scaffold project with TS, Vitest, ESLint config"
```

---

## Task 2: Core — Constants & Types

**Files:**
- Create: `src/core/constants.ts`
- Create: `src/core/types.ts`

- [ ] **Step 1: Create `src/core/constants.ts`**

```ts
import type { FocusNFeEnvironment } from './types.js'

export const FOCUSNFE_BASE_URLS: Record<FocusNFeEnvironment, string> = {
  HOMOLOGACAO: 'https://homologacao.focusnfe.com.br',
  PRODUCTION: 'https://api.focusnfe.com.br',
}

export const FOCUSNFE_DEFAULT_TIMEOUT = 30_000

export const FOCUSNFE_DEFAULT_ENVIRONMENT: FocusNFeEnvironment = 'PRODUCTION'
```

- [ ] **Step 2: Create `src/core/types.ts`**

```ts
/* v8 ignore start -- type-only file, no runtime code */
export type FocusNFeEnvironment = 'HOMOLOGACAO' | 'PRODUCTION'

export interface FocusNFeClientOptions {
  token: string
  environment?: FocusNFeEnvironment
  baseUrl?: string
  timeout?: number
  fetch?: typeof globalThis.fetch
  userAgent?: string
}

export interface NormalizedOptions {
  token: string
  baseUrl: string
  timeout: number
  fetch: typeof globalThis.fetch
  userAgent: string
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd ~/Workspace/focusnfe-sdk && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/core/constants.ts src/core/types.ts
git commit -m "feat(core): add constants and types"
```

---

## Task 3: Core — Errors

**Files:**
- Create: `src/core/errors.ts`
- Create: `src/core/errors.spec.ts`

Reference: `~/Workspace/asaas-sdk/src/core/errors.ts` and `~/Workspace/asaas-sdk/src/core/errors.spec.ts`

- [ ] **Step 1: Write `src/core/errors.spec.ts`**

```ts
import { describe, expect, it } from 'vitest'

import { FocusNFeApiError, FocusNFeConnectionError, FocusNFeError } from './errors.js'

describe('FocusNFeError', () => {
  it('is an instance of Error with correct name', () => {
    const err = new FocusNFeError('test')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('FocusNFeError')
    expect(err.message).toBe('test')
  })
})

describe('FocusNFeApiError', () => {
  it('builds message from erros detail descriptions', () => {
    const err = new FocusNFeApiError({
      status: 400,
      codigo: 'requisicao_invalida',
      mensagem: 'Requisição inválida',
      erros: [
        { mensagem: 'CNPJ inválido', campo: 'cnpj' },
        { mensagem: 'Nome obrigatório', campo: 'nome' },
      ],
    })
    expect(err.message).toBe('CNPJ inválido; Nome obrigatório')
    expect(err.name).toBe('FocusNFeApiError')
    expect(err.status).toBe(400)
    expect(err.codigo).toBe('requisicao_invalida')
    expect(err.mensagem).toBe('Requisição inválida')
    expect(err.erros).toHaveLength(2)
    expect(err.body).toBeNull()
  })

  it('falls back to mensagem when erros is empty', () => {
    const err = new FocusNFeApiError({
      status: 404,
      codigo: 'nao_encontrado',
      mensagem: 'Nota fiscal não encontrada',
    })
    expect(err.message).toBe('Nota fiscal não encontrada')
  })

  it('falls back to HTTP status when no description', () => {
    const err = new FocusNFeApiError({ status: 500 })
    expect(err.message).toBe('HTTP 500')
  })

  it('exposes helper getters', () => {
    expect(new FocusNFeApiError({ status: 401 }).isAuth).toBe(true)
    expect(new FocusNFeApiError({ status: 403 }).isAuth).toBe(true)
    expect(new FocusNFeApiError({ status: 429 }).isRateLimit).toBe(true)
    expect(new FocusNFeApiError({ status: 500 }).isServer).toBe(true)
    expect(new FocusNFeApiError({ status: 502 }).isServer).toBe(true)
    expect(new FocusNFeApiError({ status: 429 }).isRetryable).toBe(true)
    expect(new FocusNFeApiError({ status: 503 }).isRetryable).toBe(true)
    expect(new FocusNFeApiError({ status: 400 }).isRetryable).toBe(false)
  })
})

describe('FocusNFeConnectionError', () => {
  it('wraps cause and has correct name', () => {
    const cause = new TypeError('fetch failed')
    const err = new FocusNFeConnectionError('Network error', { cause })
    expect(err.name).toBe('FocusNFeConnectionError')
    expect(err.message).toBe('Network error')
    expect(err.cause).toBe(cause)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/core/errors.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/core/errors.ts`**

```ts
export interface FocusNFeErrorDetail {
  mensagem?: string
  campo?: string
}

export class FocusNFeError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'FocusNFeError'
  }
}

export class FocusNFeApiError extends FocusNFeError {
  readonly status: number
  readonly body: unknown
  readonly codigo: string
  readonly mensagem: string
  readonly erros: FocusNFeErrorDetail[]

  constructor(params: {
    status: number
    body?: unknown
    codigo?: string
    mensagem?: string
    erros?: FocusNFeErrorDetail[]
  }) {
    const detail = params.erros
      ?.map((e) => e.mensagem?.trim())
      .filter((d): d is string => Boolean(d))
      .join('; ')

    super(detail || params.mensagem || `HTTP ${params.status}`)
    this.name = 'FocusNFeApiError'
    this.status = params.status
    this.body = params.body ?? null
    this.codigo = params.codigo ?? ''
    this.mensagem = params.mensagem ?? ''
    this.erros = params.erros ?? []
  }

  get isAuth(): boolean {
    return this.status === 401 || this.status === 403
  }

  get isRateLimit(): boolean {
    return this.status === 429
  }

  get isServer(): boolean {
    return this.status >= 500
  }

  get isRetryable(): boolean {
    return this.isRateLimit || this.isServer
  }
}

export class FocusNFeConnectionError extends FocusNFeError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'FocusNFeConnectionError'
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/core/errors.spec.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/errors.ts src/core/errors.spec.ts
git commit -m "feat(core): add error hierarchy with tests"
```

---

## Task 4: Core — Test Helpers

**Files:**
- Create: `src/core/test-helpers.ts`
- Create: `src/core/test-helpers.spec.ts`

Reference: `~/Workspace/asaas-sdk/src/core/test-helpers.ts`

- [ ] **Step 1: Write `src/core/test-helpers.spec.ts`**

```ts
import { describe, expect, it } from 'vitest'

import { FOCUSNFE_BASE_URLS } from './constants.js'
import { createMockFetch, createTestOptions } from './test-helpers.js'

describe('createMockFetch', () => {
  it('returns a Response with given status and JSON body', async () => {
    const { fetch } = createMockFetch({ status: 201, body: { ref: 'abc' } })
    const res = await fetch('https://example.com', {})
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ ref: 'abc' })
  })

  it('defaults to 200 with empty body', async () => {
    const { fetch } = createMockFetch()
    const res = await fetch('https://example.com', {})
    expect(res.status).toBe(200)
  })

  it('queues multiple responses in order', async () => {
    const { fetch } = createMockFetch(
      { status: 200, body: { n: 1 } },
      { status: 404, body: { codigo: 'nao_encontrado' } },
    )
    const r1 = await fetch('https://example.com', {})
    const r2 = await fetch('https://example.com', {})
    expect(r1.status).toBe(200)
    expect(r2.status).toBe(404)
  })
})

describe('createTestOptions', () => {
  it('returns NormalizedOptions with sandbox defaults', () => {
    const opts = createTestOptions()
    expect(opts.token).toBe('test_token_123')
    expect(opts.baseUrl).toBe(FOCUSNFE_BASE_URLS.HOMOLOGACAO)
    expect(opts.timeout).toBe(30_000)
    expect(typeof opts.fetch).toBe('function')
  })

  it('accepts overrides', () => {
    const opts = createTestOptions({ token: 'custom', timeout: 5000 })
    expect(opts.token).toBe('custom')
    expect(opts.timeout).toBe(5000)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/core/test-helpers.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/core/test-helpers.ts`**

```ts
import { vi } from 'vitest'

import { FOCUSNFE_BASE_URLS, FOCUSNFE_DEFAULT_TIMEOUT } from './constants.js'
import type { NormalizedOptions } from './types.js'

interface MockResponse {
  status?: number
  body?: unknown
  headers?: Record<string, string>
}

export function createMockFetch(...responses: MockResponse[]) {
  const queue = [...responses]

  const mockFetch = vi.fn(async () => {
    const resp = queue.shift() ?? { status: 200, body: {} }
    return new Response(
      resp.body !== undefined ? JSON.stringify(resp.body) : null,
      {
        status: resp.status ?? 200,
        headers: { 'content-type': 'application/json', ...resp.headers },
      },
    )
  }) as unknown as typeof globalThis.fetch

  return {
    fetch: mockFetch,
    spy: mockFetch as unknown as ReturnType<typeof vi.fn>,
  }
}

export function createTestOptions(
  overrides?: Partial<NormalizedOptions>,
): NormalizedOptions {
  const { fetch: mockFetch } = createMockFetch({ status: 200, body: {} })
  return {
    token: 'test_token_123',
    baseUrl: FOCUSNFE_BASE_URLS.HOMOLOGACAO,
    timeout: FOCUSNFE_DEFAULT_TIMEOUT,
    fetch: mockFetch,
    userAgent: '@rodrigogs/focusnfe-sdk-test',
    ...overrides,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/core/test-helpers.spec.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/test-helpers.ts src/core/test-helpers.spec.ts
git commit -m "feat(core): add test helpers with createMockFetch and createTestOptions"
```

---

## Task 5: Core — HTTP Layer

**Files:**
- Create: `src/core/http.ts`
- Create: `src/core/http.spec.ts`

Reference: `~/Workspace/asaas-sdk/src/core/http.ts` and `~/Workspace/asaas-sdk/src/core/http.spec.ts`

Key differences from asaas-sdk: Basic Auth instead of `access_token` header. No multipart. Error body uses `codigo`/`mensagem`/`erros` instead of `errors`.

- [ ] **Step 1: Write `src/core/http.spec.ts`**

Tests should cover:
1. `buildUrl` — base + path + query params (undefined filtered)
2. `buildHeaders` — Basic Auth header format: `Authorization: Basic ${btoa(token + ':')}`, Content-Type, Accept, User-Agent (when set)
3. `request()` — success path returns parsed JSON
4. `request()` — non-ok response throws `FocusNFeApiError` with parsed FocusNFe body (`{ codigo, mensagem, erros }`)
5. `request()` — non-ok with non-JSON body still throws `FocusNFeApiError`
6. `request()` — network error wraps as `FocusNFeConnectionError`
7. `request()` — rethrows `FocusNFeApiError` without wrapping
8. `requestBinary()` — returns `{ contentType, content }` for ok responses
9. `requestBinary()` — returns contentType from header or defaults to `'application/octet-stream'`
10. `requestBinary()` — throws `FocusNFeApiError` for non-ok responses

Write tests that verify the URL construction, auth header format (`Basic base64(token:)`), and error parsing of FocusNFe's `{ codigo, mensagem, erros }` shape.

Reference `~/Workspace/asaas-sdk/src/core/http.spec.ts` for test structure, adapting for Basic Auth and FocusNFe error format.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/core/http.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/core/http.ts`**

Mirror `~/Workspace/asaas-sdk/src/core/http.ts` with these changes:
- `buildHeaders()` uses `Authorization: Basic ${btoa(token + ':')}` instead of `access_token` header
- `buildApiError()` parses FocusNFe error shape: `{ codigo, mensagem, erros: [{ mensagem, campo }] }`
- No `requestMultipart()` function
- Keep `request<T>()` and `requestBinary()` functions

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/core/http.spec.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/http.ts src/core/http.spec.ts
git commit -m "feat(core): add HTTP layer with Basic Auth and binary support"
```

---

## Task 6: Core — BaseService

**Files:**
- Create: `src/core/base-service.ts`
- Create: `src/core/base-service.spec.ts`

Reference: `~/Workspace/asaas-sdk/src/core/base-service.ts`

- [ ] **Step 1: Write `src/core/base-service.spec.ts`**

Tests should cover:
1. `_request()` delegates to `request()` from http module
2. `_requestBinary()` delegates to `requestBinary()` from http module

Reference `~/Workspace/asaas-sdk/src/core/base-service.spec.ts` for pattern. No `_list()` tests since FocusNFe has no pagination.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/core/base-service.spec.ts`

- [ ] **Step 3: Implement `src/core/base-service.ts`**

```ts
import { type BinaryResponse, request, requestBinary, type RequestConfig } from './http.js'
import type { NormalizedOptions } from './types.js'

export class BaseService {
  constructor(protected readonly options: NormalizedOptions) {}

  protected _request<T>(config: RequestConfig): Promise<T> {
    return request<T>(this.options, config)
  }

  protected _requestBinary(config: RequestConfig): Promise<BinaryResponse> {
    return requestBinary(this.options, config)
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/core/base-service.spec.ts`

- [ ] **Step 5: Run all core tests**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/core/`
Expected: All core tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/core/base-service.ts src/core/base-service.spec.ts
git commit -m "feat(core): add BaseService with request and requestBinary"
```

---

## Task 7: Services — Webhooks (simplest service, establishes pattern)

**Files:**
- Create: `src/services/webhooks/types.ts`
- Create: `src/services/webhooks/service.ts`
- Create: `src/services/webhooks/service.spec.ts`
- Create: `src/services/webhooks/index.ts`

Start with the simplest service to establish the pattern all others follow.

API reference: `docs/raw/gatilhos_webhooks.md`

- [ ] **Step 1: Create `src/services/webhooks/types.ts`**

Define types from the raw API docs: `WebhookCreateParams`, `Webhook`, `WebhookEvent`.

- [ ] **Step 2: Write `src/services/webhooks/service.spec.ts`**

Test all 4 methods: `create()`, `list()`, `get()`, `remove()`. Each test verifies correct HTTP method, path, and body. Follow the pattern from asaas-sdk `customers/service.spec.ts`.

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/services/webhooks/service.spec.ts`

- [ ] **Step 4: Implement `src/services/webhooks/service.ts`**

```ts
import { BaseService } from '../../core/base-service.js'
import type { Webhook, WebhookCreateParams } from './types.js'

export class WebhooksService extends BaseService {
  create(params: WebhookCreateParams): Promise<Webhook> {
    return this._request({ method: 'POST', path: '/v2/hooks', body: params })
  }

  list(): Promise<Webhook[]> {
    return this._request({ method: 'GET', path: '/v2/hooks' })
  }

  get(id: string): Promise<Webhook> {
    return this._request({ method: 'GET', path: `/v2/hooks/${id}` })
  }

  remove(id: string): Promise<void> {
    return this._request({ method: 'DELETE', path: `/v2/hooks/${id}` })
  }
}
```

- [ ] **Step 5: Create `src/services/webhooks/index.ts`**

```ts
export { WebhooksService } from './service.js'
export type { Webhook, WebhookCreateParams, WebhookEvent } from './types.js'
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run src/services/webhooks/service.spec.ts`

- [ ] **Step 7: Commit**

```bash
git add src/services/webhooks/
git commit -m "feat(webhooks): add WebhooksService with create, list, get, remove"
```

---

## Task 8: Services — Empresas

**Files:**
- Create: `src/services/empresas/types.ts`
- Create: `src/services/empresas/service.ts`
- Create: `src/services/empresas/service.spec.ts`
- Create: `src/services/empresas/index.ts`

API reference: `docs/raw/empresas.md`

Endpoints: `create()`, `list()`, `get(id)`, `update(id, params)`, `remove(id)`

- [ ] **Step 1: Create types from raw docs**
- [ ] **Step 2: Write service spec (5 methods)**
- [ ] **Step 3: Run tests — expect FAIL**
- [ ] **Step 4: Implement service**
- [ ] **Step 5: Create index.ts re-exports**
- [ ] **Step 6: Run tests — expect PASS**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat(empresas): add EmpresasService with full CRUD"
```

---

## Task 9: Services — NFSe (establishes fiscal document pattern)

**Files:**
- Create: `src/services/nfse/types.ts`
- Create: `src/services/nfse/service.ts`
- Create: `src/services/nfse/service.spec.ts`
- Create: `src/services/nfse/index.ts`

API reference: `docs/raw/nfse.md`

This establishes the reference-based fiscal document pattern: `create(ref, params)`, `get(ref)`, `cancel(ref)`, `email(ref, params)`, `resendWebhook(ref)`.

- [ ] **Step 1: Create types from raw docs** (NFSe fields: prestador, tomador, servico, intermediario)
- [ ] **Step 2: Write service spec (5 methods)**
- [ ] **Step 3: Run tests — expect FAIL**
- [ ] **Step 4: Implement service**
- [ ] **Step 5: Create index.ts re-exports**
- [ ] **Step 6: Run tests — expect PASS**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat(nfse): add NfseService with create, get, cancel, email, resendWebhook"
```

---

## Task 10: Services — NFSe Nacional

**Files:** `src/services/nfse-nacional/` (types.ts, service.ts, service.spec.ts, index.ts)

API reference: `docs/raw/nfse_nacional.md`

Endpoints: `create(ref, params)`, `get(ref)`, `cancel(ref)`, `resendWebhook(ref)` — uses `/v2/nfsen` path.

- [ ] **Steps 1-7: Same pattern as Task 9, adapted for NFSe Nacional fields and `/v2/nfsen` endpoints**
- [ ] **Commit**

```bash
git commit -m "feat(nfse-nacional): add NfseNacionalService"
```

---

## Task 11: Services — NFe (largest service)

**Files:** `src/services/nfe/` (types.ts, service.ts, service.spec.ts, index.ts)

API reference: `docs/raw/nfe.md`

16 methods. The types file will be the largest — NFe has hundreds of fields for items, emitter, recipient, taxes, payments.

- [ ] **Step 1: Create types** — NFe request types (items, emitter, recipient, totals), response types (all statuses), cancel params, carta correcao, inutilização, econf, email, etc.
- [ ] **Step 2: Write service spec (16 methods)** — Every method: `create`, `get`, `cancel`, `cartaCorrecao`, `atorInteressado`, `insucessoEntrega`, `cancelInsucessoEntrega`, `email`, `inutilizar`, `inutilizacoes`, `importar`, `danfePreview`, `econf`, `getEconf`, `cancelEconf`, `resendWebhook`
- [ ] **Step 3: Run tests — expect FAIL**
- [ ] **Step 4: Implement service**
- [ ] **Step 5: Create index.ts re-exports**
- [ ] **Step 6: Run tests — expect PASS**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat(nfe): add NfeService with 16 methods and full type definitions"
```

---

## Task 12: Services — NFCe

**Files:** `src/services/nfce/` (types.ts, service.ts, service.spec.ts, index.ts)

API reference: `docs/raw/nfce.md`

10 methods. Similar to NFe but synchronous and consumer-facing. Shares many field patterns.

- [ ] **Steps 1-7: Same pattern, 10 methods**: `create`, `get`, `cancel`, `email`, `inutilizar`, `inutilizacoes`, `econf`, `getEconf`, `cancelEconf`, `resendWebhook`
- [ ] **Commit**

```bash
git commit -m "feat(nfce): add NfceService with 10 methods"
```

---

## Task 13: Services — CTe

**Files:** `src/services/cte/` (types.ts, service.ts, service.spec.ts, index.ts)

API reference: `docs/raw/cte_e_cte_os.md`

9 methods. Covers both CTe and CTe OS via separate create endpoints.

- [ ] **Steps 1-7: Same pattern, 9 methods**: `create`, `createOs`, `get`, `cancel`, `cartaCorrecao`, `desacordo`, `registroMultimodal`, `dadosGtv`, `resendWebhook`
- [ ] **Commit**

```bash
git commit -m "feat(cte): add CteService with CTe and CTe OS support"
```

---

## Task 14: Services — MDFe

**Files:** `src/services/mdfe/` (types.ts, service.ts, service.spec.ts, index.ts)

API reference: `docs/raw/mdfe.md`

7 methods including driver management and shipment closing.

- [ ] **Steps 1-7: Same pattern, 7 methods**: `create`, `get`, `cancel`, `incluirCondutor`, `incluirDfe`, `encerrar`, `resendWebhook`
- [ ] **Commit**

```bash
git commit -m "feat(mdfe): add MdfeService with driver and DFe management"
```

---

## Task 15: Services — NFCom

**Files:** `src/services/nfcom/` (types.ts, service.ts, service.spec.ts, index.ts)

API reference: `docs/raw/nfcom.md`

4 methods. Simplest fiscal document service.

- [ ] **Steps 1-7: Same pattern, 4 methods**: `create`, `get`, `cancel`, `resendWebhook`
- [ ] **Commit**

```bash
git commit -m "feat(nfcom): add NfcomService"
```

---

## Task 16: Services — NFe Recebidas

**Files:** `src/services/nfe-recebidas/` (types.ts, service.ts, service.spec.ts, index.ts)

API reference: `docs/raw/nfe_recebidas.md`

7 methods. Different pattern — key-based, not ref-based. Includes binary downloads (XML).

- [ ] **Steps 1-7: Same pattern, 7 methods**: `list`, `get`, `getXml`, `getCancelamentoXml`, `getCartaCorrecaoXml`, `manifestar`, `getManifestacao`
- [ ] **Commit**

```bash
git commit -m "feat(nfe-recebidas): add NfeRecebidasService with manifestation"
```

---

## Task 17: Services — CTe Recebidas

**Files:** `src/services/cte-recebidas/` (types.ts, service.ts, service.spec.ts, index.ts)

API reference: `docs/raw/cte_recebidas.md`

7 methods. Same key-based pattern as NFe Recebidas.

- [ ] **Steps 1-7: Same pattern, 7 methods**: `list`, `get`, `getXml`, `getCancelamentoXml`, `getCartaCorrecaoXml`, `desacordo`, `getDesacordo`
- [ ] **Commit**

```bash
git commit -m "feat(cte-recebidas): add CteRecebidasService with desacordo"
```

---

## Task 18: Services — NFSe Recebidas

**Files:** `src/services/nfse-recebidas/` (types.ts, service.ts, service.spec.ts, index.ts)

API reference: `docs/raw/nfses_recebidas.md`

2 methods. Simplest received document service.

- [ ] **Steps 1-7: Same pattern, 2 methods**: `list`, `get`
- [ ] **Commit**

```bash
git commit -m "feat(nfse-recebidas): add NfseRecebidasService"
```

---

## Task 19: Services — Consultas (utility lookups)

**Files:** `src/services/consultas/` (types.ts, service.ts, service.spec.ts, index.ts)

API references: `docs/raw/consulta_de_ncm.md`, `consulta_de_cfop.md`, `consulta_de_cep_beta.md`, `consulta_de_cnae.md`, `consulta_de_municipios_beta.md`, `consulta_de_cnpj.md`, `consulta_de_emails.md`, `backups_nfe_nfce_cte_e_mdfe.md`

13 methods grouped into one service.

- [ ] **Step 1: Create types** — Query params and result types for each lookup
- [ ] **Step 2: Write service spec (13 methods)** — `ncm`, `cfop`, `cep`, `cepByCodigo`, `cnae`, `municipios`, `municipio`, `itensListaServico`, `codigosTributariosMunicipio`, `cnpj`, `blockedEmail`, `unblockEmail`, `backups`
- [ ] **Step 3: Run tests — expect FAIL**
- [ ] **Step 4: Implement service**
- [ ] **Step 5: Create index.ts re-exports**
- [ ] **Step 6: Run tests — expect PASS**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat(consultas): add ConsultasService with all utility lookups"
```

---

## Task 20: Client Class

**Files:**
- Create: `src/client.ts`
- Create: `src/client.spec.ts`

Reference: `~/Workspace/asaas-sdk/src/client.ts`

- [ ] **Step 1: Write `src/client.spec.ts`**

Test:
1. Constructor normalizes options (environment → baseUrl, default timeout)
2. Each service getter returns correct service type
3. Service getters use lazy initialization (same instance on repeated access)
4. `request()` escape hatch delegates to `http.request()`
5. `requestBinary()` escape hatch delegates to `http.requestBinary()`

- [ ] **Step 2: Run tests — expect FAIL**
- [ ] **Step 3: Implement `src/client.ts`**

13 lazy service getters using `??=` pattern. `normalizeOptions()` function. `request()` and `requestBinary()` escape hatches.

- [ ] **Step 4: Run tests — expect PASS**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add FocusNFeClient with 13 service getters"
```

---

## Task 21: Index & Types Re-exports

**Files:**
- Create: `src/index.ts`
- Create: `src/index.spec.ts`
- Create: `src/types.ts`

Reference: `~/Workspace/asaas-sdk/src/index.ts`

- [ ] **Step 1: Create `src/types.ts`**

Aggregated type re-exports from all services and core.

- [ ] **Step 2: Create `src/index.ts`**

Export `FocusNFeClient`, error classes, and all service types. Follow asaas-sdk pattern.
**Note:** `test-helpers.ts` is dev-only — it is NOT exported from `index.ts`. It is excluded from the TypeScript build in `tsconfig.json`.

- [ ] **Step 3: Write `src/index.spec.ts`**

Smoke test: verify key exports exist (client, errors, service classes).

- [ ] **Step 4: Run test — expect PASS**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add public API exports"
```

---

## Task 22: Lint, Build & Coverage Gate

- [ ] **Step 1: Run lint**

Run: `cd ~/Workspace/focusnfe-sdk && npm run lint`
Expected: No errors. Fix any issues.

- [ ] **Step 2: Run build**

Run: `cd ~/Workspace/focusnfe-sdk && npm run build`
Expected: Clean build to `dist/`, no errors.

- [ ] **Step 3: Run full test suite with coverage**

Run: `cd ~/Workspace/focusnfe-sdk && npx vitest run --coverage`
Expected: All tests pass, 100% coverage on runtime files.

- [ ] **Step 4: Fix any gaps**

If coverage is below 100%, add missing tests.

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: pass lint, build, and 100% coverage gate"
```

---

## Summary

| Task | Component | Methods | Complexity |
|------|-----------|---------|------------|
| 1 | Project scaffolding | — | Config only |
| 2 | Constants & types | — | Type-only |
| 3 | Errors | — | 3 classes |
| 4 | Test helpers | — | 2 functions |
| 5 | HTTP layer | — | 2 functions |
| 6 | BaseService | — | 2 methods |
| 7 | Webhooks | 4 | Simple CRUD |
| 8 | Empresas | 5 | Standard CRUD |
| 9 | NFSe | 5 | First fiscal doc |
| 10 | NFSe Nacional | 4 | Variant of NFSe |
| 11 | NFe | 16 | Largest service |
| 12 | NFCe | 10 | Like NFe, sync |
| 13 | CTe | 9 | Dual create |
| 14 | MDFe | 7 | Driver mgmt |
| 15 | NFCom | 4 | Simplest fiscal |
| 16 | NFe Recebidas | 7 | Key-based + binary |
| 17 | CTe Recebidas | 7 | Key-based |
| 18 | NFSe Recebidas | 2 | Simplest received |
| 19 | Consultas | 13 | Grouped lookups |
| 20 | Client | 13 getters | Integration |
| 21 | Index & types | — | Re-exports |
| 22 | Lint/Build/Coverage | — | Quality gate |
