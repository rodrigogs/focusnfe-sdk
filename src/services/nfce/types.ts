// --- Item ---

export interface NfceItem {
  numero_item: string | number;
  codigo_produto: string | number;
  descricao: string;
  cfop: string | number;
  codigo_ncm: string | number;
  quantidade_comercial: string | number;
  valor_unitario_comercial: string | number;
  unidade_comercial: string;
  quantidade_tributavel?: string | number;
  valor_unitario_tributavel?: string | number;
  unidade_tributavel?: string;
  valor_bruto?: string | number;
  icms_origem: string | number;
  icms_situacao_tributaria: string | number;
  icms_aliquota?: string | number;
  icms_base_calculo?: string | number;
  icms_modalidade_base_calculo?: string | number;
  icms_valor?: string | number;
  valor_frete?: string | number;
  valor_desconto?: string | number;
  valor_outras_despesas?: string | number;
  valor_total_tributos?: string | number;
  inclui_no_total?: string | number;
  [key: string]: unknown;
}

// --- Forma de pagamento ---

export interface NfceFormaPagamento {
  forma_pagamento: string;
  valor_pagamento: string | number;
  tipo_integracao?: string | number;
  cnpj_credenciadora?: string;
  numero_autorizacao?: string;
  bandeira_operadora?: string;
  nome_credenciadora?: string;
  troco?: string | number;
  [key: string]: unknown;
}

// --- Create params ---

export interface NfceCreateParams {
  // Geral
  natureza_operacao?: string;
  data_emissao?: string;
  presenca_comprador: string | number;
  modalidade_frete?: string | number;
  local_destino?: string | number;
  informacoes_adicionais_contribuinte?: string;

  // Emitente
  cnpj_emitente: string;
  nome_emitente?: string;
  nome_fantasia_emitente?: string;
  logradouro_emitente?: string;
  numero_emitente?: string | number;
  bairro_emitente?: string;
  municipio_emitente?: string;
  uf_emitente?: string;
  cep_emitente?: string;
  inscricao_estadual_emitente?: string;

  // Destinatario
  nome_destinatario?: string;
  cnpj_destinatario?: string;
  cpf_destinatario?: string;
  id_estrangeiro_destinatario?: string;
  indicador_inscricao_estadual_destinatario?: string | number;
  telefone_destinatario?: string;
  logradouro_destinatario?: string;
  numero_destinatario?: string | number;
  bairro_destinatario?: string;
  municipio_destinatario?: string;
  uf_destinatario?: string;
  cep_destinatario?: string;

  // Transportador
  cnpj_transportador?: string;
  cpf_transportador?: string;
  nome_transportador?: string;
  inscricao_estadual_transportador?: string;
  endereco_transportador?: string;
  municipio_transportador?: string;
  uf_transportador?: string;

  // Totalizadores
  valor_produtos?: string | number;
  valor_total?: string | number;
  valor_frete?: string | number;
  valor_desconto?: string | number;
  icms_base_calculo?: string | number;
  icms_valor_total?: string | number;
  icms_base_calculo_st?: string | number;
  icms_valor_total_st?: string | number;

  // Itens e pagamento
  items: NfceItem[];
  formas_pagamento: NfceFormaPagamento[];

  // Numeração manual / contingência
  numero?: string | number;
  serie?: string | number;
  forma_emissao?: string;
  codigo_unico?: string;

  [key: string]: unknown;
}

// --- Response ---

export interface NfceResponse {
  ref?: string;
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave_nfe?: string;
  numero?: string | number;
  serie?: string | number;
  cnpj_emitente?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_danfe?: string;
  caminho_xml_cancelamento?: string;
  numero_protocolo?: string;
  qrcode_url?: string;
  url_consulta_nf?: string;
  contingencia_offline?: boolean;
  contingencia_offline_efetivada?: boolean;
  requisicao_nota_fiscal?: unknown;
  protocolo_nota_fiscal?: unknown;
  requisicao_cancelamento?: unknown;
  protocolo_cancelamento?: unknown;
  [key: string]: unknown;
}

// --- Cancel ---

export interface NfceCancelParams {
  justificativa: string;
}

export interface NfceCancelResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_cancelamento?: string;
  [key: string]: unknown;
}

// --- Email ---

export interface NfceEmailParams {
  emails: string[];
}

// --- Inutilizacao ---

export interface NfceInutilizacaoParams {
  cnpj: string;
  serie: string | number;
  numero_inicial: string | number;
  numero_final: string | number;
  justificativa: string;
}

export interface NfceInutilizacaoResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  serie?: string | number;
  numero_inicial?: string | number;
  numero_final?: string | number;
  modelo?: string;
  cnpj?: string;
  caminho_xml?: string;
  protocolo_sefaz?: string;
  [key: string]: unknown;
}

// --- ECONF ---

export interface NfceEconfDetalhePagamento {
  indicador_pagamento?: string;
  forma_pagamento: string;
  descricao_pagamento?: string;
  valor_pagamento: string | number;
  data_pagamento: string;
  cnpj_transacional?: string;
  uf_transacional?: string;
  cnpj_instituicao_financeira?: string;
  bandeira_operadora?: string;
  numero_autorizacao?: string;
  cnpj_beneficiario?: string;
  uf_beneficiario?: string;
}

export interface NfceEconfParams {
  detalhes_pagamento: NfceEconfDetalhePagamento[];
}

export interface NfceEconfResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_conciliacao_financeira?: string;
  numero_conciliacao_financeira?: number;
  numero_protocolo?: string;
  [key: string]: unknown;
}

export interface NfceEconfCancelResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_cancelamento_conciliacao_financeira?: string;
  numero_cancelamento_conciliacao_financeira?: number;
  [key: string]: unknown;
}

// --- Webhook ---

export interface NfceWebhookResponse {
  [key: string]: unknown;
}
