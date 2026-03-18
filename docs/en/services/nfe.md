# NFe (Nota Fiscal Eletronica)

The NFe service (`client.nfe`) manages the complete lifecycle of electronic product invoices (model 55), including issuance, retrieval, cancellation, correction letter, number voiding, and various fiscal events.

## Key Concepts

**Identification by Reference (ref)**

All NFe operations use a unique reference (`ref`) that you define when creating the document. This reference is used to query, cancel, and perform subsequent events. The `ref` must be unique per issuing company.

**Asynchronous Processing**

NFe issuance is asynchronous. When you call `create()`, the document enters a processing queue. Use `get()` to check the status until it becomes `autorizado` (authorized) or `erro_autorizacao` (authorization error).

**The `completa` Parameter**

When querying an NFe with `get(ref, true)`, the response includes the full request and protocol objects (`requisicao_nota_fiscal`, `protocolo_nota_fiscal`, etc.), useful for debugging and auditing.

**Status (`NfeStatus`)** Possible statuses are: `processando_autorizacao`, `autorizado`, `cancelado`, `erro_autorizacao`, `denegado`.

**ECONF (Financial Reconciliation)**

The financial reconciliation event (ECONF) allows you to register the payment details actually received after the document was issued, as required by the tax authority.

## Method Reference

| Method | Description |
|--------|-------------|
| `create(ref, params)` | Create (issue) an NFe with the given reference |
| `get(ref, completa?)` | Retrieve an NFe by reference |
| `cancel(ref, params)` | Cancel an authorized NFe |
| `cartaCorrecao(ref, params)` | Issue a Correction Letter (CC-e) |
| `atorInteressado(ref, params)` | Register an interested party in the transport |
| `insucessoEntrega(ref, params)` | Register a delivery failure event |
| `cancelInsucessoEntrega(ref)` | Cancel a delivery failure event |
| `email(ref, params)` | Send the NFe by email to recipients |
| `inutilizar(params)` | Void a number range (inutilizacao) |
| `inutilizacoes(params)` | List voided number ranges |
| `importar(ref, params)` | Import an NFe from XML |
| `danfePreview(params)` | Generate a DANFE PDF preview (returns `BinaryResponse`) |
| `econf(ref, params)` | Register a financial reconciliation event (ECONF) |
| `getEconf(ref, protocolo)` | Retrieve an ECONF event by protocol |
| `cancelEconf(ref, protocolo)` | Cancel an ECONF event |
| `evento(ref, params)` | Register a generic event on the NFe |
| `resendWebhook(ref)` | Resend the NFe webhook |

## Examples

### Create an NFe

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk';

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'homologation',
});

const nfe = await client.nfe.create('ref-001', {
  natureza_operacao: 'Venda de mercadoria',
  data_emissao: '2026-03-18T10:00:00-03:00',
  tipo_documento: 1,
  local_destino: 1,
  finalidade_emissao: 1,
  consumidor_final: 1,
  presenca_comprador: 1,
  cnpj_emitente: '11222333000181',
  nome_destinatario: 'Cliente Exemplo',
  cpf_destinatario: '12345678901',
  logradouro_destinatario: 'Rua Exemplo',
  numero_destinatario: '100',
  bairro_destinatario: 'Centro',
  municipio_destinatario: 'Sao Paulo',
  uf_destinatario: 'SP',
  cep_destinatario: '01001000',
  indicador_inscricao_estadual_destinatario: 9,
  items: [
    {
      numero_item: 1,
      codigo_produto: 'PROD001',
      descricao: 'Produto de teste',
      cfop: '5102',
      codigo_ncm: '94019090',
      quantidade_comercial: 1,
      valor_unitario_comercial: 100.00,
      unidade_comercial: 'UN',
      icms_origem: 0,
      icms_situacao_tributaria: '102',
    },
  ],
  formas_pagamento: [
    {
      forma_pagamento: '01',
      valor_pagamento: 100.00,
    },
  ],
});

console.log('Status:', nfe.status);
console.log('Ref:', nfe.ref);
```

### Retrieve an NFe

```typescript
// Simple query
const nfe = await client.nfe.get('ref-001');

console.log('Status:', nfe.status);
console.log('Key:', nfe.chave_nfe);
console.log('DANFE:', nfe.caminho_danfe);

// Full query (includes request and protocol)
const nfeCompleta = await client.nfe.get('ref-001', true);

console.log('Request:', nfeCompleta.requisicao_nota_fiscal);
console.log('Protocol:', nfeCompleta.protocolo_nota_fiscal);
```

### Cancel an NFe

```typescript
const cancelamento = await client.nfe.cancel('ref-001', {
  justificativa: 'Erro nos dados do destinatario',
});

console.log('Status:', cancelamento.status);
console.log('Cancellation XML:', cancelamento.caminho_xml_cancelamento);
```

### Issue a Correction Letter

```typescript
const cc = await client.nfe.cartaCorrecao('ref-001', {
  correcao: 'Correcao do endereco do destinatario: Rua Correta, 200',
});

console.log('Status:', cc.status);
console.log('CC-e number:', cc.numero_carta_correcao);
console.log('XML:', cc.caminho_xml_carta_correcao);
console.log('PDF:', cc.caminho_pdf_carta_correcao);
```

### Register an Interested Party

```typescript
const ator = await client.nfe.atorInteressado('ref-001', {
  cpf: '12345678901',
  permite_autorizacao_terceiros: true,
});

console.log('Status:', ator.status);
```

### Register a Delivery Failure

```typescript
const insucesso = await client.nfe.insucessoEntrega('ref-001', {
  data_tentativa_entrega: '2026-03-18',
  motivo_insucesso: 1,
  hash_tentativa_entrega: 'abc123hash',
  numero_tentativas: 2,
});

console.log('Status:', insucesso.status);

// Cancel the delivery failure if needed
const cancelInsucesso = await client.nfe.cancelInsucessoEntrega('ref-001');
console.log('Failure cancellation:', cancelInsucesso.status);
```

### Send NFe by Email

```typescript
await client.nfe.email('ref-001', {
  emails: ['cliente@exemplo.com', 'contabilidade@exemplo.com'],
});
```

### Void a Number Range

```typescript
const inutilizacao = await client.nfe.inutilizar({
  cnpj: '11222333000181',
  serie: 1,
  numero_inicial: 100,
  numero_final: 110,
  justificativa: 'Falha na sequencia de numeracao',
});

console.log('Status:', inutilizacao.status);
console.log('XML:', inutilizacao.caminho_xml);
```

### List Voided Ranges

```typescript
const lista = await client.nfe.inutilizacoes({
  cnpj: '11222333000181',
});

for (const item of lista) {
  console.log(`Serie ${item.serie}: ${item.numero_inicial}-${item.numero_final}`);
  console.log('Status:', item.status);
}
```

### Import NFe via XML

```typescript
const importada = await client.nfe.importar('ref-import-001', {
  xml: '<nfeProc>...full XML content...</nfeProc>',
});

console.log('Status:', importada.status);
```

### DANFE Preview

```typescript
import { writeFile } from 'fs/promises';

const danfe = await client.nfe.danfePreview({
  natureza_operacao: 'Venda de mercadoria',
  // ...remaining NFe fields
  items: [/* ... */],
});

await writeFile('danfe-preview.pdf', danfe.data);
console.log('Preview saved:', danfe.filename);
```

### Financial Reconciliation (ECONF)

```typescript
// Register ECONF
const econf = await client.nfe.econf('ref-001', {
  detalhes_pagamento: [
    {
      forma_pagamento: '01',
      valor_pagamento: 100.00,
      data_pagamento: '2026-03-18',
    },
  ],
});

console.log('Protocol:', econf.numero_protocolo);

// Retrieve ECONF
const econfConsulta = await client.nfe.getEconf('ref-001', econf.numero_protocolo!);
console.log('ECONF status:', econfConsulta.status);

// Cancel ECONF
const econfCancel = await client.nfe.cancelEconf('ref-001', econf.numero_protocolo!);
console.log('ECONF cancelled:', econfCancel.status);
```

### Generic Event

```typescript
const evento = await client.nfe.evento('ref-001', {
  tipo_evento: 'averbacao_exportacao',
  // ...event-specific fields
});

console.log('Status:', evento.status);
```

### Resend Webhook

```typescript
const webhook = await client.nfe.resendWebhook('ref-001');
console.log('Webhook resent');
```

## Main Types

### NfeCreateParams

```typescript
interface NfeCreateParams {
  natureza_operacao?: string;
  data_emissao?: string;
  tipo_documento?: string | number;
  local_destino?: string | number;
  finalidade_emissao?: string | number;
  consumidor_final?: string | number;
  presenca_comprador?: string | number;
  modalidade_frete?: string | number;
  cnpj_emitente?: string;
  cpf_emitente?: string;
  nome_destinatario?: string;
  cnpj_destinatario?: string;
  cpf_destinatario?: string;
  items: NfeItem[];
  formas_pagamento?: NfeFormaPagamento[];
  notas_referenciadas?: NfeNotaReferenciada[];
  // ...additional issuer, recipient, and totals fields
}
```

### NfeResponse

```typescript
interface NfeResponse {
  ref?: string;
  status?: NfeStatus;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave_nfe?: string;
  numero?: string | number;
  serie?: string | number;
  caminho_xml_nota_fiscal?: string;
  caminho_danfe?: string;
  caminho_xml_carta_correcao?: string;
  caminho_pdf_carta_correcao?: string;
  caminho_xml_cancelamento?: string;
  qrcode_url?: string;
  url_consulta_nf?: string;
  requisicao_nota_fiscal?: unknown;  // available when completa=true
  protocolo_nota_fiscal?: unknown;   // available when completa=true
}
```

### NfeCancelParams

```typescript
interface NfeCancelParams {
  justificativa: string;
}
```

### NfeCartaCorrecaoParams

```typescript
interface NfeCartaCorrecaoParams {
  correcao: string;
  data_evento?: string;
}
```

### NfeInutilizacaoParams

```typescript
interface NfeInutilizacaoParams {
  cnpj: string;
  serie: string | number;
  numero_inicial: string | number;
  numero_final: string | number;
  justificativa: string;
}
```

## Important Notes

1. **Asynchronous processing**: After `create()`, poll with `get()` until the final status. Possible statuses include `processando_autorizacao`, `autorizado`, and `erro_autorizacao`.
2. **Correction Letter (Carta de Correcao)**: Can be issued up to 30 times for the same NFe. Cannot correct values, tax rates, or data that affects tax calculations.
3. **Cancellation**: Must be performed within the legal deadline (generally 24 hours after authorization). Requires a justificativa (justification) with a minimum of 15 characters.
4. **Number Voiding (Inutilizacao)**: Used to inform SEFAZ about number sequences that were skipped and will not be used.
5. **DANFE Preview**: Returns a `BinaryResponse` with the PDF data. Useful for previewing the document before issuance.
6. **Webhook**: Use `resendWebhook()` if the notification callback was not received by your system.

## Related

- [NFCe](./nfce.md) - Consumer Electronic Invoice
- [NFSe](./nfse.md) - Electronic Service Invoice
