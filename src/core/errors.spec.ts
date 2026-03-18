import { describe, expect, it } from "vitest";

import {
  FocusNFeApiError,
  FocusNFeConnectionError,
  FocusNFeError,
} from "./errors.js";

describe("FocusNFeError", () => {
  it("is an instance of Error with correct name", () => {
    const err = new FocusNFeError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("FocusNFeError");
    expect(err.message).toBe("test");
  });
});

describe("FocusNFeApiError", () => {
  it("builds message from erros detail descriptions", () => {
    const err = new FocusNFeApiError({
      status: 400,
      codigo: "requisicao_invalida",
      mensagem: "Requisição inválida",
      erros: [
        { mensagem: "CNPJ inválido", campo: "cnpj" },
        { mensagem: "Nome obrigatório", campo: "nome" },
      ],
    });
    expect(err.message).toBe("CNPJ inválido; Nome obrigatório");
    expect(err.name).toBe("FocusNFeApiError");
    expect(err.status).toBe(400);
    expect(err.codigo).toBe("requisicao_invalida");
    expect(err.mensagem).toBe("Requisição inválida");
    expect(err.erros).toHaveLength(2);
    expect(err.body).toBeNull();
  });

  it("falls back to mensagem when erros is empty", () => {
    const err = new FocusNFeApiError({
      status: 404,
      codigo: "nao_encontrado",
      mensagem: "Nota fiscal não encontrada",
    });
    expect(err.message).toBe("Nota fiscal não encontrada");
  });

  it("falls back to HTTP status when no description", () => {
    const err = new FocusNFeApiError({ status: 500 });
    expect(err.message).toBe("HTTP 500");
  });

  it("stores body when provided", () => {
    const body = { codigo: "erro", mensagem: "msg" };
    const err = new FocusNFeApiError({ status: 400, body });
    expect(err.body).toBe(body);
  });

  it("defaults codigo and mensagem to empty strings", () => {
    const err = new FocusNFeApiError({ status: 500 });
    expect(err.codigo).toBe("");
    expect(err.mensagem).toBe("");
    expect(err.erros).toEqual([]);
  });

  it("exposes helper getters", () => {
    expect(new FocusNFeApiError({ status: 401 }).isAuth).toBe(true);
    expect(new FocusNFeApiError({ status: 403 }).isAuth).toBe(true);
    expect(new FocusNFeApiError({ status: 400 }).isAuth).toBe(false);
    expect(new FocusNFeApiError({ status: 429 }).isRateLimit).toBe(true);
    expect(new FocusNFeApiError({ status: 400 }).isRateLimit).toBe(false);
    expect(new FocusNFeApiError({ status: 500 }).isServer).toBe(true);
    expect(new FocusNFeApiError({ status: 502 }).isServer).toBe(true);
    expect(new FocusNFeApiError({ status: 499 }).isServer).toBe(false);
    expect(new FocusNFeApiError({ status: 429 }).isRetryable).toBe(true);
    expect(new FocusNFeApiError({ status: 503 }).isRetryable).toBe(true);
    expect(new FocusNFeApiError({ status: 400 }).isRetryable).toBe(false);
  });

  it("is an instance of FocusNFeError", () => {
    const err = new FocusNFeApiError({ status: 400 });
    expect(err).toBeInstanceOf(FocusNFeError);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("FocusNFeConnectionError", () => {
  it("wraps cause and has correct name", () => {
    const cause = new TypeError("fetch failed");
    const err = new FocusNFeConnectionError("Network error", { cause });
    expect(err.name).toBe("FocusNFeConnectionError");
    expect(err.message).toBe("Network error");
    expect(err.cause).toBe(cause);
  });

  it("is an instance of FocusNFeError", () => {
    const err = new FocusNFeConnectionError("err");
    expect(err).toBeInstanceOf(FocusNFeError);
    expect(err).toBeInstanceOf(Error);
  });
});
