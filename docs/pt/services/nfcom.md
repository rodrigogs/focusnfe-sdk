# NFCom (Nota Fiscal Fatura de Servico de Comunicacao Eletronica)

O servico NFCom (`client.nfcom`) gerencia o ciclo de vida de Notas Fiscais Fatura de Servico de Comunicacao Eletronicas (modelo 62), utilizadas por prestadores de servicos de telecomunicacao para documentar a prestacao de servicos de comunicacao.

## Conceitos-Chave

**Finalidade da NFCom**

A NFCom substitui os antigos modelos 21 e 22 (Nota Fiscal de Servico de Comunicacao e Nota Fiscal de Servico de Telecomunicacoes), unificando a documentacao fiscal do setor de telecomunicacoes em um unico modelo eletronico.

**Identificacao por Referencia (ref)**

Todas as operacoes utilizam uma referencia unica (`ref`) definida por voce ao criar a nota.

**Processamento Assincrono**

A emissao de NFCom e assincrona. Utilize `get()` para consultar o status ate que seja `autorizado` ou `erro_autorizacao`.

**Contingencia**

A NFCom pode ser emitida em contingencia quando a SEFAZ esta indisponivel. Passe `{ contingencia: true }` no terceiro parametro de `create()`.

## Referencia de Metodos

| Metodo | Descricao |
|--------|-----------|
| `create(ref, params, options?)` | Cria (emite) uma NFCom. Aceita `{ contingencia: true }` em options |
| `get(ref, completa?)` | Consulta uma NFCom pela referencia |
| `cancel(ref, params)` | Cancela uma NFCom autorizada |
| `resendWebhook(ref)` | Reenvia o webhook da NFCom |

## Exemplos

### Criar uma NFCom

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk';

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'homologation',
});

const nfcom = await client.nfcom.create('ref-nfcom-001', {
  cnpj_emitente: '11222333000181',
  // ...demais campos especificos da NFCom
});

console.log('Status:', nfcom.status);
console.log('Ref:', nfcom.ref);
```

### Criar uma NFCom em Contingencia

```typescript
const nfcom = await client.nfcom.create('ref-nfcom-002', {
  cnpj_emitente: '11222333000181',
  // ...demais campos
}, { contingencia: true });

console.log('Status:', nfcom.status);
```

### Consultar uma NFCom

```typescript
// Consulta simples
const nfcom = await client.nfcom.get('ref-nfcom-001');

console.log('Status:', nfcom.status);
console.log('Chave:', nfcom.chave);
console.log('Numero:', nfcom.numero);
console.log('Serie:', nfcom.serie);
console.log('DANFECom:', nfcom.caminho_danfecom);
console.log('XML:', nfcom.caminho_xml);

// Consulta completa
const nfcomCompleta = await client.nfcom.get('ref-nfcom-001', true);
```

### Cancelar uma NFCom

```typescript
const cancelamento = await client.nfcom.cancel('ref-nfcom-001', {
  justificativa: 'Nota emitida com dados incorretos do assinante',
});

console.log('Status:', cancelamento.status);
console.log('Status SEFAZ:', cancelamento.status_sefaz);
console.log('Mensagem:', cancelamento.mensagem_sefaz);
console.log('XML:', cancelamento.caminho_xml);
```

### Reenviar Webhook

```typescript
await client.nfcom.resendWebhook('ref-nfcom-001');
console.log('Webhook reenviado');
```

## Tipos Principais

### NfcomCreateParams

```typescript
interface NfcomCreateParams {
  cnpj_emitente: string;
  [key: string]: unknown;  // campos especificos da NFCom
}
```

### NfcomCreateOptions

```typescript
interface NfcomCreateOptions {
  contingencia?: boolean;
}
```

### NfcomResponse

```typescript
interface NfcomResponse {
  cnpj_emitente?: string;
  ref?: string;
  status: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave?: string;
  numero?: string;
  serie?: string;
  modelo?: string;
  caminho_xml?: string;
  caminho_danfecom?: string;
  caminho_xml_cancelamento?: string;
}
```

### NfcomCancelParams

```typescript
interface NfcomCancelParams {
  justificativa: string;
}
```

### NfcomCancelResponse

```typescript
interface NfcomCancelResponse {
  status: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml?: string;
}
```

## Notas Importantes

1. **Processamento assincrono**: Apos `create()`, consulte `get()` ate o status final.
2. **Contingencia**: Utilize `{ contingencia: true }` no terceiro parametro de `create()` quando a SEFAZ estiver indisponivel.
3. **Cancelamento**: Deve ser realizado dentro do prazo legal. Requer justificativa com minimo de 15 caracteres.
4. **Setor especifico**: A NFCom e exclusiva para prestadores de servicos de telecomunicacao. Para outros tipos de servico, utilize [NFSe](./nfse.md) ou [NFSe Nacional](./nfse-nacional.md).
5. **Tipos flexiveis**: O `NfcomCreateParams` aceita campos adicionais alem do `cnpj_emitente`, conforme a especificacao tecnica da NFCom.
6. **Webhook**: Utilize `resendWebhook()` caso o callback nao tenha sido recebido pelo seu sistema.

## Relacionados

- [NFe](./nfe.md) - Nota Fiscal Eletronica de produtos
- [NFSe](./nfse.md) - Nota Fiscal de Servico Eletronica
- [CTe](./cte.md) - Conhecimento de Transporte Eletronico
