import {
  FOCUSNFE_BASE_URLS,
  FOCUSNFE_DEFAULT_ENVIRONMENT,
  FOCUSNFE_DEFAULT_TIMEOUT,
} from "./core/constants.js";
import { FocusNFeError } from "./core/errors.js";
import {
  type BinaryResponse,
  request,
  requestBinary,
  type RequestConfig,
} from "./core/http.js";
import type { FocusNFeClientOptions, NormalizedOptions } from "./core/types.js";
import { ConsultasService } from "./services/consultas/index.js";
import { CteService } from "./services/cte/index.js";
import { CteRecebidasService } from "./services/cte-recebidas/index.js";
import { EmpresasService } from "./services/empresas/index.js";
import { MdfeService } from "./services/mdfe/index.js";
import { NfceService } from "./services/nfce/index.js";
import { NfcomService } from "./services/nfcom/index.js";
import { NfeService } from "./services/nfe/index.js";
import { NfeRecebidasService } from "./services/nfe-recebidas/index.js";
import { NfseService } from "./services/nfse/index.js";
import { NfseNacionalService } from "./services/nfse-nacional/index.js";
import { NfseRecebidasService } from "./services/nfse-recebidas/index.js";
import { WebhooksService } from "./services/webhooks/index.js";

function normalizeOptions(options: FocusNFeClientOptions): NormalizedOptions {
  const environment = options.environment ?? FOCUSNFE_DEFAULT_ENVIRONMENT;
  return {
    token: options.token,
    baseUrl: options.baseUrl ?? FOCUSNFE_BASE_URLS[environment],
    timeout: options.timeout ?? FOCUSNFE_DEFAULT_TIMEOUT,
    fetch: options.fetch ?? globalThis.fetch,
    userAgent: options.userAgent ?? "",
  };
}

export class FocusNFeClient {
  private readonly _options: NormalizedOptions;

  constructor(options: FocusNFeClientOptions) {
    if (!options.token) {
      throw new FocusNFeError("FocusNFe API token is required");
    }
    this._options = normalizeOptions(options);
  }

  private _nfe?: NfeService;
  get nfe(): NfeService {
    return (this._nfe ??= new NfeService(this._options));
  }

  private _nfce?: NfceService;
  get nfce(): NfceService {
    return (this._nfce ??= new NfceService(this._options));
  }

  private _nfse?: NfseService;
  get nfse(): NfseService {
    return (this._nfse ??= new NfseService(this._options));
  }

  private _nfseNacional?: NfseNacionalService;
  get nfseNacional(): NfseNacionalService {
    return (this._nfseNacional ??= new NfseNacionalService(this._options));
  }

  private _cte?: CteService;
  get cte(): CteService {
    return (this._cte ??= new CteService(this._options));
  }

  private _mdfe?: MdfeService;
  get mdfe(): MdfeService {
    return (this._mdfe ??= new MdfeService(this._options));
  }

  private _nfcom?: NfcomService;
  get nfcom(): NfcomService {
    return (this._nfcom ??= new NfcomService(this._options));
  }

  private _nfeRecebidas?: NfeRecebidasService;
  get nfeRecebidas(): NfeRecebidasService {
    return (this._nfeRecebidas ??= new NfeRecebidasService(this._options));
  }

  private _cteRecebidas?: CteRecebidasService;
  get cteRecebidas(): CteRecebidasService {
    return (this._cteRecebidas ??= new CteRecebidasService(this._options));
  }

  private _nfseRecebidas?: NfseRecebidasService;
  get nfseRecebidas(): NfseRecebidasService {
    return (this._nfseRecebidas ??= new NfseRecebidasService(this._options));
  }

  private _empresas?: EmpresasService;
  get empresas(): EmpresasService {
    return (this._empresas ??= new EmpresasService(this._options));
  }

  private _webhooks?: WebhooksService;
  get webhooks(): WebhooksService {
    return (this._webhooks ??= new WebhooksService(this._options));
  }

  private _consultas?: ConsultasService;
  get consultas(): ConsultasService {
    return (this._consultas ??= new ConsultasService(this._options));
  }

  request<T>(config: RequestConfig): Promise<T> {
    return request<T>(this._options, config);
  }

  requestBinary(config: RequestConfig): Promise<BinaryResponse> {
    return requestBinary(this._options, config);
  }
}
