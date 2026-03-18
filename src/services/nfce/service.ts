import { BaseService } from "../../core/base-service.js";
import type {
  NfceCancelParams,
  NfceCancelResponse,
  NfceCreateParams,
  NfceEconfCancelResponse,
  NfceEconfParams,
  NfceEconfResponse,
  NfceEmailParams,
  NfceInutilizacaoParams,
  NfceInutilizacaoResponse,
  NfceInutilizacoesListParams,
  NfceResponse,
} from "./types.js";

export class NfceService extends BaseService {
  create(ref: string, params: NfceCreateParams): Promise<NfceResponse> {
    return this._request({
      method: "POST",
      path: "/v2/nfce",
      query: { ref },
      body: params,
    });
  }

  get(ref: string, completa?: boolean): Promise<NfceResponse> {
    return this._request({
      method: "GET",
      path: `/v2/nfce/${ref}`,
      query: completa ? { completa: 1 } : undefined,
    });
  }

  cancel(ref: string, params: NfceCancelParams): Promise<NfceCancelResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/nfce/${ref}`,
      body: params,
    });
  }

  email(ref: string, params: NfceEmailParams): Promise<void> {
    return this._request({
      method: "POST",
      path: `/v2/nfce/${ref}/email`,
      body: params,
    });
  }

  inutilizar(
    params: NfceInutilizacaoParams,
  ): Promise<NfceInutilizacaoResponse> {
    return this._request({
      method: "POST",
      path: "/v2/nfce/inutilizacao",
      body: params,
    });
  }

  inutilizacoes(
    params: NfceInutilizacoesListParams,
  ): Promise<NfceInutilizacaoResponse[]> {
    return this._request({
      method: "GET",
      path: "/v2/nfce/inutilizacoes",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  econf(ref: string, params: NfceEconfParams): Promise<NfceEconfResponse> {
    return this._request({
      method: "POST",
      path: `/v2/nfce/${ref}/econf`,
      body: params,
    });
  }

  getEconf(ref: string, protocolo: string): Promise<NfceEconfResponse> {
    return this._request({
      method: "GET",
      path: `/v2/nfce/${ref}/econf/${protocolo}`,
    });
  }

  cancelEconf(
    ref: string,
    protocolo: string,
  ): Promise<NfceEconfCancelResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/nfce/${ref}/econf/${protocolo}`,
    });
  }
}
