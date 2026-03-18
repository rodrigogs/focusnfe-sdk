export interface NfsePrestador {
  cnpj: string;
  inscricao_municipal: string;
  codigo_municipio: string;
}

export interface NfseTomadorEndereco {
  logradouro?: string;
  tipo_logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  codigo_municipio?: string;
  uf?: string;
  cep?: string;
}

export interface NfseTomador {
  cpf?: string;
  cnpj?: string;
  nif?: string;
  motivo_ausencia_nif?: string;
  inscricao_municipal?: string;
  razao_social?: string;
  telefone?: string;
  email?: string;
  endereco?: NfseTomadorEndereco;
}

export interface NfseServico {
  valor_servicos: number;
  valor_deducoes?: number;
  valor_pis?: number;
  valor_cofins?: number;
  valor_inss?: number;
  valor_ir?: number;
  valor_csll?: number;
  iss_retido: boolean | string;
  valor_iss?: number;
  valor_iss_retido?: number;
  outras_retencoes?: number;
  base_calculo?: number;
  aliquota?: number;
  desconto_incondicionado?: number;
  desconto_condicionado?: number;
  item_lista_servico: string;
  codigo_cnae?: string;
  codigo_tributario_municipio?: string;
  discriminacao: string;
  codigo_municipio?: string;
  percentual_total_tributos?: number;
  fonte_total_tributos?: string;
  codigo_nbs?: string;
  codigo_indicador_operacao?: string;
  ibs_cbs_classificacao_tributaria?: string;
  ibs_cbs_situacao_tributaria?: string;
  ibs_cbs_base_calculo?: number;
  ibs_uf_aliquota?: number;
  ibs_mun_aliquota?: number;
  cbs_aliquota?: number;
  ibs_uf_valor?: number;
  ibs_mun_valor?: number;
  cbs_valor?: number;
}

export interface NfseIntermediario {
  razao_social?: string;
  cpf?: string;
  cnpj?: string;
  nif?: string;
  motivo_ausencia_nif?: string;
  inscricao_municipal?: string;
}

export interface NfseCreateParams {
  data_emissao: string;
  natureza_operacao?: string;
  regime_especial_tributacao?: string;
  optante_simples_nacional?: boolean | string;
  incentivador_cultural?: boolean | string;
  codigo_obra?: string;
  art?: string;
  numero_rps_substituido?: string;
  serie_rps_substituido?: string;
  tipo_rps_substituido?: string;
  prestador: NfsePrestador;
  tomador: NfseTomador;
  servico: NfseServico;
  intermediario?: NfseIntermediario;
}

export interface NfseResponseError {
  codigo?: string;
  mensagem?: string;
  correcao?: string | null;
}

export interface NfseResponse {
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
  numero_nfse_substituida?: string;
  numero_nfse_substituta?: string;
  erros?: NfseResponseError[];
  status_sefaz?: string;
  mensagem_sefaz?: string;
}

export interface NfseEmailParams {
  emails: string[];
}

export interface NfseCancelResponse {
  status: string;
  erros?: NfseResponseError[];
}
