// --- Item ---

export interface NfeItem {
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
  icms_valor_desonerado?: string | number;
  icms_base_calculo_st?: string | number;
  icms_aliquota_st?: string | number;
  icms_valor_st?: string | number;
  pis_situacao_tributaria?: string;
  pis_base_calculo?: string | number;
  pis_aliquota?: string | number;
  pis_valor?: string | number;
  cofins_situacao_tributaria?: string;
  cofins_base_calculo?: string | number;
  cofins_aliquota?: string | number;
  cofins_valor?: string | number;
  ipi_situacao_tributaria?: string;
  ipi_codigo_enquadramento_legal?: string;
  ipi_base_calculo?: string | number;
  ipi_aliquota?: string | number;
  ipi_valor?: string | number;
  valor_frete?: string | number;
  valor_seguro?: string | number;
  valor_desconto?: string | number;
  valor_outras_despesas?: string | number;
  valor_total_tributos?: string | number;
  inclui_no_total?: string | number;
  informacoes_adicionais_item?: string;
  numero_pedido_compra?: string;
  item_pedido_compra?: string | number;
  [key: string]: unknown;
}

// --- Forma de pagamento ---

export interface NfeFormaPagamento {
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

// --- Nota referenciada ---

export interface NfeNotaReferenciada {
  chave_nfe?: string;
  [key: string]: unknown;
}

// --- Create params ---

export interface NfeCreateParams {
  // Geral
  natureza_operacao?: string;
  data_emissao?: string;
  data_entrada_saida?: string;
  tipo_documento?: string | number;
  local_destino?: string | number;
  finalidade_emissao?: string | number;
  consumidor_final?: string | number;
  presenca_comprador?: string | number;
  modalidade_frete?: string | number;
  informacoes_adicionais_contribuinte?: string;
  informacoes_adicionais_fisco?: string;

  // Emitente
  cnpj_emitente?: string;
  cpf_emitente?: string;
  nome_emitente?: string;
  nome_fantasia_emitente?: string;
  logradouro_emitente?: string;
  numero_emitente?: string | number;
  complemento_emitente?: string;
  bairro_emitente?: string;
  municipio_emitente?: string;
  uf_emitente?: string;
  cep_emitente?: string;
  telefone_emitente?: string;
  inscricao_estadual_emitente?: string;
  regime_tributario_emitente?: string | number;

  // Destinatario
  nome_destinatario?: string;
  cnpj_destinatario?: string;
  cpf_destinatario?: string;
  id_estrangeiro_destinatario?: string;
  inscricao_estadual_destinatario?: string | null;
  indicador_inscricao_estadual_destinatario?: string | number;
  logradouro_destinatario?: string;
  numero_destinatario?: string | number;
  complemento_destinatario?: string;
  bairro_destinatario?: string;
  municipio_destinatario?: string;
  uf_destinatario?: string;
  cep_destinatario?: string | number;
  pais_destinatario?: string;
  telefone_destinatario?: string | number;
  email_destinatario?: string;

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
  valor_seguro?: string | number;
  valor_desconto?: string | number;
  valor_outras_despesas?: string | number;
  valor_total_ii?: string | number;
  valor_ipi?: string | number;
  valor_pis?: string | number;
  valor_cofins?: string | number;
  icms_base_calculo?: string | number;
  icms_valor_total?: string | number;
  icms_valor_total_desonerado?: string | number;
  icms_base_calculo_st?: string | number;
  icms_valor_total_st?: string | number;
  icms_modalidade_base_calculo?: string | number;

  // Itens e pagamento
  items: NfeItem[];
  formas_pagamento?: NfeFormaPagamento[];
  notas_referenciadas?: NfeNotaReferenciada[];

  // Numeração manual
  numero?: string | number;
  serie?: string | number;
  forma_emissao?: string;

  [key: string]: unknown;
}

// --- Response ---

export interface NfeResponse {
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
  caminho_xml_carta_correcao?: string;
  caminho_pdf_carta_correcao?: string;
  numero_carta_correcao?: number;
  caminho_xml_cancelamento?: string;
  qrcode_url?: string;
  url_consulta_nf?: string;
  requisicao_nota_fiscal?: unknown;
  protocolo_nota_fiscal?: unknown;
  requisicao_cancelamento?: unknown;
  protocolo_cancelamento?: unknown;
  requisicao_carta_correcao?: unknown;
  protocolo_carta_correcao?: unknown;
  [key: string]: unknown;
}

// --- Cancel ---

export interface NfeCancelParams {
  justificativa: string;
}

export interface NfeCancelResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_cancelamento?: string;
  [key: string]: unknown;
}

// --- Carta de correcao ---

export interface NfeCartaCorrecaoParams {
  correcao: string;
  data_evento?: string;
}

export interface NfeCartaCorrecaoResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_carta_correcao?: string;
  caminho_pdf_carta_correcao?: string;
  numero_carta_correcao?: number;
  [key: string]: unknown;
}

// --- Ator interessado ---

export interface NfeAtorInteressadoParams {
  cpf?: string;
  cnpj?: string;
  permite_autorizacao_terceiros?: boolean;
}

export interface NfeAtorInteressadoResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_evento_ator_interessado?: string;
  numero_evento_ator_interessado?: number;
  [key: string]: unknown;
}

// --- Insucesso entrega ---

export interface NfeInsucessoEntregaParams {
  data_tentativa_entrega: string;
  motivo_insucesso: string | number;
  hash_tentativa_entrega: string;
  numero_tentativas?: string | number;
  justificativa_insucesso?: string;
  latitude_entrega?: string;
  longitude_entrega?: string;
  data_hash_tentativa?: string;
}

export interface NfeInsucessoEntregaResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_insucesso_entrega?: string;
  numero_insucesso_entrega?: number;
  [key: string]: unknown;
}

// --- Cancel insucesso entrega ---

export interface NfeCancelInsucessoEntregaResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_cancelamento_insucesso_entrega?: string;
  numero_cancelamento_insucesso_entrega?: number;
  [key: string]: unknown;
}

// --- Email ---

export interface NfeEmailParams {
  emails: string[];
}

// --- Inutilizacao ---

export interface NfeInutilizacaoParams {
  cnpj: string;
  serie: string | number;
  numero_inicial: string | number;
  numero_final: string | number;
  justificativa: string;
}

export interface NfeInutilizacoesListParams {
  cnpj?: string;
  cpf?: string;
  data_recebimento_inicial?: string;
  data_recebimento_final?: string;
  numero_inicial?: string | number;
  numero_final?: string | number;
}

export interface NfeInutilizacaoResponse {
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

// --- Importacao ---

export interface NfeImportacaoParams {
  xml?: string;
  [key: string]: unknown;
}

// --- ECONF ---

export interface NfeEconfDetalhePagamento {
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

export interface NfeEconfParams {
  detalhes_pagamento: NfeEconfDetalhePagamento[];
}

export interface NfeEconfResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_conciliacao_financeira?: string;
  numero_conciliacao_financeira?: number;
  numero_protocolo?: string;
  [key: string]: unknown;
}

export interface NfeEconfCancelResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_cancelamento_conciliacao_financeira?: string;
  numero_cancelamento_conciliacao_financeira?: number;
  [key: string]: unknown;
}

// --- Evento genérico ---

export interface NfeEventoParams {
  tipo_evento: string;
  [key: string]: unknown;
}

export interface NfeEventoResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  [key: string]: unknown;
}

// --- Webhook ---

export interface NfeWebhookResponse {
  [key: string]: unknown;
}
