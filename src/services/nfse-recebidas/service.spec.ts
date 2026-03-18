import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { NfseRecebidasService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new NfseRecebidasService(createTestOptions({ fetch }));
}

describe("NfseRecebidasService", () => {
  describe("list", () => {
    it("sends GET /v2/nfses_recebidas with cnpj query param", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            chave: "NFSe859042900001504305108-5555-123456-DMMY000",
            versao: 846,
            status: "autorizado",
            numero: "123456",
            numero_rps: "789",
            serie_rps: "S",
            data_emissao: "2023-02-01T21:43:00-03:00",
            valor_servicos: "100.00",
            documento_prestador: "85904290000150",
            nome_prestador: "Fictício Prestador",
            documento_tomador: "07504505000132",
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.list({ cnpj: "07504505000132" });

      expect(result).toHaveLength(1);
      expect(result[0]!.chave).toBe(
        "NFSe859042900001504305108-5555-123456-DMMY000",
      );
      expect(result[0]!.valor_servicos).toBe("100.00");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/nfses_recebidas");
      expect(url.toString()).toContain("cnpj=07504505000132");
      expect(init.method).toBe("GET");
    });

    it("sends versao query param when provided", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: [] });
      const service = createService(fetch);

      await service.list({ cnpj: "07504505000132", versao: 800 });

      const [url] = spy.mock.calls[0];
      expect(url.toString()).toContain("cnpj=07504505000132");
      expect(url.toString()).toContain("versao=800");
    });
  });

  describe("get", () => {
    it("sends GET /v2/nfses_recebidas/CHAVE", async () => {
      const chave = "NFSe859042900001504305108-5555-123456-DMMY000";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          chave,
          versao: 846,
          status: "autorizado",
          numero: "123456",
          data_emissao: "2023-02-01T21:43:00-03:00",
          valor_servicos: "100.00",
          documento_prestador: "85904290000150",
          nome_prestador: "Fictício Prestador",
        },
      });
      const service = createService(fetch);

      const result = await service.get(chave);

      expect(result.chave).toBe(chave);
      expect(result.numero).toBe("123456");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(`/v2/nfses_recebidas/${chave}`);
      expect(init.method).toBe("GET");
    });
  });
});
