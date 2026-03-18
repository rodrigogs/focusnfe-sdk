import { describe, expect, it } from "vitest";

import { FocusNFeApiError, FocusNFeConnectionError } from "./errors.js";
import { request, requestBinary } from "./http.js";
import { createMockFetch, createTestOptions } from "./test-helpers.js";

describe("request", () => {
  it("sends GET with Basic Auth and returns parsed JSON", async () => {
    const { fetch, spy } = createMockFetch({
      status: 200,
      body: { ref: "abc", status: "autorizado" },
    });
    const options = createTestOptions({ fetch });

    const result = await request<{ ref: string; status: string }>(options, {
      method: "GET",
      path: "/v2/nfe/abc",
    });

    expect(result.ref).toBe("abc");
    expect(result.status).toBe("autorizado");

    const [url, init] = spy.mock.calls[0]!;
    expect(url).toContain("/v2/nfe/abc");
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toMatch(/^Basic /);
    expect(atob(init.headers.Authorization.replace("Basic ", ""))).toBe(
      "test_token_123:",
    );
  });

  it("sends POST with JSON body", async () => {
    const { fetch, spy } = createMockFetch({
      status: 201,
      body: { ref: "new", status: "processando_autorizacao" },
    });
    const options = createTestOptions({ fetch });

    await request(options, {
      method: "POST",
      path: "/v2/nfe",
      query: { ref: "new" },
      body: { natureza_operacao: "VENDA" },
    });

    const [url, init] = spy.mock.calls[0]!;
    expect(url).toContain("ref=new");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ natureza_operacao: "VENDA" });
  });

  it("builds URL with query params, filtering undefined", async () => {
    const { fetch, spy } = createMockFetch({ status: 200, body: [] });
    const options = createTestOptions({ fetch });

    await request(options, {
      method: "GET",
      path: "/v2/hooks",
      query: { cnpj: "12345", event: undefined },
    });

    const url = spy.mock.calls[0]![0] as string;
    expect(url).toContain("cnpj=12345");
    expect(url).not.toContain("event");
  });

  it("includes User-Agent when set", async () => {
    const { fetch, spy } = createMockFetch({ status: 200, body: {} });
    const options = createTestOptions({ fetch, userAgent: "my-app/1.0" });

    await request(options, { method: "GET", path: "/v2/nfe/x" });

    expect(spy.mock.calls[0]![1].headers["User-Agent"]).toBe("my-app/1.0");
  });

  it("omits User-Agent when empty", async () => {
    const { fetch, spy } = createMockFetch({ status: 200, body: {} });
    const options = createTestOptions({ fetch, userAgent: "" });

    await request(options, { method: "GET", path: "/v2/nfe/x" });

    expect(spy.mock.calls[0]![1].headers["User-Agent"]).toBeUndefined();
  });

  it("throws FocusNFeApiError with parsed body on non-ok response", async () => {
    const { fetch } = createMockFetch({
      status: 400,
      body: {
        codigo: "requisicao_invalida",
        mensagem: "Campo obrigatório",
        erros: [{ mensagem: "CNPJ inválido", campo: "cnpj" }],
      },
    });
    const options = createTestOptions({ fetch });

    const err = await request(options, {
      method: "POST",
      path: "/v2/nfe",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(FocusNFeApiError);
    expect(err.status).toBe(400);
    expect(err.codigo).toBe("requisicao_invalida");
    expect(err.erros[0].campo).toBe("cnpj");
  });

  it("throws FocusNFeApiError even with non-JSON error body", async () => {
    const { fetch } = createMockFetch({
      status: 500,
      body: undefined,
      headers: { "content-type": "text/plain" },
    });
    const options = createTestOptions({ fetch });

    const err = await request(options, {
      method: "GET",
      path: "/v2/nfe/x",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(FocusNFeApiError);
    expect(err.status).toBe(500);
  });

  it("wraps network errors as FocusNFeConnectionError", async () => {
    const fetch = (() => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof globalThis.fetch;
    const options = createTestOptions({ fetch });

    const err = await request(options, {
      method: "GET",
      path: "/v2/nfe/x",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(FocusNFeConnectionError);
    expect(err.message).toBe("fetch failed");
    expect(err.cause).toBeInstanceOf(TypeError);
  });

  it("wraps non-Error thrown values as FocusNFeConnectionError", async () => {
    const fetch = (() => {
      throw "string error";
    }) as unknown as typeof globalThis.fetch;
    const options = createTestOptions({ fetch });

    const err = await request(options, {
      method: "GET",
      path: "/v2/nfe/x",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(FocusNFeConnectionError);
    expect(err.message).toBe("Unknown network error");
  });

  it("rethrows FocusNFeApiError without wrapping", async () => {
    const original = new FocusNFeApiError({ status: 422 });
    const fetch = (() => {
      throw original;
    }) as unknown as typeof globalThis.fetch;
    const options = createTestOptions({ fetch });

    const err = await request(options, {
      method: "GET",
      path: "/v2/nfe/x",
    }).catch((e) => e);

    expect(err).toBe(original);
  });
});

describe("requestBinary", () => {
  it("returns contentType and ArrayBuffer content", async () => {
    const { fetch } = createMockFetch({
      status: 200,
      body: "<xml>test</xml>",
      headers: { "content-type": "application/xml" },
    });
    const options = createTestOptions({ fetch });

    const result = await requestBinary(options, {
      method: "GET",
      path: "/v2/nfes_recebidas/CHAVE.xml",
    });

    expect(result.contentType).toBe("application/xml");
    expect(result.content).toBeInstanceOf(ArrayBuffer);
  });

  it("defaults contentType to application/octet-stream", async () => {
    const { fetch } = createMockFetch({
      status: 200,
      body: "data",
      headers: { "content-type": "" },
    });
    const options = createTestOptions({ fetch });

    const result = await requestBinary(options, {
      method: "GET",
      path: "/v2/backups/x.zip",
    });

    expect(result.contentType).toBe("application/octet-stream");
  });

  it("throws FocusNFeApiError on non-ok response", async () => {
    const { fetch } = createMockFetch({
      status: 404,
      body: { codigo: "nao_encontrado", mensagem: "Not found" },
    });
    const options = createTestOptions({ fetch });

    const err = await requestBinary(options, {
      method: "GET",
      path: "/v2/nfes_recebidas/CHAVE.xml",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(FocusNFeApiError);
    expect(err.status).toBe(404);
  });

  it("wraps network errors as FocusNFeConnectionError", async () => {
    const fetch = (() => {
      throw new Error("network down");
    }) as unknown as typeof globalThis.fetch;
    const options = createTestOptions({ fetch });

    const err = await requestBinary(options, {
      method: "GET",
      path: "/v2/nfes_recebidas/CHAVE.xml",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(FocusNFeConnectionError);
  });

  it("wraps non-Error thrown values as FocusNFeConnectionError", async () => {
    const fetch = (() => {
      throw 42;
    }) as unknown as typeof globalThis.fetch;
    const options = createTestOptions({ fetch });

    const err = await requestBinary(options, {
      method: "GET",
      path: "/v2/nfes_recebidas/CHAVE.xml",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(FocusNFeConnectionError);
    expect(err.message).toBe("Unknown network error");
  });

  it("forwards body on POST requests", async () => {
    const { fetch, spy } = createMockFetch({
      status: 200,
      body: "pdf-bytes",
      headers: { "content-type": "application/pdf" },
    });
    const options = createTestOptions({ fetch });

    await requestBinary(options, {
      method: "POST",
      path: "/v2/nfe/danfe_preview",
      body: { natureza_operacao: "VENDA" },
    });

    const [, init] = spy.mock.calls[0]!;
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      natureza_operacao: "VENDA",
    });
  });
});
