// Core types
export type { FocusNFeErrorDetail } from "./core/errors.js";
export type { BinaryResponse, HttpMethod, RequestConfig } from "./core/http.js";
export type {
  FocusNFeClientOptions,
  FocusNFeEnvironment,
  NormalizedOptions,
} from "./core/types.js";

// NFe
export type {
  NfeAtorInteressadoParams,
  NfeAtorInteressadoResponse,
  NfeCancelInsucessoEntregaResponse,
  NfeCancelParams,
  NfeCancelResponse,
  NfeCartaCorrecaoParams,
  NfeCartaCorrecaoResponse,
  NfeCreateParams,
  NfeEconfCancelResponse,
  NfeEconfDetalhePagamento,
  NfeEconfParams,
  NfeEconfResponse,
  NfeEmailParams,
  NfeEventoParams,
  NfeEventoResponse,
  NfeFormaPagamento,
  NfeImportacaoParams,
  NfeInsucessoEntregaParams,
  NfeInsucessoEntregaResponse,
  NfeInutilizacaoParams,
  NfeInutilizacaoResponse,
  NfeInutilizacoesListParams,
  NfeItem,
  NfeNotaReferenciada,
  NfeResponse,
  NfeStatus,
  NfeWebhookResponse,
} from "./services/nfe/index.js";

// NFCe
export type {
  NfceCancelParams,
  NfceCancelResponse,
  NfceCreateParams,
  NfceEconfCancelResponse,
  NfceEconfDetalhePagamento,
  NfceEconfParams,
  NfceEconfResponse,
  NfceEmailParams,
  NfceFormaPagamento,
  NfceInutilizacaoParams,
  NfceInutilizacaoResponse,
  NfceInutilizacoesListParams,
  NfceItem,
  NfceResponse,
  NfceStatus,
} from "./services/nfce/index.js";

// NFSe
export type {
  NfseCancelParams,
  NfseCancelResponse,
  NfseCreateParams,
  NfseEmailParams,
  NfseIntermediario,
  NfsePrestador,
  NfseResponse,
  NfseResponseError,
  NfseServico,
  NfseStatus,
  NfseTomador,
  NfseTomadorEndereco,
} from "./services/nfse/index.js";

// NFSe Nacional
export type {
  NfseNacionalCancelParams,
  NfseNacionalCancelResponse,
  NfseNacionalCreateParams,
  NfseNacionalResponse,
  NfseNacionalResponseError,
  NfseNacionalStatus,
} from "./services/nfse-nacional/index.js";

// CTe
export type {
  CteCancelParams,
  CteCancelResponse,
  CteCartaCorrecaoParams,
  CteCartaCorrecaoResponse,
  CteCreateParams,
  CteDadosGtvParams,
  CteDadosGtvResponse,
  CteDocumentoReferenciado,
  CteDuplicata,
  CteNfe,
  CteOsCreateParams,
  CtePrestacaoDesacordoParams,
  CtePrestacaoDesacordoResponse,
  CteQuantidade,
  CteRegistroMultimodalParams,
  CteRegistroMultimodalResponse,
  CteResponse,
  CteSeguroCarga,
  CteStatus,
  CteWebhookResponse,
} from "./services/cte/index.js";

// MDFe
export type {
  MdfeCancelParams,
  MdfeCancelResponse,
  MdfeCondutorParams,
  MdfeCondutorResponse,
  MdfeConhecimentoTransporte,
  MdfeCreateOptions,
  MdfeCreateParams,
  MdfeDfeDocumento,
  MdfeDfeParams,
  MdfeDfeResponse,
  MdfeEncerrarParams,
  MdfeEncerrarResponse,
  MdfeMunicipioCarregamento,
  MdfeMunicipioDescarregamento,
  MdfeNotaFiscal,
  MdfePercurso,
  MdfeResponse,
  MdfeStatus,
} from "./services/mdfe/index.js";

// NFCom
export type {
  NfcomCancelParams,
  NfcomCancelResponse,
  NfcomCreateOptions,
  NfcomCreateParams,
  NfcomResponse,
  NfcomStatus,
} from "./services/nfcom/index.js";

// NFe Recebidas
export type {
  ManifestacaoParams,
  ManifestacaoResponse,
  ManifestacaoTipo,
  NfeRecebida,
  NfeRecebidasListParams,
} from "./services/nfe-recebidas/index.js";

// CTe Recebidas
export type {
  CteDesacordoParams,
  CteDesacordoResponse,
  CteDesacordoStatus,
  CteRecebida,
  CteRecebidasListParams,
} from "./services/cte-recebidas/index.js";

// NFSe Recebidas
export type {
  NfseRecebida,
  NfseRecebidasListParams,
} from "./services/nfse-recebidas/index.js";

// Empresas
export type {
  Empresa,
  EmpresaCreateOptions,
  EmpresaCreateParams,
  EmpresaListParams,
  EmpresaUpdateOptions,
  EmpresaUpdateParams,
} from "./services/empresas/index.js";

// Webhooks
export type {
  Webhook,
  WebhookCreateParams,
  WebhookEvent,
  WebhookRemoveResult,
} from "./services/webhooks/index.js";

// Consultas
export type {
  BackupEntry,
  BackupResult,
  BlockedEmailResult,
  CepQueryParams,
  CepResult,
  CfopQueryParams,
  CfopResult,
  CnaeQueryParams,
  CnaeResult,
  CnpjEndereco,
  CnpjResult,
  CodigosTributariosMunicipioParams,
  CodigoTributarioMunicipio,
  ItemListaServico,
  ItensListaServicoParams,
  MunicipioQueryParams,
  MunicipioResult,
  MunicipioStatusNfse,
  NcmQueryParams,
  NcmResult,
} from "./services/consultas/index.js";
