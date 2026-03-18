import { BaseService } from "../../core/base-service.js";
import type {
  NfseNacionalCancelParams,
  NfseNacionalCancelResponse,
  NfseNacionalCreateParams,
  NfseNacionalResponse,
} from "./types.js";

export class NfseNacionalService extends BaseService {
  create(
    ref: string,
    params: NfseNacionalCreateParams,
  ): Promise<NfseNacionalResponse> {
    return this._request({
      method: "POST",
      path: "/v2/nfsen",
      query: { ref },
      body: params,
    });
  }

  get(ref: string, completa?: boolean): Promise<NfseNacionalResponse> {
    return this._request({
      method: "GET",
      path: `/v2/nfsen/${ref}`,
      query: completa ? { completa: 1 } : undefined,
    });
  }

  cancel(
    ref: string,
    params: NfseNacionalCancelParams,
  ): Promise<NfseNacionalCancelResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/nfsen/${ref}`,
      body: params,
    });
  }

  resendWebhook(ref: string): Promise<void> {
    return this._request({
      method: "POST",
      path: `/v2/nfsen/${ref}/hook`,
    });
  }
}
