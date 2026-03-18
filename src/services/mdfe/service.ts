import { BaseService } from "../../core/base-service.js";
import type {
  MdfeCancelParams,
  MdfeCancelResponse,
  MdfeCondutorParams,
  MdfeCondutorResponse,
  MdfeCreateParams,
  MdfeDfeParams,
  MdfeDfeResponse,
  MdfeEncerrarParams,
  MdfeEncerrarResponse,
  MdfeResponse,
  MdfeWebhookResponse,
} from "./types.js";

export class MdfeService extends BaseService {
  create(ref: string, params: MdfeCreateParams): Promise<MdfeResponse> {
    return this._request<MdfeResponse>({
      method: "POST",
      path: "/v2/mdfe",
      query: { ref },
      body: params,
    });
  }

  get(ref: string, completa?: boolean): Promise<MdfeResponse> {
    return this._request<MdfeResponse>({
      method: "GET",
      path: `/v2/mdfe/${ref}`,
      query: completa ? { completa: 1 } : undefined,
    });
  }

  cancel(ref: string, params: MdfeCancelParams): Promise<MdfeCancelResponse> {
    return this._request<MdfeCancelResponse>({
      method: "DELETE",
      path: `/v2/mdfe/${ref}`,
      body: params,
    });
  }

  incluirCondutor(
    ref: string,
    params: MdfeCondutorParams,
  ): Promise<MdfeCondutorResponse> {
    return this._request<MdfeCondutorResponse>({
      method: "POST",
      path: `/v2/mdfe/${ref}/inclusao_condutor`,
      body: params,
    });
  }

  incluirDfe(ref: string, params: MdfeDfeParams): Promise<MdfeDfeResponse> {
    return this._request<MdfeDfeResponse>({
      method: "POST",
      path: `/v2/mdfe/${ref}/inclusao_dfe`,
      body: params,
    });
  }

  encerrar(
    ref: string,
    params: MdfeEncerrarParams,
  ): Promise<MdfeEncerrarResponse> {
    return this._request<MdfeEncerrarResponse>({
      method: "POST",
      path: `/v2/mdfe/${ref}/encerrar`,
      body: params,
    });
  }

  resendWebhook(ref: string): Promise<MdfeWebhookResponse> {
    return this._request<MdfeWebhookResponse>({
      method: "POST",
      path: `/v2/mdfe/${ref}/hook`,
    });
  }
}
