# MDFe (Manifesto Eletronico de Documentos Fiscais)

O servico MDFe (`client.mdfe`) gerencia o ciclo de vida de Manifestos Eletronicos de Documentos Fiscais (modelo 58), utilizados para vincular documentos fiscais (NFe e CTe) a um veiculo de transporte de carga. O MDFe e obrigatorio para operacoes interestaduais e intermunicipais.

## Conceitos-Chave

**Finalidade do MDFe**

O MDFe funciona como um manifesto que agrupa os documentos fiscais (NFe e/ou CTe) transportados em um mesmo veiculo. Ele e exigido tanto para transportadores quanto para emitentes de NFe que realizam transporte proprio.

**Identificacao por Referencia (ref)**

Todas as operacoes utilizam uma referencia unica (`ref`) definida por voce ao criar o manifesto.

**Processamento Assincrono**

A emissao de MDFe e assincrona. Utilize `get()` para consultar o status ate que seja `autorizado` ou `erro_autorizacao`.

**Status (`MdfeStatus`)** Os status possiveis sao: `processando_autorizacao`, `autorizado`, `cancelado`, `encerrado`, `erro_autorizacao`.

**Contingencia**

O MDFe pode ser emitido em contingencia quando a SEFAZ esta indisponivel. Passe `{ contingencia: true }` no terceiro parametro de `create()`.

**Encerramento Obrigatorio**

Todo MDFe autorizado deve ser encerrado ao final da operacao de transporte. O encerramento informa a SEFAZ que o transporte foi concluido.

**Inclusao Posterior de Condutor e DFe**

Apos a autorizacao, e possivel incluir novos condutores e documentos fiscais ao manifesto sem necessidade de cancelamento e reemissao.

## Referencia de Metodos

| Metodo | Descricao |
|--------|-----------|
| `create(ref, params, options?)` | Cria (emite) um MDFe. Aceita `{ contingencia: true }` em options |
| `get(ref, completa?)` | Consulta um MDFe pela referencia |
| `cancel(ref, params)` | Cancela um MDFe autorizado |
| `incluirCondutor(ref, params)` | Inclui um condutor ao MDFe autorizado |
| `incluirDfe(ref, params)` | Inclui documentos fiscais ao MDFe autorizado |
| `encerrar(ref, params)` | Encerra o MDFe (obrigatorio ao final do transporte) |

## Exemplos

### Criar um MDFe

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

### Criar um MDFe em Contingencia

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
    // ...dados do modal
  },
}, { contingencia: true });

console.log('Status:', mdfe.status);
```

### Consultar um MDFe

```typescript
// Consulta simples
const mdfe = await client.mdfe.get('ref-mdfe-001');

console.log('Status:', mdfe.status);
console.log('Chave:', mdfe.chave);
console.log('Numero:', mdfe.numero);
console.log('DAMDFe:', mdfe.caminho_damdfe);
console.log('XML:', mdfe.caminho_xml);
console.log('Condutores incluidos:', mdfe.condutores_incluidos);
console.log('DFes incluidos:', mdfe.dfes_incluidos);

// Consulta completa (inclui requisicao e protocolo)
const mdfeCompleta = await client.mdfe.get('ref-mdfe-001', true);

console.log('Requisicao:', mdfeCompleta.requisicao);
console.log('Protocolo:', mdfeCompleta.protocolo);
```

### Cancelar um MDFe

```typescript
const cancelamento = await client.mdfe.cancel('ref-mdfe-001', {
  justificativa: 'Viagem cancelada por motivos operacionais',
});

console.log('Status:', cancelamento.status);
console.log('Status SEFAZ:', cancelamento.status_sefaz);
console.log('Mensagem:', cancelamento.mensagem_sefaz);
console.log('XML:', cancelamento.caminho_xml);
```

### Incluir Condutor

```typescript
const condutor = await client.mdfe.incluirCondutor('ref-mdfe-001', {
  nome: 'Jose Motorista Substituto',
  cpf: '98765432100',
});

console.log('Status:', condutor.status);
console.log('XML:', condutor.caminho_xml);
```

### Incluir Documento Fiscal (DFe)

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

### Encerrar um MDFe

```typescript
const encerramento = await client.mdfe.encerrar('ref-mdfe-001', {
  data: '2026-03-19',
  sigla_uf: 'RJ',
  nome_municipio: 'Rio de Janeiro',
});

console.log('Status:', encerramento.status);
console.log('Status SEFAZ:', encerramento.status_sefaz);
console.log('XML:', encerramento.caminho_xml);
```

## Tipos Principais

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
  requisicao?: Record<string, unknown>;         // disponivel com completa=true
  protocolo?: Record<string, unknown>;           // disponivel com completa=true
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

## Notas Importantes

1. **Processamento assincrono**: Apos `create()`, consulte `get()` ate o status final.
2. **Encerramento obrigatorio**: Todo MDFe autorizado deve ser encerrado ao final do transporte. O nao encerramento pode gerar impedimentos fiscais.
3. **Contingencia**: Utilize `{ contingencia: true }` no terceiro parametro de `create()` quando a SEFAZ estiver indisponivel.
4. **Inclusao de condutor**: Permite adicionar novos motoristas ao manifesto sem cancelamento. Util em substituicoes durante o percurso.
5. **Inclusao de DFe**: Permite adicionar novos documentos fiscais ao manifesto apos a autorizacao. Requer o protocolo de autorizacao do MDFe.
6. **Sem resendWebhook**: O MDFe nao possui metodo para reenvio de webhook.
7. **Cancelamento**: So e possivel cancelar um MDFe que ainda nao foi encerrado. Requer justificativa com minimo de 15 caracteres.

## Relacionados

- [CTe](./cte.md) - Conhecimento de Transporte Eletronico
- [NFe](./nfe.md) - Nota Fiscal Eletronica de produtos
