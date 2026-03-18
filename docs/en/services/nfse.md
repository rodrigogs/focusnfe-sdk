# NFSe (Nota Fiscal de Servico Eletronica)

The NFSe service (`client.nfse`) manages the issuance of municipal Electronic Service Invoices. The NFSe is used by service providers to document service delivery and is processed by each municipality's local government.

## Key Concepts

**Municipal NFSe**

This service works with the municipal NFSe model, where each city has its own issuance system. The Focus NFe API abstracts the differences between municipal systems, providing a unified interface. For the national standardized model, use the [NFSe Nacional](./nfse-nacional.md) service.

**Identification by Reference (ref)**

All operations use a unique reference (`ref`) that you define when creating the document. This reference identifies the NFSe in the Focus NFe system.

**Asynchronous Processing**

NFSe issuance is asynchronous, as it depends on communication with the municipality's web service. Use `get()` to check the status until it becomes `autorizado` (authorized) or `erro_autorizacao` (authorization error).

**Status (`NfseStatus`)** Possible statuses are: `processando_autorizacao`, `autorizado`, `cancelado`, `erro_autorizacao`.

**Provider/Client/Service Structure**

The NFSe requires data about the provider (prestador -- who performs the service), the client (tomador -- who contracts the service), and the service itself (servico), organized in separate objects.

## Method Reference

| Method | Description |
|--------|-------------|
| `create(ref, params)` | Create (issue) an NFSe with the given reference |
| `get(ref, completa?)` | Retrieve an NFSe by reference |
| `cancel(ref, params)` | Cancel an authorized NFSe |
| `email(ref, params)` | Send the NFSe by email to recipients |
| `resendWebhook(ref)` | Resend the NFSe webhook |

## Examples

### Create an NFSe

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk';

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'homologation',
});

const nfse = await client.nfse.create('ref-nfse-001', {
  data_emissao: '2026-03-18T10:00:00-03:00',
  prestador: {
    cnpj: '11222333000181',
    inscricao_municipal: '12345',
    codigo_municipio: '3550308',
  },
  tomador: {
    cnpj: '44555666000199',
    razao_social: 'Empresa Tomadora Ltda',
    email: 'contato@tomador.com',
    endereco: {
      logradouro: 'Rua do Tomador',
      numero: '200',
      bairro: 'Centro',
      codigo_municipio: '3550308',
      uf: 'SP',
      cep: '01001000',
    },
  },
  servico: {
    valor_servicos: 1500.00,
    iss_retido: false,
    item_lista_servico: '1.01',
    discriminacao: 'Desenvolvimento de software sob encomenda',
    codigo_municipio: '3550308',
    aliquota: 2.0,
  },
});

console.log('Status:', nfse.status);
console.log('Ref:', nfse.ref);
```

### Retrieve an NFSe

```typescript
// Simple query
const nfse = await client.nfse.get('ref-nfse-001');

console.log('Status:', nfse.status);
console.log('Number:', nfse.numero);
console.log('Verification code:', nfse.codigo_verificacao);
console.log('URL:', nfse.url);
console.log('DANFSE:', nfse.url_danfse);
console.log('XML:', nfse.caminho_xml_nota_fiscal);

// Full query
const nfseCompleta = await client.nfse.get('ref-nfse-001', true);
```

### Cancel an NFSe

```typescript
const cancelamento = await client.nfse.cancel('ref-nfse-001', {
  justificativa: 'Servico nao prestado conforme acordado',
});

console.log('Status:', cancelamento.status);

// Check for errors returned by the municipality
if (cancelamento.erros) {
  for (const erro of cancelamento.erros) {
    console.log(`Error ${erro.codigo}: ${erro.mensagem}`);
  }
}
```

### Send NFSe by Email

```typescript
await client.nfse.email('ref-nfse-001', {
  emails: ['tomador@exemplo.com', 'contabilidade@exemplo.com'],
});
```

### Resend Webhook

```typescript
await client.nfse.resendWebhook('ref-nfse-001');
console.log('Webhook resent');
```

## Main Types

### NfseCreateParams

```typescript
interface NfseCreateParams {
  data_emissao: string;
  natureza_operacao?: string;
  regime_especial_tributacao?: string;
  optante_simples_nacional?: boolean | string;
  incentivador_cultural?: boolean | string;
  prestador: NfsePrestador;
  tomador: NfseTomador;
  servico: NfseServico;
  intermediario?: NfseIntermediario;
}
```

### NfsePrestador

```typescript
interface NfsePrestador {
  cnpj: string;
  inscricao_municipal: string;
  codigo_municipio: string;
}
```

### NfseServico

```typescript
interface NfseServico {
  valor_servicos: number;
  iss_retido: boolean | string;
  item_lista_servico: string;
  discriminacao: string;
  valor_deducoes?: number;
  valor_pis?: number;
  valor_cofins?: number;
  valor_inss?: number;
  valor_ir?: number;
  valor_csll?: number;
  valor_iss?: number;
  valor_iss_retido?: number;
  aliquota?: number;
  base_calculo?: number;
  codigo_cnae?: string;
  codigo_municipio?: string;
  codigo_tributario_municipio?: string;
}
```

### NfseResponse

```typescript
interface NfseResponse {
  cnpj_prestador?: string;
  ref?: string;
  status: NfseStatus;
  numero?: string;
  numero_rps?: string;
  serie_rps?: string;
  codigo_verificacao?: string;
  data_emissao?: string;
  url?: string;
  url_danfse?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_xml_cancelamento?: string;
  erros?: NfseResponseError[];
}
```

### NfseCancelParams

```typescript
interface NfseCancelParams {
  justificativa: string;
}
```

## Important Notes

1. **Asynchronous processing**: After `create()`, check with `get()` to verify the status. Response times vary depending on the municipality.
2. **Municipal errors**: The response may include the `erros` array with municipality-specific codes and messages, even in error status cases.
3. **Municipal registration required**: The provider must supply the inscricao_municipal (municipal registration) for NFSe issuance.
4. **ISS withholding**: The `iss_retido` field indicates whether ISS (service tax) will be withheld by the client. When `true`, provide `valor_iss_retido`.
5. **Municipality code**: Use the IBGE municipality code (7 digits).
6. **Service list item**: Use the code according to Complementary Law 116/2003.
7. **Webhook**: Use `resendWebhook()` if the callback was not received by your system.

## Related

- [NFSe Nacional](./nfse-nacional.md) - National standardized NFSe model
- [NFe](./nfe.md) - Electronic Product Invoice
