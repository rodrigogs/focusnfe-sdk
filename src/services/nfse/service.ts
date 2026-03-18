import { BaseService } from "../../core/base-service.js";
import type {
  NfseCancelParams,
  NfseCancelResponse,
  NfseCreateParams,
  NfseEmailParams,
  NfseResponse,
} from "./types.js";

export class NfseService extends BaseService {
  create(ref: string, params: NfseCreateParams): Promise<NfseResponse> {
    return this._request({
      method: "POST",
      path: "/v2/nfse",
      query: { ref },
      body: params,
    });
  }

  get(ref: string, completa?: boolean): Promise<NfseResponse> {
    return this._request({
      method: "GET",
      path: `/v2/nfse/${ref}`,
      query: completa ? { completa: 1 } : undefined,
    });
  }

  cancel(ref: string, params: NfseCancelParams): Promise<NfseCancelResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/nfse/${ref}`,
      body: params,
    });
  }

  email(ref: string, params: NfseEmailParams): Promise<void> {
    return this._request({
      method: "POST",
      path: `/v2/nfse/${ref}/email`,
      body: params,
    });
  }

  resendWebhook(ref: string): Promise<void> {
    return this._request({
      method: "POST",
      path: `/v2/nfse/${ref}/hook`,
    });
  }
}
