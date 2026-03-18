# NFe (Nota Fiscal Eletronica)

O servico NFe (`client.nfe`) gerencia o ciclo de vida completo de Notas Fiscais Eletronicas de produtos (modelo 55), incluindo emissao, consulta, cancelamento, carta de correcao, inutilizacao e diversos eventos fiscais.

## Conceitos-Chave

**Identificacao por Referencia (ref)**

Todas as operacoes da NFe utilizam uma referencia unica (`ref`) definida por voce ao criar a nota. Essa referencia e usada para consultar, cancelar e realizar eventos posteriores. A `ref` deve ser unica por empresa emitente.

**Processamento Assincrono**

A emissao de NFe e assincrona. Ao chamar `create()`, a nota entra em fila de processamento. Utilize `get()` para consultar o status ate que seja `autorizado` ou `erro_autorizacao`.

**Parametro `completa`**

Ao consultar uma NFe com `get(ref, true)`, a resposta inclui os objetos completos de requisicao e protocolo (`requisicao_nota_fiscal`, `protocolo_nota_fiscal`, etc.), uteis para depuracao e auditoria.

**Status (`NfeStatus`)** Os status possiveis sao: `processando_autorizacao`, `autorizado`, `cancelado`, `erro_autorizacao`, `denegado`.

**ECONF (Conciliacao Financeira)**

O evento de conciliacao financeira (ECONF) permite registrar os detalhes de pagamento efetivamente recebidos apos a emissao da nota, conforme exigencia do fisco.

## Referencia de Metodos

| Metodo | Descricao |
|--------|-----------|
| `create(ref, params)` | Cria (emite) uma NFe com a referencia informada |
| `get(ref, completa?)` | Consulta uma NFe pela referencia |
| `cancel(ref, params)` | Cancela uma NFe autorizada |
| `cartaCorrecao(ref, params)` | Emite uma Carta de Correcao (CC-e) |
| `atorInteressado(ref, params)` | Registra ator interessado no transporte |
| `insucessoEntrega(ref, params)` | Registra evento de insucesso na entrega |
| `cancelInsucessoEntrega(ref)` | Cancela evento de insucesso na entrega |
| `email(ref, params)` | Envia a NFe por e-mail para destinatarios |
| `inutilizar(params)` | Inutiliza uma faixa de numeracao |
| `inutilizacoes(params)` | Lista inutilizacoes realizadas |
| `importar(ref, params)` | Importa uma NFe a partir de XML |
| `danfePreview(params)` | Gera preview do DANFE em PDF (retorna `BinaryResponse`) |
| `econf(ref, params)` | Registra evento de conciliacao financeira |
| `getEconf(ref, protocolo)` | Consulta evento ECONF por protocolo |
| `cancelEconf(ref, protocolo)` | Cancela evento ECONF |
| `evento(ref, params)` | Registra evento generico na NFe |
| `resendWebhook(ref)` | Reenvia o webhook da NFe |

## Exemplos

### Criar uma NFe

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

### Consultar uma NFe

```typescript
// Consulta simples
const nfe = await client.nfe.get('ref-001');

console.log('Status:', nfe.status);
console.log('Chave:', nfe.chave_nfe);
console.log('DANFE:', nfe.caminho_danfe);

// Consulta completa (inclui requisicao e protocolo)
const nfeCompleta = await client.nfe.get('ref-001', true);

console.log('Requisicao:', nfeCompleta.requisicao_nota_fiscal);
console.log('Protocolo:', nfeCompleta.protocolo_nota_fiscal);
```

### Cancelar uma NFe

```typescript
const cancelamento = await client.nfe.cancel('ref-001', {
  justificativa: 'Erro nos dados do destinatario',
});

console.log('Status:', cancelamento.status);
console.log('XML cancelamento:', cancelamento.caminho_xml_cancelamento);
```

### Emitir Carta de Correcao

```typescript
const cc = await client.nfe.cartaCorrecao('ref-001', {
  correcao: 'Correcao do endereco do destinatario: Rua Correta, 200',
});

console.log('Status:', cc.status);
console.log('Numero CC-e:', cc.numero_carta_correcao);
console.log('XML:', cc.caminho_xml_carta_correcao);
console.log('PDF:', cc.caminho_pdf_carta_correcao);
```

### Registrar Ator Interessado

```typescript
const ator = await client.nfe.atorInteressado('ref-001', {
  cpf: '12345678901',
  permite_autorizacao_terceiros: true,
});

console.log('Status:', ator.status);
```

### Registrar Insucesso na Entrega

```typescript
const insucesso = await client.nfe.insucessoEntrega('ref-001', {
  data_tentativa_entrega: '2026-03-18',
  motivo_insucesso: 1,
  hash_tentativa_entrega: 'abc123hash',
  numero_tentativas: 2,
});

console.log('Status:', insucesso.status);

// Cancelar o insucesso, se necessario
const cancelInsucesso = await client.nfe.cancelInsucessoEntrega('ref-001');
console.log('Cancelamento insucesso:', cancelInsucesso.status);
```

### Enviar NFe por E-mail

```typescript
await client.nfe.email('ref-001', {
  emails: ['cliente@exemplo.com', 'contabilidade@exemplo.com'],
});
```

### Inutilizar Numeracao

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

### Listar Inutilizacoes

```typescript
const lista = await client.nfe.inutilizacoes({
  cnpj: '11222333000181',
});

for (const item of lista) {
  console.log(`Serie ${item.serie}: ${item.numero_inicial}-${item.numero_final}`);
  console.log('Status:', item.status);
}
```

### Importar NFe via XML

```typescript
const importada = await client.nfe.importar('ref-import-001', {
  xml: '<nfeProc>...conteudo XML completo...</nfeProc>',
});

console.log('Status:', importada.status);
```

### Preview do DANFE

```typescript
import { writeFile } from 'fs/promises';

const danfe = await client.nfe.danfePreview({
  natureza_operacao: 'Venda de mercadoria',
  // ...demais campos da NFe
  items: [/* ... */],
});

await writeFile('danfe-preview.pdf', danfe.data);
console.log('Preview salvo:', danfe.filename);
```

### Conciliacao Financeira (ECONF)

```typescript
// Registrar ECONF
const econf = await client.nfe.econf('ref-001', {
  detalhes_pagamento: [
    {
      forma_pagamento: '01',
      valor_pagamento: 100.00,
      data_pagamento: '2026-03-18',
    },
  ],
});

console.log('Protocolo:', econf.numero_protocolo);

// Consultar ECONF
const econfConsulta = await client.nfe.getEconf('ref-001', econf.numero_protocolo!);
console.log('Status ECONF:', econfConsulta.status);

// Cancelar ECONF
const econfCancel = await client.nfe.cancelEconf('ref-001', econf.numero_protocolo!);
console.log('ECONF cancelado:', econfCancel.status);
```

### Evento Generico

```typescript
const evento = await client.nfe.evento('ref-001', {
  tipo_evento: 'averbacao_exportacao',
  // ...campos especificos do evento
});

console.log('Status:', evento.status);
```

### Reenviar Webhook

```typescript
const webhook = await client.nfe.resendWebhook('ref-001');
console.log('Webhook reenviado');
```

## Tipos Principais

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
  // ...demais campos do emitente, destinatario e totalizadores
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
  requisicao_nota_fiscal?: unknown;  // disponivel com completa=true
  protocolo_nota_fiscal?: unknown;   // disponivel com completa=true
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

## Notas Importantes

1. **Processamento assincrono**: Apos `create()`, consulte `get()` ate o status final. Os status possiveis incluem `processando_autorizacao`, `autorizado` e `erro_autorizacao`.
2. **Carta de Correcao**: Pode ser emitida ate 30 vezes para a mesma NFe. Nao corrige valores, aliquotas ou dados que alterem o calculo do imposto.
3. **Cancelamento**: Deve ser realizado dentro do prazo legal (geralmente 24 horas apos a autorizacao). Requer justificativa com minimo de 15 caracteres.
4. **Inutilizacao**: Utilizada para informar a SEFAZ sobre numeracoes que foram puladas e nao serao utilizadas.
5. **DANFE Preview**: Retorna um `BinaryResponse` com os dados do PDF. Util para visualizar o documento antes da emissao.
6. **Webhook**: Utilize `resendWebhook()` caso o callback de notificacao nao tenha sido recebido pelo seu sistema.

## Relacionados

- [NFCe](./nfce.md) - Nota Fiscal ao Consumidor Eletronica
- [NFSe](./nfse.md) - Nota Fiscal de Servico Eletronica
