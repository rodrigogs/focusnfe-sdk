# NFSe Nacional (National Electronic Service Invoice)

The NFSe Nacional service (`client.nfseNacional`) manages the issuance of Electronic Service Invoices through the national standardized system (NFS-e Nacional), implemented by the NFS-e Management Committee (CGNFS-e) in partnership with the Brazilian Federal Revenue Service (Receita Federal).

## Key Concepts

**Difference from Municipal NFSe**

The [NFSe](./nfse.md) service works with each municipality's individual system, where fields and behaviors vary by city. The NFSe Nacional uses a federally standardized system with a unified layout for all participating municipalities. The NFSe Nacional tends to be simpler to integrate, as it does not depend on the particularities of each municipality.

**Identification by Reference (ref)**

Like other fiscal documents, the NFSe Nacional uses a unique reference (`ref`) to identify each document in the Focus NFe system.

**Asynchronous Processing**

Issuance is asynchronous. Use `get()` to check the status until it becomes `autorizado` (authorized) or `erro_autorizacao` (authorization error).

**Status (`NfseNacionalStatus`)** Possible statuses are: `processando_autorizacao`, `autorizado`, `cancelado`, `erro_autorizacao`.

**Simplified Structure**

Unlike the municipal NFSe, the NFSe Nacional uses a flatter structure without nested provider, client, and service objects. Data is provided directly as fields in the request.

## Method Reference

| Method | Description |
|--------|-------------|
| `create(ref, params)` | Create (issue) an NFSe Nacional with the given reference |
| `get(ref, completa?)` | Retrieve an NFSe Nacional by reference |
| `cancel(ref, params)` | Cancel an authorized NFSe Nacional |
| `resendWebhook(ref)` | Resend the NFSe Nacional webhook |

## Examples

### Create an NFSe Nacional

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk';

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'homologation',
});

const nfse = await client.nfseNacional.create('ref-nfsen-001', {
  data_emissao: '2026-03-18T10:00:00-03:00',
  codigo_municipio_emissora: '3550308',
  cnpj_prestador: '11222333000181',
  inscricao_municipal_prestador: '12345',
  cnpj_tomador: '44555666000199',
  razao_social_tomador: 'Empresa Tomadora Ltda',
  codigo_municipio_tomador: '3550308',
  email_tomador: 'contato@tomador.com',
  logradouro_tomador: 'Rua do Tomador',
  numero_tomador: '200',
  bairro_tomador: 'Centro',
  cep_tomador: '01001000',
  descricao_servico: 'Consultoria em tecnologia da informacao',
  valor_servico: 3000.00,
  codigo_tributacao_nacional_iss: '010101',
});

console.log('Status:', nfse.status);
console.log('Ref:', nfse.ref);
```

### Retrieve an NFSe Nacional

```typescript
// Simple query
const nfse = await client.nfseNacional.get('ref-nfsen-001');

console.log('Status:', nfse.status);
console.log('Number:', nfse.numero);
console.log('Verification code:', nfse.codigo_verificacao);
console.log('URL:', nfse.url);
console.log('DANFSE:', nfse.url_danfse);
console.log('XML:', nfse.caminho_xml_nota_fiscal);

// Full query
const nfseCompleta = await client.nfseNacional.get('ref-nfsen-001', true);
```

### Cancel an NFSe Nacional

```typescript
const cancelamento = await client.nfseNacional.cancel('ref-nfsen-001', {
  justificativa: 'Servico cancelado por acordo entre as partes',
});

console.log('Status:', cancelamento.status);

// Check for errors
if (cancelamento.erros) {
  for (const erro of cancelamento.erros) {
    console.log(`Error ${erro.codigo}: ${erro.mensagem}`);
  }
}
```

### Resend Webhook

```typescript
await client.nfseNacional.resendWebhook('ref-nfsen-001');
console.log('Webhook resent');
```

## Main Types

### NfseNacionalCreateParams

```typescript
interface NfseNacionalCreateParams {
  data_emissao: string;
  data_competencia?: string;
  codigo_municipio_emissora: string | number;
  cnpj_prestador: string;
  inscricao_municipal_prestador?: string;
  codigo_opcao_simples_nacional?: string | number;
  regime_especial_tributacao?: string | number;
  cpf_tomador?: string;
  cnpj_tomador?: string;
  razao_social_tomador?: string;
  codigo_municipio_tomador?: string | number;
  cep_tomador?: string;
  logradouro_tomador?: string;
  numero_tomador?: string;
  complemento_tomador?: string;
  bairro_tomador?: string;
  telefone_tomador?: string;
  email_tomador?: string;
  codigo_municipio_prestacao?: string | number;
  codigo_tributacao_nacional_iss?: string;
  descricao_servico: string;
  valor_servico: number | string;
  tributacao_iss?: string | number;
  tipo_retencao_iss?: string | number;
}
```

### NfseNacionalResponse

```typescript
interface NfseNacionalResponse {
  cnpj_prestador?: string;
  ref?: string;
  status: NfseNacionalStatus;
  numero?: string;
  numero_rps?: string;
  serie_rps?: string;
  tipo_rps?: string;
  codigo_verificacao?: string;
  data_emissao?: string;
  url?: string;
  url_danfse?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_xml_cancelamento?: string;
  erros?: NfseNacionalResponseError[];
}
```

### NfseNacionalCancelParams

```typescript
interface NfseNacionalCancelParams {
  justificativa: string;
}
```

## Important Notes

1. **Asynchronous processing**: After `create()`, check with `get()` to verify the status until completion.
2. **Participating municipalities**: Not all municipalities have adopted the national system. Verify that the provider's municipality is compatible before using this service. Otherwise, use the municipal [NFSe](./nfse.md) service.
3. **National tax code**: The `codigo_tributacao_nacional_iss` field follows the national system's service table, which may differ from municipal codes.
4. **Simplified structure**: Client data is provided directly as fields in the main object (e.g., `cnpj_tomador`, `razao_social_tomador`), unlike the municipal NFSe which uses nested objects.
5. **Errors**: The response may contain the `erros` array with details about issuance or cancellation failures.
6. **Webhook**: Use `resendWebhook()` if the callback was not received by your system.

## Related

- [NFSe](./nfse.md) - Municipal Electronic Service Invoice
- [NFe](./nfe.md) - Electronic Product Invoice
