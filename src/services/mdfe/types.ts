// ── MDFe Create ─────────────────────────────────────────────────────

export interface MdfeMunicipioCarregamento {
  codigo: string;
  nome: string;
}

export interface MdfeConhecimentoTransporte {
  chave_cte: string;
}

export interface MdfeNotaFiscal {
  chave_nfe: string;
}

export interface MdfeMunicipioDescarregamento {
  codigo: string;
  nome: string;
  conhecimentos_transporte?: MdfeConhecimentoTransporte[];
  notas_fiscais?: MdfeNotaFiscal[];
}

export interface MdfePercurso {
  uf_percurso: string;
}

export interface MdfeCreateParams {
  serie: string;
  modo_transporte: string;
  data_emissao: string;
  uf_inicio: string;
  uf_fim: string;
  cnpj_emitente: string;
  inscricao_estadual_emitente: string;
  municipios_carregamento: MdfeMunicipioCarregamento[];
  municipios_descarregamento: MdfeMunicipioDescarregamento[];
  percursos?: MdfePercurso[];
  data_hora_previsto_inicio_viagem?: string;
  tipo_transporte?: string;
  emitente?: string;
  quantidade_total_cte?: number;
  quantidade_total_nfe?: number;
  valor_total_carga?: string;
  codigo_unidade_medida_peso_bruto?: string;
  peso_bruto?: string;
  modal_rodoviario?: Record<string, unknown>;
  modal_aereo?: Record<string, unknown>;
  modal_aquaviario?: Record<string, unknown>;
  modal_ferroviario?: Record<string, unknown>;
  [key: string]: unknown;
}

// ── MDFe Response ───────────────────────────────────────────────────

export interface MdfeResponse {
  cnpj_emitente: string;
  ref: string;
  status: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave_mdfe?: string;
  numero?: string;
  serie?: string;
  modelo?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_damdfe?: string;
  caminho_xml?: string;
  caminho_xml_cancelamento?: string;
  caminho_xml_encerramento?: string;
  requisicao?: Record<string, unknown>;
  protocolo?: Record<string, unknown>;
  requisicao_cancelamento?: Record<string, unknown>;
  protocolo_cancelamento?: Record<string, unknown>;
  requisicao_encerramento?: Record<string, unknown>;
  protocolo_encerramento?: Record<string, unknown>;
  condutores_incluidos?: Record<string, unknown>[];
  dfes_incluidos?: Record<string, unknown>[];
}

// ── MDFe Cancel ─────────────────────────────────────────────────────

export interface MdfeCancelParams {
  justificativa: string;
}

export interface MdfeCancelResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: string;
  caminho_xml?: string;
}

// ── MDFe Incluir Condutor ───────────────────────────────────────────

export interface MdfeCondutorParams {
  nome: string;
  cpf: string;
}

export interface MdfeCondutorResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: string;
  caminho_xml?: string;
}

// ── MDFe Incluir DFe ────────────────────────────────────────────────

export interface MdfeDfeDocumento {
  codigo_municipio_descarregamento: string;
  nome_municipio_descarregamento?: string;
  chave_nfe: string;
}

export interface MdfeDfeParams {
  protocolo: string;
  codigo_municipio_carregamento: string;
  nome_municipio_carregamento?: string;
  documentos: MdfeDfeDocumento[];
}

export interface MdfeDfeResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: string;
  caminho_xml?: string;
}

// ── MDFe Encerrar ───────────────────────────────────────────────────

export interface MdfeEncerrarParams {
  data: string;
  sigla_uf: string;
  nome_municipio: string;
}

export interface MdfeEncerrarResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: string;
  caminho_xml?: string;
}
