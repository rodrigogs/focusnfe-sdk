# Lookups (Consultas)

The lookups service provides access to reference tables and essential utilities for issuing fiscal documents. Through it you can search NCM codes, CFOP codes, CNAE codes, CEP (postal codes), municipalities, service list items, municipal tax codes, CNPJ data, manage blocked emails, and download backups.

## Fiscal Codes (NCM and CFOP)

### NCM - Common Mercosur Nomenclature

Fiscal classification table for goods used in NFe and NFCe.

| Method | Description |
|--------|-------------|
| `ncm(params?)` | Search NCMs with filters by code, description, chapter, position, and subposition |
| `ncmByCodigo(codigo)` | Retrieve a specific NCM by code |

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// Search NCMs by description
const ncms = await client.consultas.ncm({
  descricao: 'parafuso'
})

for (const ncm of ncms) {
  console.log(`${ncm.codigo}: ${ncm.descricao_completa}`)
  console.log(`  Chapter: ${ncm.capitulo}`)
  console.log(`  Position: ${ncm.posicao}`)
}

// Search NCMs by chapter
const capitulo73 = await client.consultas.ncm({
  capitulo: '73' // Cast iron, iron, or steel works
})

// Search by partial code
const porCodigo = await client.consultas.ncm({
  codigo: '7318'
})

// Pagination with offset
const pagina2 = await client.consultas.ncm({
  descricao: 'aco',
  offset: 50
})

// Retrieve a specific NCM
const ncm = await client.consultas.ncmByCodigo('73181500')
console.log(`NCM: ${ncm.codigo} - ${ncm.descricao_completa}`)
```

### CFOP - Fiscal Operations and Services Code

Code table identifying the nature of the fiscal operation.

| Method | Description |
|--------|-------------|
| `cfop(params?)` | Search CFOPs with filters by code and description |
| `cfopByCodigo(codigo)` | Retrieve a specific CFOP by code |

```typescript
// Search CFOPs by description
const cfops = await client.consultas.cfop({
  descricao: 'venda'
})

for (const cfop of cfops) {
  console.log(`${cfop.codigo}: ${cfop.descricao}`)
}

// Search by code
const porCodigo = await client.consultas.cfop({
  codigo: '5102'
})

// Pagination
const pagina2 = await client.consultas.cfop({
  descricao: 'remessa',
  offset: 50
})

// Retrieve a specific CFOP
const cfop = await client.consultas.cfopByCodigo('5102')
console.log(`CFOP: ${cfop.codigo} - ${cfop.descricao}`)
```

## Addresses (CEP)

Brazilian address lookup by postal code (CEP) or location filters.

| Method | Description |
|--------|-------------|
| `cep(params)` | Search CEPs with filters by IBGE code, state (UF), street, and locality |
| `cepByCodigo(cep)` | Retrieve an address by specific CEP |

```typescript
// Search CEPs by locality and state
const ceps = await client.consultas.cep({
  localidade: 'Sao Paulo',
  uf: 'SP',
  logradouro: 'Paulista'
})

for (const cep of ceps) {
  console.log(`${cep.cep}: ${cep.tipo_logradouro} ${cep.nome_logradouro}`)
  console.log(`  District: ${cep.nome_bairro_inicial}`)
  console.log(`  Locality: ${cep.nome_localidade} - ${cep.uf}`)
}

// Search by IBGE municipality code
const porIbge = await client.consultas.cep({
  codigo_ibge: '3550308' // Sao Paulo
})

// Retrieve address by CEP
const endereco = await client.consultas.cepByCodigo('01310100')
console.log(`${endereco.nome_logradouro}, ${endereco.nome_localidade} - ${endereco.uf}`)
console.log(`IBGE code: ${endereco.codigo_ibge}`)
```

## CNAE - National Classification of Economic Activities

Lookup for CNAE codes used in business activity classification.

| Method | Description |
|--------|-------------|
| `cnae(params?)` | Search CNAEs with filters by code, description, section, division, group, class, and subclass |
| `cnaeByCodigo(codigo)` | Retrieve a specific CNAE by code |

```typescript
// Search CNAEs by description
const cnaes = await client.consultas.cnae({
  descricao: 'manutencao de veiculos'
})

for (const cnae of cnaes) {
  console.log(`${cnae.codigo_formatado}: ${cnae.descricao}`)
  console.log(`  Section: ${cnae.secao} - ${cnae.descricao_secao}`)
  console.log(`  Division: ${cnae.divisao} - ${cnae.descricao_divisao}`)
  console.log(`  Group: ${cnae.grupo} - ${cnae.descricao_grupo}`)
  console.log(`  Class: ${cnae.classe} - ${cnae.descricao_classe}`)
}

// Search by section
const secaoG = await client.consultas.cnae({
  secao: 'G' // Commerce
})

// Search by division
const divisao45 = await client.consultas.cnae({
  divisao: '45' // Vehicle commerce and repair
})

// Retrieve a specific CNAE
const cnae = await client.consultas.cnaeByCodigo('4520001')
console.log(`CNAE: ${cnae.codigo_formatado} - ${cnae.descricao}`)
```

## Municipalities and Services

### Municipalities

Brazilian municipality lookup with information about NFSe support.

| Method | Description |
|--------|-------------|
| `municipios(params?)` | Search municipalities with filters by state (UF), name, and NFSe status |
| `municipio(codigo)` | Retrieve a municipality by IBGE code |

```typescript
// List municipalities in a state
const municipiosSP = await client.consultas.municipios({
  sigla_uf: 'SP'
})

for (const mun of municipiosSP) {
  console.log(`${mun.codigo_municipio}: ${mun.nome_municipio} - ${mun.sigla_uf}`)
  console.log(`  NFSe enabled: ${mun.nfse_habilitada ? 'Yes' : 'No'}`)
  if (mun.provedor_nfse) {
    console.log(`  Provider: ${mun.provedor_nfse}`)
  }
}

// Search by name
const porNome = await client.consultas.municipios({
  nome_municipio: 'Campinas'
})

// Search municipalities with active NFSe
const comNfse = await client.consultas.municipios({
  sigla_uf: 'MG',
  status_nfse: 'ativo'
})

// Retrieve a specific municipality
const sp = await client.consultas.municipio('3550308')
console.log(`${sp.nome_municipio} - ${sp.nome_uf}`)
console.log(`NFSe enabled: ${sp.nfse_habilitada}`)
console.log(`Requires NFSe certificate: ${sp.requer_certificado_nfse}`)
console.log(`Has NFSe staging environment: ${sp.possui_ambiente_homologacao_nfse}`)
console.log(`Has NFSe cancellation: ${sp.possui_cancelamento_nfse}`)
console.log(`Address required: ${sp.endereco_obrigatorio_nfse}`)
console.log(`CPF/CNPJ required: ${sp.cpf_cnpj_obrigatorio_nfse}`)
```

### Service List Items

Lookup for a municipality's service list items, used in NFSe issuance.

| Method | Description |
|--------|-------------|
| `itensListaServico(codigoMunicipio, params?)` | List service items for a municipality |
| `itemListaServicoByCodigo(codigoMunicipio, codigoItem)` | Retrieve a specific service item |

```typescript
// List service items for Sao Paulo
const itens = await client.consultas.itensListaServico('3550308')

for (const item of itens) {
  console.log(`${item.codigo}: ${item.descricao}`)
  if (item.tax_rate) {
    console.log(`  Tax rate: ${item.tax_rate}%`)
  }
}

// Filter by description
const filtrados = await client.consultas.itensListaServico('3550308', {
  descricao: 'manutencao'
})

// Filter by code
const porCodigo = await client.consultas.itensListaServico('3550308', {
  codigo: '14.01'
})

// Retrieve a specific item
const item = await client.consultas.itemListaServicoByCodigo('3550308', '14.01')
console.log(`Item: ${item.codigo} - ${item.descricao}`)
```

### Municipal Tax Codes

Lookup for municipal tax codes used in NFSe issuance.

| Method | Description |
|--------|-------------|
| `codigosTributariosMunicipio(codigoMunicipio, params?)` | List tax codes for a municipality |
| `codigoTributarioMunicipioByCodigo(codigoMunicipio, codigoTributario)` | Retrieve a specific tax code |

```typescript
// List tax codes for Sao Paulo
const codigos = await client.consultas.codigosTributariosMunicipio('3550308')

for (const codigo of codigos) {
  console.log(`${codigo.codigo}: ${codigo.descricao}`)
  if (codigo.tax_rate) {
    console.log(`  Tax rate: ${codigo.tax_rate}%`)
  }
}

// Filter by description
const filtrados = await client.consultas.codigosTributariosMunicipio('3550308', {
  descricao: 'servicos'
})

// Retrieve a specific tax code
const codigo = await client.consultas.codigoTributarioMunicipioByCodigo(
  '3550308',
  '01.02'
)
console.log(`Code: ${codigo.codigo} - ${codigo.descricao}`)
```

## CNPJ Lookup

Query registered data for a CNPJ from the Brazilian Federal Revenue Service (Receita Federal).

| Method | Description |
|--------|-------------|
| `cnpj(cnpj)` | Look up CNPJ data |

```typescript
const resultado = await client.consultas.cnpj('12345678000190')

console.log(`Legal name: ${resultado.razao_social}`)
console.log(`CNPJ: ${resultado.cnpj}`)
console.log(`Registration status: ${resultado.situacao_cadastral}`)
console.log(`Primary CNAE: ${resultado.cnae_principal}`)
console.log(`Simples Nacional: ${resultado.optante_simples_nacional ? 'Yes' : 'No'}`)
console.log(`MEI: ${resultado.optante_mei ? 'Yes' : 'No'}`)

// Address
const end = resultado.endereco
console.log(`Address: ${end.logradouro}, ${end.numero} - ${end.bairro}`)
console.log(`${end.nome_municipio} - ${end.uf}, CEP: ${end.cep}`)
console.log(`IBGE code: ${end.codigo_ibge}`)
```

## Blocked Emails

Management of emails blocked due to bounces or rejections when sending fiscal documents.

| Method | Description |
|--------|-------------|
| `blockedEmail(email)` | Check if an email is blocked and the reason |
| `unblockEmail(email)` | Unblock an email |

```typescript
// Check if an email is blocked
const bloqueio = await client.consultas.blockedEmail('cliente@exemplo.com.br')

console.log(`Email: ${bloqueio.email}`)
console.log(`Block type: ${bloqueio.block_type}`)
if (bloqueio.bounce_type) {
  console.log(`Bounce type: ${bloqueio.bounce_type}`)
}
if (bloqueio.diagnostic_code) {
  console.log(`Diagnostic: ${bloqueio.diagnostic_code}`)
}
if (bloqueio.blocked_at) {
  console.log(`Blocked at: ${bloqueio.blocked_at}`)
}

// Unblock an email
await client.consultas.unblockEmail('cliente@exemplo.com.br')
console.log('Email unblocked successfully')
```

## Backups

Download links for monthly DANFE and XML backups of a company.

| Method | Description |
|--------|-------------|
| `backups(cnpj)` | Get monthly backup links by CNPJ |

```typescript
const resultado = await client.consultas.backups('12345678000190')

for (const backup of resultado.backups) {
  console.log(`Month: ${backup.mes}`)
  if (backup.danfes) {
    console.log(`  DANFEs: ${backup.danfes}`)
  }
  if (backup.xmls) {
    console.log(`  XMLs: ${backup.xmls}`)
  }
}
```

## Important Types

```typescript
// --- NCM ---
interface NcmQueryParams {
  codigo?: string
  descricao?: string
  capitulo?: string
  posicao?: string
  subposicao1?: string
  subposicao2?: string
  item1?: string
  item2?: string
  offset?: number
}

interface NcmResult {
  codigo: string
  descricao_completa: string
  capitulo: string
  posicao: string
  subposicao1: string
  subposicao2: string
  item1: string
  item2: string
}

// --- CFOP ---
interface CfopResult {
  codigo: string
  descricao: string
}

// --- CEP ---
interface CepResult {
  cep: string
  tipo?: string
  nome?: string
  uf: string
  nome_localidade: string
  codigo_ibge?: string
  tipo_logradouro?: string
  nome_logradouro?: string
  nome_bairro_inicial?: string
  descricao?: string
}

// --- CNAE ---
interface CnaeResult {
  codigo: string
  descricao: string
  secao: string
  descricao_secao: string
  divisao: string
  descricao_divisao: string
  grupo: string
  descricao_grupo: string
  classe: string
  descricao_classe: string
  subclasse: string
  descricao_subclasse: string
  codigo_formatado: string
}

// --- Municipality ---
interface MunicipioResult {
  codigo_municipio: string
  nome_municipio: string
  sigla_uf: string
  nome_uf: string
  nfse_habilitada: boolean
  requer_certificado_nfse?: boolean | null
  possui_ambiente_homologacao_nfse?: boolean | null
  possui_cancelamento_nfse?: boolean | null
  provedor_nfse?: string | null
  endereco_obrigatorio_nfse?: boolean | null
  cpf_cnpj_obrigatorio_nfse?: boolean | null
  codigo_cnae_obrigatorio_nfse?: boolean | null
  item_lista_servico_obrigatorio_nfse?: boolean | null
  codigo_tributario_municipio_obrigatorio_nfse?: boolean | null
  status_nfse?: MunicipioStatusNfse | null
}

// --- Service List Item ---
interface ItemListaServico {
  codigo: string
  descricao: string
  tax_rate?: string | null
}

// --- Municipal Tax Code ---
interface CodigoTributarioMunicipio {
  codigo: string
  descricao: string
  tax_rate?: string | null
}

// --- CNPJ ---
interface CnpjResult {
  razao_social: string
  cnpj: string
  situacao_cadastral: string
  cnae_principal: string
  optante_simples_nacional: boolean
  optante_mei: boolean
  endereco: {
    codigo_municipio: string
    codigo_siafi: string
    codigo_ibge: string
    nome_municipio: string
    logradouro: string
    complemento?: string | null
    numero?: string | null
    bairro: string
    cep: string
    uf: string
  }
}

// --- Blocked Email ---
interface BlockedEmailResult {
  email: string
  block_type: string
  bounce_type?: string | null
  diagnostic_code?: string | null
  blocked_at?: string | null
}

// --- Backup ---
interface BackupEntry {
  mes: string
  danfes?: string | null
  xmls?: string | null
}

interface BackupResult {
  backups: BackupEntry[]
}
```

## Important Notes

1. **Pagination**: The `ncm`, `cfop`, `cnae`, and `municipios` methods support pagination via the `offset` parameter. The API returns a fixed number of records per page.

2. **CNPJ lookup**: The returned data comes from the public Receita Federal database and may be outdated compared to the official registry.

3. **Municipalities and NFSe**: The `nfse_habilitada` field indicates whether the municipality has been integrated into the system. The auxiliary fields (`requer_certificado_nfse`, `endereco_obrigatorio_nfse`, etc.) describe the municipality's specific rules for NFSe issuance. **Municipality Status (`MunicipioStatusNfse`)** Possible values are: `ativo`, `fora_do_ar`, `pausado`, `em_implementacao`, `em_reimplementacao`, `inativo`, `nao_implementado`.

4. **Service list items and tax codes**: This data varies by municipality. Always query by the correct `codigoMunicipio` (IBGE code) before issuing an NFSe.

5. **Blocked emails**: Emails are automatically blocked after bounces from fiscal document deliveries. Use `unblockEmail` to allow new deliveries after correcting the address.

6. **Backups**: The download links returned in `danfes` and `xmls` have temporary validity. Download the files immediately after querying.

## Related

- **[Companies (Empresas)](./empresas.md)**: Register companies that use the codes looked up here
- **[Received Documents](./recebidas.md)**: Received documents that reference NCM, CFOP, and municipalities
