import { BaseService } from "../../core/base-service.js";
import type {
  CteCancelParams,
  CteCancelResponse,
  CteCartaCorrecaoParams,
  CteCartaCorrecaoResponse,
  CteCreateParams,
  CteDadosGtvParams,
  CteDadosGtvResponse,
  CteOsCreateParams,
  CtePrestacaoDesacordoParams,
  CtePrestacaoDesacordoResponse,
  CteRegistroMultimodalParams,
  CteRegistroMultimodalResponse,
  CteResponse,
} from "./types.js";

export class CteService extends BaseService {
  create(ref: string, params: CteCreateParams): Promise<CteResponse> {
    return this._request({
      method: "POST",
      path: "/v2/cte",
      query: { ref },
      body: params,
    });
  }

  createOs(ref: string, params: CteOsCreateParams): Promise<CteResponse> {
    return this._request({
      method: "POST",
      path: "/v2/cte_os",
      query: { ref },
      body: params,
    });
  }

  get(ref: string, completa?: boolean): Promise<CteResponse> {
    return this._request({
      method: "GET",
      path: `/v2/cte/${ref}`,
      query: completa ? { completa: 1 } : undefined,
    });
  }

  cancel(ref: string, params: CteCancelParams): Promise<CteCancelResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/cte/${ref}`,
      body: params,
    });
  }

  cartaCorrecao(
    ref: string,
    params: CteCartaCorrecaoParams,
  ): Promise<CteCartaCorrecaoResponse> {
    return this._request({
      method: "POST",
      path: `/v2/cte/${ref}/carta_correcao`,
      body: params,
    });
  }

  desacordo(
    ref: string,
    params: CtePrestacaoDesacordoParams,
  ): Promise<CtePrestacaoDesacordoResponse> {
    return this._request({
      method: "POST",
      path: `/v2/cte/${ref}/desacordo`,
      body: params,
    });
  }

  registroMultimodal(
    ref: string,
    params: CteRegistroMultimodalParams,
  ): Promise<CteRegistroMultimodalResponse> {
    return this._request({
      method: "POST",
      path: `/v2/cte/${ref}/registro_multimodal`,
      body: params,
    });
  }

  dadosGtv(
    ref: string,
    params: CteDadosGtvParams,
  ): Promise<CteDadosGtvResponse> {
    return this._request({
      method: "POST",
      path: `/v2/cte/${ref}/dados_gtv`,
      body: params,
    });
  }

  resendWebhook(ref: string): Promise<void> {
    return this._request({
      method: "POST",
      path: `/v2/cte/${ref}/hook`,
    });
  }
}
