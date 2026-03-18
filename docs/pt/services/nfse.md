# NFSe (Nota Fiscal de Servico Eletronica)

O servico NFSe (`client.nfse`) gerencia a emissao de Notas Fiscais de Servico Eletronicas municipais. A NFSe e utilizada por prestadores de servico para documentar a prestacao de servicos e e processada pelas prefeituras de cada municipio.

## Conceitos-Chave

**NFSe Municipal**

Este servico trabalha com o modelo municipal de NFSe, onde cada prefeitura possui seu proprio sistema de emissao. A API do FocusNFe abstrai as diferencas entre os sistemas municipais, oferecendo uma interface unificada. Para o modelo nacional padronizado, utilize o servico [NFSe Nacional](./nfse-nacional.md).

**Identificacao por Referencia (ref)**

Todas as operacoes utilizam uma referencia unica (`ref`) definida por voce ao criar a nota. Essa referencia identifica a NFSe no sistema FocusNFe.

**Processamento Assincrono**

A emissao de NFSe e assincrona, pois depende da comunicacao com o webservice da prefeitura. Utilize `get()` para consultar o status ate que seja `autorizado` ou `erro_autorizacao`.

**Status (`NfseStatus`)** Os status possiveis sao: `processando_autorizacao`, `autorizado`, `cancelado`, `erro_autorizacao`.

**Estrutura Prestador/Tomador/Servico**

A NFSe exige dados do prestador (quem presta o servico), do tomador (quem contrata o servico) e do servico prestado, organizados em objetos separados.

## Referencia de Metodos

| Metodo | Descricao |
|--------|-----------|
| `create(ref, params)` | Cria (emite) uma NFSe com a referencia informada |
| `get(ref, completa?)` | Consulta uma NFSe pela referencia |
| `cancel(ref, params)` | Cancela uma NFSe autorizada |
| `email(ref, params)` | Envia a NFSe por e-mail para destinatarios |
| `resendWebhook(ref)` | Reenvia o webhook da NFSe |

## Exemplos

### Criar uma NFSe

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

### Consultar uma NFSe

```typescript
// Consulta simples
const nfse = await client.nfse.get('ref-nfse-001');

console.log('Status:', nfse.status);
console.log('Numero:', nfse.numero);
console.log('Codigo verificacao:', nfse.codigo_verificacao);
console.log('URL:', nfse.url);
console.log('DANFSE:', nfse.url_danfse);
console.log('XML:', nfse.caminho_xml_nota_fiscal);

// Consulta completa
const nfseCompleta = await client.nfse.get('ref-nfse-001', true);
```

### Cancelar uma NFSe

```typescript
const cancelamento = await client.nfse.cancel('ref-nfse-001', {
  justificativa: 'Servico nao prestado conforme acordado',
});

console.log('Status:', cancelamento.status);

// Verificar erros retornados pela prefeitura
if (cancelamento.erros) {
  for (const erro of cancelamento.erros) {
    console.log(`Erro ${erro.codigo}: ${erro.mensagem}`);
  }
}
```

### Enviar NFSe por E-mail

```typescript
await client.nfse.email('ref-nfse-001', {
  emails: ['tomador@exemplo.com', 'contabilidade@exemplo.com'],
});
```

### Reenviar Webhook

```typescript
await client.nfse.resendWebhook('ref-nfse-001');
console.log('Webhook reenviado');
```

## Tipos Principais

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

## Notas Importantes

1. **Processamento assincrono**: Apos `create()`, consulte `get()` para verificar o status. Os tempos de resposta variam conforme a prefeitura.
2. **Erros municipais**: A resposta pode incluir o array `erros` com codigos e mensagens especificos da prefeitura, mesmo em caso de status de erro.
3. **Inscricao municipal obrigatoria**: O prestador deve informar a inscricao municipal para emissao da NFSe.
4. **ISS retido**: O campo `iss_retido` indica se o ISS sera retido pelo tomador. Quando `true`, informe `valor_iss_retido`.
5. **Codigo do municipio**: Utilize o codigo IBGE do municipio (7 digitos).
6. **Item da lista de servico**: Utilize o codigo conforme a Lei Complementar 116/2003.
7. **Webhook**: Utilize `resendWebhook()` caso o callback nao tenha sido recebido pelo seu sistema.

## Relacionados

- [NFSe Nacional](./nfse-nacional.md) - Modelo nacional padronizado de NFSe
- [NFe](./nfe.md) - Nota Fiscal Eletronica de produtos
