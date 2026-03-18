# NFCom (Nota Fiscal Fatura de Servico de Comunicacao Eletronica)

The NFCom service (`client.nfcom`) manages the lifecycle of Electronic Communication Service Invoices (model 62), used by telecommunications service providers to document the provision of communication services.

## Key Concepts

**Purpose of NFCom**

The NFCom replaces the former models 21 and 22 (Communication Service Invoice and Telecommunications Service Invoice), unifying the telecommunications sector's fiscal documentation into a single electronic model.

**Identification by Reference (ref)**

All operations use a unique reference (`ref`) that you define when creating the document.

**Asynchronous Processing**

NFCom issuance is asynchronous. Use `get()` to check the status until it becomes `autorizado` (authorized) or `erro_autorizacao` (authorization error).

**Status (`NfcomStatus`)** Possible statuses are: `processando_autorizacao`, `autorizado`, `cancelado`, `erro_autorizacao`.

**Contingency**

The NFCom can be issued in contingency mode when SEFAZ is unavailable. Pass `{ contingencia: true }` as the third parameter of `create()`.

## Method Reference

| Method | Description |
|--------|-------------|
| `create(ref, params, options?)` | Create (issue) an NFCom. Accepts `{ contingencia: true }` in options |
| `get(ref, completa?)` | Retrieve an NFCom by reference |
| `cancel(ref, params)` | Cancel an authorized NFCom |
| `resendWebhook(ref)` | Resend the NFCom webhook |

## Examples

### Create an NFCom

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk';

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'homologation',
});

const nfcom = await client.nfcom.create('ref-nfcom-001', {
  cnpj_emitente: '11222333000181',
  // ...additional NFCom-specific fields
});

console.log('Status:', nfcom.status);
console.log('Ref:', nfcom.ref);
```

### Create an NFCom in Contingency

```typescript
const nfcom = await client.nfcom.create('ref-nfcom-002', {
  cnpj_emitente: '11222333000181',
  // ...additional fields
}, { contingencia: true });

console.log('Status:', nfcom.status);
```

### Retrieve an NFCom

```typescript
// Simple query
const nfcom = await client.nfcom.get('ref-nfcom-001');

console.log('Status:', nfcom.status);
console.log('Key:', nfcom.chave);
console.log('Number:', nfcom.numero);
console.log('Serie:', nfcom.serie);
console.log('DANFECom:', nfcom.caminho_danfecom);
console.log('XML:', nfcom.caminho_xml);

// Full query
const nfcomCompleta = await client.nfcom.get('ref-nfcom-001', true);
```

### Cancel an NFCom

```typescript
const cancelamento = await client.nfcom.cancel('ref-nfcom-001', {
  justificativa: 'Nota emitida com dados incorretos do assinante',
});

console.log('Status:', cancelamento.status);
console.log('SEFAZ status:', cancelamento.status_sefaz);
console.log('Message:', cancelamento.mensagem_sefaz);
console.log('XML:', cancelamento.caminho_xml);
```

### Resend Webhook

```typescript
await client.nfcom.resendWebhook('ref-nfcom-001');
console.log('Webhook resent');
```

## Main Types

### NfcomCreateParams

```typescript
interface NfcomCreateParams {
  cnpj_emitente: string;
  [key: string]: unknown;  // NFCom-specific fields
}
```

### NfcomCreateOptions

```typescript
interface NfcomCreateOptions {
  contingencia?: boolean;
}
```

### NfcomResponse

```typescript
interface NfcomResponse {
  cnpj_emitente?: string;
  ref?: string;
  status: NfcomStatus;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave?: string;
  numero?: string;
  serie?: string;
  modelo?: string;
  caminho_xml?: string;
  caminho_danfecom?: string;
  caminho_xml_cancelamento?: string;
}
```

### NfcomCancelParams

```typescript
interface NfcomCancelParams {
  justificativa: string;
}
```

### NfcomCancelResponse

```typescript
interface NfcomCancelResponse {
  status: NfcomStatus;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml?: string;
}
```

## Important Notes

1. **Asynchronous processing**: After `create()`, poll with `get()` until the final status.
2. **Contingency**: Use `{ contingencia: true }` as the third parameter of `create()` when SEFAZ is unavailable.
3. **Cancellation**: Must be performed within the legal deadline. Requires a justificativa (justification) with a minimum of 15 characters.
4. **Sector-specific**: The NFCom is exclusive to telecommunications service providers. For other types of services, use [NFSe](./nfse.md) or [NFSe Nacional](./nfse-nacional.md).
5. **Flexible types**: `NfcomCreateParams` accepts additional fields beyond `cnpj_emitente`, according to the NFCom technical specification.
6. **Webhook**: Use `resendWebhook()` if the callback was not received by your system.

## Related

- [NFe](./nfe.md) - Electronic Product Invoice
- [NFSe](./nfse.md) - Electronic Service Invoice
- [CTe](./cte.md) - Electronic Transport Document
