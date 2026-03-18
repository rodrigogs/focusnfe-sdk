// --- Enums ---

export type WebhookEvent =
  | "nfe"
  | "nfse"
  | "nfsen"
  | "nfce_contingencia"
  | "nfe_recebida"
  | "nfe_recebida_falha_consulta"
  | "nfse_recebida"
  | "cte_recebida"
  | "inutilizacao"
  | "cte"
  | "mdfe"
  | "nfcom";

// --- Input types ---

export interface WebhookCreateParams {
  cnpj?: string;
  cpf?: string;
  event: WebhookEvent;
  url: string;
  authorization?: string;
  authorization_header?: string;
}

// --- Response types ---

export interface Webhook {
  id: string;
  url: string;
  authorization: string | null;
  authorization_header: string | null;
  event: WebhookEvent;
  cnpj?: string;
  cpf?: string;
  nome?: string;
  empresa_id?: string | number;
  count_since?: string;
  request_count?: number;
  error_count?: number;
  success_count?: number;
}

export interface WebhookRemoveResult extends Webhook {
  deleted: boolean;
}
