import { BaseService } from "../../core/base-service.js";
import type {
  MdfeCancelParams,
  MdfeCancelResponse,
  MdfeCondutorParams,
  MdfeCondutorResponse,
  MdfeCreateOptions,
  MdfeCreateParams,
  MdfeDfeParams,
  MdfeDfeResponse,
  MdfeEncerrarParams,
  MdfeEncerrarResponse,
  MdfeResponse,
} from "./types.js";

export class MdfeService extends BaseService {
  create(
    ref: string,
    params: MdfeCreateParams,
    options?: MdfeCreateOptions,
  ): Promise<MdfeResponse> {
    return this._request({
      method: "POST",
      path: "/v2/mdfe",
      query: { ref, ...(options?.contingencia ? { contingencia: 1 } : {}) },
      body: params,
    });
  }

  get(ref: string, completa?: boolean): Promise<MdfeResponse> {
    return this._request({
      method: "GET",
      path: `/v2/mdfe/${ref}`,
      query: completa ? { completa: 1 } : undefined,
    });
  }

  cancel(ref: string, params: MdfeCancelParams): Promise<MdfeCancelResponse> {
    return this._request({
      method: "DELETE",
      path: `/v2/mdfe/${ref}`,
      body: params,
    });
  }

  incluirCondutor(
    ref: string,
    params: MdfeCondutorParams,
  ): Promise<MdfeCondutorResponse> {
    return this._request({
      method: "POST",
      path: `/v2/mdfe/${ref}/inclusao_condutor`,
      body: params,
    });
  }

  incluirDfe(ref: string, params: MdfeDfeParams): Promise<MdfeDfeResponse> {
    return this._request({
      method: "POST",
      path: `/v2/mdfe/${ref}/inclusao_dfe`,
      body: params,
    });
  }

  encerrar(
    ref: string,
    params: MdfeEncerrarParams,
  ): Promise<MdfeEncerrarResponse> {
    return this._request({
      method: "POST",
      path: `/v2/mdfe/${ref}/encerrar`,
      body: params,
    });
  }
}
