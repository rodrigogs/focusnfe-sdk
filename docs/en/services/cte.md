# CTe (Conhecimento de Transporte Eletronico)

The CTe service (`client.cte`) manages the lifecycle of Electronic Transport Documents (model 57), used to document freight transport services. The service also supports the issuance of CTe OS (Other Services) for passenger transport, valuables, and excess baggage.

## Key Concepts

**CTe vs CTe OS**

- **CTe (Transport Document)**: Documents interstate and intermunicipal freight transport. Uses the `create()` method.
- **CTe OS (Other Services)**: Documents the transport of passengers, valuables, and excess baggage. Uses the `createOs()` method. Both share the same query and event operations.

**Identification by Reference (ref)**

All operations use a unique reference (`ref`). The same `ref` identifies both CTe and CTe OS for queries and events.

**Asynchronous Processing**

CTe issuance is asynchronous. Use `get()` to check the status until it becomes `autorizado` (authorized) or `erro_autorizacao` (authorization error).

**Status (`CteStatus`)**

Possible statuses are: `processando_autorizacao`, `autorizado`, `cancelado`, `erro_autorizacao`.

**Transport Modals**

The CTe supports several transport modals: road, air, waterway, railway, pipeline, and multimodal. Each modal has specific fields provided through the `modal_rodoviario`, `modal_aereo`, etc. objects.

**Structured Correction Letter**

Unlike the NFe (which uses free text), the CTe correction letter is structured: you specify the corrected group, field, and value individually.

## Method Reference

| Method | Description |
|--------|-------------|
| `create(ref, params)` | Create (issue) a CTe with the given reference |
| `createOs(ref, params)` | Create (issue) a CTe OS with the given reference |
| `get(ref, completa?)` | Retrieve a CTe/CTe OS by reference |
| `cancel(ref, params)` | Cancel an authorized CTe/CTe OS |
| `cartaCorrecao(ref, params)` | Issue a structured Correction Letter (CC-e) |
| `desacordo(ref, params)` | Register a service disagreement event |
| `registroMultimodal(ref, params)` | Register a multimodal transport event |
| `dadosGtv(ref, params)` | Register GTV (Valuables Transport Guide) data |
| `resendWebhook(ref)` | Resend the CTe webhook |

## Examples

### Create a CTe

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk';

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'homologation',
});

const cte = await client.cte.create('ref-cte-001', {
  cfop: '6353',
  natureza_operacao: 'Prestacao de servico de transporte',
  data_emissao: '2026-03-18T10:00:00-03:00',
  tipo_documento: 0,
  modal: '01',
  tipo_servico: 0,
  cnpj_emitente: '11222333000181',
  inscricao_estadual_emitente: '123456789',
  nome_emitente: 'Transportadora Exemplo Ltda',
  logradouro_emitente: 'Rua da Transportadora',
  numero_emitente: '1000',
  bairro_emitente: 'Industrial',
  codigo_municipio_emitente: '3550308',
  municipio_emitente: 'Sao Paulo',
  uf_emitente: 'SP',
  cep_emitente: '01001000',
  cnpj_remetente: '55666777000188',
  nome_remetente: 'Empresa Remetente Ltda',
  logradouro_remetente: 'Rua do Remetente',
  numero_remetente: '500',
  bairro_remetente: 'Centro',
  codigo_municipio_remetente: '3550308',
  municipio_remetente: 'Sao Paulo',
  uf_remetente: 'SP',
  cep_remetente: '01001000',
  cnpj_destinatario: '88999000000111',
  nome_destinatario: 'Empresa Destinataria Ltda',
  logradouro_destinatario: 'Rua do Destinatario',
  numero_destinatario: '300',
  bairro_destinatario: 'Centro',
  codigo_municipio_destinatario: '3304557',
  municipio_destinatario: 'Rio de Janeiro',
  uf_destinatario: 'RJ',
  cep_destinatario: '20040020',
  valor_total: '1500.00',
  valor_receber: '1500.00',
  valor_total_carga: '50000.00',
  produto_predominante: 'Pecas automotivas',
  icms_situacao_tributaria: '00',
  icms_base_calculo: '1500.00',
  icms_aliquota: '12.00',
  icms_valor: '180.00',
  nfes: [
    { chave_nfe: '35260311222333000181550010000001001000000001' },
  ],
  quantidades: [
    {
      codigo_unidade_medida: '01',
      tipo_medida: 'PESO BRUTO',
      quantidade: '500.00',
    },
  ],
  codigo_municipio_envio: '3550308',
  municipio_envio: 'Sao Paulo',
  uf_envio: 'SP',
  codigo_municipio_inicio: '3550308',
  municipio_inicio: 'Sao Paulo',
  uf_inicio: 'SP',
  codigo_municipio_fim: '3304557',
  municipio_fim: 'Rio de Janeiro',
  uf_fim: 'RJ',
  tomador: '0',
});

console.log('Status:', cte.status);
console.log('Ref:', cte.ref);
```

### Create a CTe OS

```typescript
const cteOs = await client.cte.createOs('ref-cteos-001', {
  cfop: '6353',
  natureza_operacao: 'Prestacao de servico de transporte de pessoas',
  data_emissao: '2026-03-18T10:00:00-03:00',
  tipo_documento: 0,
  modal: '01',
  tipo_servico: 6,
  cnpj_emitente: '11222333000181',
  inscricao_estadual_emitente: '123456789',
  nome_emitente: 'Transportadora Exemplo Ltda',
  logradouro_emitente: 'Rua da Transportadora',
  numero_emitente: '1000',
  bairro_emitente: 'Industrial',
  codigo_municipio_emitente: '3550308',
  municipio_emitente: 'Sao Paulo',
  uf_emitente: 'SP',
  cep_emitente: '01001000',
  cnpj_tomador: '44555666000199',
  nome_tomador: 'Empresa Tomadora Ltda',
  logradouro_tomador: 'Rua do Tomador',
  numero_tomador: '200',
  bairro_tomador: 'Centro',
  codigo_municipio_tomador: '3550308',
  municipio_tomador: 'Sao Paulo',
  uf_tomador: 'SP',
  cep_tomador: '01001000',
  valor_total: '800.00',
  valor_receber: '800.00',
  icms_situacao_tributaria: '00',
  icms_base_calculo: '800.00',
  icms_aliquota: '12.00',
  icms_valor: '96.00',
  codigo_municipio_envio: '3550308',
  municipio_envio: 'Sao Paulo',
  uf_envio: 'SP',
  codigo_municipio_inicio: '3550308',
  municipio_inicio: 'Sao Paulo',
  uf_inicio: 'SP',
  codigo_municipio_fim: '3304557',
  municipio_fim: 'Rio de Janeiro',
  uf_fim: 'RJ',
});

console.log('Status:', cteOs.status);
console.log('Ref:', cteOs.ref);
```

### Retrieve a CTe

```typescript
// Simple query
const cte = await client.cte.get('ref-cte-001');

console.log('Status:', cte.status);
console.log('Key:', cte.chave);
console.log('Number:', cte.numero);
console.log('DACTe:', cte.caminho_dacte);
console.log('XML:', cte.caminho_xml);

// Full query (includes request and protocol)
const cteCompleta = await client.cte.get('ref-cte-001', true);

console.log('Request:', cteCompleta.requisicao);
console.log('Protocol:', cteCompleta.protocolo);
```

### Cancel a CTe

```typescript
const cancelamento = await client.cte.cancel('ref-cte-001', {
  justificativa: 'Transporte nao realizado por indisponibilidade do veiculo',
});

console.log('Status:', cancelamento.status);
console.log('SEFAZ status:', cancelamento.status_sefaz);
console.log('Message:', cancelamento.mensagem_sefaz);
console.log('XML:', cancelamento.caminho_xml);
```

### Issue a Correction Letter

```typescript
const cc = await client.cte.cartaCorrecao('ref-cte-001', {
  grupo_corrigido: 'ide',
  campo_corrigido: 'natOp',
  valor_corrigido: 'Prestacao de servico de transporte interestadual',
});

console.log('Status:', cc.status);
console.log('CC-e number:', cc.numero_carta_correcao);
console.log('XML:', cc.caminho_xml);
```

### Register a Service Disagreement

```typescript
const desacordo = await client.cte.desacordo('ref-cte-001', {
  observacoes: 'Mercadoria entregue com avarias nao previstas no contrato',
});

console.log('Status:', desacordo.status);
console.log('XML:', desacordo.caminho_xml);
```

### Register a Multimodal Transport Event

```typescript
const multimodal = await client.cte.registroMultimodal('ref-cte-001', {
  // multimodal registration-specific fields
});

console.log('Status:', multimodal.status);
```

### Register GTV Data

```typescript
const gtv = await client.cte.dadosGtv('ref-cte-001', {
  // GTV-specific fields
});

console.log('Status:', gtv.status);
```

### Resend Webhook

```typescript
const webhook = await client.cte.resendWebhook('ref-cte-001');
console.log('Status:', webhook.status);
```

## Main Types

### CteCreateParams

```typescript
interface CteCreateParams {
  cfop: string;
  natureza_operacao: string;
  data_emissao: string;
  tipo_documento: number;
  modal: string;
  tipo_servico?: number;
  cnpj_emitente: string;
  inscricao_estadual_emitente?: string;
  cnpj_remetente?: string;
  cpf_remetente?: string;
  nome_remetente?: string;
  cnpj_destinatario?: string;
  cpf_destinatario?: string;
  nome_destinatario?: string;
  valor_total: string;
  valor_receber?: string;
  nfes?: CteNfe[];
  quantidades?: CteQuantidade[];
  duplicatas?: CteDuplicata[];
  seguros_carga?: CteSeguroCarga[];
  modal_rodoviario?: Record<string, unknown>;
  modal_aereo?: Record<string, unknown>;
  modal_aquaviario?: Record<string, unknown>;
  modal_ferroviario?: Record<string, unknown>;
  modal_dutoviario?: Record<string, unknown>;
  modal_multimodal?: Record<string, unknown>;
  // ...additional issuer, sender, and recipient fields
}
```

### CteOsCreateParams

```typescript
interface CteOsCreateParams {
  cfop: string;
  natureza_operacao: string;
  data_emissao: string;
  tipo_documento: number;
  modal: string;
  tipo_servico?: number;
  cnpj_emitente: string;
  cnpj_tomador?: string;
  cpf_tomador?: string;
  nome_tomador?: string;
  valor_total: string;
  valor_receber?: string;
  descricao_servico?: string;
  // ...additional issuer and client fields
}
```

### CteResponse

```typescript
interface CteResponse {
  cnpj_emitente: string;
  ref: string;
  status: CteStatus;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave?: string;
  numero?: string;
  serie?: string;
  modelo?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_dacte?: string;
  caminho_xml?: string;
  caminho_xml_carta_correcao?: string;
  caminho_xml_cancelamento?: string;
  requisicao?: Record<string, unknown>;       // available when completa=true
  protocolo?: Record<string, unknown>;         // available when completa=true
}
```

### CteCancelParams

```typescript
interface CteCancelParams {
  justificativa: string;
}
```

### CteCartaCorrecaoParams

```typescript
interface CteCartaCorrecaoParams {
  grupo_corrigido?: string;
  campo_corrigido: string;
  valor_corrigido: string;
  numero_item_grupo_corrigido?: number;
  campo_api?: number;
}
```

### CtePrestacaoDesacordoParams

```typescript
interface CtePrestacaoDesacordoParams {
  observacoes: string;
}
```

## Important Notes

1. **Asynchronous processing**: After `create()` or `createOs()`, poll with `get()` until the final status.
2. **Structured Correction Letter**: Unlike the NFe, you specify the corrected group, field, and value individually. Each call corrects one field; to correct multiple fields, make separate calls (the latest one replaces all previous corrections).
3. **Cancellation**: Must be performed within the legal deadline. Requires a justificativa (justification) with a minimum of 15 characters.
4. **Service disagreement (desacordo)**: The disagreement event is registered by the service client (tomador) when they disagree with the service described in the CTe.
5. **Modals**: Provide only the modal object corresponding to the `modal` field (e.g., `modal_rodoviario` for modal `01`).
6. **Shared reference**: The same `ref` is used for both CTe and CTe OS in query and event operations.
7. **Webhook**: Use `resendWebhook()` if the callback was not received by your system.

## Related

- [MDFe](./mdfe.md) - Electronic Fiscal Document Manifest
- [NFe](./nfe.md) - Electronic Product Invoice
