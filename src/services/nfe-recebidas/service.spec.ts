import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { NfeRecebidasService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new NfeRecebidasService(createTestOptions({ fetch }));
}

describe("NfeRecebidasService", () => {
  describe("list", () => {
    it("sends GET /v2/nfes_recebidas with cnpj query param", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            nome_emitente: "Empresa emitente Ltda.",
            documento_emitente: "79160190000193",
            chave_nfe: "41171179060190000182550010000002661875685069",
            valor_total: "24560.00",
            data_emissao: "2017-11-07T01:00:00-02:00",
            situacao: "autorizada",
            tipo_nfe: "1",
            versao: 73,
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.list({ cnpj: "07504505000132" });

      expect(result).toHaveLength(1);
      expect(result[0]!.nome_emitente).toBe("Empresa emitente Ltda.");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/nfes_recebidas");
      expect(url.toString()).toContain("cnpj=07504505000132");
      expect(init.method).toBe("GET");
    });

    it("sends versao query param when provided", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: [] });
      const service = createService(fetch);

      await service.list({ cnpj: "07504505000132", versao: 60 });

      const [url] = spy.mock.calls[0];
      expect(url.toString()).toContain("cnpj=07504505000132");
      expect(url.toString()).toContain("versao=60");
    });
  });

  describe("get", () => {
    it("sends GET /v2/nfes_recebidas/CHAVE.json", async () => {
      const chave = "41171179060190000182550010000002661875685069";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          nome_emitente: "Empresa emitente Ltda.",
          documento_emitente: "79160190000193",
          chave_nfe: chave,
          valor_total: "24560.00",
          data_emissao: "2017-11-07T01:00:00-02:00",
          situacao: "autorizada",
          tipo_nfe: "1",
          versao: 73,
        },
      });
      const service = createService(fetch);

      const result = await service.get(chave);

      expect(result.chave_nfe).toBe(chave);

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(`/v2/nfes_recebidas/${chave}.json`);
      expect(init.method).toBe("GET");
    });
  });

  describe("getXml", () => {
    it("sends GET /v2/nfes_recebidas/CHAVE.xml via _requestBinary", async () => {
      const chave = "41171179060190000182550010000002661875685069";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: "<xml>nfe</xml>",
        headers: { "content-type": "application/xml" },
      });
      const service = createService(fetch);

      const result = await service.getXml(chave);

      expect(result.contentType).toBe("application/xml");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(`/v2/nfes_recebidas/${chave}.xml`);
      expect(init.method).toBe("GET");
    });
  });

  describe("getCancelamentoXml", () => {
    it("sends GET /v2/nfes_recebidas/CHAVE/cancelamento.xml via _requestBinary", async () => {
      const chave = "41171179060190000182550010000002661875685069";
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
        `/v2/nfes_recebidas/${chave}/cancelamento.xml`,
      );
      expect(init.method).toBe("GET");
    });
  });

  describe("getCartaCorrecaoXml", () => {
    it("sends GET /v2/nfes_recebidas/CHAVE/carta_correcao.xml via _requestBinary", async () => {
      const chave = "41171179060190000182550010000002661875685069";
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
        `/v2/nfes_recebidas/${chave}/carta_correcao.xml`,
      );
      expect(init.method).toBe("GET");
    });
  });

  describe("manifestar", () => {
    it("sends POST /v2/nfes_recebidas/CHAVE/manifesto with tipo", async () => {
      const chave = "41171179060190000182550010000002661875685069";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          status_sefaz: "135",
          mensagem_sefaz: "Evento registrado e vinculado a NF-e",
          status: "evento_registrado",
          protocolo: "891170005150285",
          tipo: "ciencia",
        },
      });
      const service = createService(fetch);

      const result = await service.manifestar(chave, { tipo: "ciencia" });

      expect(result.status).toBe("evento_registrado");
      expect(result.tipo).toBe("ciencia");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(`/v2/nfes_recebidas/${chave}/manifesto`);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({ tipo: "ciencia" });
    });

    it("sends POST with tipo and justificativa for nao_realizada", async () => {
      const chave = "41171179060190000182550010000002661875685069";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          status_sefaz: "135",
          mensagem_sefaz: "Evento registrado e vinculado a NF-e",
          status: "evento_registrado",
          protocolo: "891170005150285",
          tipo: "nao_realizada",
          justificativa:
            "Fornecedor cancelou a operação devido a falta dos produtos em estoque",
        },
      });
      const service = createService(fetch);

      const result = await service.manifestar(chave, {
        tipo: "nao_realizada",
        justificativa:
          "Fornecedor cancelou a operação devido a falta dos produtos em estoque",
      });

      expect(result.tipo).toBe("nao_realizada");
      expect(result.justificativa).toBe(
        "Fornecedor cancelou a operação devido a falta dos produtos em estoque",
      );

      expect(JSON.parse(spy.mock.calls[0][1].body as string)).toEqual({
        tipo: "nao_realizada",
        justificativa:
          "Fornecedor cancelou a operação devido a falta dos produtos em estoque",
      });
    });
  });

  describe("getManifestacao", () => {
    it("sends GET /v2/nfes_recebidas/CHAVE/manifesto", async () => {
      const chave = "41171179060190000182550010000002661875685069";
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          status_sefaz: "135",
          mensagem_sefaz: "Evento registrado e vinculado a NF-e",
          status: "evento_registrado",
          protocolo: "891170005150285",
          tipo: "ciencia",
        },
      });
      const service = createService(fetch);

      const result = await service.getManifestacao(chave);

      expect(result.status).toBe("evento_registrado");
      expect(result.protocolo).toBe("891170005150285");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(`/v2/nfes_recebidas/${chave}/manifesto`);
      expect(init.method).toBe("GET");
    });
  });
});
