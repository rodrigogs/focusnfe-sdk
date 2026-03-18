# MDFe (Manifesto Eletronico de Documentos Fiscais)

The MDFe service (`client.mdfe`) manages the lifecycle of Electronic Fiscal Document Manifests (model 58), used to link fiscal documents (NFe and CTe) to a cargo transport vehicle. The MDFe is mandatory for interstate and intermunicipal operations.

## Key Concepts

**Purpose of MDFe**

The MDFe acts as a manifest that groups fiscal documents (NFe and/or CTe) being transported in the same vehicle. It is required for both carriers and NFe issuers who perform their own transport.

**Identification by Reference (ref)**

All operations use a unique reference (`ref`) that you define when creating the manifest.

**Asynchronous Processing**

MDFe issuance is asynchronous. Use `get()` to check the status until it becomes `autorizado` (authorized) or `erro_autorizacao` (authorization error).

**Status (`MdfeStatus`)** Possible statuses are: `processando_autorizacao`, `autorizado`, `cancelado`, `encerrado`, `erro_autorizacao`.

**Contingency**

The MDFe can be issued in contingency mode when SEFAZ is unavailable. Pass `{ contingencia: true }` as the third parameter of `create()`.

**Mandatory Closure**

Every authorized MDFe must be closed (encerrado) at the end of the transport operation. The closure informs SEFAZ that the transport has been completed.

**Post-Authorization Additions**

After authorization, you can add new drivers and fiscal documents to the manifest without needing to cancel and reissue.

## Method Reference

| Method | Description |
|--------|-------------|
| `create(ref, params, options?)` | Create (issue) an MDFe. Accepts `{ contingencia: true }` in options |
| `get(ref, completa?)` | Retrieve an MDFe by reference |
| `cancel(ref, params)` | Cancel an authorized MDFe |
| `incluirCondutor(ref, params)` | Add a driver to the authorized MDFe |
| `incluirDfe(ref, params)` | Add fiscal documents to the authorized MDFe |
| `encerrar(ref, params)` | Close the MDFe (mandatory at the end of transport) |

## Examples

### Create an MDFe

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk';

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'homologation',
});

const mdfe = await client.mdfe.create('ref-mdfe-001', {
  serie: '1',
  modo_transporte: '1',
  data_emissao: '2026-03-18T08:00:00-03:00',
  uf_inicio: 'SP',
  uf_fim: 'RJ',
  cnpj_emitente: '11222333000181',
  inscricao_estadual_emitente: '123456789',
  municipios_carregamento: [
    { codigo: '3550308', nome: 'Sao Paulo' },
  ],
  municipios_descarregamento: [
    {
      codigo: '3304557',
      nome: 'Rio de Janeiro',
      notas_fiscais: [
        { chave_nfe: '35260311222333000181550010000001001000000001' },
      ],
    },
  ],
  percursos: [
    { uf_percurso: 'RJ' },
  ],
  quantidade_total_nfe: 1,
  valor_total_carga: '50000.00',
  codigo_unidade_medida_peso_bruto: '01',
  peso_bruto: '500.00',
  modal_rodoviario: {
    rntrc: '12345678',
    placa: 'ABC1D23',
    uf_licenciamento: 'SP',
    tipo_rodado: '02',
    tipo_carroceria: '00',
    condutor: [
      { nome: 'Joao Motorista', cpf: '12345678901' },
    ],
  },
});

console.log('Status:', mdfe.status);
console.log('Ref:', mdfe.ref);
```

### Create an MDFe in Contingency

```typescript
const mdfe = await client.mdfe.create('ref-mdfe-002', {
  serie: '1',
  modo_transporte: '1',
  data_emissao: '2026-03-18T08:00:00-03:00',
  uf_inicio: 'SP',
  uf_fim: 'MG',
  cnpj_emitente: '11222333000181',
  inscricao_estadual_emitente: '123456789',
  municipios_carregamento: [
    { codigo: '3550308', nome: 'Sao Paulo' },
  ],
  municipios_descarregamento: [
    {
      codigo: '3106200',
      nome: 'Belo Horizonte',
      conhecimentos_transporte: [
        { chave_cte: '35260311222333000181570010000001001000000001' },
      ],
    },
  ],
  quantidade_total_cte: 1,
  valor_total_carga: '80000.00',
  codigo_unidade_medida_peso_bruto: '01',
  peso_bruto: '1000.00',
  modal_rodoviario: {
    // ...modal data
  },
}, { contingencia: true });

console.log('Status:', mdfe.status);
```

### Retrieve an MDFe

```typescript
// Simple query
const mdfe = await client.mdfe.get('ref-mdfe-001');

console.log('Status:', mdfe.status);
console.log('Key:', mdfe.chave);
console.log('Number:', mdfe.numero);
console.log('DAMDFe:', mdfe.caminho_damdfe);
console.log('XML:', mdfe.caminho_xml);
console.log('Included drivers:', mdfe.condutores_incluidos);
console.log('Included DFes:', mdfe.dfes_incluidos);

// Full query (includes request and protocol)
const mdfeCompleta = await client.mdfe.get('ref-mdfe-001', true);

console.log('Request:', mdfeCompleta.requisicao);
console.log('Protocol:', mdfeCompleta.protocolo);
```

### Cancel an MDFe

```typescript
const cancelamento = await client.mdfe.cancel('ref-mdfe-001', {
  justificativa: 'Viagem cancelada por motivos operacionais',
});

console.log('Status:', cancelamento.status);
console.log('SEFAZ status:', cancelamento.status_sefaz);
console.log('Message:', cancelamento.mensagem_sefaz);
console.log('XML:', cancelamento.caminho_xml);
```

### Add a Driver

```typescript
const condutor = await client.mdfe.incluirCondutor('ref-mdfe-001', {
  nome: 'Jose Motorista Substituto',
  cpf: '98765432100',
});

console.log('Status:', condutor.status);
console.log('XML:', condutor.caminho_xml);
```

### Add a Fiscal Document (DFe)

```typescript
const dfe = await client.mdfe.incluirDfe('ref-mdfe-001', {
  protocolo: '135260300000001',
  codigo_municipio_carregamento: '3550308',
  nome_municipio_carregamento: 'Sao Paulo',
  documentos: [
    {
      codigo_municipio_descarregamento: '3304557',
      nome_municipio_descarregamento: 'Rio de Janeiro',
      chave_nfe: '35260311222333000181550010000002001000000002',
    },
  ],
});

console.log('Status:', dfe.status);
console.log('XML:', dfe.caminho_xml);
```

### Close an MDFe

```typescript
const encerramento = await client.mdfe.encerrar('ref-mdfe-001', {
  data: '2026-03-19',
  sigla_uf: 'RJ',
  nome_municipio: 'Rio de Janeiro',
});

console.log('Status:', encerramento.status);
console.log('SEFAZ status:', encerramento.status_sefaz);
console.log('XML:', encerramento.caminho_xml);
```

## Main Types

### MdfeCreateParams

```typescript
interface MdfeCreateParams {
  serie: string;
  modo_transporte: string;
  data_emissao: string;
  uf_inicio: string;
  uf_fim: string;
  cnpj_emitente: string;
  inscricao_estadual_emitente: string;
  municipios_carregamento: MdfeMunicipioCarregamento[];
  municipios_descarregamento: MdfeMunicipioDescarregamento[];
  percursos?: MdfePercurso[];
  quantidade_total_cte?: number;
  quantidade_total_nfe?: number;
  valor_total_carga?: string;
  codigo_unidade_medida_peso_bruto?: string;
  peso_bruto?: string;
  modal_rodoviario?: Record<string, unknown>;
  modal_aereo?: Record<string, unknown>;
  modal_aquaviario?: Record<string, unknown>;
  modal_ferroviario?: Record<string, unknown>;
}
```

### MdfeCreateOptions

```typescript
interface MdfeCreateOptions {
  contingencia?: boolean;
}
```

### MdfeResponse

```typescript
interface MdfeResponse {
  cnpj_emitente: string;
  ref: string;
  status: MdfeStatus;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave?: string;
  numero?: string;
  serie?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_damdfe?: string;
  caminho_xml?: string;
  caminho_xml_cancelamento?: string;
  caminho_xml_encerramento?: string;
  requisicao?: Record<string, unknown>;         // available when completa=true
  protocolo?: Record<string, unknown>;           // available when completa=true
  condutores_incluidos?: Record<string, unknown>[];
  dfes_incluidos?: Record<string, unknown>[];
}
```

### MdfeCancelParams

```typescript
interface MdfeCancelParams {
  justificativa: string;
}
```

### MdfeCondutorParams

```typescript
interface MdfeCondutorParams {
  nome: string;
  cpf: string;
}
```

### MdfeDfeParams

```typescript
interface MdfeDfeParams {
  protocolo: string;
  codigo_municipio_carregamento: string;
  nome_municipio_carregamento?: string;
  documentos: MdfeDfeDocumento[];
}

interface MdfeDfeDocumento {
  codigo_municipio_descarregamento: string;
  nome_municipio_descarregamento?: string;
  chave_nfe: string;
}
```

### MdfeEncerrarParams

```typescript
interface MdfeEncerrarParams {
  data: string;
  sigla_uf: string;
  nome_municipio: string;
}
```

## Important Notes

1. **Asynchronous processing**: After `create()`, poll with `get()` until the final status.
2. **Mandatory closure**: Every authorized MDFe must be closed at the end of the transport. Failure to close may result in fiscal penalties.
3. **Contingency**: Use `{ contingencia: true }` as the third parameter of `create()` when SEFAZ is unavailable.
4. **Adding drivers**: Allows adding new drivers to the manifest without cancellation. Useful for driver substitutions during the route.
5. **Adding DFe**: Allows adding new fiscal documents to the manifest after authorization. Requires the MDFe authorization protocol.
6. **No resendWebhook**: The MDFe does not have a webhook resend method.
7. **Cancellation**: An MDFe can only be cancelled if it has not been closed yet. Requires a justificativa (justification) with a minimum of 15 characters.

## Related

- [CTe](./cte.md) - Electronic Transport Document
- [NFe](./nfe.md) - Electronic Product Invoice
