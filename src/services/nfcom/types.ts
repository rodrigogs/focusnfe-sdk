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
