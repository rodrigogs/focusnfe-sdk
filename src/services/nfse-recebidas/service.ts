import { BaseService } from "../../core/base-service.js";
import type { NfseRecebida, NfseRecebidasListParams } from "./types.js";

export class NfseRecebidasService extends BaseService {
  list(params: NfseRecebidasListParams): Promise<NfseRecebida[]> {
    return this._request({
      method: "GET",
      path: "/v2/nfses_recebidas",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  get(chave: string): Promise<NfseRecebida> {
    return this._request({
      method: "GET",
      path: `/v2/nfses_recebidas/${chave}`,
    });
  }
}
