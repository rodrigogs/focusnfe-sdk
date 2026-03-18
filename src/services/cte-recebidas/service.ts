import { BaseService } from "../../core/base-service.js";
import type { BinaryResponse } from "../../core/http.js";
import type {
  CteDesacordoParams,
  CteDesacordoResponse,
  CteRecebida,
  CteRecebidasListParams,
} from "./types.js";

export class CteRecebidasService extends BaseService {
  list(params: CteRecebidasListParams): Promise<CteRecebida[]> {
    return this._request({
      method: "GET",
      path: "/v2/ctes_recebidas",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  get(chave: string): Promise<CteRecebida> {
    return this._request({
      method: "GET",
      path: `/v2/ctes_recebidas/${chave}.json`,
    });
  }

  getXml(chave: string): Promise<BinaryResponse> {
    return this._requestBinary({
      method: "GET",
      path: `/v2/ctes_recebidas/${chave}.xml`,
    });
  }

  getCancelamentoXml(chave: string): Promise<BinaryResponse> {
    return this._requestBinary({
      method: "GET",
      path: `/v2/ctes_recebidas/${chave}/cancelamento.xml`,
    });
  }

  getCartaCorrecaoXml(chave: string): Promise<BinaryResponse> {
    return this._requestBinary({
      method: "GET",
      path: `/v2/ctes_recebidas/${chave}/carta_correcao.xml`,
    });
  }

  desacordo(
    chave: string,
    params: CteDesacordoParams,
  ): Promise<CteDesacordoResponse> {
    return this._request({
      method: "POST",
      path: `/v2/ctes_recebidas/${chave}/desacordo`,
      body: params,
    });
  }

  getDesacordo(chave: string): Promise<CteDesacordoResponse> {
    return this._request({
      method: "GET",
      path: `/v2/ctes_recebidas/${chave}/desacordo`,
    });
  }
}
