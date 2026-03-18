import { BaseService } from "../../core/base-service.js";
import type {
  Empresa,
  EmpresaCreateParams,
  EmpresaUpdateParams,
} from "./types.js";

export class EmpresasService extends BaseService {
  create(params: EmpresaCreateParams): Promise<Empresa> {
    return this._request({
      method: "POST",
      path: "/v2/empresas",
      body: params,
    });
  }

  list(): Promise<Empresa[]> {
    return this._request({ method: "GET", path: "/v2/empresas" });
  }

  get(id: number): Promise<Empresa> {
    return this._request({ method: "GET", path: `/v2/empresas/${id}` });
  }

  update(id: number, params: EmpresaUpdateParams): Promise<Empresa> {
    return this._request({
      method: "PUT",
      path: `/v2/empresas/${id}`,
      body: params,
    });
  }

  remove(id: number): Promise<void> {
    return this._request({ method: "DELETE", path: `/v2/empresas/${id}` });
  }
}
