export interface NfcomCreateOptions {
  contingencia?: boolean;
}

export interface NfcomCreateParams {
  cnpj_emitente: string;
  [key: string]: unknown;
}

export interface NfcomResponse {
  cnpj_emitente?: string;
  ref?: string;
  status: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave?: string;
  numero?: string;
  serie?: string;
  modelo?: string;
  caminho_xml?: string;
  caminho_danfecom?: string;
  caminho_xml_cancelamento?: string;
  // Fields returned when completa=1
  requisicao?: Record<string, unknown>;
  protocolo?: Record<string, unknown>;
  requisicao_cancelamento?: Record<string, unknown>;
  protocolo_cancelamento?: Record<string, unknown>;
  // Contingency fields
  contingencia_offline?: boolean;
  contingencia_offline_efetivada?: boolean;
}

export interface NfcomCancelParams {
  justificativa: string;
}

export interface NfcomCancelResponse {
  status: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml?: string;
}
