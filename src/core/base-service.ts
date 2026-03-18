import {
  type BinaryResponse,
  request,
  requestBinary,
  type RequestConfig,
} from "./http.js";
import type { NormalizedOptions } from "./types.js";

export class BaseService {
  constructor(protected readonly options: NormalizedOptions) {}

  protected _request<T>(config: RequestConfig): Promise<T> {
    return request<T>(this.options, config);
  }

  protected _requestBinary(config: RequestConfig): Promise<BinaryResponse> {
    return requestBinary(this.options, config);
  }
}
