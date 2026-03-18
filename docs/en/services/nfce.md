# NFCe (Nota Fiscal ao Consumidor Eletronica)

The NFCe service (`client.nfce`) manages the lifecycle of Consumer Electronic Invoices (model 65), used for retail point-of-sale operations. The NFCe replaces the traditional fiscal coupon issued by ECF (Electronic Fiscal Printer).

## Key Concepts

**Synchronous Processing**

Unlike the NFe, the NFCe is processed synchronously. The `create()` response already returns the final authorization status (`autorizado` or `erro_autorizacao`), with no need for polling.

**Identification by Reference (ref)**

Like the NFe, all operations use a unique reference (`ref`) that you define when creating the document.

**Offline Contingency**

The NFCe supports offline contingency issuance. When SEFAZ is unavailable, the document can be issued locally and transmitted later. The `contingencia_offline` and `contingencia_offline_efetivada` fields in the response indicate the contingency state.

**Status (`NfceStatus`)** Possible statuses are: `processando_autorizacao`, `autorizado`, `cancelado`, `erro_autorizacao`.

**No Webhook Resend**

The NFCe does not have a `resendWebhook()` method, since processing is synchronous and the response is immediate.

## Method Reference

| Method | Description |
|--------|-------------|
| `create(ref, params)` | Create (issue) an NFCe with the given reference |
| `get(ref, completa?)` | Retrieve an NFCe by reference |
| `cancel(ref, params)` | Cancel an authorized NFCe |
| `email(ref, params)` | Send the NFCe by email to recipients |
| `inutilizar(params)` | Void a number range (inutilizacao) |
| `inutilizacoes(params)` | List voided number ranges |
| `econf(ref, params)` | Register a financial reconciliation event (ECONF) |
| `getEconf(ref, protocolo)` | Retrieve an ECONF event by protocol |
| `cancelEconf(ref, protocolo)` | Cancel an ECONF event |

## Examples

### Create an NFCe

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk';

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'homologation',
});

const nfce = await client.nfce.create('ref-nfce-001', {
  natureza_operacao: 'Venda ao consumidor final',
  data_emissao: '2026-03-18T14:30:00-03:00',
  presenca_comprador: 1,
  cnpj_emitente: '11222333000181',
  nome_emitente: 'Loja Exemplo Ltda',
  inscricao_estadual_emitente: '123456789',
  logradouro_emitente: 'Rua do Comercio',
  numero_emitente: '500',
  bairro_emitente: 'Centro',
  municipio_emitente: 'Sao Paulo',
  uf_emitente: 'SP',
  cep_emitente: '01001000',
  items: [
    {
      numero_item: 1,
      codigo_produto: 'PROD001',
      descricao: 'Camiseta algodao',
      cfop: '5102',
      codigo_ncm: '61091000',
      quantidade_comercial: 2,
      valor_unitario_comercial: 49.90,
      unidade_comercial: 'UN',
      icms_origem: 0,
      icms_situacao_tributaria: '102',
    },
  ],
  formas_pagamento: [
    {
      forma_pagamento: '01',
      valor_pagamento: 99.80,
    },
  ],
});

// Synchronous response - final status is already available
console.log('Status:', nfce.status);
console.log('Key:', nfce.chave_nfe);
console.log('QR Code:', nfce.qrcode_url);
console.log('DANFE:', nfce.caminho_danfe);
```

### Retrieve an NFCe

```typescript
// Simple query
const nfce = await client.nfce.get('ref-nfce-001');

console.log('Status:', nfce.status);
console.log('Key:', nfce.chave_nfe);
console.log('Number:', nfce.numero);

// Full query (includes request and protocol)
const nfceCompleta = await client.nfce.get('ref-nfce-001', true);

console.log('Request:', nfceCompleta.requisicao_nota_fiscal);
console.log('Protocol:', nfceCompleta.protocolo_nota_fiscal);
```

### Cancel an NFCe

```typescript
const cancelamento = await client.nfce.cancel('ref-nfce-001', {
  justificativa: 'Venda cancelada a pedido do cliente',
});

console.log('Status:', cancelamento.status);
console.log('Cancellation XML:', cancelamento.caminho_xml_cancelamento);
```

### Send NFCe by Email

```typescript
await client.nfce.email('ref-nfce-001', {
  emails: ['cliente@exemplo.com'],
});
```

### Void a Number Range

```typescript
const inutilizacao = await client.nfce.inutilizar({
  cnpj: '11222333000181',
  serie: 1,
  numero_inicial: 50,
  numero_final: 55,
  justificativa: 'Numeracao nao utilizada por falha no sistema PDV',
});

console.log('Status:', inutilizacao.status);
console.log('XML:', inutilizacao.caminho_xml);
```

### List Voided Ranges

```typescript
const lista = await client.nfce.inutilizacoes({
  cnpj: '11222333000181',
});

for (const item of lista) {
  console.log(`Serie ${item.serie}: ${item.numero_inicial}-${item.numero_final}`);
  console.log('Status:', item.status);
}
```

### Financial Reconciliation (ECONF)

```typescript
// Register ECONF
const econf = await client.nfce.econf('ref-nfce-001', {
  detalhes_pagamento: [
    {
      forma_pagamento: '03',
      valor_pagamento: 99.80,
      data_pagamento: '2026-03-18',
    },
  ],
});

console.log('Protocol:', econf.numero_protocolo);

// Retrieve ECONF
const econfConsulta = await client.nfce.getEconf('ref-nfce-001', econf.numero_protocolo!);
console.log('ECONF status:', econfConsulta.status);

// Cancel ECONF
const econfCancel = await client.nfce.cancelEconf('ref-nfce-001', econf.numero_protocolo!);
console.log('ECONF cancelled:', econfCancel.status);
```

## Main Types

### NfceCreateParams

```typescript
interface NfceCreateParams {
  natureza_operacao?: string;
  data_emissao?: string;
  presenca_comprador: string | number;
  modalidade_frete?: string | number;
  cnpj_emitente: string;
  nome_emitente?: string;
  inscricao_estadual_emitente?: string;
  nome_destinatario?: string;
  cpf_destinatario?: string;
  cnpj_destinatario?: string;
  items: NfceItem[];
  formas_pagamento: NfceFormaPagamento[];
  numero?: string | number;
  serie?: string | number;
  forma_emissao?: string;
  codigo_unico?: string;
  // ...additional issuer, recipient, and totals fields
}
```

### NfceResponse

```typescript
interface NfceResponse {
  ref?: string;
  status?: NfceStatus;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave_nfe?: string;
  numero?: string | number;
  serie?: string | number;
  caminho_xml_nota_fiscal?: string;
  caminho_danfe?: string;
  caminho_xml_cancelamento?: string;
  qrcode_url?: string;
  url_consulta_nf?: string;
  contingencia_offline?: boolean;
  contingencia_offline_efetivada?: boolean;
}
```

### NfceCancelParams

```typescript
interface NfceCancelParams {
  justificativa: string;
}
```

### NfceInutilizacaoParams

```typescript
interface NfceInutilizacaoParams {
  cnpj: string;
  serie: string | number;
  numero_inicial: string | number;
  numero_final: string | number;
  justificativa: string;
}
```

## Important Notes

1. **Synchronous processing**: The `create()` response already contains the final status. No polling is needed as with NFe.
2. **Offline contingency**: The `contingencia_offline` and `contingencia_offline_efetivada` fields indicate whether the document was issued in contingency mode and whether it has been confirmed with SEFAZ.
3. **Cancellation**: Must be performed within the legal deadline. Requires a justificativa (justification) with a minimum of 15 characters.
4. **Required payment methods**: Unlike the NFe, the `formas_pagamento` field is required for NFCe.
5. **Buyer presence**: The `presenca_comprador` field is required and indicates the service type (1 = in-person, 4 = NFCe delivery, etc.).
6. **No resendWebhook**: Since processing is synchronous, there is no method for webhook resending.

## Related

- [NFe](./nfe.md) - Electronic Invoice (model 55)
- [NFSe](./nfse.md) - Electronic Service Invoice
