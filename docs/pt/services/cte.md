# CTe (Conhecimento de Transporte Eletronico)

O servico CTe (`client.cte`) gerencia o ciclo de vida de Conhecimentos de Transporte Eletronicos (modelo 57), utilizados para documentar prestacoes de servico de transporte de cargas. O servico tambem suporta a emissao de CTe OS (Outros Servicos) para transporte de pessoas, valores e excesso de bagagem.

## Conceitos-Chave

**CTe vs CTe OS**

- **CTe (Conhecimento de Transporte)**: Documenta o transporte de cargas interestadual e intermunicipal. Utiliza o metodo `create()`.
- **CTe OS (Outros Servicos)**: Documenta o transporte de pessoas, valores e excesso de bagagem. Utiliza o metodo `createOs()`. Ambos compartilham a mesma consulta e eventos.

**Identificacao por Referencia (ref)**

Todas as operacoes utilizam uma referencia unica (`ref`). A mesma `ref` identifica tanto CTe quanto CTe OS na consulta e eventos.

**Processamento Assincrono**

A emissao de CTe e assincrona. Utilize `get()` para consultar o status ate que seja `autorizado` ou `erro_autorizacao`.

**Modais de Transporte**

O CTe suporta diversos modais: rodoviario, aereo, aquaviario, ferroviario, dutoviario e multimodal. Cada modal possui campos especificos informados nos objetos `modal_rodoviario`, `modal_aereo`, etc.

**Carta de Correcao Estruturada**

Diferente da NFe (que usa texto livre), a carta de correcao do CTe e estruturada: voce informa grupo, campo e valor corrigido individualmente.

## Referencia de Metodos

| Metodo | Descricao |
|--------|-----------|
| `create(ref, params)` | Cria (emite) um CTe com a referencia informada |
| `createOs(ref, params)` | Cria (emite) um CTe OS com a referencia informada |
| `get(ref, completa?)` | Consulta um CTe/CTe OS pela referencia |
| `cancel(ref, params)` | Cancela um CTe/CTe OS autorizado |
| `cartaCorrecao(ref, params)` | Emite uma Carta de Correcao (CC-e) estruturada |
| `desacordo(ref, params)` | Registra evento de prestacao em desacordo |
| `registroMultimodal(ref, params)` | Registra evento de transporte multimodal |
| `dadosGtv(ref, params)` | Registra dados do GTV (Guia de Transporte de Valores) |
| `resendWebhook(ref)` | Reenvia o webhook do CTe |

## Exemplos

### Criar um CTe

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

### Criar um CTe OS

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

### Consultar um CTe

```typescript
// Consulta simples
const cte = await client.cte.get('ref-cte-001');

console.log('Status:', cte.status);
console.log('Chave:', cte.chave_cte);
console.log('Numero:', cte.numero);
console.log('DACTe:', cte.caminho_dacte);
console.log('XML:', cte.caminho_xml);

// Consulta completa (inclui requisicao e protocolo)
const cteCompleta = await client.cte.get('ref-cte-001', true);

console.log('Requisicao:', cteCompleta.requisicao);
console.log('Protocolo:', cteCompleta.protocolo);
```

### Cancelar um CTe

```typescript
const cancelamento = await client.cte.cancel('ref-cte-001', {
  justificativa: 'Transporte nao realizado por indisponibilidade do veiculo',
});

console.log('Status:', cancelamento.status);
console.log('Status SEFAZ:', cancelamento.status_sefaz);
console.log('Mensagem:', cancelamento.mensagem_sefaz);
console.log('XML:', cancelamento.caminho_xml);
```

### Emitir Carta de Correcao

```typescript
const cc = await client.cte.cartaCorrecao('ref-cte-001', {
  correcoes: [
    {
      grupo_corrigido: 'ide',
      campo_corrigido: 'natOp',
      valor_corrigido: 'Prestacao de servico de transporte interestadual',
    },
    {
      grupo_corrigido: 'rem',
      campo_corrigido: 'xNome',
      valor_corrigido: 'Empresa Remetente Corrigida Ltda',
    },
  ],
});

console.log('Status:', cc.status);
console.log('Numero CC-e:', cc.numero_carta_correcao);
console.log('XML:', cc.caminho_xml);
```

### Registrar Prestacao em Desacordo

```typescript
const desacordo = await client.cte.desacordo('ref-cte-001', {
  observacoes: 'Mercadoria entregue com avarias nao previstas no contrato',
});

console.log('Status:', desacordo.status);
console.log('XML:', desacordo.caminho_xml);
```

### Registrar Transporte Multimodal

```typescript
const multimodal = await client.cte.registroMultimodal('ref-cte-001', {
  // campos especificos do registro multimodal
});

console.log('Status:', multimodal.status);
```

### Registrar Dados do GTV

```typescript
const gtv = await client.cte.dadosGtv('ref-cte-001', {
  // campos especificos do GTV
});

console.log('Status:', gtv.status);
```

### Reenviar Webhook

```typescript
const webhook = await client.cte.resendWebhook('ref-cte-001');
console.log('Status:', webhook.status);
```

## Tipos Principais

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
  // ...demais campos de emitente, remetente, destinatario
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
  // ...demais campos de emitente e tomador
}
```

### CteResponse

```typescript
interface CteResponse {
  cnpj_emitente: string;
  ref: string;
  status: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave_cte?: string;
  numero?: string;
  serie?: string;
  modelo?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_dacte?: string;
  caminho_xml?: string;
  caminho_xml_carta_correcao?: string;
  caminho_xml_cancelamento?: string;
  requisicao?: Record<string, unknown>;       // disponivel com completa=true
  protocolo?: Record<string, unknown>;         // disponivel com completa=true
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
  correcoes: CteCorrecao[];
}

interface CteCorrecao {
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

## Notas Importantes

1. **Processamento assincrono**: Apos `create()` ou `createOs()`, consulte `get()` ate o status final.
2. **Carta de Correcao estruturada**: Diferente da NFe, informe grupo, campo e valor individualmente no array `correcoes`.
3. **Cancelamento**: Deve ser realizado dentro do prazo legal. Requer justificativa com minimo de 15 caracteres.
4. **Desacordo**: O evento de prestacao em desacordo e registrado pelo tomador quando discorda do servico prestado.
5. **Modais**: Informe apenas o objeto do modal correspondente ao campo `modal` (ex: `modal_rodoviario` para modal `01`).
6. **Referencia unica**: A mesma `ref` e utilizada tanto para CTe quanto para CTe OS nas operacoes de consulta e eventos.
7. **Webhook**: Utilize `resendWebhook()` caso o callback nao tenha sido recebido pelo seu sistema.

## Relacionados

- [MDFe](./mdfe.md) - Manifesto Eletronico de Documentos Fiscais
- [NFe](./nfe.md) - Nota Fiscal Eletronica de produtos
