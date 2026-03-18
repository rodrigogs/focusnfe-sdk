import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { NfeService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new NfeService(createTestOptions({ fetch }));
}

describe("NfeService", () => {
  describe("create", () => {
    it("sends POST /v2/nfe?ref=REF with body", async () => {
      const body = {
        ref: "ref123",
        status: "processando_autorizacao",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.create("ref123", {
        natureza_operacao: "Remessa",
        items: [
          {
            numero_item: 1,
            codigo_produto: "1232",
            descricao: "Produto Teste",
            cfop: 5923,
            codigo_ncm: "49111090",
            quantidade_comercial: 1,
            valor_unitario_comercial: 10,
            unidade_comercial: "un",
            icms_origem: 0,
            icms_situacao_tributaria: 41,
          },
        ],
      });

      expect(result.ref).toBe("ref123");
      expect(result.status).toBe("processando_autorizacao");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe");
      expect(url.toString()).toContain("ref=ref123");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string).natureza_operacao).toBe("Remessa");
    });
  });

  describe("get", () => {
    it("sends GET /v2/nfe/REF without completa", async () => {
      const body = { ref: "ref123", status: "autorizado" };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.get("ref123");

      expect(result.status).toBe("autorizado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123");
      expect(url.toString()).not.toContain("completa");
      expect(init.method).toBe("GET");
    });

    it("sends GET /v2/nfe/REF?completa=1 when completa is true", async () => {
      const body = { ref: "ref123", status: "autorizado" };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      await service.get("ref123", true);

      const [url] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123");
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
    it("sends DELETE /v2/nfe/REF with justificativa body", async () => {
      const body = { status: "cancelado", status_sefaz: "135" };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.cancel("ref123", {
        justificativa: "Cancelamento de teste",
      });

      expect(result.status).toBe("cancelado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123");
      expect(init.method).toBe("DELETE");
      expect(JSON.parse(init.body as string)).toEqual({
        justificativa: "Cancelamento de teste",
      });
    });
  });

  describe("cartaCorrecao", () => {
    it("sends POST /v2/nfe/REF/carta_correcao with correcao body", async () => {
      const body = {
        status: "autorizado",
        numero_carta_correcao: 1,
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.cartaCorrecao("ref123", {
        correcao: "Correção de teste",
      });

      expect(result.status).toBe("autorizado");
      expect(result.numero_carta_correcao).toBe(1);

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123/carta_correcao");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        correcao: "Correção de teste",
      });
    });
  });

  describe("atorInteressado", () => {
    it("sends POST /v2/nfe/REF/ator_interessado with body", async () => {
      const body = {
        status: "autorizado",
        numero_evento_ator_interessado: 1,
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.atorInteressado("ref123", {
        cpf: "12345678901",
        permite_autorizacao_terceiros: true,
      });

      expect(result.status).toBe("autorizado");
      expect(result.numero_evento_ator_interessado).toBe(1);

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123/ator_interessado");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        cpf: "12345678901",
        permite_autorizacao_terceiros: true,
      });
    });
  });

  describe("insucessoEntrega", () => {
    it("sends POST /v2/nfe/REF/insucesso_entrega with body", async () => {
      const body = {
        status: "autorizado",
        numero_insucesso_entrega: 1,
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.insucessoEntrega("ref123", {
        data_tentativa_entrega: "2024-07-24T10:30:56-0300",
        motivo_insucesso: 4,
        justificativa_insucesso: "Endereço incorreto",
        hash_tentativa_entrega: "yzmPGyT1YM5KqilP56w+oPlVkx8=",
      });

      expect(result.status).toBe("autorizado");
      expect(result.numero_insucesso_entrega).toBe(1);

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123/insucesso_entrega");
      expect(init.method).toBe("POST");
      const parsed = JSON.parse(init.body as string);
      expect(parsed.data_tentativa_entrega).toBe("2024-07-24T10:30:56-0300");
      expect(parsed.motivo_insucesso).toBe(4);
    });
  });

  describe("cancelInsucessoEntrega", () => {
    it("sends DELETE /v2/nfe/REF/insucesso_entrega without body", async () => {
      const body = {
        status: "autorizado",
        numero_cancelamento_insucesso_entrega: 1,
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.cancelInsucessoEntrega("ref123");

      expect(result.status).toBe("autorizado");
      expect(result.numero_cancelamento_insucesso_entrega).toBe(1);

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123/insucesso_entrega");
      expect(init.method).toBe("DELETE");
      expect(init.body).toBeUndefined();
    });
  });

  describe("email", () => {
    it("sends POST /v2/nfe/REF/email with emails body", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const service = createService(fetch);

      await service.email("ref123", {
        emails: ["user@example.com", "other@example.com"],
      });

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123/email");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        emails: ["user@example.com", "other@example.com"],
      });
    });
  });

  describe("inutilizar", () => {
    it("sends POST /v2/nfe/inutilizacao with body", async () => {
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
        justificativa: "Teste de inutilizacao",
      });

      expect(result.status).toBe("autorizado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/inutilizacao");
      expect(init.method).toBe("POST");
      const parsed = JSON.parse(init.body as string);
      expect(parsed.cnpj).toBe("51916585000125");
      expect(parsed.justificativa).toBe("Teste de inutilizacao");
    });
  });

  describe("inutilizacoes", () => {
    it("sends GET /v2/nfe/inutilizacoes", async () => {
      const body = [{ status: "autorizado", serie: "1", numero_inicial: "7" }];
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.inutilizacoes();

      expect(result).toHaveLength(1);
      expect(result[0]!.status).toBe("autorizado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/inutilizacoes");
      expect(init.method).toBe("GET");
    });
  });

  describe("importar", () => {
    it("sends POST /v2/nfe/importacao?ref=REF with body", async () => {
      const body = { ref: "ref123", status: "autorizado" };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.importar("ref123", {
        xml: "<nfe>...</nfe>",
      });

      expect(result.status).toBe("autorizado");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/importacao");
      expect(url.toString()).toContain("ref=ref123");
      expect(init.method).toBe("POST");
    });
  });

  describe("danfePreview", () => {
    it("sends POST /v2/nfe/danfe and returns BinaryResponse", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: "%PDF-1.4",
        headers: { "content-type": "application/pdf" },
      });
      const service = createService(fetch);

      const result = await service.danfePreview({
        natureza_operacao: "Remessa",
        items: [
          {
            numero_item: 1,
            codigo_produto: "1",
            descricao: "Teste",
            cfop: 5923,
            codigo_ncm: "49111090",
            quantidade_comercial: 1,
            valor_unitario_comercial: 1,
            unidade_comercial: "un",
            icms_origem: 0,
            icms_situacao_tributaria: 41,
          },
        ],
      });

      expect(result.contentType).toBe("application/pdf");
      expect(result.content).toBeInstanceOf(ArrayBuffer);

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/danfe");
      expect(init.method).toBe("POST");
    });
  });

  describe("econf", () => {
    it("sends POST /v2/nfe/REF/econf with body", async () => {
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
      expect(url.toString()).toContain("/v2/nfe/ref123/econf");
      expect(init.method).toBe("POST");
      const parsed = JSON.parse(init.body as string);
      expect(parsed.detalhes_pagamento).toHaveLength(1);
    });
  });

  describe("getEconf", () => {
    it("sends GET /v2/nfe/REF/econf/PROTOCOLO", async () => {
      const body = {
        status: "autorizado",
        numero_protocolo: "335250000000445",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.getEconf("ref123", "335250000000445");

      expect(result.numero_protocolo).toBe("335250000000445");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123/econf/335250000000445");
      expect(init.method).toBe("GET");
    });
  });

  describe("cancelEconf", () => {
    it("sends DELETE /v2/nfe/REF/econf/PROTOCOLO without body", async () => {
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
      expect(url.toString()).toContain("/v2/nfe/ref123/econf/335250000000445");
      expect(init.method).toBe("DELETE");
      expect(init.body).toBeUndefined();
    });
  });

  describe("resendWebhook", () => {
    it("sends POST /v2/nfe/REF/hook without body", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const service = createService(fetch);

      await service.resendWebhook("ref123");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfe/ref123/hook");
      expect(init.method).toBe("POST");
      expect(init.body).toBeUndefined();
    });
  });
});
