import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { NfseNacionalService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new NfseNacionalService(createTestOptions({ fetch }));
}

describe("NfseNacionalService", () => {
  describe("create", () => {
    it("sends POST /v2/nfsen with ref query param and body", async () => {
      const body = {
        cnpj_prestador: "18765499000199",
        ref: "ref_456",
        status: "processando_autorizacao",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.create("ref_456", {
        data_emissao: "2024-05-07T07:34:56-0300",
        data_competencia: "2024-05-07",
        codigo_municipio_emissora: 4106902,
        cnpj_prestador: "18765499000199",
        inscricao_municipal_prestador: "12345",
        codigo_opcao_simples_nacional: 2,
        regime_especial_tributacao: 0,
        cnpj_tomador: "07504505000132",
        razao_social_tomador: "Acras Tecnologia da Informacao LTDA",
        descricao_servico: "Nota emitida em carater de TESTE",
        valor_servico: 1.0,
        tributacao_iss: 1,
        tipo_retencao_iss: 1,
      });

      expect(result.status).toBe("processando_autorizacao");
      expect(result.ref).toBe("ref_456");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfsen");
      expect(url.toString()).toContain("ref=ref_456");
      expect(init.method).toBe("POST");

      const parsed = JSON.parse(init.body as string);
      expect(parsed.data_emissao).toBe("2024-05-07T07:34:56-0300");
      expect(parsed.cnpj_prestador).toBe("18765499000199");
      expect(parsed.valor_servico).toBe(1.0);
    });
  });

  describe("get", () => {
    it("sends GET /v2/nfsen/{ref}", async () => {
      const body = {
        cnpj_prestador: "18765499000199",
        ref: "ref_456",
        status: "autorizado",
        numero: "1245",
        codigo_verificacao: "ABC123",
        url: "https://www.nfse.gov.br/consultapublica/?tpc=1&chave=ABC123",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.get("ref_456");

      expect(result.status).toBe("autorizado");
      expect(result.numero).toBe("1245");
      expect(result.ref).toBe("ref_456");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfsen/ref_456");
      expect(url.toString()).not.toContain("completa");
      expect(init.method).toBe("GET");
    });

    it("adds completa=1 when completa is true", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: { ref: "ref_456", status: "autorizado" },
      });
      const service = createService(fetch);

      await service.get("ref_456", true);

      const [url] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfsen/ref_456");
      expect(url.toString()).toContain("completa=1");
    });
  });

  describe("cancel", () => {
    it("sends DELETE /v2/nfsen/{ref} with justificativa body", async () => {
      const body = { status: "cancelado" };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.cancel("ref_456", {
        justificativa: "Cancelamento por erro nos dados da nota fiscal",
      });

      expect(result.status).toBe("cancelado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfsen/ref_456");
      expect(init.method).toBe("DELETE");

      const parsed = JSON.parse(init.body as string);
      expect(parsed.justificativa).toBe(
        "Cancelamento por erro nos dados da nota fiscal",
      );
    });
  });

  describe("resendWebhook", () => {
    it("sends POST /v2/nfsen/{ref}/hook", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const service = createService(fetch);

      await service.resendWebhook("ref_456");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfsen/ref_456/hook");
      expect(init.method).toBe("POST");
    });
  });
});
