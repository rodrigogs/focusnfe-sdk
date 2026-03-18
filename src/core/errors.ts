export interface FocusNFeErrorDetail {
  mensagem?: string;
  campo?: string;
}

export class FocusNFeError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "FocusNFeError";
  }
}

export class FocusNFeApiError extends FocusNFeError {
  readonly status: number;
  readonly body: unknown;
  readonly codigo: string;
  readonly mensagem: string;
  readonly erros: FocusNFeErrorDetail[];

  constructor(params: {
    status: number;
    body?: unknown;
    codigo?: string;
    mensagem?: string;
    erros?: FocusNFeErrorDetail[];
  }) {
    const detail = params.erros
      ?.map((e) => e.mensagem?.trim())
      .filter((d): d is string => Boolean(d))
      .join("; ");

    super(detail || params.mensagem || `HTTP ${params.status}`);
    this.name = "FocusNFeApiError";
    this.status = params.status;
    this.body = params.body ?? null;
    this.codigo = params.codigo ?? "";
    this.mensagem = params.mensagem ?? "";
    this.erros = params.erros ?? [];
  }

  get isAuth(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isRateLimit(): boolean {
    return this.status === 429;
  }

  get isServer(): boolean {
    return this.status >= 500;
  }

  get isRetryable(): boolean {
    return this.isRateLimit || this.isServer;
  }
}

export class FocusNFeConnectionError extends FocusNFeError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "FocusNFeConnectionError";
  }
}
