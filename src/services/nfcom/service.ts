import { BaseService } from "../../core/base-service.js";
import type {
  NfcomCancelParams,
  NfcomCancelResponse,
  NfcomCreateParams,
  NfcomResponse,
} from "./types.js";

export class NfcomService extends BaseService {
  create(ref: string, params: NfcomCreateParams): Promise<NfcomResponse> {
    return this._request({
      method: "POST",
      path: "/v2/nfcom",
      query: { ref },
      body: params,
    });
  }

  get(ref: string, completa?: boolean): Promise<NfcomResponse> {
    return this._request({
      method: "GET",
      path: `/v2/nfcom/${ref}`,
      query: completa ? { completa: 1 } : undefined,
    });
  }

  cancel(ref: string, params: NfcomCancelParams): Promise<NfcomCancelResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/nfcom/${ref}`,
      body: params,
    });
  }

  resendWebhook(ref: string): Promise<void> {
    return this._request({
      method: "POST",
      path: `/v2/nfcom/${ref}/hook`,
    });
  }
}
