# Companies (Empresas)

The companies service manages the issuing companies registered in your Focus NFe account. Through it you can create, list, retrieve, update, and remove companies, including digital certificate configuration, fiscal document enablement, series numbering, and CSC tokens for NFCe.

## Key Concepts

**Identifier:**
The company `id` can be `string` or `number`, depending on how it was created. Use the same type returned by the API when referencing the company.

**Dry Run Mode:**
The `create` and `update` methods accept a `dryRun: true` option, which validates the submitted data without persisting changes. Useful for validating certificates and configurations before applying them.

**Digital Certificate:**
- `arquivo_certificado_base64`: A1 certificate encoded in base64
- `senha_certificado`: Certificate password
- `certificado_especifico`: Whether the company uses its own certificate (different from the account certificate)
- `certificado_valido_ate` / `certificado_valido_de`: Validity period (read-only)

**Enablement Flags (Habilitacoes):**
Boolean fields controlling which fiscal document types the company can issue and receive:
- `habilita_nfe`, `habilita_nfce`, `habilita_nfse`, `habilita_cte`, `habilita_mdfe`
- `habilita_manifestacao`, `habilita_manifestacao_cte` (document receiving)
- `habilita_nfsen_producao`, `habilita_nfsen_homologacao` (NFSe Nacional)
- `habilita_contingencia_offline_nfce` (NFCe offline contingency)

**CSC (Taxpayer Security Code):**
Tokens required for NFCe issuance, separated by environment:
- `csc_nfce_producao` / `id_token_nfce_producao`
- `csc_nfce_homologacao` / `id_token_nfce_homologacao`

**Tax Regime (Regime Tributario):**
- `1` - Simples Nacional (simplified national regime)
- `2` - Simples Nacional with excess revenue sublimit
- `3` - Regular regime (Regime Normal)

## Methods

| Method | Description |
|--------|-------------|
| `create(params, options?)` | Create a new company. Supports `dryRun` for validation |
| `list(params?)` | List companies with optional CNPJ or CPF filter |
| `get(id)` | Retrieve a company by ID (`string \| number`) |
| `update(id, params, options?)` | Update a company. Supports `dryRun` for validation |
| `remove(id)` | Remove a company |

## Examples

### Create a Company

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// Create a company with basic data
const empresa = await client.empresas.create({
  nome: 'Empresa Exemplo LTDA',
  nome_fantasia: 'Exemplo',
  cnpj: '12345678000190',
  inscricao_estadual: 123456789,
  regime_tributario: 1, // Simples Nacional
  email: 'fiscal@exemplo.com.br',
  telefone: '1199999999',
  logradouro: 'Rua das Flores',
  numero: '100',
  complemento: 'Sala 201',
  bairro: 'Centro',
  cep: '01001000',
  municipio: 'Sao Paulo',
  uf: 'SP',
  habilita_nfe: true,
  habilita_nfce: true,
  habilita_nfse: true,
  habilita_manifestacao: true
})

console.log(`Company created: ${empresa.id}`)
console.log(`Name: ${empresa.nome}`)
console.log(`CNPJ: ${empresa.cnpj}`)
```

### Validate Before Creating (Dry Run)

```typescript
// Validate data without creating the company
try {
  const validacao = await client.empresas.create(
    {
      nome: 'Empresa Teste LTDA',
      nome_fantasia: 'Teste',
      cnpj: '98765432000199',
      regime_tributario: 3,
      email: 'fiscal@teste.com.br',
      logradouro: 'Av. Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cep: '01310100',
      municipio: 'Sao Paulo',
      uf: 'SP'
    },
    { dryRun: true }
  )

  console.log('Data is valid, you may proceed with creation')
} catch (error) {
  console.error('Invalid data:', error)
}
```

### Create a Company with Digital Certificate

```typescript
import * as fs from 'fs'

// Read A1 certificate and convert to base64
const certificado = fs.readFileSync('./certificado.pfx')
const certificadoBase64 = certificado.toString('base64')

const empresa = await client.empresas.create({
  nome: 'Empresa com Certificado LTDA',
  nome_fantasia: 'Certificada',
  cnpj: '11222333000144',
  regime_tributario: 3,
  email: 'fiscal@certificada.com.br',
  logradouro: 'Rua Principal',
  numero: '50',
  bairro: 'Centro',
  cep: '04001000',
  municipio: 'Sao Paulo',
  uf: 'SP',
  arquivo_certificado_base64: certificadoBase64,
  senha_certificado: 'senha-do-certificado',
  certificado_especifico: true,
  habilita_nfe: true
})

console.log(`Certificate valid until: ${empresa.certificado_valido_ate}`)
```

### Create a Company with CSC for NFCe

```typescript
const empresa = await client.empresas.create({
  nome: 'Loja Varejo LTDA',
  nome_fantasia: 'Loja Varejo',
  cnpj: '55666777000188',
  regime_tributario: 1,
  email: 'fiscal@varejo.com.br',
  logradouro: 'Av. Comercial',
  numero: '200',
  bairro: 'Comercio',
  cep: '30130000',
  municipio: 'Belo Horizonte',
  uf: 'MG',
  habilita_nfce: true,
  csc_nfce_producao: 'CSC-TOKEN-PRODUCAO-AQUI',
  id_token_nfce_producao: '000001',
  csc_nfce_homologacao: 'CSC-TOKEN-HOMOLOGACAO-AQUI',
  id_token_nfce_homologacao: '000001',
  serie_nfce_producao: 1,
  proximo_numero_nfce_producao: 1
})

console.log(`NFCe enabled: ${empresa.habilita_nfce}`)
```

### List Companies

```typescript
// List all companies
const empresas = await client.empresas.list()

for (const empresa of empresas) {
  console.log(`${empresa.id}: ${empresa.nome} (${empresa.cnpj})`)
  console.log(`  NFe: ${empresa.habilita_nfe ? 'Yes' : 'No'}`)
  console.log(`  NFCe: ${empresa.habilita_nfce ? 'Yes' : 'No'}`)
  console.log(`  NFSe: ${empresa.habilita_nfse ? 'Yes' : 'No'}`)
  if (empresa.certificado_valido_ate) {
    console.log(`  Certificate valid until: ${empresa.certificado_valido_ate}`)
  }
}

// Filter by CNPJ
const porCnpj = await client.empresas.list({
  cnpj: '12345678000190'
})

// Filter by CPF (for sole proprietor companies)
const porCpf = await client.empresas.list({
  cpf: '12345678901'
})
```

### Retrieve a Company

```typescript
// Retrieve by ID (string or number)
const empresa = await client.empresas.get('empresa-id-123')

console.log(`Name: ${empresa.nome}`)
console.log(`Trade name: ${empresa.nome_fantasia}`)
console.log(`CNPJ: ${empresa.cnpj}`)
console.log(`Tax regime: ${empresa.regime_tributario}`)
console.log(`Email: ${empresa.email}`)
console.log(`Address: ${empresa.logradouro}, ${empresa.numero} - ${empresa.bairro}`)
console.log(`City: ${empresa.municipio}/${empresa.uf}`)

// Check certificate
if (empresa.certificado_valido_ate) {
  const validade = new Date(empresa.certificado_valido_ate)
  const hoje = new Date()
  const diasRestantes = Math.ceil(
    (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  )
  console.log(`Certificate: ${diasRestantes} days remaining`)
}

// Check enablement flags
console.log('Enabled documents:')
console.log(`  NFe: ${empresa.habilita_nfe}`)
console.log(`  NFCe: ${empresa.habilita_nfce}`)
console.log(`  NFSe: ${empresa.habilita_nfse}`)
console.log(`  CTe: ${empresa.habilita_cte}`)
console.log(`  MDFe: ${empresa.habilita_mdfe}`)
console.log(`  NFe receiving: ${empresa.habilita_manifestacao}`)
console.log(`  CTe receiving: ${empresa.habilita_manifestacao_cte}`)
```

### Update a Company

```typescript
// Partial update
const atualizada = await client.empresas.update('empresa-id-123', {
  email: 'novo-email@exemplo.com.br',
  telefone: '11988887777',
  habilita_cte: true,
  habilita_mdfe: true
})

console.log(`Company updated: ${atualizada.nome}`)

// Update digital certificate
const novoCertificado = fs.readFileSync('./novo-certificado.pfx')

const comCertificado = await client.empresas.update('empresa-id-123', {
  arquivo_certificado_base64: novoCertificado.toString('base64'),
  senha_certificado: 'nova-senha'
})

console.log(`New certificate valid until: ${comCertificado.certificado_valido_ate}`)

// Update numbering
const comNumeracao = await client.empresas.update('empresa-id-123', {
  proximo_numero_nfe_producao: 500,
  serie_nfe_producao: 2
})

// Validate update without persisting (dry run)
const validacao = await client.empresas.update(
  'empresa-id-123',
  { regime_tributario: 3 },
  { dryRun: true }
)

console.log('Update validated successfully')
```

### Remove a Company

```typescript
await client.empresas.remove('empresa-id-123')
console.log('Company removed successfully')
```

## Important Types

```typescript
interface EmpresaCreateParams {
  // Basic data (required)
  nome: string
  nome_fantasia: string
  cnpj: string
  regime_tributario: number // 1, 2, or 3
  email: string

  // Address (required)
  logradouro: string
  numero: string
  bairro: string
  cep: string
  municipio: string
  uf: string

  // Optional
  inscricao_estadual?: number
  inscricao_municipal?: number
  telefone?: string
  complemento?: string

  // Enablement flags
  habilita_nfe?: boolean
  habilita_nfce?: boolean
  habilita_nfse?: boolean
  habilita_cte?: boolean
  habilita_mdfe?: boolean
  habilita_manifestacao?: boolean
  habilita_manifestacao_cte?: boolean

  // Digital certificate
  arquivo_certificado_base64?: string
  senha_certificado?: string
  certificado_especifico?: boolean

  // CSC for NFCe
  csc_nfce_producao?: string
  id_token_nfce_producao?: string
  csc_nfce_homologacao?: string
  id_token_nfce_homologacao?: string

  // Numbering (NFe, NFCe, NFSe, CTe, MDFe...)
  proximo_numero_nfe_producao?: number
  serie_nfe_producao?: number
  // ... additional numbering fields per document type and environment
}

// EmpresaUpdateParams is Partial<EmpresaCreateParams>
type EmpresaUpdateParams = Partial<EmpresaCreateParams>

interface EmpresaCreateOptions {
  dryRun?: boolean
}

interface EmpresaUpdateOptions {
  dryRun?: boolean
}

interface Empresa {
  id: string | number
  nome: string
  nome_fantasia: string
  cnpj: string
  cpf?: string
  inscricao_estadual?: string | null
  inscricao_municipal?: string | null
  regime_tributario?: string | null
  email?: string | null
  telefone?: string | null

  // Address
  logradouro?: string | null
  numero?: string | null
  bairro?: string | null
  cep?: string | null
  municipio?: string | null
  uf?: string | null
  codigo_municipio?: string | null

  // Enablement flags
  habilita_nfe?: boolean
  habilita_nfce?: boolean
  habilita_nfse?: boolean
  habilita_cte?: boolean
  habilita_mdfe?: boolean
  habilita_manifestacao?: boolean
  habilita_manifestacao_cte?: boolean

  // Certificate
  certificado_valido_ate?: string | null
  certificado_valido_de?: string | null
  certificado_cnpj?: string | null
  certificado_especifico?: boolean

  // Numbering, CSC, responsible party, etc.
  // ... full fields available in the Empresa interface
}
```

## Important Notes

1. **ID as `string | number`**: The company identifier can be a string or number. Use the type returned by the API without converting.

2. **Dry Run**: Always validate with `dryRun: true` before creating or updating companies in production, especially when uploading digital certificates.

3. **A1 Certificate**: Only A1 type certificates (.pfx files) are supported. Convert to base64 before sending.

4. **Numbering fields**: Each document type (NFe, NFCe, NFSe, CTe, MDFe) has separate `proximo_numero` and `serie` fields for production and homologacao environments.

5. **Removal**: Company removal is irreversible. Ensure there are no pending documents before removing.

## Related

- **[Received Documents](./recebidas.md)**: Query NFe, CTe, and NFSe received by registered companies
- **[Lookups (Consultas)](./consultas.md)**: Look up municipality codes, NCM, and CFOP for data entry
