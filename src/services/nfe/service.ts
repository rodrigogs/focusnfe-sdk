import { BaseService } from "../../core/base-service.js";
import type { BinaryResponse } from "../../core/http.js";
import type {
  NfeAtorInteressadoParams,
  NfeAtorInteressadoResponse,
  NfeCancelInsucessoEntregaResponse,
  NfeCancelParams,
  NfeCancelResponse,
  NfeCartaCorrecaoParams,
  NfeCartaCorrecaoResponse,
  NfeCreateParams,
  NfeEconfCancelResponse,
  NfeEconfParams,
  NfeEconfResponse,
  NfeEmailParams,
  NfeImportacaoParams,
  NfeInsucessoEntregaParams,
  NfeInsucessoEntregaResponse,
  NfeInutilizacaoParams,
  NfeInutilizacaoResponse,
  NfeInutilizacoesListParams,
  NfeResponse,
  NfeWebhookResponse,
} from "./types.js";

export class NfeService extends BaseService {
  create(ref: string, params: NfeCreateParams): Promise<NfeResponse> {
    return this._request({
      method: "POST",
      path: "/v2/nfe",
      query: { ref },
      body: params,
    });
  }

  get(ref: string, completa?: boolean): Promise<NfeResponse> {
    return this._request({
      method: "GET",
      path: `/v2/nfe/${ref}`,
      query: completa ? { completa: 1 } : undefined,
    });
  }

  cancel(ref: string, params: NfeCancelParams): Promise<NfeCancelResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/nfe/${ref}`,
      body: params,
    });
  }

  cartaCorrecao(
    ref: string,
    params: NfeCartaCorrecaoParams,
  ): Promise<NfeCartaCorrecaoResponse> {
    return this._request({
      method: "POST",
      path: `/v2/nfe/${ref}/carta_correcao`,
      body: params,
    });
  }

  atorInteressado(
    ref: string,
    params: NfeAtorInteressadoParams,
  ): Promise<NfeAtorInteressadoResponse> {
    return this._request({
      method: "POST",
      path: `/v2/nfe/${ref}/ator_interessado`,
      body: params,
    });
  }

  insucessoEntrega(
    ref: string,
    params: NfeInsucessoEntregaParams,
  ): Promise<NfeInsucessoEntregaResponse> {
    return this._request({
      method: "POST",
      path: `/v2/nfe/${ref}/insucesso_entrega`,
      body: params,
    });
  }

  cancelInsucessoEntrega(
    ref: string,
  ): Promise<NfeCancelInsucessoEntregaResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/nfe/${ref}/insucesso_entrega`,
    });
  }

  email(ref: string, params: NfeEmailParams): Promise<void> {
    return this._request({
      method: "POST",
      path: `/v2/nfe/${ref}/email`,
      body: params,
    });
  }

  inutilizar(params: NfeInutilizacaoParams): Promise<NfeInutilizacaoResponse> {
    return this._request({
      method: "POST",
      path: "/v2/nfe/inutilizacao",
      body: params,
    });
  }

  inutilizacoes(
    params: NfeInutilizacoesListParams,
  ): Promise<NfeInutilizacaoResponse[]> {
    return this._request({
      method: "GET",
      path: "/v2/nfe/inutilizacoes",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  importar(ref: string, params: NfeImportacaoParams): Promise<NfeResponse> {
    return this._request({
      method: "POST",
      path: "/v2/nfe/importacao",
      query: { ref },
      body: params,
    });
  }

  danfePreview(params: NfeCreateParams): Promise<BinaryResponse> {
    return this._requestBinary({
      method: "POST",
      path: "/v2/nfe/danfe",
      body: params,
    });
  }

  econf(ref: string, params: NfeEconfParams): Promise<NfeEconfResponse> {
    return this._request({
      method: "POST",
      path: `/v2/nfe/${ref}/econf`,
      body: params,
    });
  }

  getEconf(ref: string, protocolo: string): Promise<NfeEconfResponse> {
    return this._request({
      method: "GET",
      path: `/v2/nfe/${ref}/econf/${protocolo}`,
    });
  }

  cancelEconf(ref: string, protocolo: string): Promise<NfeEconfCancelResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/nfe/${ref}/econf/${protocolo}`,
    });
  }

  resendWebhook(ref: string): Promise<NfeWebhookResponse> {
    return this._request({
      method: "POST",
      path: `/v2/nfe/${ref}/hook`,
    });
  }
}
