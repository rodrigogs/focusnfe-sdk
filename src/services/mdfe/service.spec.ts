import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { MdfeService } from "./service.js";

function setup(body: unknown = {}, status = 200) {
  const { fetch, spy } = createMockFetch({ status, body });
  const service = new MdfeService(createTestOptions({ fetch }));
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

describe("MdfeService", () => {
  // ── create ──────────────────────────────────────────────────────

  describe("create", () => {
    it("sends POST to /v2/mdfe with ref query param and body", async () => {
      const responseBody = {
        cnpj_emitente: "123",
        ref: "ref1",
        status: "processando_autorizacao",
      };
      const { service, spy } = setup(responseBody);

      const params = {
        serie: "1",
        modo_transporte: "1",
        data_emissao: "2024-01-01",
        uf_inicio: "SP",
        uf_fim: "RJ",
        cnpj_emitente: "123",
        inscricao_estadual_emitente: "456",
        municipios_carregamento: [{ codigo: "3550308", nome: "Sao Paulo" }],
        municipios_descarregamento: [
          { codigo: "3304557", nome: "Rio de Janeiro" },
        ],
      };
      const result = await service.create("ref1", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/mdfe");
      expect(callUrl(spy)).toContain("ref=ref1");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── get ─────────────────────────────────────────────────────────

  describe("get", () => {
    it("sends GET to /v2/mdfe/REF", async () => {
      const responseBody = {
        cnpj_emitente: "123",
        ref: "ref2",
        status: "autorizado",
      };
      const { service, spy } = setup(responseBody);

      const result = await service.get("ref2");

      expect(callMethod(spy)).toBe("GET");
      expect(callUrl(spy)).toContain("/v2/mdfe/ref2");
      expect(callUrl(spy)).not.toContain("completa");
      expect(result).toEqual(responseBody);
    });

    it("adds completa=1 query param when completa is true", async () => {
      const { service, spy } = setup({
        cnpj_emitente: "123",
        ref: "ref3",
        status: "autorizado",
      });

      await service.get("ref3", true);

      expect(callUrl(spy)).toContain("/v2/mdfe/ref3");
      expect(callUrl(spy)).toContain("completa=1");
    });

    it("does not add completa param when completa is false", async () => {
      const { service, spy } = setup({
        cnpj_emitente: "123",
        ref: "ref4",
        status: "autorizado",
      });

      await service.get("ref4", false);

      expect(callUrl(spy)).toContain("/v2/mdfe/ref4");
      expect(callUrl(spy)).not.toContain("completa");
    });
  });

  // ── cancel ──────────────────────────────────────────────────────

  describe("cancel", () => {
    it("sends DELETE to /v2/mdfe/REF with justificativa body", async () => {
      const responseBody = {
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado",
        status: "cancelado",
        caminho_xml: "https://example.com/xml",
      };
      const { service, spy } = setup(responseBody);

      const params = { justificativa: "Cancelamento por erro de digitacao" };
      const result = await service.cancel("ref5", params);

      expect(callMethod(spy)).toBe("DELETE");
      expect(callUrl(spy)).toContain("/v2/mdfe/ref5");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── incluirCondutor ───────────────────────────────────────────

  describe("incluirCondutor", () => {
    it("sends POST to /v2/mdfe/REF/inclusao_condutor with nome and cpf", async () => {
      const responseBody = {
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado",
        status: "incluido",
        caminho_xml: "https://example.com/xml",
      };
      const { service, spy } = setup(responseBody);

      const params = { nome: "Joao da Silva", cpf: "12345678901" };
      const result = await service.incluirCondutor("ref6", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/mdfe/ref6/inclusao_condutor");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── incluirDfe ────────────────────────────────────────────────

  describe("incluirDfe", () => {
    it("sends POST to /v2/mdfe/REF/inclusao_dfe with body", async () => {
      const responseBody = {
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado",
        status: "incluido",
        caminho_xml: "https://example.com/xml",
      };
      const { service, spy } = setup(responseBody);

      const params = {
        protocolo: "110011000001101",
        codigo_municipio_carregamento: "5107875",
        documentos: [
          {
            codigo_municipio_descarregamento: "5107875",
            chave_nfe: "51210810425282002508550010000186761100123456",
          },
        ],
      };
      const result = await service.incluirDfe("ref7", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/mdfe/ref7/inclusao_dfe");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });

  // ── encerrar ──────────────────────────────────────────────────

  describe("encerrar", () => {
    it("sends POST to /v2/mdfe/REF/encerrar with body", async () => {
      const responseBody = {
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado",
        status: "encerrado",
        caminho_xml: "https://example.com/xml",
      };
      const { service, spy } = setup(responseBody);

      const params = {
        data: "2024-03-05",
        sigla_uf: "SP",
        nome_municipio: "Sao Paulo",
      };
      const result = await service.encerrar("ref8", params);

      expect(callMethod(spy)).toBe("POST");
      expect(callUrl(spy)).toContain("/v2/mdfe/ref8/encerrar");
      expect(callBody(spy)).toEqual(params);
      expect(result).toEqual(responseBody);
    });
  });
});
