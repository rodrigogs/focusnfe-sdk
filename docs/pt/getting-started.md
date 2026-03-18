# Primeiros Passos

Este guia apresenta os conceitos basicos para comecar a usar o `@rodrigogs/focusnfe-sdk`, um SDK TypeScript completo para a API da Focus NFe -- plataforma de emissao de documentos fiscais eletronicos (NFe, NFCe, NFSe, CTe, MDFe, NFCom).

## Pre-requisitos

Antes de comecar, certifique-se de ter:

- **Node.js >= 18** -- Necessario para `fetch` nativo, `AbortSignal.timeout` e `btoa`
- **Uma conta Focus NFe** -- Ambiente homologacao ou producao
- **Um token de acesso** -- Obtido ao habilitar a API para sua empresa no painel da Focus NFe

## Instalacao

Instale o pacote via npm:

```bash
npm install @rodrigogs/focusnfe-sdk
```

Ou usando outros gerenciadores de pacotes:

```bash
# Yarn
yarn add @rodrigogs/focusnfe-sdk

# pnpm
pnpm add @rodrigogs/focusnfe-sdk
```

## Criando o Cliente

A primeira etapa e instanciar o `FocusNFeClient` com seu token de acesso:

```ts
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'HOMOLOGACAO', // ou 'PRODUCTION' (padrao)
})
```

O cliente agora esta pronto para realizar requisicoes a API da Focus NFe.

## Opcoes de Configuracao

O construtor do `FocusNFeClient` aceita as seguintes opcoes:

| Opcao | Tipo | Obrigatorio | Padrao | Descricao |
|-------|------|-------------|--------|-----------|
| `token` | `string` | Sim | - | Seu token de acesso da Focus NFe |
| `environment` | `'HOMOLOGACAO'` \| `'PRODUCTION'` | Nao | `'PRODUCTION'` | Ambiente da API a ser utilizado |
| `baseUrl` | `string` | Nao | (automatico) | Sobrescreve completamente a URL base da API |
| `timeout` | `number` | Nao | `30000` | Timeout das requisicoes em milissegundos |
| `fetch` | `typeof globalThis.fetch` | Nao | `globalThis.fetch` | Implementacao customizada de fetch |
| `userAgent` | `string` | Nao | - | Sufixo customizado para o header `User-Agent` |

**Exemplo com configuracoes avancadas:**

```ts
const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'HOMOLOGACAO',
  timeout: 60000, // 60 segundos
  userAgent: 'MeuApp/1.0.0',
})
```

## Autenticacao

A API da Focus NFe utiliza **HTTP Basic Auth** para autenticacao. O SDK cuida disso automaticamente: ao fornecer o `token`, ele e enviado como nome de usuario no header `Authorization`, com a senha em branco.

Internamente, o SDK gera o header assim:

```
Authorization: Basic base64(token + ":")
```

Voce nao precisa se preocupar com a codificacao -- basta fornecer o token ao criar o cliente.

## Sua Primeira Requisicao

Vamos emitir uma NFe de exemplo. A emissao de NFe e assincrona: voce envia os dados, a API aceita para processamento e depois voce consulta o status.

```ts
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  environment: 'HOMOLOGACAO',
})

async function exemplo() {
  // 1. Criar (enviar) uma NFe para processamento
  const ref = 'nfe-001' // referencia unica na sua aplicacao
  const nfe = await client.nfe.create(ref, {
    natureza_operacao: 'Venda de mercadoria',
    data_emissao: '2026-03-18T10:00:00-03:00',
    tipo_documento: 1,
    local_destino: 1,
    finalidade_emissao: 1,
    consumidor_final: 1,
    presenca_comprador: 1,
    modalidade_frete: 9,
    nome_destinatario: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
    cpf_destinatario: '12345678909',
    indicador_inscricao_estadual_destinatario: 9,
    logradouro_destinatario: 'Avenida Paulista',
    numero_destinatario: '1000',
    bairro_destinatario: 'Bela Vista',
    municipio_destinatario: 'Sao Paulo',
    uf_destinatario: 'SP',
    cep_destinatario: '01310100',
    items: [
      {
        numero_item: 1,
        codigo_produto: 'PROD-001',
        descricao: 'Produto de teste',
        cfop: 5102,
        codigo_ncm: '62044200',
        quantidade_comercial: 1,
        valor_unitario_comercial: 100.0,
        unidade_comercial: 'UN',
        icms_origem: 0,
        icms_situacao_tributaria: '102',
      },
    ],
    formas_pagamento: [
      {
        forma_pagamento: '01',
        valor_pagamento: 100.0,
      },
    ],
  })

  console.log('NFe enviada para processamento:', nfe.status)
  console.log('Referencia:', nfe.ref)

  // 2. Consultar o status da NFe
  const status = await client.nfe.get(ref)

  console.log('Status:', status.status)
  if (status.status === 'autorizado') {
    console.log('Chave NFe:', status.chave_nfe)
    console.log('DANFE:', status.caminho_danfe)
  }
}

exemplo().catch(console.error)
```

**Nota sobre referencias:** A referencia (`ref`) e o identificador unico da emissao na sua aplicacao. Ela deve ser unica por token de acesso. E comum usar o ID do registro no seu banco de dados. Uma referencia pode ser reutilizada apenas se a emissao anterior resultou em erro.

## Ambientes

A Focus NFe oferece dois ambientes distintos:

### Homologacao

- **URL:** `https://homologacao.focusnfe.com.br`
- **Uso:** Desenvolvimento e testes
- **Caracteristicas:**
  - Notas emitidas nao possuem validade fiscal
  - Permite simular fluxos completos de emissao
  - Ideal para validar a integracao antes de ir para producao

### Producao

- **URL:** `https://api.focusnfe.com.br`
- **Uso:** Aplicacoes em producao
- **Caracteristicas:**
  - Notas emitidas possuem validade fiscal e tributaria
  - Todas as emissoes tem impacto real
  - Use apenas quando estiver pronto para emitir documentos validos

**Recomendacao:** Sempre desenvolva e teste no ambiente **HOMOLOGACAO** antes de migrar para producao.

```ts
// Desenvolvimento
const clientDev = new FocusNFeClient({
  token: process.env.FOCUSNFE_HOMOLOGACAO_TOKEN!,
  environment: 'HOMOLOGACAO',
})

// Producao
const clientProd = new FocusNFeClient({
  token: process.env.FOCUSNFE_PRODUCTION_TOKEN!,
  environment: 'PRODUCTION', // ou omitir (padrao)
})
```

## Usando um Fetch Customizado

Voce pode fornecer uma implementacao customizada de `fetch` para casos especiais como testes, mocks ou uso de bibliotecas alternativas:

```ts
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'
import { fetch as undiciFetch } from 'undici'

// Exemplo: usando undici
const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN!,
  fetch: undiciFetch as typeof globalThis.fetch,
})

// Exemplo: mock para testes
const mockFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  return new Response(JSON.stringify({ status: 'autorizado' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

const clientMock = new FocusNFeClient({
  token: 'test-token',
  fetch: mockFetch,
})
```

## Servicos Disponiveis

O `FocusNFeClient` expoe os seguintes servicos para interagir com a API da Focus NFe:

| Servico | Descricao |
|---------|-----------|
| `nfe` | Emissao, consulta, cancelamento e operacoes de NFe |
| `nfce` | Emissao, consulta, cancelamento e operacoes de NFCe |
| `nfse` | Emissao, consulta e cancelamento de NFSe |
| `nfseNacional` | NFSe no padrao nacional |
| `cte` | Emissao, consulta e cancelamento de CTe / CTe OS |
| `mdfe` | Emissao, consulta e operacoes de MDFe |
| `nfcom` | Emissao, consulta e cancelamento de NFCom |
| `nfeRecebidas` | Consulta e manifestacao de NFe recebidas |
| `cteRecebidas` | Consulta de CTe recebidas |
| `nfseRecebidas` | Consulta de NFSe recebidas |
| `empresas` | Cadastro e gestao de empresas emissoras |
| `webhooks` | Gerenciamento de gatilhos/webhooks |
| `consultas` | Consultas auxiliares (CEP, CNPJ, NCM, CFOP, municipios) |

Cada servico oferece metodos especificos para suas operacoes. Todos os metodos retornam Promises tipadas.

## Proximos Passos

Agora que voce configurou o cliente e realizou sua primeira requisicao, explore os guias avancados:

- [Tratamento de Erros](./error-handling.md) -- Como lidar com erros da API
- [Webhooks](./webhooks.md) -- Recebendo notificacoes em tempo real
- [Limites de Requisicoes](./rate-limits.md) -- Entendendo os limites da API

Para duvidas adicionais, entre em contato com o suporte da Focus NFe em suporte@focusnfe.com.br.
