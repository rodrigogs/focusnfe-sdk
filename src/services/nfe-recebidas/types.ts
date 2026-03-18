// --- Query params ---

export interface NfeRecebidasListParams {
  cnpj: string;
  versao?: number;
  pendente?: boolean;
  pendente_ciencia?: boolean;
}

// --- Response types ---

export interface NfeRecebida {
  nome_emitente: string;
  documento_emitente: string;
  cnpj_destinatario?: string;
  chave_nfe: string;
  valor_total: string;
  data_emissao: string;
  situacao: "autorizada" | "cancelada" | "denegada";
  manifestacao_destinatario?:
    | "ciencia"
    | "confirmacao"
    | "desconhecimento"
    | "nao_realizada"
    | null;
  nfe_completa?: boolean;
  tipo_nfe: string;
  versao: number;
  digest_value?: string;
  numero_carta_correcao?: string | null;
  carta_correcao?: string | null;
  data_carta_correcao?: string | null;
  data_cancelamento?: string | null;
  justificativa_cancelamento?: string | null;
}

// --- Manifestacao ---

export type ManifestacaoTipo =
  | "ciencia"
  | "confirmacao"
  | "desconhecimento"
  | "nao_realizada";

export interface ManifestacaoParams {
  tipo: ManifestacaoTipo;
  justificativa?: string;
}

export interface ManifestacaoResponse {
  status_sefaz: string;
  mensagem_sefaz: string;
  status: string;
  protocolo: string;
  tipo: ManifestacaoTipo;
  justificativa?: string;
}
