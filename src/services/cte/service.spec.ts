import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { CteService } from "./service.js";

function setup(body: unknown = {}, status = 200) {
  const { fetch, spy } = createMockFetch({ status, body });
  const service = new CteService(createTestOptions({ fetch }));
  return { service, spy };
}

function callUrl(spy: ReturnType<typeof createMockFetch>["spy"]): string {
  return spy.mock.calls[0]![0] as string;
}

function callMethod(spy: ReturnType<typeof createMockFetch>["spy"]): string {
  return (spy.mock.calls[0]![1] as RequestInit).method!;
}

function callBody(spy: ReturnType<typeof createMockFetch>["spy"]): unknown {
  const raw = (spy.mock.calls[0]![1] as RequestInit).body as string;
  return JSON.parse(raw);
}

describe("CteService", () => {
  // ── create ──────────────────────────────────────────────────────

  describe("create", () => {
    it("sends POST to /v2/cte with ref query param and body", async () => {
      const responseBody = {
        cnpj_emitente: "123",
        ref: "ref1",
        status: "processando_autorizacao",
      };
      const { service, spy } = setup(responseBody);

      const params = {
        cfop: "5353",
        natureza_operacao: "TESTE",
        data_emissao: "2024-01-01",
        tipo_documento: 0,
        modal: "01",
        cnpj_emitente: "123",
        valor_total: "100.00",
      };
      const result = await service.create("ref1", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/cte");
      expect(callUrl(spy)).toContain("ref=ref1");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── createOs ────────────────────────────────────────────────────

  describe("createOs", () => {
    it("sends POST to /v2/cte_os with ref query param and body", async () => {
      const responseBody = {
        cnpj_emitente: "123",
        ref: "ref2",
        status: "autorizado",
      };
      const { service, spy } = setup(responseBody);

      const params = {
        cfop: "5353",
        natureza_operacao: "TESTE OS",
        data_emissao: "2024-01-01",
        tipo_documento: 0,
        modal: "02",
        cnpj_emitente: "123",
        valor_total: "50.00",
      };
      const result = await service.createOs("ref2", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/cte_os");
      expect(callUrl(spy)).toContain("ref=ref2");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── get ─────────────────────────────────────────────────────────

  describe("get", () => {
    it("sends GET to /v2/cte/REF", async () => {
      const responseBody = {
        cnpj_emitente: "123",
        ref: "ref3",
        status: "autorizado",
      };
      const { service, spy } = setup(responseBody);

      const result = await service.get("ref3");

      expect(callMethod(spy)).toBe("GET");
      expect(callUrl(spy)).toContain("/v2/cte/ref3");
      expect(callUrl(spy)).not.toContain("completa");
      expect(result).toEqual(responseBody);
    });

    it("adds completa=1 query param when completa is true", async () => {
      const { service, spy } = setup({
        cnpj_emitente: "123",
        ref: "ref4",
        status: "autorizado",
      });

      await service.get("ref4", true);

      expect(callUrl(spy)).toContain("/v2/cte/ref4");
      expect(callUrl(spy)).toContain("completa=1");
    });

    it("does not add completa param when completa is false", async () => {
      const { service, spy } = setup({
        cnpj_emitente: "123",
        ref: "ref5",
        status: "autorizado",
      });

      await service.get("ref5", false);

      expect(callUrl(spy)).toContain("/v2/cte/ref5");
      expect(callUrl(spy)).not.toContain("completa");
    });
  });

  // ── cancel ──────────────────────────────────────────────────────

  describe("cancel", () => {
    it("sends DELETE to /v2/cte/REF with justificativa body", async () => {
      const responseBody = {
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado",
        status: "cancelado",
        caminho_xml: "https://example.com/xml",
      };
      const { service, spy } = setup(responseBody);

      const params = { justificativa: "Cancelamento por erro de digitacao" };
      const result = await service.cancel("ref6", params);

      expect(callMethod(spy)).toBe("DELETE");
      expect(callUrl(spy)).toContain("/v2/cte/ref6");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── cartaCorrecao ─────────────────────────────────────────────

  describe("cartaCorrecao", () => {
    it("sends POST to /v2/cte/REF/carta_correcao with correcoes body", async () => {
      const responseBody = {
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado",
        status: "autorizado",
        caminho_xml: "https://example.com/xml",
        numero_carta_correcao: 1,
      };
      const { service, spy } = setup(responseBody);

      const params = {
        correcoes: [
          {
            grupo_corrigido: "ide",
            campo_corrigido: "uf_inicio",
            valor_corrigido: "PR",
          },
        ],
      };
      const result = await service.cartaCorrecao("ref7", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/cte/ref7/carta_correcao");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── desacordo ─────────────────────────────────────────────────

  describe("desacordo", () => {
    it("sends POST to /v2/cte/REF/desacordo with observacoes body", async () => {
      const responseBody = {
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado",
        status: "autorizado",
      };
      const { service, spy } = setup(responseBody);

      const params = { observacoes: "Servico nao prestado conforme acordado" };
      const result = await service.desacordo("ref8", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/cte/ref8/desacordo");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── registroMultimodal ────────────────────────────────────────

  describe("registroMultimodal", () => {
    it("sends POST to /v2/cte/REF/registro_multimodal with body", async () => {
      const responseBody = {
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado",
        status: "autorizado",
      };
      const { service, spy } = setup(responseBody);

      const params = { numero_registro: "12345" };
      const result = await service.registroMultimodal("ref9", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/cte/ref9/registro_multimodal");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── dadosGtv ──────────────────────────────────────────────────

  describe("dadosGtv", () => {
    it("sends POST to /v2/cte/REF/dados_gtv with body", async () => {
      const responseBody = {
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado",
        status: "autorizado",
      };
      const { service, spy } = setup(responseBody);

      const params = { informacoes: "dados gtv aqui" };
      const result = await service.dadosGtv("ref10", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/cte/ref10/dados_gtv");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── resendWebhook ─────────────────────────────────────────────

  describe("resendWebhook", () => {
    it("sends POST to /v2/cte/REF/hook with no body", async () => {
      const responseBody = { status: "ok" };
      const { service, spy } = setup(responseBody);

      const result = await service.resendWebhook("ref11");

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/cte/ref11/hook");
      expect(result).toEqual(responseBody);
    });
  });
});
