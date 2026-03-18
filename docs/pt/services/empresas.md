# Empresas

O servico de empresas permite gerenciar as empresas (emitentes) cadastradas na sua conta FocusNFe. Atraves dele voce pode criar, listar, consultar, atualizar e remover empresas, incluindo configuracoes de certificado digital, habilitacoes de documentos fiscais, numeracao de series e tokens CSC para NFCe.

## Conceitos-Chave

**Identificador:**
O `id` da empresa pode ser `string` ou `number`, dependendo de como foi criada. Use o mesmo tipo retornado pela API ao referenciar a empresa.

**Modo Dry Run:**
Os metodos `create` e `update` aceitam a opcao `dryRun: true`, que valida os dados enviados sem persistir alteracoes. Util para validar certificados e configuracoes antes de aplicar.

**Certificado Digital:**
- `arquivo_certificado_base64`: Certificado A1 codificado em base64
- `senha_certificado`: Senha do certificado
- `certificado_especifico`: Define se a empresa usa certificado proprio (diferente do certificado da conta)
- `certificado_valido_ate` / `certificado_valido_de`: Periodo de validade (somente leitura)

**Habilitacoes:**
Campos booleanos que controlam quais tipos de documento fiscal a empresa pode emitir e receber:
- `habilita_nfe`, `habilita_nfce`, `habilita_nfse`, `habilita_cte`, `habilita_mdfe`
- `habilita_manifestacao`, `habilita_manifestacao_cte` (recebimento de documentos)
- `habilita_nfsen_producao`, `habilita_nfsen_homologacao` (NFSe Nacional)
- `habilita_contingencia_offline_nfce` (contingencia NFCe)

**CSC (Codigo de Seguranca do Contribuinte):**
Tokens exigidos para emissao de NFCe, separados por ambiente:
- `csc_nfce_producao` / `id_token_nfce_producao`
- `csc_nfce_homologacao` / `id_token_nfce_homologacao`

**Regime Tributario:**
- `1` - Simples Nacional
- `2` - Simples Nacional com excesso de sublimite de receita bruta
- `3` - Regime Normal

## Metodos

| Metodo | Descricao |
|--------|-----------|
| `create(params, options?)` | Criar nova empresa. Suporta `dryRun` para validacao |
| `list(params?)` | Listar empresas com filtro opcional por CNPJ ou CPF |
| `get(id)` | Obter uma empresa por ID (`string \| number`) |
| `update(id, params, options?)` | Atualizar empresa. Suporta `dryRun` para validacao |
| `remove(id)` | Remover empresa |

## Exemplos

### Criar Empresa

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// Criar empresa com dados basicos
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

console.log(`Empresa criada: ${empresa.id}`)
console.log(`Nome: ${empresa.nome}`)
console.log(`CNPJ: ${empresa.cnpj}`)
```

### Validar Antes de Criar (Dry Run)

```typescript
// Validar dados sem criar a empresa
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

  console.log('Dados validos, pode prosseguir com a criacao')
} catch (error) {
  console.error('Dados invalidos:', error)
}
```

### Criar Empresa com Certificado Digital

```typescript
import * as fs from 'fs'

// Ler certificado A1 e converter para base64
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

console.log(`Certificado valido ate: ${empresa.certificado_valido_ate}`)
```

### Criar Empresa com CSC para NFCe

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

console.log(`NFCe habilitada: ${empresa.habilita_nfce}`)
```

### Listar Empresas

```typescript
// Listar todas as empresas
const empresas = await client.empresas.list()

for (const empresa of empresas) {
  console.log(`${empresa.id}: ${empresa.nome} (${empresa.cnpj})`)
  console.log(`  NFe: ${empresa.habilita_nfe ? 'Sim' : 'Nao'}`)
  console.log(`  NFCe: ${empresa.habilita_nfce ? 'Sim' : 'Nao'}`)
  console.log(`  NFSe: ${empresa.habilita_nfse ? 'Sim' : 'Nao'}`)
  if (empresa.certificado_valido_ate) {
    console.log(`  Certificado valido ate: ${empresa.certificado_valido_ate}`)
  }
}

// Filtrar por CNPJ
const porCnpj = await client.empresas.list({
  cnpj: '12345678000190'
})

// Filtrar por CPF (para empresas de pessoa fisica)
const porCpf = await client.empresas.list({
  cpf: '12345678901'
})
```

### Obter Empresa

```typescript
// Obter por ID (string ou number)
const empresa = await client.empresas.get('empresa-id-123')

console.log(`Nome: ${empresa.nome}`)
console.log(`Nome fantasia: ${empresa.nome_fantasia}`)
console.log(`CNPJ: ${empresa.cnpj}`)
console.log(`Regime tributario: ${empresa.regime_tributario}`)
console.log(`Email: ${empresa.email}`)
console.log(`Endereco: ${empresa.logradouro}, ${empresa.numero} - ${empresa.bairro}`)
console.log(`Municipio: ${empresa.municipio}/${empresa.uf}`)

// Verificar certificado
if (empresa.certificado_valido_ate) {
  const validade = new Date(empresa.certificado_valido_ate)
  const hoje = new Date()
  const diasRestantes = Math.ceil(
    (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  )
  console.log(`Certificado: ${diasRestantes} dias restantes`)
}

// Verificar habilitacoes
console.log('Habilitacoes:')
console.log(`  NFe: ${empresa.habilita_nfe}`)
console.log(`  NFCe: ${empresa.habilita_nfce}`)
console.log(`  NFSe: ${empresa.habilita_nfse}`)
console.log(`  CTe: ${empresa.habilita_cte}`)
console.log(`  MDFe: ${empresa.habilita_mdfe}`)
console.log(`  Manifestacao NFe: ${empresa.habilita_manifestacao}`)
console.log(`  Manifestacao CTe: ${empresa.habilita_manifestacao_cte}`)
```

### Atualizar Empresa

```typescript
// Atualizar dados parciais
const atualizada = await client.empresas.update('empresa-id-123', {
  email: 'novo-email@exemplo.com.br',
  telefone: '11988887777',
  habilita_cte: true,
  habilita_mdfe: true
})

console.log(`Empresa atualizada: ${atualizada.nome}`)

// Atualizar certificado digital
const novoCertificado = fs.readFileSync('./novo-certificado.pfx')

const comCertificado = await client.empresas.update('empresa-id-123', {
  arquivo_certificado_base64: novoCertificado.toString('base64'),
  senha_certificado: 'nova-senha'
})

console.log(`Novo certificado valido ate: ${comCertificado.certificado_valido_ate}`)

// Atualizar numeracao
const comNumeracao = await client.empresas.update('empresa-id-123', {
  proximo_numero_nfe_producao: 500,
  serie_nfe_producao: 2
})

// Validar atualizacao sem persistir (dry run)
const validacao = await client.empresas.update(
  'empresa-id-123',
  { regime_tributario: 3 },
  { dryRun: true }
)

console.log('Atualizacao validada com sucesso')
```

### Remover Empresa

```typescript
await client.empresas.remove('empresa-id-123')
console.log('Empresa removida com sucesso')
```

## Tipos Importantes

```typescript
interface EmpresaCreateParams {
  // Dados basicos (obrigatorios)
  nome: string
  nome_fantasia: string
  cnpj: string
  regime_tributario: number // 1, 2 ou 3
  email: string

  // Endereco (obrigatorios)
  logradouro: string
  numero: string
  bairro: string
  cep: string
  municipio: string
  uf: string

  // Opcionais
  inscricao_estadual?: number
  inscricao_municipal?: number
  telefone?: string
  complemento?: string

  // Habilitacoes
  habilita_nfe?: boolean
  habilita_nfce?: boolean
  habilita_nfse?: boolean
  habilita_cte?: boolean
  habilita_mdfe?: boolean
  habilita_manifestacao?: boolean
  habilita_manifestacao_cte?: boolean

  // Certificado digital
  arquivo_certificado_base64?: string
  senha_certificado?: string
  certificado_especifico?: boolean

  // CSC NFCe
  csc_nfce_producao?: string
  id_token_nfce_producao?: string
  csc_nfce_homologacao?: string
  id_token_nfce_homologacao?: string

  // Numeracao (NFe, NFCe, NFSe, CTe, MDFe...)
  proximo_numero_nfe_producao?: number
  serie_nfe_producao?: number
  // ... demais campos de numeracao por tipo e ambiente
}

// EmpresaUpdateParams e Partial<EmpresaCreateParams>
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

  // Endereco
  logradouro?: string | null
  numero?: string | null
  bairro?: string | null
  cep?: string | null
  municipio?: string | null
  uf?: string | null
  codigo_municipio?: string | null

  // Habilitacoes
  habilita_nfe?: boolean
  habilita_nfce?: boolean
  habilita_nfse?: boolean
  habilita_cte?: boolean
  habilita_mdfe?: boolean
  habilita_manifestacao?: boolean
  habilita_manifestacao_cte?: boolean

  // Certificado
  certificado_valido_ate?: string | null
  certificado_valido_de?: string | null
  certificado_cnpj?: string | null
  certificado_especifico?: boolean

  // Numeracao, CSC, responsavel, etc.
  // ... campos completos disponiveis na interface Empresa
}
```

## Notas Importantes

1. **ID como `string | number`**: O identificador da empresa pode ser string ou number. Use o tipo retornado pela API sem converter.

2. **Dry Run**: Sempre valide com `dryRun: true` antes de criar ou atualizar empresas em producao, especialmente ao enviar certificados digitais.

3. **Certificado A1**: Apenas certificados do tipo A1 (arquivo .pfx) sao suportados. Converta para base64 antes de enviar.

4. **Campos de numeracao**: Cada tipo de documento (NFe, NFCe, NFSe, CTe, MDFe) possui campos separados de `proximo_numero` e `serie` para producao e homologacao.

5. **Remocao**: A remocao de uma empresa e irreversivel. Certifique-se de que nao ha documentos pendentes antes de remover.

## Relacionado

- **[Documentos Recebidos](./recebidas.md)**: Consultar NFe, CTe e NFSe recebidos pelas empresas cadastradas
- **[Consultas](./consultas.md)**: Consultar codigos de municipio, NCM e CFOP para preenchimento de dados
