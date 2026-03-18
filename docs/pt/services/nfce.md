# NFCe (Nota Fiscal ao Consumidor Eletronica)

O servico NFCe (`client.nfce`) gerencia o ciclo de vida de Notas Fiscais ao Consumidor Eletronicas (modelo 65), utilizadas para operacoes de varejo no ponto de venda. A NFCe substitui o cupom fiscal emitido por ECF.

## Conceitos-Chave

**Processamento Sincrono**

Diferente da NFe, a NFCe e processada de forma sincrona. A resposta de `create()` ja retorna o status final da autorizacao (`autorizado` ou `erro_autorizacao`), sem necessidade de polling.

**Identificacao por Referencia (ref)**

Assim como a NFe, todas as operacoes utilizam uma referencia unica (`ref`) definida por voce ao criar a nota.

**Contingencia Offline**

A NFCe suporta emissao em contingencia offline. Quando a SEFAZ esta indisponivel, a nota pode ser emitida localmente e transmitida posteriormente. Os campos `contingencia_offline` e `contingencia_offline_efetivada` na resposta indicam o estado da contingencia.

**Sem Reenvio de Webhook**

A NFCe nao possui o metodo `resendWebhook()`, uma vez que o processamento e sincrono e a resposta e imediata.

## Referencia de Metodos

| Metodo | Descricao |
|--------|-----------|
| `create(ref, params)` | Cria (emite) uma NFCe com a referencia informada |
| `get(ref, completa?)` | Consulta uma NFCe pela referencia |
| `cancel(ref, params)` | Cancela uma NFCe autorizada |
| `email(ref, params)` | Envia a NFCe por e-mail para destinatarios |
| `inutilizar(params)` | Inutiliza uma faixa de numeracao |
| `inutilizacoes(params)` | Lista inutilizacoes realizadas |
| `econf(ref, params)` | Registra evento de conciliacao financeira |
| `getEconf(ref, protocolo)` | Consulta evento ECONF por protocolo |
| `cancelEconf(ref, protocolo)` | Cancela evento ECONF |

## Exemplos

### Criar uma NFCe

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

// Resposta sincrona - status final ja disponivel
console.log('Status:', nfce.status);
console.log('Chave:', nfce.chave_nfe);
console.log('QR Code:', nfce.qrcode_url);
console.log('DANFE:', nfce.caminho_danfe);
```

### Consultar uma NFCe

```typescript
// Consulta simples
const nfce = await client.nfce.get('ref-nfce-001');

console.log('Status:', nfce.status);
console.log('Chave:', nfce.chave_nfe);
console.log('Numero:', nfce.numero);

// Consulta completa (inclui requisicao e protocolo)
const nfceCompleta = await client.nfce.get('ref-nfce-001', true);

console.log('Requisicao:', nfceCompleta.requisicao_nota_fiscal);
console.log('Protocolo:', nfceCompleta.protocolo_nota_fiscal);
```

### Cancelar uma NFCe

```typescript
const cancelamento = await client.nfce.cancel('ref-nfce-001', {
  justificativa: 'Venda cancelada a pedido do cliente',
});

console.log('Status:', cancelamento.status);
console.log('XML cancelamento:', cancelamento.caminho_xml_cancelamento);
```

### Enviar NFCe por E-mail

```typescript
await client.nfce.email('ref-nfce-001', {
  emails: ['cliente@exemplo.com'],
});
```

### Inutilizar Numeracao

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

### Listar Inutilizacoes

```typescript
const lista = await client.nfce.inutilizacoes({
  cnpj: '11222333000181',
});

for (const item of lista) {
  console.log(`Serie ${item.serie}: ${item.numero_inicial}-${item.numero_final}`);
  console.log('Status:', item.status);
}
```

### Conciliacao Financeira (ECONF)

```typescript
// Registrar ECONF
const econf = await client.nfce.econf('ref-nfce-001', {
  detalhes_pagamento: [
    {
      forma_pagamento: '03',
      valor_pagamento: 99.80,
      data_pagamento: '2026-03-18',
    },
  ],
});

console.log('Protocolo:', econf.numero_protocolo);

// Consultar ECONF
const econfConsulta = await client.nfce.getEconf('ref-nfce-001', econf.numero_protocolo!);
console.log('Status ECONF:', econfConsulta.status);

// Cancelar ECONF
const econfCancel = await client.nfce.cancelEconf('ref-nfce-001', econf.numero_protocolo!);
console.log('ECONF cancelado:', econfCancel.status);
```

## Tipos Principais

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
  // ...demais campos do emitente, destinatario e totalizadores
}
```

### NfceResponse

```typescript
interface NfceResponse {
  ref?: string;
  status?: string;
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

## Notas Importantes

1. **Processamento sincrono**: A resposta de `create()` ja contem o status final. Nao e necessario polling como na NFe.
2. **Contingencia offline**: Os campos `contingencia_offline` e `contingencia_offline_efetivada` indicam se a nota foi emitida em contingencia e se ja foi efetivada junto a SEFAZ.
3. **Cancelamento**: Deve ser realizado dentro do prazo legal. Requer justificativa com minimo de 15 caracteres.
4. **Formas de pagamento obrigatorias**: Diferente da NFe, o campo `formas_pagamento` e obrigatorio na NFCe.
5. **Presenca do comprador**: O campo `presenca_comprador` e obrigatorio e indica a forma de atendimento (1 = presencial, 4 = NFC-e delivery, etc.).
6. **Sem resendWebhook**: Como o processamento e sincrono, nao ha metodo para reenvio de webhook.

## Relacionados

- [NFe](./nfe.md) - Nota Fiscal Eletronica (modelo 55)
- [NFSe](./nfse.md) - Nota Fiscal de Servico Eletronica
