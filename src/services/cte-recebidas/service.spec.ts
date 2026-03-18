import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { CteRecebidasService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new CteRecebidasService(createTestOptions({ fetch }));
}

describe("CteRecebidasService", () => {
  describe("list", () => {
    it("sends GET /v2/ctes_recebidas with cnpj query param", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            nome_emitente: "Empresa emitente Ltda.",
            documento_emitente: "79160190000193",
            chave: "35191008165642000152570020004201831004201839",
            valor_total: "295.66",
            data_emissao: "2019-10-07T23:44:00-03:00",
            situacao: "autorizado",
            tipo_cte: "0",
            versao: 1709,
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.list({ cnpj: "24178617000110" });

      expect(result).toHaveLength(1);
      expect(result[0]!.nome_emitente).toBe("Empresa emitente Ltda.");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/ctes_recebidas");
      expect(url.toString()).toContain("cnpj=24178617000110");
      expect(init.method).toBe("GET");
    });

    it("sends versao query param when provided", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: [] });
      const service = createService(fetch);

      await service.list({ cnpj: "24178617000110", versao: 100 });

      const [url] = spy.mock.calls[0];
      expect(url.toString()).toContain("cnpj=24178617000110");
      expect(url.toString()).toContain("versao=100");
    });
  });

  describe("get", () => {
    it("sends GET /v2/ctes_recebidas/CHAVE.json", async () => {
      const chave = "35191008165642000152570020004201831004201839";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          nome_emitente: "Empresa emitente Ltda.",
          documento_emitente: "79160190000193",
          chave,
          valor_total: "295.66",
          data_emissao: "2019-10-07T23:44:00-03:00",
          situacao: "autorizado",
          tipo_cte: "0",
          versao: 1709,
        },
      });
      const service = createService(fetch);

      const result = await service.get(chave);

      expect(result.chave).toBe(chave);

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(`/v2/ctes_recebidas/${chave}.json`);
      expect(init.method).toBe("GET");
    });
  });

  describe("getXml", () => {
    it("sends GET /v2/ctes_recebidas/CHAVE.xml via _requestBinary", async () => {
      const chave = "35191008165642000152570020004201831004201839";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: "<xml>cte</xml>",
        headers: { "content-type": "application/xml" },
      });
      const service = createService(fetch);

      const result = await service.getXml(chave);

      expect(result.contentType).toBe("application/xml");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(`/v2/ctes_recebidas/${chave}.xml`);
      expect(init.method).toBe("GET");
    });
  });

  describe("getCancelamentoXml", () => {
    it("sends GET /v2/ctes_recebidas/CHAVE/cancelamento.xml via _requestBinary", async () => {
      const chave = "35191008165642000152570020004201831004201839";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: "<xml>cancelamento</xml>",
        headers: { "content-type": "application/xml" },
      });
      const service = createService(fetch);

      const result = await service.getCancelamentoXml(chave);

      expect(result.contentType).toBe("application/xml");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(
        `/v2/ctes_recebidas/${chave}/cancelamento.xml`,
      );
      expect(init.method).toBe("GET");
    });
  });

  describe("getCartaCorrecaoXml", () => {
    it("sends GET /v2/ctes_recebidas/CHAVE/carta_correcao.xml via _requestBinary", async () => {
      const chave = "35191008165642000152570020004201831004201839";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: "<xml>carta_correcao</xml>",
        headers: { "content-type": "application/xml" },
      });
      const service = createService(fetch);

      const result = await service.getCartaCorrecaoXml(chave);

      expect(result.contentType).toBe("application/xml");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(
        `/v2/ctes_recebidas/${chave}/carta_correcao.xml`,
      );
      expect(init.method).toBe("GET");
    });
  });

  describe("desacordo", () => {
    it("sends POST /v2/ctes_recebidas/CHAVE/desacordo with observacoes", async () => {
      const chave = "35191008165642000152570020004201831004201839";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          status_sefaz: "135",
          mensagem_sefaz: "Evento registrado e vinculado a CT-e",
          status: "evento_registrado",
          protocolo: "891170005150285",
        },
      });
      const service = createService(fetch);

      const result = await service.desacordo(chave, {
        observacoes: "Observações referente ao desacordo informado",
      });

      expect(result.status).toBe("evento_registrado");
      expect(result.protocolo).toBe("891170005150285");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(`/v2/ctes_recebidas/${chave}/desacordo`);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        observacoes: "Observações referente ao desacordo informado",
      });
    });
  });

  describe("getDesacordo", () => {
    it("sends GET /v2/ctes_recebidas/CHAVE/desacordo", async () => {
      const chave = "35191008165642000152570020004201831004201839";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          status_sefaz: "135",
          mensagem_sefaz: "Evento registrado e vinculado a CT-e",
          status: "evento_registrado",
          protocolo: "891170005150285",
        },
      });
      const service = createService(fetch);

      const result = await service.getDesacordo(chave);

      expect(result.status).toBe("evento_registrado");
      expect(result.protocolo).toBe("891170005150285");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(`/v2/ctes_recebidas/${chave}/desacordo`);
      expect(init.method).toBe("GET");
    });
  });
});
