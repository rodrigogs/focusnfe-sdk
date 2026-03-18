# Received Fiscal Documents

The received documents module allows you to query and manage electronic fiscal documents received by your company: NFe (products), CTe (transport), and NFSe (services). Through these services you can list documents, download XMLs, perform recipient acknowledgment (manifestacao do destinatario) for NFe, and register service disagreements for CTe.

## Received NFe

Electronic product invoices received by the company. The service allows querying documents, downloading original and event XMLs (cancellation, correction letter), performing recipient acknowledgment (manifestacao), and resending webhooks.

### Key Concepts

**Listing Filters:**
- `pendente`: Returns only NFe that have not yet been acknowledged
- `pendente_ciencia`: Returns only NFe whose awareness acknowledgment (ciencia da operacao) has not yet been registered
- `versao`: Filters documents whose version is greater than the provided value, enabling incremental synchronization

**Acknowledgment Types (Manifestacao):**
- `ciencia`: Awareness acknowledgment -- confirms that the recipient is aware of the NFe. Required before other acknowledgment types
- `confirmacao`: Operation confirmation -- confirms that the operation described in the NFe was carried out
- `desconhecimento`: Unknown operation -- informs that the recipient does not recognize the operation
- `nao_realizada`: Operation not performed -- informs that the operation was not completed. Requires a justificativa (justification)

**NFe Statuses (Situacao):**
- `autorizada`: Valid NFe authorized by SEFAZ
- `cancelada`: NFe cancelled by the issuer
- `denegada`: NFe denied by SEFAZ

### Methods

| Method | Description |
|--------|-------------|
| `list(params)` | List received NFe with filters for CNPJ, versao, pendente, and pendente_ciencia |
| `get(chave)` | Retrieve a received NFe by access key |
| `getXml(chave)` | Download the original NFe XML |
| `getCancelamentoXml(chave)` | Download the cancellation event XML |
| `getCartaCorrecaoXml(chave)` | Download the correction letter XML |
| `manifestar(chave, params)` | Register recipient acknowledgment (manifestacao) |
| `getManifestacao(chave)` | Retrieve registered acknowledgment |
| `resendWebhook(chave)` | Resend webhook for the received NFe |

### Examples

#### List Received NFe

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// List all received NFe for a CNPJ
const nfes = await client.nfeRecebidas.list({
  cnpj: '12345678000190'
})

for (const nfe of nfes) {
  console.log(`${nfe.chave_nfe}: ${nfe.nome_emitente}`)
  console.log(`  Value: R$ ${nfe.valor_total}`)
  console.log(`  Status: ${nfe.situacao}`)
  console.log(`  Acknowledgment: ${nfe.manifestacao_destinatario ?? 'none'}`)
}

// List only NFe pending acknowledgment
const pendentes = await client.nfeRecebidas.list({
  cnpj: '12345678000190',
  pendente: true
})

console.log(`${pendentes.length} NFe pending acknowledgment`)

// List only NFe pending awareness
const pendentesCiencia = await client.nfeRecebidas.list({
  cnpj: '12345678000190',
  pendente_ciencia: true
})

console.log(`${pendentesCiencia.length} NFe pending awareness`)

// Incremental sync: fetch only new documents
const novas = await client.nfeRecebidas.list({
  cnpj: '12345678000190',
  versao: 150
})
```

#### Retrieve Details and XMLs

```typescript
const chave = '35260312345678000190550010000001231234567890'

// Retrieve NFe details
const nfe = await client.nfeRecebidas.get(chave)

console.log(`Issuer: ${nfe.nome_emitente} (${nfe.documento_emitente})`)
console.log(`Issue date: ${nfe.data_emissao}`)
console.log(`Type: ${nfe.tipo_nfe}`)
console.log(`Version: ${nfe.versao}`)

// Download original XML
const xml = await client.nfeRecebidas.getXml(chave)
console.log(`Content-Type: ${xml.contentType}`)
// xml.data contains the binary content

// Download cancellation XML (if applicable)
if (nfe.situacao === 'cancelada') {
  const cancelamentoXml = await client.nfeRecebidas.getCancelamentoXml(chave)
  console.log('Cancellation XML retrieved')
}

// Download correction letter XML (if applicable)
if (nfe.carta_correcao) {
  const cartaXml = await client.nfeRecebidas.getCartaCorrecaoXml(chave)
  console.log('Correction letter XML retrieved')
}
```

#### Recipient Acknowledgment (Manifestacao)

```typescript
const chave = '35260312345678000190550010000001231234567890'

// Step 1: Register awareness (ciencia da operacao)
const ciencia = await client.nfeRecebidas.manifestar(chave, {
  tipo: 'ciencia'
})

console.log(`SEFAZ status: ${ciencia.status_sefaz}`)
console.log(`Message: ${ciencia.mensagem_sefaz}`)
console.log(`Protocol: ${ciencia.protocolo}`)

// Step 2: Confirm the operation
const confirmacao = await client.nfeRecebidas.manifestar(chave, {
  tipo: 'confirmacao'
})

console.log(`Confirmation registered: ${confirmacao.protocolo}`)

// Or: report unknown operation
const desconhecimento = await client.nfeRecebidas.manifestar(chave, {
  tipo: 'desconhecimento'
})

// Or: report operation not performed (requires justificativa)
const naoRealizada = await client.nfeRecebidas.manifestar(chave, {
  tipo: 'nao_realizada',
  justificativa: 'Mercadoria nao foi entregue no prazo acordado'
})

// Retrieve registered acknowledgment
const manifestacao = await client.nfeRecebidas.getManifestacao(chave)
console.log(`Type: ${manifestacao.tipo}`)
console.log(`Status: ${manifestacao.status}`)
```

#### Resend Webhook

```typescript
// Resend webhook to reprocess the NFe in your system
await client.nfeRecebidas.resendWebhook(chave)
console.log('Webhook resent successfully')
```

### Important Types

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
  justificativa?: string // required for nao_realizada
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

### Important Notes

1. **Awareness required first**: The `ciencia` acknowledgment must be registered before `confirmacao`, `desconhecimento`, or `nao_realizada`.

2. **Justification**: The `justificativa` field is required only for the `nao_realizada` type.

3. **Binary XMLs**: The `getXml`, `getCancelamentoXml`, and `getCartaCorrecaoXml` methods return `BinaryResponse` with `data` (content) and `contentType`.

4. **Incremental sync**: Use the `versao` parameter to fetch only documents newer than a given version, avoiding reprocessing of already known documents.

---

## Received CTe

Electronic transport documents received by the company. The service allows querying documents, downloading XMLs, and registering service disagreement events.

### Key Concepts

**Service Disagreement Event (Desacordo):**
The disagreement is a fiscal event that registers the service client's (tomador) disagreement with the service described in the CTe. When registering a disagreement, the `observacoes` field must contain a detailed justification.

**Disagreement Status (`CteDesacordoStatus`)** Possible statuses are: `evento_registrado`, `erro_autorizacao`.

### Methods

| Method | Description |
|--------|-------------|
| `list(params)` | List received CTe with filters for CNPJ and versao |
| `get(chave)` | Retrieve a received CTe by access key |
| `getXml(chave)` | Download the original CTe XML |
| `getCancelamentoXml(chave)` | Download the cancellation event XML |
| `getCartaCorrecaoXml(chave)` | Download the correction letter XML |
| `desacordo(chave, params)` | Register a disagreement event |
| `getDesacordo(chave)` | Retrieve a registered disagreement event |

### Examples

#### List Received CTe

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// List all received CTe
const ctes = await client.cteRecebidas.list({
  cnpj: '12345678000190'
})

for (const cte of ctes) {
  console.log(`${cte.chave}: ${cte.nome_emitente}`)
  console.log(`  Value: R$ ${cte.valor_total}`)
  console.log(`  Status: ${cte.situacao}`)
  console.log(`  Type: ${cte.tipo_cte}`)
}

// Incremental sync
const novos = await client.cteRecebidas.list({
  cnpj: '12345678000190',
  versao: 42
})
```

#### Retrieve Details and XMLs

```typescript
const chave = '35260312345678000190570010000001231234567890'

// Retrieve CTe details
const cte = await client.cteRecebidas.get(chave)

console.log(`Issuer: ${cte.nome_emitente} (${cte.documento_emitente})`)
console.log(`Issue date: ${cte.data_emissao}`)
console.log(`Version: ${cte.versao}`)

// Download original XML
const xml = await client.cteRecebidas.getXml(chave)

// Download cancellation XML
if (cte.data_cancelamento) {
  const cancelamentoXml = await client.cteRecebidas.getCancelamentoXml(chave)
  console.log('Cancellation XML retrieved')
}

// Download correction letter XML
if (cte.carta_correcao) {
  const cartaXml = await client.cteRecebidas.getCartaCorrecaoXml(chave)
  console.log('Correction letter XML retrieved')
}
```

#### Register a Disagreement

```typescript
const chave = '35260312345678000190570010000001231234567890'

// Register a disagreement with the transport service
const desacordo = await client.cteRecebidas.desacordo(chave, {
  observacoes: 'Mercadoria entregue com avarias significativas na embalagem'
})

console.log(`SEFAZ status: ${desacordo.status_sefaz}`)
console.log(`Message: ${desacordo.mensagem_sefaz}`)
console.log(`Protocol: ${desacordo.protocolo}`)
console.log(`Status: ${desacordo.status}`)

// Retrieve registered disagreement
const consulta = await client.cteRecebidas.getDesacordo(chave)
console.log(`Disagreement registered - protocol: ${consulta.protocolo}`)
```

### Important Types

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
  status: CteDesacordoStatus
  protocolo: string
}
```

### Important Notes

1. **Disagreement is irreversible**: Once registered, a disagreement event cannot be cancelled.

2. **Observations required**: The `observacoes` field is required when registering a disagreement and must contain the justification for the dispute.

3. **Different from NFe**: The CTe does not have recipient acknowledgment (manifestacao) like the NFe. The only available event for the service client is the disagreement.

---

## Received NFSe

Electronic service invoices received by the company. A simpler service, limited to queries and listing, without acknowledgment or disagreement events.

### Methods

| Method | Description |
|--------|-------------|
| `list(params)` | List received NFSe with filters for CNPJ, versao, completa, and api_version |
| `get(chave)` | Retrieve a received NFSe by key |

### Examples

#### List Received NFSe

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// List received NFSe
const nfses = await client.nfseRecebidas.list({
  cnpj: '12345678000190'
})

for (const nfse of nfses) {
  console.log(`${nfse.chave}: ${nfse.nome_prestador}`)
  console.log(`  Number: ${nfse.numero}`)
  console.log(`  Service value: R$ ${nfse.valor_servicos}`)
  console.log(`  Issue date: ${nfse.data_emissao}`)
  console.log(`  Municipality: ${nfse.nome_municipio}`)
}

// List with full data
const completas = await client.nfseRecebidas.list({
  cnpj: '12345678000190',
  completa: true
})

// Specify API version
const comVersao = await client.nfseRecebidas.list({
  cnpj: '12345678000190',
  api_version: '2'
})

// Incremental sync
const novas = await client.nfseRecebidas.list({
  cnpj: '12345678000190',
  versao: 75
})
```

#### Retrieve NFSe Details

```typescript
const chave = 'nfse-chave-exemplo-12345'

const nfse = await client.nfseRecebidas.get(chave)

console.log(`Provider: ${nfse.nome_prestador} (${nfse.documento_prestador})`)
console.log(`Number: ${nfse.numero}`)
console.log(`Value: R$ ${nfse.valor_servicos}`)
console.log(`Status: ${nfse.status}`)
console.log(`Verification code: ${nfse.codigo_verificacao}`)

if (nfse.url) {
  console.log(`View URL: ${nfse.url}`)
}
if (nfse.url_xml) {
  console.log(`XML URL: ${nfse.url_xml}`)
}
```

### Important Types

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

### Important Notes

1. **The `completa` parameter**: When `true`, returns full NFSe data. Otherwise, returns a summary version.

2. **The `api_version` parameter**: Allows specifying the NFSe API version used by the provider's municipality.

3. **No events**: Unlike NFe and CTe, received NFSe does not support acknowledgment or disagreement events. Only query and listing are available.

4. **Access URLs**: The `url` and `url_xml` fields provide direct links for viewing and downloading the NFSe XML when available.

## Related

- **[Companies (Empresas)](./empresas.md)**: Enable document receiving (`habilita_manifestacao`, `habilita_manifestacao_cte`)
- **[Lookups (Consultas)](./consultas.md)**: Look up NCM, CFOP, and other codes used in documents
