import { BaseService } from "../../core/base-service.js";
import type {
  Webhook,
  WebhookCreateParams,
  WebhookRemoveResult,
} from "./types.js";

export class WebhooksService extends BaseService {
  create(params: WebhookCreateParams): Promise<Webhook> {
    return this._request({ method: "POST", path: "/v2/hooks", body: params });
  }

  list(): Promise<Webhook[]> {
    return this._request({ method: "GET", path: "/v2/hooks" });
  }

  get(id: string): Promise<Webhook> {
    return this._request({ method: "GET", path: `/v2/hooks/${id}` });
  }

  remove(id: string): Promise<WebhookRemoveResult> {
    return this._request({ method: "DELETE", path: `/v2/hooks/${id}` });
  }
}
