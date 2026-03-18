# Consultas

O servico de consultas oferece acesso a tabelas de referencia e utilitarios essenciais para emissao de documentos fiscais. Atraves dele voce pode buscar codigos NCM, CFOP, CNAE, CEP, municipios, itens de lista de servico, codigos tributarios municipais, dados de CNPJ, gerenciar emails bloqueados e baixar backups.

## Codigos Fiscais (NCM e CFOP)

### NCM - Nomenclatura Comum do Mercosul

Tabela de classificacao fiscal de mercadorias utilizada em NFe e NFCe.

| Metodo | Descricao |
|--------|-----------|
| `ncm(params?)` | Buscar NCMs com filtros por codigo, descricao, capitulo, posicao e subposicao |
| `ncmByCodigo(codigo)` | Obter um NCM especifico pelo codigo |

```typescript
import { FocusNFeClient } from '@rodrigogs/focusnfe-sdk'

const client = new FocusNFeClient({
  token: process.env.FOCUSNFE_TOKEN,
  environment: 'PRODUCTION'
})

// Buscar NCMs por descricao
const ncms = await client.consultas.ncm({
  descricao: 'parafuso'
})

for (const ncm of ncms) {
  console.log(`${ncm.codigo}: ${ncm.descricao_completa}`)
  console.log(`  Capitulo: ${ncm.capitulo}`)
  console.log(`  Posicao: ${ncm.posicao}`)
}

// Buscar NCMs por capitulo
const capitulo73 = await client.consultas.ncm({
  capitulo: '73' // Obras de ferro fundido, ferro ou aco
})

// Buscar por codigo parcial
const porCodigo = await client.consultas.ncm({
  codigo: '7318'
})

// Paginacao com offset
const pagina2 = await client.consultas.ncm({
  descricao: 'aco',
  offset: 50
})

// Obter NCM especifico
const ncm = await client.consultas.ncmByCodigo('73181500')
console.log(`NCM: ${ncm.codigo} - ${ncm.descricao_completa}`)
```

### CFOP - Codigo Fiscal de Operacoes e Prestacoes

Tabela de codigos que identificam a natureza da operacao fiscal.

| Metodo | Descricao |
|--------|-----------|
| `cfop(params?)` | Buscar CFOPs com filtros por codigo e descricao |
| `cfopByCodigo(codigo)` | Obter um CFOP especifico pelo codigo |

```typescript
// Buscar CFOPs por descricao
const cfops = await client.consultas.cfop({
  descricao: 'venda'
})

for (const cfop of cfops) {
  console.log(`${cfop.codigo}: ${cfop.descricao}`)
}

// Buscar por codigo
const porCodigo = await client.consultas.cfop({
  codigo: '5102'
})

// Paginacao
const pagina2 = await client.consultas.cfop({
  descricao: 'remessa',
  offset: 50
})

// Obter CFOP especifico
const cfop = await client.consultas.cfopByCodigo('5102')
console.log(`CFOP: ${cfop.codigo} - ${cfop.descricao}`)
```

## Enderecos (CEP)

Consulta de enderecos brasileiros por CEP ou por filtros de localizacao.

| Metodo | Descricao |
|--------|-----------|
| `cep(params)` | Buscar CEPs com filtros por codigo IBGE, UF, logradouro e localidade |
| `cepByCodigo(cep)` | Obter endereco por CEP especifico |

```typescript
// Buscar CEPs por localidade e UF
const ceps = await client.consultas.cep({
  localidade: 'Sao Paulo',
  uf: 'SP',
  logradouro: 'Paulista'
})

for (const cep of ceps) {
  console.log(`${cep.cep}: ${cep.tipo_logradouro} ${cep.nome_logradouro}`)
  console.log(`  Bairro: ${cep.nome_bairro_inicial}`)
  console.log(`  Localidade: ${cep.nome_localidade} - ${cep.uf}`)
}

// Buscar por codigo IBGE do municipio
const porIbge = await client.consultas.cep({
  codigo_ibge: '3550308' // Sao Paulo
})

// Obter endereco por CEP
const endereco = await client.consultas.cepByCodigo('01310100')
console.log(`${endereco.nome_logradouro}, ${endereco.nome_localidade} - ${endereco.uf}`)
console.log(`Codigo IBGE: ${endereco.codigo_ibge}`)
```

## CNAE - Classificacao Nacional de Atividades Economicas

Consulta de codigos CNAE utilizados na classificacao de atividades empresariais.

| Metodo | Descricao |
|--------|-----------|
| `cnae(params?)` | Buscar CNAEs com filtros por codigo, descricao, secao, divisao, grupo, classe e subclasse |
| `cnaeByCodigo(codigo)` | Obter um CNAE especifico pelo codigo |

```typescript
// Buscar CNAEs por descricao
const cnaes = await client.consultas.cnae({
  descricao: 'manutencao de veiculos'
})

for (const cnae of cnaes) {
  console.log(`${cnae.codigo_formatado}: ${cnae.descricao}`)
  console.log(`  Secao: ${cnae.secao} - ${cnae.descricao_secao}`)
  console.log(`  Divisao: ${cnae.divisao} - ${cnae.descricao_divisao}`)
  console.log(`  Grupo: ${cnae.grupo} - ${cnae.descricao_grupo}`)
  console.log(`  Classe: ${cnae.classe} - ${cnae.descricao_classe}`)
}

// Buscar por secao
const secaoG = await client.consultas.cnae({
  secao: 'G' // Comercio
})

// Buscar por divisao
const divisao45 = await client.consultas.cnae({
  divisao: '45' // Comercio e reparacao de veiculos
})

// Obter CNAE especifico
const cnae = await client.consultas.cnaeByCodigo('4520001')
console.log(`CNAE: ${cnae.codigo_formatado} - ${cnae.descricao}`)
```

## Municipios e Servicos

### Municipios

Consulta de municipios brasileiros com informacoes sobre suporte a NFSe.

| Metodo | Descricao |
|--------|-----------|
| `municipios(params?)` | Buscar municipios com filtros por UF, nome e status NFSe |
| `municipio(codigo)` | Obter municipio pelo codigo IBGE |

```typescript
// Listar municipios de um estado
const municipiosSP = await client.consultas.municipios({
  sigla_uf: 'SP'
})

for (const mun of municipiosSP) {
  console.log(`${mun.codigo_municipio}: ${mun.nome_municipio} - ${mun.sigla_uf}`)
  console.log(`  NFSe habilitada: ${mun.nfse_habilitada ? 'Sim' : 'Nao'}`)
  if (mun.provedor_nfse) {
    console.log(`  Provedor: ${mun.provedor_nfse}`)
  }
}

// Buscar por nome
const porNome = await client.consultas.municipios({
  nome_municipio: 'Campinas'
})

// Buscar municipios com NFSe ativa
const comNfse = await client.consultas.municipios({
  sigla_uf: 'MG',
  status_nfse: 'ativo'
})

// Obter municipio especifico
const sp = await client.consultas.municipio('3550308')
console.log(`${sp.nome_municipio} - ${sp.nome_uf}`)
console.log(`NFSe habilitada: ${sp.nfse_habilitada}`)
console.log(`Requer certificado NFSe: ${sp.requer_certificado_nfse}`)
console.log(`Possui homologacao NFSe: ${sp.possui_ambiente_homologacao_nfse}`)
console.log(`Possui cancelamento NFSe: ${sp.possui_cancelamento_nfse}`)
console.log(`Endereco obrigatorio: ${sp.endereco_obrigatorio_nfse}`)
console.log(`CPF/CNPJ obrigatorio: ${sp.cpf_cnpj_obrigatorio_nfse}`)
```

### Itens da Lista de Servico

Consulta de itens da lista de servico de um municipio, utilizados na emissao de NFSe.

| Metodo | Descricao |
|--------|-----------|
| `itensListaServico(codigoMunicipio, params?)` | Listar itens de servico do municipio |
| `itemListaServicoByCodigo(codigoMunicipio, codigoItem)` | Obter item de servico especifico |

```typescript
// Listar itens de servico de Sao Paulo
const itens = await client.consultas.itensListaServico('3550308')

for (const item of itens) {
  console.log(`${item.codigo}: ${item.descricao}`)
  if (item.tax_rate) {
    console.log(`  Aliquota: ${item.tax_rate}%`)
  }
}

// Filtrar por descricao
const filtrados = await client.consultas.itensListaServico('3550308', {
  descricao: 'manutencao'
})

// Filtrar por codigo
const porCodigo = await client.consultas.itensListaServico('3550308', {
  codigo: '14.01'
})

// Obter item especifico
const item = await client.consultas.itemListaServicoByCodigo('3550308', '14.01')
console.log(`Item: ${item.codigo} - ${item.descricao}`)
```

### Codigos Tributarios do Municipio

Consulta de codigos tributarios municipais utilizados na emissao de NFSe.

| Metodo | Descricao |
|--------|-----------|
| `codigosTributariosMunicipio(codigoMunicipio, params?)` | Listar codigos tributarios do municipio |
| `codigoTributarioMunicipioByCodigo(codigoMunicipio, codigoTributario)` | Obter codigo tributario especifico |

```typescript
// Listar codigos tributarios de Sao Paulo
const codigos = await client.consultas.codigosTributariosMunicipio('3550308')

for (const codigo of codigos) {
  console.log(`${codigo.codigo}: ${codigo.descricao}`)
  if (codigo.tax_rate) {
    console.log(`  Aliquota: ${codigo.tax_rate}%`)
  }
}

// Filtrar por descricao
const filtrados = await client.consultas.codigosTributariosMunicipio('3550308', {
  descricao: 'servicos'
})

// Obter codigo tributario especifico
const codigo = await client.consultas.codigoTributarioMunicipioByCodigo(
  '3550308',
  '01.02'
)
console.log(`Codigo: ${codigo.codigo} - ${codigo.descricao}`)
```

## Consulta de CNPJ

Consulta dados cadastrais de um CNPJ na Receita Federal.

| Metodo | Descricao |
|--------|-----------|
| `cnpj(cnpj)` | Consultar dados do CNPJ |

```typescript
const resultado = await client.consultas.cnpj('12345678000190')

console.log(`Razao social: ${resultado.razao_social}`)
console.log(`CNPJ: ${resultado.cnpj}`)
console.log(`Situacao cadastral: ${resultado.situacao_cadastral}`)
console.log(`CNAE principal: ${resultado.cnae_principal}`)
console.log(`Simples Nacional: ${resultado.optante_simples_nacional ? 'Sim' : 'Nao'}`)
console.log(`MEI: ${resultado.optante_mei ? 'Sim' : 'Nao'}`)

// Endereco
const end = resultado.endereco
console.log(`Endereco: ${end.logradouro}, ${end.numero} - ${end.bairro}`)
console.log(`${end.nome_municipio} - ${end.uf}, CEP: ${end.cep}`)
console.log(`Codigo IBGE: ${end.codigo_ibge}`)
```

## Emails Bloqueados

Gerenciamento de emails bloqueados por bounce ou rejeicao nos envios de documentos fiscais.

| Metodo | Descricao |
|--------|-----------|
| `blockedEmail(email)` | Consultar se um email esta bloqueado e o motivo |
| `unblockEmail(email)` | Desbloquear um email |

```typescript
// Verificar se email esta bloqueado
const bloqueio = await client.consultas.blockedEmail('cliente@exemplo.com.br')

console.log(`Email: ${bloqueio.email}`)
console.log(`Tipo de bloqueio: ${bloqueio.block_type}`)
if (bloqueio.bounce_type) {
  console.log(`Tipo de bounce: ${bloqueio.bounce_type}`)
}
if (bloqueio.diagnostic_code) {
  console.log(`Diagnostico: ${bloqueio.diagnostic_code}`)
}
if (bloqueio.blocked_at) {
  console.log(`Bloqueado em: ${bloqueio.blocked_at}`)
}

// Desbloquear email
await client.consultas.unblockEmail('cliente@exemplo.com.br')
console.log('Email desbloqueado com sucesso')
```

## Backups

Download de links para backups mensais de DANFes e XMLs de uma empresa.

| Metodo | Descricao |
|--------|-----------|
| `backups(cnpj)` | Obter links de backup mensal por CNPJ |

```typescript
const resultado = await client.consultas.backups('12345678000190')

for (const backup of resultado.backups) {
  console.log(`Mes: ${backup.mes}`)
  if (backup.danfes) {
    console.log(`  DANFes: ${backup.danfes}`)
  }
  if (backup.xmls) {
    console.log(`  XMLs: ${backup.xmls}`)
  }
}
```

## Tipos Importantes

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

// --- Municipio ---
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

// --- Item Lista Servico ---
interface ItemListaServico {
  codigo: string
  descricao: string
  tax_rate?: string | null
}

// --- Codigo Tributario Municipio ---
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

// --- Email Bloqueado ---
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

## Notas Importantes

1. **Paginacao**: Os metodos `ncm`, `cfop`, `cnae` e `municipios` suportam paginacao via parametro `offset`. A API retorna um numero fixo de registros por pagina.

2. **Consulta de CNPJ**: Os dados retornados sao da base publica da Receita Federal e podem estar desatualizados em relacao ao cadastro oficial.

3. **Municipios e NFSe**: O campo `nfse_habilitada` indica se o municipio ja foi integrado ao sistema. Os campos auxiliares (`requer_certificado_nfse`, `endereco_obrigatorio_nfse`, etc.) descrevem as regras especificas do municipio para emissao de NFSe. **Status do Municipio (`MunicipioStatusNfse`)** Os valores possiveis sao: `ativo`, `fora_do_ar`, `pausado`, `em_implementacao`, `em_reimplementacao`, `inativo`, `nao_implementado`.

4. **Itens de lista de servico e codigos tributarios**: Esses dados variam por municipio. Sempre consulte pelo `codigoMunicipio` (codigo IBGE) correto antes de emitir uma NFSe.

5. **Emails bloqueados**: Emails sao bloqueados automaticamente apos bounces de envio de documentos fiscais. Use `unblockEmail` para permitir novos envios apos corrigir o endereco.

6. **Backups**: Os links de download retornados em `danfes` e `xmls` possuem validade temporaria. Baixe os arquivos imediatamente apos a consulta.

## Relacionado

- **[Empresas](./empresas.md)**: Cadastrar empresas que utilizam os codigos consultados aqui
- **[Documentos Recebidos](./recebidas.md)**: Documentos recebidos que referenciam NCM, CFOP e municipios
