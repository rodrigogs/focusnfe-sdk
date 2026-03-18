import { BaseService } from "../../core/base-service.js";
import type {
  Empresa,
  EmpresaCreateOptions,
  EmpresaCreateParams,
  EmpresaListParams,
  EmpresaUpdateOptions,
  EmpresaUpdateParams,
} from "./types.js";

export class EmpresasService extends BaseService {
  create(
    params: EmpresaCreateParams,
    options?: EmpresaCreateOptions,
  ): Promise<Empresa> {
    return this._request({
      method: "POST",
      path: "/v2/empresas",
      query: options?.dryRun ? { dry_run: 1 } : undefined,
      body: params,
    });
  }

  list(params?: EmpresaListParams): Promise<Empresa[]> {
    return this._request({
      method: "GET",
      path: "/v2/empresas",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  get(id: string | number): Promise<Empresa> {
    return this._request({ method: "GET", path: `/v2/empresas/${id}` });
  }

  update(
    id: string | number,
    params: EmpresaUpdateParams,
    options?: EmpresaUpdateOptions,
  ): Promise<Empresa> {
    return this._request({
      method: "PUT",
      path: `/v2/empresas/${id}`,
      query: options?.dryRun ? { dry_run: 1 } : undefined,
      body: params,
    });
  }

  remove(id: string | number): Promise<void> {
    return this._request({ method: "DELETE", path: `/v2/empresas/${id}` });
  }
}
