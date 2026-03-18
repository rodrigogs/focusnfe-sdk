// --- Query params ---

export interface CteRecebidasListParams {
  cnpj: string;
  versao?: number;
}

// --- Response types ---

export interface CteRecebida {
  nome_emitente: string;
  documento_emitente: string;
  cnpj_destinatario?: string;
  chave: string;
  valor_total: string;
  data_emissao: string;
  situacao: string;
  tipo_cte: string;
  versao: number;
  digest_value?: string;
  carta_correcao?: string | null;
  data_carta_correcao?: string | null;
  data_cancelamento?: string | null;
  justificativa_cancelamento?: string | null;
}

// --- Desacordo ---

export interface CteDesacordoParams {
  observacoes: string;
}

export type CteDesacordoStatus = "evento_registrado" | "erro_autorizacao";

export interface CteDesacordoResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: CteDesacordoStatus;
  protocolo: string;
}
