import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { NfceService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new NfceService(createTestOptions({ fetch }));
}

describe("NfceService", () => {
  describe("create", () => {
    it("sends POST /v2/nfce?ref=REF with body", async () => {
      const body = {
        ref: "ref123",
        status: "autorizado",
        chave_nfe: "NFe41190607504505000132650010000000121743484310",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.create("ref123", {
        cnpj_emitente: "05953016000132",
        presenca_comprador: "1",
        items: [
          {
            numero_item: 1,
            codigo_produto: "251887",
            descricao: "Produto Teste",
            cfop: "5102",
            codigo_ncm: "62044200",
            quantidade_comercial: 1,
            valor_unitario_comercial: 79,
            unidade_comercial: "un",
            icms_origem: 0,
            icms_situacao_tributaria: "102",
          },
        ],
        formas_pagamento: [
          {
            forma_pagamento: "03",
            valor_pagamento: "79.00",
          },
        ],
      });

      expect(result.ref).toBe("ref123");
      expect(result.status).toBe("autorizado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce");
      expect(url.toString()).toContain("ref=ref123");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string).cnpj_emitente).toBe(
        "05953016000132",
      );
    });
  });

  describe("get", () => {
    it("sends GET /v2/nfce/REF without completa", async () => {
      const body = { ref: "ref123", status: "autorizado" };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.get("ref123");

      expect(result.status).toBe("autorizado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/ref123");
      expect(url.toString()).not.toContain("completa");
      expect(init.method).toBe("GET");
    });

    it("sends GET /v2/nfce/REF?completa=1 when completa is true", async () => {
      const body = { ref: "ref123", status: "autorizado" };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      await service.get("ref123", true);

      const [url] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/ref123");
      expect(url.toString()).toContain("completa=1");
    });

    it("does not add completa param when false", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: { ref: "ref123" },
      });
      const service = createService(fetch);

      await service.get("ref123", false);

      const [url] = spy.mock.calls[0]!;
      expect(url.toString()).not.toContain("completa");
    });
  });

  describe("cancel", () => {
    it("sends DELETE /v2/nfce/REF with justificativa body", async () => {
      const body = { status: "cancelado", status_sefaz: "135" };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.cancel("ref123", {
        justificativa: "Cancelamento de teste da NFCe",
      });

      expect(result.status).toBe("cancelado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/ref123");
      expect(init.method).toBe("DELETE");
      expect(JSON.parse(init.body as string)).toEqual({
        justificativa: "Cancelamento de teste da NFCe",
      });
    });
  });

  describe("email", () => {
    it("sends POST /v2/nfce/REF/email with emails body", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const service = createService(fetch);

      await service.email("ref123", {
        emails: ["user@example.com"],
      });

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/ref123/email");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        emails: ["user@example.com"],
      });
    });
  });

  describe("inutilizar", () => {
    it("sends POST /v2/nfce/inutilizacao with body", async () => {
      const body = {
        status: "autorizado",
        status_sefaz: "102",
        serie: "1",
        numero_inicial: "7",
        numero_final: "9",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.inutilizar({
        cnpj: "51916585000125",
        serie: "1",
        numero_inicial: "7",
        numero_final: "9",
        justificativa: "Teste de inutilizacao de NFCe",
      });

      expect(result.status).toBe("autorizado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/inutilizacao");
      expect(init.method).toBe("POST");
      const parsed = JSON.parse(init.body as string);
      expect(parsed.cnpj).toBe("51916585000125");
    });
  });

  describe("inutilizacoes", () => {
    it("sends GET /v2/nfce/inutilizacoes", async () => {
      const body = [{ status: "autorizado", serie: "1", numero_inicial: "10" }];
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.inutilizacoes();

      expect(result).toHaveLength(1);
      expect(result[0]!.status).toBe("autorizado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/inutilizacoes");
      expect(init.method).toBe("GET");
    });
  });

  describe("econf", () => {
    it("sends POST /v2/nfce/REF/econf with body", async () => {
      const body = {
        status: "autorizado",
        numero_conciliacao_financeira: 1,
        numero_protocolo: "335250000000445",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.econf("ref123", {
        detalhes_pagamento: [
          {
            forma_pagamento: "01",
            valor_pagamento: "1",
            data_pagamento: "2025-02-10",
          },
        ],
      });

      expect(result.status).toBe("autorizado");
      expect(result.numero_protocolo).toBe("335250000000445");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/ref123/econf");
      expect(init.method).toBe("POST");
      const parsed = JSON.parse(init.body as string);
      expect(parsed.detalhes_pagamento).toHaveLength(1);
    });
  });

  describe("getEconf", () => {
    it("sends GET /v2/nfce/REF/econf/PROTOCOLO", async () => {
      const body = {
        status: "autorizado",
        numero_protocolo: "335250000000445",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.getEconf("ref123", "335250000000445");

      expect(result.numero_protocolo).toBe("335250000000445");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/ref123/econf/335250000000445");
      expect(init.method).toBe("GET");
    });
  });

  describe("cancelEconf", () => {
    it("sends DELETE /v2/nfce/REF/econf/PROTOCOLO without body", async () => {
      const body = {
        status: "autorizado",
        numero_cancelamento_conciliacao_financeira: 1,
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.cancelEconf("ref123", "335250000000445");

      expect(result.status).toBe("autorizado");
      expect(result.numero_cancelamento_conciliacao_financeira).toBe(1);

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/ref123/econf/335250000000445");
      expect(init.method).toBe("DELETE");
      expect(init.body).toBeUndefined();
    });
  });

  describe("resendWebhook", () => {
    it("sends POST /v2/nfce/REF/hook without body", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const service = createService(fetch);

      await service.resendWebhook("ref123");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfce/ref123/hook");
      expect(init.method).toBe("POST");
      expect(init.body).toBeUndefined();
    });
  });
});
