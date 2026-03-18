// --- Query params ---

export interface NfseRecebidasListParams {
  cnpj: string;
  versao?: number;
  completa?: boolean;
  api_version?: string;
}

// --- Response types ---

export interface NfseRecebida {
  chave: string;
  versao: number;
  status: string;
  numero: string;
  numero_rps?: string | null;
  serie_rps?: string | null;
  data_emissao: string;
  data_emissao_rps?: string | null;
  codigo_verificacao?: string | null;
  valor_servicos: string;
  documento_prestador: string;
  nome_prestador?: string | null;
  inscricao_municipal_prestador?: string | null;
  nome_municipio?: string | null;
  sigla_uf?: string | null;
  codigo_municipio?: string | null;
  documento_tomador?: string | null;
  url?: string | null;
  url_xml?: string | null;
}
