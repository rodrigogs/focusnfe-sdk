/* v8 ignore start -- type-only file, no runtime code */
export type FocusNFeEnvironment = "HOMOLOGACAO" | "PRODUCTION";

export interface FocusNFeClientOptions {
  token: string;
  environment?: FocusNFeEnvironment;
  baseUrl?: string;
  timeout?: number;
  fetch?: typeof globalThis.fetch;
  userAgent?: string;
}

export interface NormalizedOptions {
  token: string;
  baseUrl: string;
  timeout: number;
  fetch: typeof globalThis.fetch;
  userAgent: string;
}
