import { BaseService } from "../../core/base-service.js";
import type {
  BackupResult,
  BlockedEmailResult,
  CepQueryParams,
  CepResult,
  CfopQueryParams,
  CfopResult,
  CnaeQueryParams,
  CnaeResult,
  CnpjResult,
  CodigosTributariosMunicipioParams,
  CodigoTributarioMunicipio,
  ItemListaServico,
  ItensListaServicoParams,
  MunicipioQueryParams,
  MunicipioResult,
  NcmQueryParams,
  NcmResult,
} from "./types.js";

export class ConsultasService extends BaseService {
  ncm(params?: NcmQueryParams): Promise<NcmResult[]> {
    return this._request({
      method: "GET",
      path: "/v2/ncms",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  cfop(params?: CfopQueryParams): Promise<CfopResult[]> {
    return this._request({
      method: "GET",
      path: "/v2/cfops",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  cep(params: CepQueryParams): Promise<CepResult[]> {
    return this._request({
      method: "GET",
      path: "/v2/ceps",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  cepByCodigo(cep: string): Promise<CepResult> {
    return this._request({
      method: "GET",
      path: `/v2/ceps/${cep}`,
    });
  }

  cnae(params?: CnaeQueryParams): Promise<CnaeResult[]> {
    return this._request({
      method: "GET",
      path: "/v2/codigos_cnae",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  municipios(params?: MunicipioQueryParams): Promise<MunicipioResult[]> {
    return this._request({
      method: "GET",
      path: "/v2/municipios",
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  municipio(codigo: string): Promise<MunicipioResult> {
    return this._request({
      method: "GET",
      path: `/v2/municipios/${codigo}`,
    });
  }

  itensListaServico(
    codigoMunicipio: string,
    params?: ItensListaServicoParams,
  ): Promise<ItemListaServico[]> {
    return this._request({
      method: "GET",
      path: `/v2/municipios/${codigoMunicipio}/itens_lista_servico`,
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  codigosTributariosMunicipio(
    codigoMunicipio: string,
    params?: CodigosTributariosMunicipioParams,
  ): Promise<CodigoTributarioMunicipio[]> {
    return this._request({
      method: "GET",
      path: `/v2/municipios/${codigoMunicipio}/codigos_tributarios_municipio`,
      query: params as unknown as Record<
        string,
        string | number | boolean | undefined
      >,
    });
  }

  cnpj(cnpj: string): Promise<CnpjResult> {
    return this._request({
      method: "GET",
      path: `/v2/cnpjs/${cnpj}`,
    });
  }

  blockedEmail(email: string): Promise<BlockedEmailResult> {
    return this._request({
      method: "GET",
      path: `/v2/blocked_emails/${email}`,
    });
  }

  unblockEmail(email: string): Promise<void> {
    return this._request({
      method: "DELETE",
      path: `/v2/blocked_emails/${email}`,
    });
  }

  backups(cnpj: string): Promise<BackupResult> {
    return this._request({
      method: "GET",
      path: `/v2/backups/${cnpj}.json`,
    });
  }
}
