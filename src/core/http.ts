import {
  FocusNFeApiError,
  FocusNFeConnectionError,
  type FocusNFeErrorDetail,
} from "./errors.js";
import type { NormalizedOptions } from "./types.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestConfig {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export interface BinaryResponse {
  contentType: string;
  content: ArrayBuffer;
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): URL {
  const normalized = path.replace(/^\/+/, "");
  const url = new URL(normalized, `${baseUrl}/`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url;
}

function buildHeaders(options: NormalizedOptions): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Basic ${btoa(options.token + ":")}`,
  };

  if (options.userAgent) {
    headers["User-Agent"] = options.userAgent;
  }

  return headers;
}

interface ErrorBody {
  codigo?: string;
  mensagem?: string;
  erros?: FocusNFeErrorDetail[];
}

function isErrorBody(value: unknown): value is ErrorBody {
  return typeof value === "object" && value !== null;
}

async function buildApiError(response: Response): Promise<FocusNFeApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // non-JSON error body
  }

  const parsed = isErrorBody(body) ? body : {};

  return new FocusNFeApiError({
    status: response.status,
    body,
    codigo: parsed.codigo,
    mensagem: parsed.mensagem,
    erros: parsed.erros,
  });
}

export async function request<T>(
  options: NormalizedOptions,
  config: RequestConfig,
): Promise<T> {
  const url = buildUrl(options.baseUrl, config.path, config.query);

  try {
    const response = await options.fetch(url.toString(), {
      method: config.method,
      headers: buildHeaders(options),
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal: AbortSignal.timeout(options.timeout),
    });

    if (!response.ok) {
      throw await buildApiError(response);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof FocusNFeApiError) throw error;
    throw new FocusNFeConnectionError(
      error instanceof Error ? error.message : "Unknown network error",
      { cause: error },
    );
  }
}

export async function requestBinary(
  options: NormalizedOptions,
  config: RequestConfig,
): Promise<BinaryResponse> {
  const url = buildUrl(options.baseUrl, config.path, config.query);

  try {
    const response = await options.fetch(url.toString(), {
      method: config.method,
      headers: buildHeaders(options),
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal: AbortSignal.timeout(options.timeout),
    });

    if (!response.ok) {
      throw await buildApiError(response);
    }

    return {
      contentType:
        response.headers.get("content-type") || "application/octet-stream",
      content: await response.arrayBuffer(),
    };
  } catch (error) {
    if (error instanceof FocusNFeApiError) throw error;
    throw new FocusNFeConnectionError(
      error instanceof Error ? error.message : "Unknown network error",
      { cause: error },
    );
  }
}
