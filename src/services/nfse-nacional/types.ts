export interface NfseNacionalCreateParams {
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

// --- Enums ---

export type NfseNacionalStatus =
  | "processando_autorizacao"
  | "autorizado"
  | "cancelado"
  | "erro_autorizacao";

// --- Response ---

export interface NfseNacionalResponseError {
  codigo?: string;
  mensagem?: string;
  correcao?: string | null;
}

export interface NfseNacionalResponse {
  cnpj_prestador?: string;
  ref?: string;
  status: NfseNacionalStatus;
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

export interface NfseNacionalCancelParams {
  justificativa: string;
}

export interface NfseNacionalCancelResponse {
  status: NfseNacionalStatus;
  erros?: NfseNacionalResponseError[];
}
