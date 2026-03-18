import { BaseService } from "../../core/base-service.js";
import type { BinaryResponse } from "../../core/http.js";
import type {
  ManifestacaoParams,
  ManifestacaoResponse,
  NfeRecebida,
  NfeRecebidasListParams,
} from "./types.js";

export class NfeRecebidasService extends BaseService {
  list(params: NfeRecebidasListParams): Promise<NfeRecebida[]> {
    return this._request({
      method: "GET",
      path: "/v2/nfes_recebidas",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  get(chave: string): Promise<NfeRecebida> {
    return this._request({
      method: "GET",
      path: `/v2/nfes_recebidas/${chave}.json`,
    });
  }

  getXml(chave: string): Promise<BinaryResponse> {
    return this._requestBinary({
      method: "GET",
      path: `/v2/nfes_recebidas/${chave}.xml`,
    });
  }

  getCancelamentoXml(chave: string): Promise<BinaryResponse> {
    return this._requestBinary({
      method: "GET",
      path: `/v2/nfes_recebidas/${chave}/cancelamento.xml`,
    });
  }

  getCartaCorrecaoXml(chave: string): Promise<BinaryResponse> {
    return this._requestBinary({
      method: "GET",
      path: `/v2/nfes_recebidas/${chave}/carta_correcao.xml`,
    });
  }

  manifestar(
    chave: string,
    params: ManifestacaoParams,
  ): Promise<ManifestacaoResponse> {
    return this._request({
      method: "POST",
      path: `/v2/nfes_recebidas/${chave}/manifesto`,
      body: params,
    });
  }

  getManifestacao(chave: string): Promise<ManifestacaoResponse> {
    return this._request({
      method: "GET",
      path: `/v2/nfes_recebidas/${chave}/manifesto`,
    });
  }

  resendWebhook(chave: string): Promise<void> {
    return this._request({
      method: "POST",
      path: `/v2/nfes_recebidas/${chave}/hook`,
    });
  }
}
