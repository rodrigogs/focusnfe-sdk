# Documentos Fiscais Recebidos

O modulo de documentos recebidos permite consultar e gerenciar notas fiscais eletrronicas recebidas pela empresa: NFe (produto), CTe (transporte) e NFSe (servico). Atraves desses servicos voce pode listar documentos, baixar XMLs, realizar manifestacao do destinatario (NFe) e registrar desacordo de prestacao (CTe).

## NFe Recebidas

Notas fiscais eletrronicas de produto recebidas pela empresa. O servico permite consultar documentos, baixar XMLs originais e de eventos (cancelamento, carta de correcao), manifestar o destinatario e reenviar webhooks.

### Conceitos-Chave

**Filtros de Listagem:**
- `pendente`: Retorna apenas NFe que ainda nao foram manifestadas
- `pendente_ciencia`: Retorna apenas NFe cuja ciencia da operacao ainda nao foi registrada
- `versao`: Filtra documentos cuja versao e maior que o valor informado, permitindo sincronizacao incremental

**Tipos de Manifestacao:**
- `ciencia`: Ciencia da operacao -- confirma que o destinatario tomou conhecimento da NFe. Obrigatoria antes das demais manifestacoes
- `confirmacao`: Confirmacao da operacao -- confirma que a operacao descrita na NFe foi realizada
- `desconhecimento`: Desconhecimento da operacao -- informa que o destinatario desconhece a operacao
- `nao_realizada`: Operacao nao realizada -- informa que a operacao nao foi concretizada. Requer `justificativa`

**Situacoes da NFe:**
- `autorizada`: NFe valida e autorizada pela SEFAZ
- `cancelada`: NFe cancelada pelo emitente
- `denegada`: NFe denegada pela SEFAZ

### Metodos

| Metodo | Descricao |
|--------|-----------|
| `list(params)` | Listar NFe recebidas com filtros de CNPJ, versao, pendente e pendente_ciencia |
| `get(chave)` | Obter uma NFe recebida pela chave de acesso |
| `getXml(chave)` | Baixar XML original da NFe |
| `getCancelamentoXml(chave)` | Baixar XML do evento de cancelamento |
| `getCartaCorrecaoXml(chave)` | Baixar XML da carta de correcao |
| `manifestar(chave, params)` | Registrar manifestacao do destinatario |
| `getManifestacao(chave)` | Consultar manifestacao registrada |
| `resendWebhook(chave)` | Reenviar webhook da NFe recebida |

### Exemplos

#### Listar NFe Recebidas

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// Listar todas as NFe recebidas de um CNPJ
const nfes = await client.nfeRecebidas.list({
  cnpj: '12345678000190'
})

for (const nfe of nfes) {
  console.log(`${nfe.chave_nfe}: ${nfe.nome_emitente}`)
  console.log(`  Valor: R$ ${nfe.valor_total}`)
  console.log(`  Situacao: ${nfe.situacao}`)
  console.log(`  Manifestacao: ${nfe.manifestacao_destinatario ?? 'nenhuma'}`)
}

// Listar apenas NFe pendentes de manifestacao
const pendentes = await client.nfeRecebidas.list({
  cnpj: '12345678000190',
  pendente: true
})

console.log(`${pendentes.length} NFe pendentes de manifestacao`)

// Listar apenas NFe pendentes de ciencia
const pendentesCiencia = await client.nfeRecebidas.list({
  cnpj: '12345678000190',
  pendente_ciencia: true
})

console.log(`${pendentesCiencia.length} NFe pendentes de ciencia`)

// Sincronizacao incremental: buscar apenas documentos novos
const novas = await client.nfeRecebidas.list({
  cnpj: '12345678000190',
  versao: 150
})
```

#### Obter Detalhes e XMLs

```typescript
const chave = '35260312345678000190550010000001231234567890'

// Obter detalhes da NFe
const nfe = await client.nfeRecebidas.get(chave)

console.log(`Emitente: ${nfe.nome_emitente} (${nfe.documento_emitente})`)
console.log(`Data emissao: ${nfe.data_emissao}`)
console.log(`Tipo: ${nfe.tipo_nfe}`)
console.log(`Versao: ${nfe.versao}`)

// Baixar XML original
const xml = await client.nfeRecebidas.getXml(chave)
console.log(`Content-Type: ${xml.contentType}`)
// xml.data contem o conteudo binario

// Baixar XML de cancelamento (se houver)
if (nfe.situacao === 'cancelada') {
  const cancelamentoXml = await client.nfeRecebidas.getCancelamentoXml(chave)
  console.log('XML de cancelamento obtido')
}

// Baixar XML da carta de correcao (se houver)
if (nfe.carta_correcao) {
  const cartaXml = await client.nfeRecebidas.getCartaCorrecaoXml(chave)
  console.log('XML da carta de correcao obtido')
}
```

#### Manifestar Destinatario

```typescript
const chave = '35260312345678000190550010000001231234567890'

// Passo 1: Registrar ciencia da operacao
const ciencia = await client.nfeRecebidas.manifestar(chave, {
  tipo: 'ciencia'
})

console.log(`Status SEFAZ: ${ciencia.status_sefaz}`)
console.log(`Mensagem: ${ciencia.mensagem_sefaz}`)
console.log(`Protocolo: ${ciencia.protocolo}`)

// Passo 2: Confirmar a operacao
const confirmacao = await client.nfeRecebidas.manifestar(chave, {
  tipo: 'confirmacao'
})

console.log(`Confirmacao registrada: ${confirmacao.protocolo}`)

// Ou: informar desconhecimento
const desconhecimento = await client.nfeRecebidas.manifestar(chave, {
  tipo: 'desconhecimento'
})

// Ou: informar operacao nao realizada (requer justificativa)
const naoRealizada = await client.nfeRecebidas.manifestar(chave, {
  tipo: 'nao_realizada',
  justificativa: 'Mercadoria nao foi entregue no prazo acordado'
})

// Consultar manifestacao registrada
const manifestacao = await client.nfeRecebidas.getManifestacao(chave)
console.log(`Tipo: ${manifestacao.tipo}`)
console.log(`Status: ${manifestacao.status}`)
```

#### Reenviar Webhook

```typescript
// Reenviar webhook para reprocessar a NFe no seu sistema
await client.nfeRecebidas.resendWebhook(chave)
console.log('Webhook reenviado com sucesso')
```

### Tipos Importantes

```typescript
interface NfeRecebida {
  nome_emitente: string
  documento_emitente: string
  cnpj_destinatario?: string
  chave_nfe: string
  valor_total: string
  data_emissao: string
  situacao: 'autorizada' | 'cancelada' | 'denegada'
  manifestacao_destinatario?:
    | 'ciencia'
    | 'confirmacao'
    | 'desconhecimento'
    | 'nao_realizada'
    | null
  nfe_completa?: boolean
  tipo_nfe: string
  versao: number
  digest_value?: string
  numero_carta_correcao?: string | null
  carta_correcao?: string | null
  data_carta_correcao?: string | null
  data_cancelamento?: string | null
  justificativa_cancelamento?: string | null
}

type ManifestacaoTipo =
  | 'ciencia'
  | 'confirmacao'
  | 'desconhecimento'
  | 'nao_realizada'

interface ManifestacaoParams {
  tipo: ManifestacaoTipo
  justificativa?: string // obrigatoria para nao_realizada
}

interface ManifestacaoResponse {
  status_sefaz: string
  mensagem_sefaz: string
  status: string
  protocolo: string
  tipo: ManifestacaoTipo
  justificativa?: string
}
```

### Notas Importantes

1. **Ciencia obrigatoria**: A manifestacao `ciencia` deve ser registrada antes de `confirmacao`, `desconhecimento` ou `nao_realizada`.

2. **Justificativa**: O campo `justificativa` e obrigatorio apenas para o tipo `nao_realizada`.

3. **XMLs binarios**: Os metodos `getXml`, `getCancelamentoXml` e `getCartaCorrecaoXml` retornam `BinaryResponse` com `data` (conteudo) e `contentType`.

4. **Sincronizacao incremental**: Use o parametro `versao` para buscar apenas documentos mais recentes que uma determinada versao, evitando reprocessar documentos ja conhecidos.

---

## CTe Recebidas

Conhecimentos de transporte eletronicos recebidos pela empresa. O servico permite consultar documentos, baixar XMLs e registrar evento de desacordo de prestacao de servico.

### Conceitos-Chave

**Evento de Desacordo:**
O desacordo e um evento fiscal que registra a discordancia do tomador do servico com a prestacao descrita no CTe. Ao registrar desacordo, o campo `observacoes` deve conter a justificativa detalhada.

### Metodos

| Metodo | Descricao |
|--------|-----------|
| `list(params)` | Listar CTe recebidos com filtros de CNPJ e versao |
| `get(chave)` | Obter um CTe recebido pela chave de acesso |
| `getXml(chave)` | Baixar XML original do CTe |
| `getCancelamentoXml(chave)` | Baixar XML do evento de cancelamento |
| `getCartaCorrecaoXml(chave)` | Baixar XML da carta de correcao |
| `desacordo(chave, params)` | Registrar evento de desacordo |
| `getDesacordo(chave)` | Consultar evento de desacordo registrado |

### Exemplos

#### Listar CTe Recebidos

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// Listar todos os CTe recebidos
const ctes = await client.cteRecebidas.list({
  cnpj: '12345678000190'
})

for (const cte of ctes) {
  console.log(`${cte.chave}: ${cte.nome_emitente}`)
  console.log(`  Valor: R$ ${cte.valor_total}`)
  console.log(`  Situacao: ${cte.situacao}`)
  console.log(`  Tipo: ${cte.tipo_cte}`)
}

// Sincronizacao incremental
const novos = await client.cteRecebidas.list({
  cnpj: '12345678000190',
  versao: 42
})
```

#### Obter Detalhes e XMLs

```typescript
const chave = '35260312345678000190570010000001231234567890'

// Obter detalhes do CTe
const cte = await client.cteRecebidas.get(chave)

console.log(`Emitente: ${cte.nome_emitente} (${cte.documento_emitente})`)
console.log(`Data emissao: ${cte.data_emissao}`)
console.log(`Versao: ${cte.versao}`)

// Baixar XML original
const xml = await client.cteRecebidas.getXml(chave)

// Baixar XML de cancelamento
if (cte.data_cancelamento) {
  const cancelamentoXml = await client.cteRecebidas.getCancelamentoXml(chave)
  console.log('XML de cancelamento obtido')
}

// Baixar XML da carta de correcao
if (cte.carta_correcao) {
  const cartaXml = await client.cteRecebidas.getCartaCorrecaoXml(chave)
  console.log('XML da carta de correcao obtido')
}
```

#### Registrar Desacordo

```typescript
const chave = '35260312345678000190570010000001231234567890'

// Registrar desacordo com a prestacao do servico de transporte
const desacordo = await client.cteRecebidas.desacordo(chave, {
  observacoes: 'Mercadoria entregue com avarias significativas na embalagem'
})

console.log(`Status SEFAZ: ${desacordo.status_sefaz}`)
console.log(`Mensagem: ${desacordo.mensagem_sefaz}`)
console.log(`Protocolo: ${desacordo.protocolo}`)
console.log(`Status: ${desacordo.status}`)

// Consultar desacordo registrado
const consulta = await client.cteRecebidas.getDesacordo(chave)
console.log(`Desacordo registrado - protocolo: ${consulta.protocolo}`)
```

### Tipos Importantes

```typescript
interface CteRecebida {
  nome_emitente: string
  documento_emitente: string
  cnpj_destinatario?: string
  chave: string
  valor_total: string
  data_emissao: string
  situacao: string
  tipo_cte: string
  versao: number
  digest_value?: string
  carta_correcao?: string | null
  data_carta_correcao?: string | null
  data_cancelamento?: string | null
  justificativa_cancelamento?: string | null
}

interface CteDesacordoParams {
  observacoes: string
}

interface CteDesacordoResponse {
  status_sefaz: string
  mensagem_sefaz: string
  status: string
  protocolo: string
}
```

### Notas Importantes

1. **Desacordo e irreversivel**: Uma vez registrado, o evento de desacordo nao pode ser cancelado.

2. **Observacoes obrigatorias**: O campo `observacoes` e obrigatorio ao registrar desacordo e deve conter a justificativa da discordancia.

3. **Diferenca em relacao a NFe**: O CTe nao possui manifestacao do destinatario como a NFe. O unico evento disponivel para o tomador e o desacordo.

---

## NFSe Recebidas

Notas fiscais de servico eletrronicas recebidas pela empresa. Servico mais simples, limitado a consulta e listagem, sem eventos de manifestacao ou desacordo.

### Metodos

| Metodo | Descricao |
|--------|-----------|
| `list(params)` | Listar NFSe recebidas com filtros de CNPJ, versao, completa e api_version |
| `get(chave)` | Obter uma NFSe recebida pela chave |

### Exemplos

#### Listar NFSe Recebidas

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// Listar NFSe recebidas
const nfses = await client.nfseRecebidas.list({
  cnpj: '12345678000190'
})

for (const nfse of nfses) {
  console.log(`${nfse.chave}: ${nfse.nome_prestador}`)
  console.log(`  Numero: ${nfse.numero}`)
  console.log(`  Valor servicos: R$ ${nfse.valor_servicos}`)
  console.log(`  Data emissao: ${nfse.data_emissao}`)
  console.log(`  Municipio: ${nfse.nome_municipio}`)
}

// Listar com dados completos
const completas = await client.nfseRecebidas.list({
  cnpj: '12345678000190',
  completa: true
})

// Especificar versao da API
const comVersao = await client.nfseRecebidas.list({
  cnpj: '12345678000190',
  api_version: '2'
})

// Sincronizacao incremental
const novas = await client.nfseRecebidas.list({
  cnpj: '12345678000190',
  versao: 75
})
```

#### Obter Detalhes da NFSe

```typescript
const chave = 'nfse-chave-exemplo-12345'

const nfse = await client.nfseRecebidas.get(chave)

console.log(`Prestador: ${nfse.nome_prestador} (${nfse.documento_prestador})`)
console.log(`Numero: ${nfse.numero}`)
console.log(`Valor: R$ ${nfse.valor_servicos}`)
console.log(`Status: ${nfse.status}`)
console.log(`Codigo verificacao: ${nfse.codigo_verificacao}`)

if (nfse.url) {
  console.log(`URL de visualizacao: ${nfse.url}`)
}
if (nfse.url_xml) {
  console.log(`URL do XML: ${nfse.url_xml}`)
}
```

### Tipos Importantes

```typescript
interface NfseRecebida {
  chave: string
  versao: number
  status: string
  numero: string
  numero_rps?: string | null
  serie_rps?: string | null
  data_emissao: string
  data_emissao_rps?: string | null
  codigo_verificacao?: string | null
  valor_servicos: string
  documento_prestador: string
  nome_prestador?: string | null
  inscricao_municipal_prestador?: string | null
  nome_municipio?: string | null
  sigla_uf?: string | null
  codigo_municipio?: string | null
  documento_tomador?: string | null
  url?: string | null
  url_xml?: string | null
}
```

### Notas Importantes

1. **Parametro `completa`**: Quando `true`, retorna os dados completos da NFSe. Caso contrario, retorna uma versao resumida.

2. **Parametro `api_version`**: Permite especificar a versao da API de NFSe utilizada pelo municipio do prestador.

3. **Sem eventos**: Diferente da NFe e do CTe, a NFSe recebida nao possui eventos de manifestacao ou desacordo. Apenas consulta e listagem estao disponiveis.

4. **URLs de acesso**: Os campos `url` e `url_xml` fornecem links diretos para visualizacao e download do XML da NFSe quando disponiveis.

## Relacionado

- **[Empresas](./empresas.md)**: Habilitar recebimento de documentos (`habilita_manifestacao`, `habilita_manifestacao_cte`)
- **[Consultas](./consultas.md)**: Consultar NCM, CFOP e outros codigos utilizados nos documentos
