// --- NCM ---

export interface NcmQueryParams {
  codigo?: string;
  descricao?: string;
  capitulo?: string;
  posicao?: string;
  subposicao1?: string;
  subposicao2?: string;
  item1?: string;
  item2?: string;
  offset?: number;
}

export interface NcmResult {
  codigo: string;
  descricao_completa: string;
  capitulo: string;
  posicao: string;
  subposicao1: string;
  subposicao2: string;
  item1: string;
  item2: string;
}

// --- CFOP ---

export interface CfopQueryParams {
  codigo?: string;
  descricao?: string;
  offset?: number;
}

export interface CfopResult {
  codigo: string;
  descricao: string;
}

// --- CEP ---

export interface CepQueryParams {
  codigo_ibge?: string;
  uf?: string;
  logradouro?: string;
  localidade?: string;
}

export interface CepResult {
  cep: string;
  tipo?: string;
  nome?: string;
  uf: string;
  nome_localidade: string;
  codigo_ibge?: string;
  tipo_logradouro?: string;
  nome_logradouro?: string;
  nome_bairro_inicial?: string;
  descricao?: string;
}

// --- CNAE ---

export interface CnaeQueryParams {
  codigo?: string;
  descricao?: string;
  secao?: string;
  descricao_secao?: string;
  divisao?: string;
  descricao_divisao?: string;
  grupo?: string;
  descricao_grupo?: string;
  classe?: string;
  descricao_classe?: string;
  subclasse?: string;
  descricao_subclasse?: string;
  offset?: number;
}

export interface CnaeResult {
  codigo: string;
  descricao: string;
  secao: string;
  descricao_secao: string;
  divisao: string;
  descricao_divisao: string;
  grupo: string;
  descricao_grupo: string;
  classe: string;
  descricao_classe: string;
  subclasse: string;
  descricao_subclasse: string;
  codigo_formatado: string;
}

// --- Municipios ---

export type MunicipioStatusNfse =
  | "ativo"
  | "fora_do_ar"
  | "pausado"
  | "em_implementacao"
  | "em_reimplementacao"
  | "inativo"
  | "nao_implementado";

export interface MunicipioQueryParams {
  sigla_uf?: string;
  nome_municipio?: string;
  nome?: string;
  status_nfse?: MunicipioStatusNfse;
  offset?: number;
}

export interface MunicipioResult {
  codigo_municipio: string;
  nome_municipio: string;
  sigla_uf: string;
  nome_uf: string;
  nfse_habilitada: boolean;
  requer_certificado_nfse?: boolean | null;
  possui_ambiente_homologacao_nfse?: boolean | null;
  possui_cancelamento_nfse?: boolean | null;
  provedor_nfse?: string | null;
  endereco_obrigatorio_nfse?: boolean | null;
  cpf_cnpj_obrigatorio_nfse?: boolean | null;
  codigo_cnae_obrigatorio_nfse?: boolean | null;
  item_lista_servico_obrigatorio_nfse?: boolean | null;
  codigo_tributario_municipio_obrigatorio_nfse?: boolean | null;
  status_nfse?: MunicipioStatusNfse | null;
  data_previsao_reimplementacao_nfse?: string | null;
  ultima_emissao_nfse?: string | null;
}

// --- Itens Lista Servico ---

export interface ItensListaServicoParams {
  codigo?: string;
  descricao?: string;
}

export interface ItemListaServico {
  codigo: string;
  descricao: string;
  tax_rate?: string | null;
}

// --- Codigos Tributarios Municipio ---

export interface CodigosTributariosMunicipioParams {
  codigo?: string;
  descricao?: string;
}

export interface CodigoTributarioMunicipio {
  codigo: string;
  descricao: string;
  tax_rate?: string | null;
}

// --- CNPJ ---

export interface CnpjEndereco {
  codigo_municipio: string;
  codigo_siafi: string;
  codigo_ibge: string;
  nome_municipio: string;
  logradouro: string;
  complemento?: string | null;
  numero?: string | null;
  bairro: string;
  cep: string;
  uf: string;
}

export interface CnpjResult {
  razao_social: string;
  cnpj: string;
  situacao_cadastral: string;
  cnae_principal: string;
  optante_simples_nacional: boolean;
  optante_mei: boolean;
  endereco: CnpjEndereco;
}

// --- Blocked Emails ---

export interface BlockedEmailResult {
  email: string;
  block_type: string;
  bounce_type?: string | null;
  diagnostic_code?: string | null;
  blocked_at?: string | null;
}

// --- Backups ---

export interface BackupEntry {
  mes: string;
  danfes?: string | null;
  xmls?: string | null;
}

export interface BackupResult {
  backups: BackupEntry[];
}
