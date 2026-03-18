# NFSe Nacional (Nota Fiscal de Servico Eletronica Nacional)

O servico NFSe Nacional (`client.nfseNacional`) gerencia a emissao de Notas Fiscais de Servico Eletronicas pelo sistema nacional padronizado (NFS-e Nacional), implementado pelo Comite Gestor da NFS-e (CGNFS-e) em parceria com a Receita Federal.

## Conceitos-Chave

**Diferenca em relacao a NFSe Municipal**

O servico [NFSe](./nfse.md) trabalha com os sistemas individuais de cada prefeitura, onde os campos e comportamentos variam por municipio. A NFSe Nacional utiliza um sistema padronizado em ambito federal, com layout unico para todos os municipios aderentes. A NFSe Nacional tende a ser mais simples de integrar, pois nao depende das particularidades de cada prefeitura.

**Identificacao por Referencia (ref)**

Assim como os demais documentos fiscais, a NFSe Nacional utiliza uma referencia unica (`ref`) para identificar cada nota no sistema FocusNFe.

**Processamento Assincrono**

A emissao e assincrona. Utilize `get()` para consultar o status ate que seja `autorizado` ou `erro_autorizacao`.

**Estrutura Simplificada**

Diferente da NFSe municipal, a NFSe Nacional utiliza uma estrutura mais plana, sem objetos aninhados de prestador, tomador e servico. Os dados sao informados diretamente nos campos da requisicao.

## Referencia de Metodos

| Metodo | Descricao |
|--------|-----------|
| `create(ref, params)` | Cria (emite) uma NFSe Nacional com a referencia informada |
| `get(ref, completa?)` | Consulta uma NFSe Nacional pela referencia |
| `cancel(ref, params)` | Cancela uma NFSe Nacional autorizada |
| `resendWebhook(ref)` | Reenvia o webhook da NFSe Nacional |

## Exemplos

### Criar uma NFSe Nacional

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

### Consultar uma NFSe Nacional

```typescript
// Consulta simples
const nfse = await client.nfseNacional.get('ref-nfsen-001');

console.log('Status:', nfse.status);
console.log('Numero:', nfse.numero);
console.log('Codigo verificacao:', nfse.codigo_verificacao);
console.log('URL:', nfse.url);
console.log('DANFSE:', nfse.url_danfse);
console.log('XML:', nfse.caminho_xml_nota_fiscal);

// Consulta completa
const nfseCompleta = await client.nfseNacional.get('ref-nfsen-001', true);
```

### Cancelar uma NFSe Nacional

```typescript
const cancelamento = await client.nfseNacional.cancel('ref-nfsen-001', {
  justificativa: 'Servico cancelado por acordo entre as partes',
});

console.log('Status:', cancelamento.status);

// Verificar erros
if (cancelamento.erros) {
  for (const erro of cancelamento.erros) {
    console.log(`Erro ${erro.codigo}: ${erro.mensagem}`);
  }
}
```

### Reenviar Webhook

```typescript
await client.nfseNacional.resendWebhook('ref-nfsen-001');
console.log('Webhook reenviado');
```

## Tipos Principais

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
  status: string;
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

## Notas Importantes

1. **Processamento assincrono**: Apos `create()`, consulte `get()` para verificar o status ate a conclusao.
2. **Municipios aderentes**: Nem todos os municipios aderiram ao sistema nacional. Verifique se o municipio do prestador e compativel antes de utilizar este servico. Caso contrario, utilize o servico [NFSe](./nfse.md) municipal.
3. **Codigo de tributacao nacional**: O campo `codigo_tributacao_nacional_iss` segue a tabela de servicos do sistema nacional, que pode diferir dos codigos municipais.
4. **Estrutura simplificada**: Os dados do tomador sao informados diretamente como campos do objeto principal (ex: `cnpj_tomador`, `razao_social_tomador`), diferente da NFSe municipal que usa objetos aninhados.
5. **Erros**: A resposta pode conter o array `erros` com detalhes sobre falhas na emissao ou cancelamento.
6. **Webhook**: Utilize `resendWebhook()` caso o callback nao tenha sido recebido pelo seu sistema.

## Relacionados

- [NFSe](./nfse.md) - Nota Fiscal de Servico Eletronica municipal
- [NFe](./nfe.md) - Nota Fiscal Eletronica de produtos
