// --- Input types ---

export interface EmpresaCreateParams {
  // Dados básicos
  nome: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual?: number;
  inscricao_municipal?: number;
  regime_tributario: number;
  email: string;
  telefone?: string;

  // Endereço
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;

  // Configurações gerais
  enviar_email_destinatario?: boolean;
  enviar_email_homologacao?: boolean;
  discrimina_impostos?: boolean;
  cpf_cnpj_contabilidade?: string;

  // Habilitações
  habilita_nfe?: boolean;
  habilita_nfce?: boolean;
  habilita_nfse?: boolean;
  habilita_nfsen_producao?: boolean;
  habilita_nfsen_homologacao?: boolean;
  habilita_nfsen_recebidas_producao?: boolean;
  habilita_nfsen_recebidas_homologacao?: boolean;
  habilita_cte?: boolean;
  habilita_mdfe?: boolean;
  habilita_manifestacao?: boolean;
  habilita_manifestacao_cte?: boolean;
  habilita_contingencia_offline_nfce?: boolean;
  reaproveita_numero_nfce_contingencia?: boolean;

  // DANFe / badge
  mostrar_danfse_badge?: boolean;
  orientacao_danfe?: "portrait" | "landscape";
  recibo_danfe?: boolean;
  exibe_sempre_ipi_danfe?: boolean;
  exibe_issqn_danfe?: boolean;
  exibe_impostos_adicionais_danfe?: boolean;
  exibe_unidade_tributaria_danfe?: boolean;
  exibe_sempre_volumes_danfe?: boolean;
  exibe_composicao_carga_mdfe?: boolean;

  // Certificado digital
  arquivo_certificado_base64?: string;
  senha_certificado?: string;
  certificado_especifico?: boolean;

  // Logo
  arquivo_logo_base64?: string;
  delete_logo?: boolean;

  // NFCe CSC / tokens
  csc_nfce_producao?: string;
  id_token_nfce_producao?: string;
  csc_nfce_homologacao?: string;
  id_token_nfce_homologacao?: string;

  // Numeração NFe
  proximo_numero_nfe_producao?: number;
  proximo_numero_nfe_homologacao?: number;
  serie_nfe_producao?: number;
  serie_nfe_homologacao?: number;

  // Numeração NFCe
  proximo_numero_nfce_producao?: number;
  proximo_numero_nfce_homologacao?: number;
  serie_nfce_producao?: number;
  serie_nfce_homologacao?: number;

  // Numeração NFSe
  proximo_numero_nfse_producao?: number;
  proximo_numero_nfse_homologacao?: number;
  serie_nfse_producao?: number;
  serie_nfse_homologacao?: number;

  // Numeração NFSe Nacional
  proximo_numero_nfsen_producao?: number;
  proximo_numero_nfsen_homologacao?: number;
  serie_nfsen_producao?: number;
  serie_nfsen_homologacao?: number;

  // Numeração CTe
  proximo_numero_cte_producao?: number;
  proximo_numero_cte_homologacao?: number;
  serie_cte_producao?: number;
  serie_cte_homologacao?: number;

  // Numeração CTeOS
  proximo_numero_cte_os_producao?: number;
  proximo_numero_cte_os_homologacao?: number;
  serie_cte_os_producao?: number;
  serie_cte_os_homologacao?: number;

  // Numeração MDFe
  proximo_numero_mdfe_producao?: number;
  proximo_numero_mdfe_homologacao?: number;
  serie_mdfe_producao?: number;
  serie_mdfe_homologacao?: number;

  // Emissão síncrona
  nfe_sincrono?: boolean;
  nfe_sincrono_homologacao?: boolean;
  mdfe_sincrono?: boolean;
  mdfe_sincrono_homologacao?: boolean;

  // Responsável
  nome_responsavel?: string;
  cpf_responsavel?: string;
  login_responsavel?: string;
  senha_responsavel?: string;

  // Recebimento de documentos
  data_inicio_recebimento_nfe?: string;
  data_inicio_recebimento_cte?: string;

  // SMTP
  smtp_endereco?: string;
  smtp_dominio?: string;
  smtp_autenticacao?: string;
  smtp_porta?: number;
  smtp_login?: string;
  smtp_senha?: string;
  smtp_remetente?: string;
  smtp_responder_para?: string;
  smtp_modo_verificacao_openssl?: string;
  smtp_habilita_starttls?: boolean;
  smtp_ssl?: boolean;
  smtp_tls?: boolean;
}

export type EmpresaUpdateParams = Partial<EmpresaCreateParams>;

// --- Response types ---

export interface Empresa {
  id: number;
  nome: string;
  nome_fantasia: string;
  cnpj: string;
  cpf?: string;
  inscricao_estadual?: string | null;
  inscricao_municipal?: string | null;
  regime_tributario?: string | null;
  email?: string | null;
  telefone?: string | null;

  // Endereço
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cep?: string | null;
  municipio?: string | null;
  uf?: string | null;
  codigo_municipio?: string | null;
  codigo_pais?: string | null;
  codigo_uf?: string | null;
  pais?: string | null;

  // Configurações gerais
  enviar_email_destinatario?: boolean;
  enviar_email_homologacao?: boolean;
  discrimina_impostos?: boolean;
  cpf_cnpj_contabilidade?: string | null;

  // Habilitações
  habilita_nfe?: boolean;
  habilita_nfce?: boolean;
  habilita_nfse?: boolean;
  habilita_nfsen_producao?: boolean;
  habilita_nfsen_homologacao?: boolean;
  habilita_cte?: boolean;
  habilita_mdfe?: boolean;
  habilita_manifestacao?: boolean;
  habilita_manifestacao_homologacao?: boolean;
  habilita_manifestacao_cte?: boolean;
  habilita_manifestacao_cte_homologacao?: boolean;
  habilita_contingencia_offline_nfce?: boolean;
  habilita_contingencia_epec_nfce?: boolean;
  reaproveita_numero_nfce_contingencia?: boolean;

  // DANFe / badge
  mostrar_danfse_badge?: boolean;
  orientacao_danfe?: string | null;
  recibo_danfe?: boolean;
  exibe_sempre_ipi_danfe?: boolean;
  exibe_issqn_danfe?: boolean;
  exibe_impostos_adicionais_danfe?: boolean;
  exibe_fatura_danfe?: boolean;
  exibe_unidade_tributaria_danfe?: boolean;
  exibe_desconto_itens?: boolean;
  exibe_sempre_volumes_danfe?: boolean;
  exibe_composicao_carga_mdfe?: boolean;

  // NFCe CSC / tokens
  csc_nfce_producao?: string | null;
  id_token_nfce_producao?: string | null;
  csc_nfce_homologacao?: string | null;
  id_token_nfce_homologacao?: string | null;

  // Numeração NFe
  proximo_numero_nfe_producao?: number | null;
  proximo_numero_nfe_homologacao?: number | null;
  serie_nfe_producao?: number | null;
  serie_nfe_homologacao?: number | null;

  // Numeração NFCe
  proximo_numero_nfce_producao?: number | null;
  proximo_numero_nfce_homologacao?: number | null;
  serie_nfce_producao?: number | null;
  serie_nfce_homologacao?: number | null;

  // Numeração NFSe
  proximo_numero_nfse_producao?: number | null;
  proximo_numero_nfse_homologacao?: number | null;
  serie_nfse_producao?: number | null;
  serie_nfse_homologacao?: number | null;

  // Numeração NFSe Nacional
  proximo_numero_nfsen_producao?: number | null;
  proximo_numero_nfsen_homologacao?: number | null;
  serie_nfsen_producao?: number | null;
  serie_nfsen_homologacao?: number | null;

  // Numeração CTe
  proximo_numero_cte_producao?: number | null;
  proximo_numero_cte_homologacao?: number | null;
  serie_cte_producao?: number | null;
  serie_cte_homologacao?: number | null;

  // Numeração CTeOS
  proximo_numero_cte_os_producao?: number | null;
  proximo_numero_cte_os_homologacao?: number | null;
  serie_cte_os_producao?: number | null;
  serie_cte_os_homologacao?: number | null;

  // Numeração MDFe
  proximo_numero_mdfe_producao?: number | null;
  proximo_numero_mdfe_homologacao?: number | null;
  serie_mdfe_producao?: number | null;
  serie_mdfe_homologacao?: number | null;

  // Certificado
  certificado_valido_ate?: string | null;
  certificado_valido_de?: string | null;
  certificado_cnpj?: string | null;
  certificado_especifico?: boolean;

  // Responsável
  nome_responsavel?: string | null;
  cpf_responsavel?: string | null;
  cargo_responsavel?: string | null;
  login_responsavel?: string | null;
  senha_responsavel_preenchida?: boolean;

  // Outros
  data_ultima_emissao?: string | null;
  caminho_logo?: string | null;
}
