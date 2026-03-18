import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { NfseService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new NfseService(createTestOptions({ fetch }));
}

describe("NfseService", () => {
  describe("create", () => {
    it("sends POST /v2/nfse with ref query param and body", async () => {
      const body = {
        cnpj_prestador: "18765499000199",
        ref: "ref_123",
        status: "processando_autorizacao",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.create("ref_123", {
        data_emissao: "2024-01-15T10:00:00-03:00",
        prestador: {
          cnpj: "18765499000199",
          inscricao_municipal: "12345",
          codigo_municipio: "4106902",
        },
        tomador: {
          cnpj: "07504505000132",
          razao_social: "Acras Tecnologia",
          email: "contato@focusnfe.com.br",
        },
        servico: {
          valor_servicos: 100.0,
          discriminacao: "Servicos prestados",
          iss_retido: false,
          item_lista_servico: "0107",
        },
      });

      expect(result.status).toBe("processando_autorizacao");
      expect(result.ref).toBe("ref_123");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfse");
      expect(url.toString()).toContain("ref=ref_123");
      expect(init.method).toBe("POST");

      const parsed = JSON.parse(init.body as string);
      expect(parsed.data_emissao).toBe("2024-01-15T10:00:00-03:00");
      expect(parsed.prestador.cnpj).toBe("18765499000199");
      expect(parsed.tomador.cnpj).toBe("07504505000132");
      expect(parsed.servico.valor_servicos).toBe(100.0);
    });
  });

  describe("get", () => {
    it("sends GET /v2/nfse/{ref}", async () => {
      const body = {
        cnpj_prestador: "07504505000132",
        ref: "nfs-2",
        status: "autorizado",
        numero: "233",
        codigo_verificacao: "DU1M-M2Y",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.get("nfs-2");

      expect(result.status).toBe("autorizado");
      expect(result.numero).toBe("233");
      expect(result.ref).toBe("nfs-2");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfse/nfs-2");
      expect(init.method).toBe("GET");
    });
  });

  describe("cancel", () => {
    it("sends DELETE /v2/nfse/{ref}", async () => {
      const body = { status: "cancelado" };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.cancel("ref_123");

      expect(result.status).toBe("cancelado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfse/ref_123");
      expect(init.method).toBe("DELETE");
    });
  });

  describe("email", () => {
    it("sends POST /v2/nfse/{ref}/email with emails array", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const service = createService(fetch);

      await service.email("ref_123", {
        emails: ["contato@example.com"],
      });

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfse/ref_123/email");
      expect(init.method).toBe("POST");

      const parsed = JSON.parse(init.body as string);
      expect(parsed.emails).toEqual(["contato@example.com"]);
    });
  });

  describe("resendWebhook", () => {
    it("sends POST /v2/nfse/{ref}/hook", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const service = createService(fetch);

      await service.resendWebhook("ref_123");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfse/ref_123/hook");
      expect(init.method).toBe("POST");
    });
  });
});
