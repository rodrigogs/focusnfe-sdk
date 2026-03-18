// ── CTe Create ──────────────────────────────────────────────────────

export interface CteQuantidade {
  codigo_unidade_medida: string;
  tipo_medida: string;
  quantidade: string;
}

export interface CteNfe {
  chave_nfe: string;
  pin_suframa?: string;
  data_prevista?: string;
}

export interface CteDuplicata {
  data_vencimento: string;
  valor: string;
}

export interface CteSeguroCarga {
  nome_seguradora: string;
  numero_apolice: string;
  responsavel_seguro: number;
}

export interface CteDocumentoReferenciado {
  data_emissao: string;
  numero: string;
  serie: string;
  subserie?: string;
  valor: string;
}

export interface CteCreateParams {
  cfop: string;
  natureza_operacao: string;
  data_emissao: string;
  tipo_documento: number;
  modal: string;
  tipo_servico?: number;
  cnpj_emitente: string;
  inscricao_estadual_emitente?: string;
  nome_emitente?: string;
  nome_fantasia_emitente?: string;
  logradouro_emitente?: string;
  numero_emitente?: string;
  complemento_emitente?: string;
  bairro_emitente?: string;
  codigo_municipio_emitente?: string;
  municipio_emitente?: string;
  uf_emitente?: string;
  cep_emitente?: string;
  telefone_emitente?: string;
  cpf_remetente?: string;
  cnpj_remetente?: string;
  nome_remetente?: string;
  telefone_remetente?: string;
  logradouro_remetente?: string;
  numero_remetente?: string;
  bairro_remetente?: string;
  codigo_municipio_remetente?: string;
  municipio_remetente?: string;
  uf_remetente?: string;
  cep_remetente?: string;
  codigo_pais_remetente?: string;
  pais_remetente?: string;
  cnpj_destinatario?: string;
  cpf_destinatario?: string;
  inscricao_estadual_destinatario?: string;
  nome_destinatario?: string;
  telefone_destinatario?: string;
  logradouro_destinatario?: string;
  numero_destinatario?: string;
  bairro_destinatario?: string;
  codigo_municipio_destinatario?: string;
  municipio_destinatario?: string;
  uf_destinatario?: string;
  cep_destinatario?: string;
  codigo_pais_destinatario?: string;
  pais_destinatario?: string;
  email_destinatario?: string;
  valor_total: string;
  valor_receber?: string;
  icms_situacao_tributaria?: string;
  icms_base_calculo?: string;
  icms_aliquota?: string;
  icms_valor?: string;
  valor_total_carga?: string;
  produto_predominante?: string;
  outras_caracteristicas_carga?: string;
  quantidades?: CteQuantidade[];
  nfes?: CteNfe[];
  valor_original_fatura?: string;
  valor_desconto_fatura?: string;
  valor_liquido_fatura?: string;
  duplicatas?: CteDuplicata[];
  seguros_carga?: CteSeguroCarga[];
  documentos_referenciados?: CteDocumentoReferenciado[];
  indicador_inscricao_estadual_tomador?: string;
  tomador?: string;
  codigo_municipio_envio?: string;
  municipio_envio?: string;
  uf_envio?: string;
  codigo_municipio_inicio?: string;
  municipio_inicio?: string;
  uf_inicio?: string;
  codigo_municipio_fim?: string;
  municipio_fim?: string;
  uf_fim?: string;
  retirar_mercadoria?: string;
  detalhes_retirar?: string;
  valor_carga_averbacao?: string;
  modal_rodoviario?: Record<string, unknown>;
  modal_aereo?: Record<string, unknown>;
  modal_aquaviario?: Record<string, unknown>;
  modal_ferroviario?: Record<string, unknown>;
  modal_dutoviario?: Record<string, unknown>;
  modal_multimodal?: Record<string, unknown>;
  [key: string]: unknown;
}

// ── CTe OS Create ───────────────────────────────────────────────────

export interface CteOsCreateParams {
  cfop: string;
  natureza_operacao: string;
  data_emissao: string;
  tipo_documento: number;
  modal: string;
  tipo_servico?: number;
  cnpj_emitente: string;
  inscricao_estadual_emitente?: string;
  nome_emitente?: string;
  nome_fantasia_emitente?: string;
  logradouro_emitente?: string;
  numero_emitente?: string;
  complemento_emitente?: string;
  bairro_emitente?: string;
  codigo_municipio_emitente?: string;
  municipio_emitente?: string;
  uf_emitente?: string;
  cep_emitente?: string;
  telefone_emitente?: string;
  cnpj_tomador?: string;
  cpf_tomador?: string;
  nome_tomador?: string;
  nome_fantasia_tomador?: string;
  logradouro_tomador?: string;
  numero_tomador?: string;
  bairro_tomador?: string;
  codigo_municipio_tomador?: string;
  municipio_tomador?: string;
  uf_tomador?: string;
  cep_tomador?: string;
  codigo_pais_tomador?: string;
  pais_tomador?: string;
  indicador_inscricao_estadual_tomador?: string;
  valor_total: string;
  valor_receber?: string;
  icms_situacao_tributaria?: string;
  icms_base_calculo?: string;
  icms_aliquota?: string;
  icms_valor?: string;
  descricao_servico?: string;
  codigo_municipio_envio?: string;
  municipio_envio?: string;
  uf_envio?: string;
  codigo_municipio_inicio?: string;
  municipio_inicio?: string;
  uf_inicio?: string;
  codigo_municipio_fim?: string;
  municipio_fim?: string;
  uf_fim?: string;
  valor_original_fatura?: string;
  valor_desconto_fatura?: string;
  valor_liquido_fatura?: string;
  numero_fatura?: string;
  seguros_carga?: CteSeguroCarga[];
  documentos_referenciados?: CteDocumentoReferenciado[];
  funcionario_emissor?: string;
  valor_inss?: string;
  valor_total_tributos?: string;
  modal_rodoviario?: Record<string, unknown>;
  modal_aereo?: Record<string, unknown>;
  modal_aquaviario?: Record<string, unknown>;
  modal_ferroviario?: Record<string, unknown>;
  modal_dutoviario?: Record<string, unknown>;
  modal_multimodal?: Record<string, unknown>;
  [key: string]: unknown;
}

// ── CTe Enums ───────────────────────────────────────────────────────

export type CteStatus =
  | "processando_autorizacao"
  | "autorizado"
  | "cancelado"
  | "erro_autorizacao";

// ── CTe Response ────────────────────────────────────────────────────

export interface CteResponse {
  cnpj_emitente: string;
  ref: string;
  status: CteStatus;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave?: string;
  numero?: string;
  serie?: string;
  modelo?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_dacte?: string;
  caminho_xml?: string;
  caminho_xml_carta_correcao?: string;
  caminho_xml_cancelamento?: string;
  requisicao?: Record<string, unknown>;
  protocolo?: Record<string, unknown>;
  requisicao_cancelamento?: Record<string, unknown>;
  protocolo_cancelamento?: Record<string, unknown>;
  requisicao_carta_correcao?: Record<string, unknown>;
  protocolo_carta_correcao?: Record<string, unknown>;
}

// ── CTe Cancel ──────────────────────────────────────────────────────

export interface CteCancelParams {
  justificativa: string;
}

export interface CteCancelResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: CteStatus;
  caminho_xml?: string;
}

// ── CTe Carta de Correcao ───────────────────────────────────────────

export interface CteCartaCorrecaoParams {
  grupo_corrigido?: string;
  campo_corrigido: string;
  valor_corrigido: string;
  numero_item_grupo_corrigido?: number;
  campo_api?: number;
}

export interface CteCartaCorrecaoResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: CteStatus;
  caminho_xml?: string;
  numero_carta_correcao?: number;
}

// ── CTe Desacordo ───────────────────────────────────────────────────

export interface CtePrestacaoDesacordoParams {
  observacoes: string;
}

export interface CtePrestacaoDesacordoResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: CteStatus;
  caminho_xml?: string;
}

// ── CTe Registro Multimodal ─────────────────────────────────────────

export interface CteRegistroMultimodalParams {
  [key: string]: unknown;
}

export interface CteRegistroMultimodalResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: CteStatus;
  caminho_xml?: string;
}

// ── CTe Dados GTV ───────────────────────────────────────────────────

export interface CteDadosGtvParams {
  [key: string]: unknown;
}

export interface CteDadosGtvResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: CteStatus;
  caminho_xml?: string;
}

// ── CTe Webhook ─────────────────────────────────────────────────────

export interface CteWebhookResponse {
  status: CteStatus;
}
