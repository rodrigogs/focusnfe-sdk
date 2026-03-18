import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { ConsultasService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new ConsultasService(createTestOptions({ fetch }));
}

describe("ConsultasService", () => {
  describe("ncm", () => {
    it("sends GET /v2/ncms with query params", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            codigo: "90049090",
            descricao_completa: "Óculos para correção",
            capitulo: "90",
            posicao: "04",
            subposicao1: "9",
            subposicao2: "0",
            item1: "9",
            item2: "0",
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.ncm({ capitulo: "90" });

      expect(result).toHaveLength(1);
      expect(result[0]!.codigo).toBe("90049090");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/ncms");
      expect(url.toString()).toContain("capitulo=90");
      expect(init.method).toBe("GET");
    });

    it("sends GET /v2/ncms without params", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: [] });
      const service = createService(fetch);

      await service.ncm();

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/ncms");
      expect(init.method).toBe("GET");
    });
  });

  describe("cfop", () => {
    it("sends GET /v2/cfops with query params", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            codigo: "2151",
            descricao: "2151 - Transferência p/ industrialização",
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.cfop({ codigo: "2" });

      expect(result).toHaveLength(1);
      expect(result[0]!.codigo).toBe("2151");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/cfops");
      expect(url.toString()).toContain("codigo=2");
      expect(init.method).toBe("GET");
    });
  });

  describe("cep", () => {
    it("sends GET /v2/ceps with query params", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            cep: "69909032",
            tipo: "logradouro",
            nome: "",
            uf: "AC",
            nome_localidade: "Rio Branco",
            codigo_ibge: "1200401",
            tipo_logradouro: "Rua",
            nome_logradouro: "Colinas",
            nome_bairro_inicial: "Rosa Linda",
            descricao: "Rua Colinas, Rio Branco, AC",
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.cep({ uf: "AC", logradouro: "colinas" });

      expect(result).toHaveLength(1);
      expect(result[0]!.cep).toBe("69909032");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/ceps");
      expect(url.toString()).toContain("uf=AC");
      expect(url.toString()).toContain("logradouro=colinas");
      expect(init.method).toBe("GET");
    });
  });

  describe("cepByCodigo", () => {
    it("sends GET /v2/ceps/CODIGO", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          cep: "80210000",
          tipo: "logradouro",
          uf: "PR",
          nome_localidade: "Curitiba",
        },
      });
      const service = createService(fetch);

      const result = await service.cepByCodigo("80210000");

      expect(result.cep).toBe("80210000");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/ceps/80210000");
      expect(init.method).toBe("GET");
    });
  });

  describe("cnae", () => {
    it("sends GET /v2/codigos_cnae with query params", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            codigo: "8599603",
            descricao: "Treinamento em informática",
            secao: "P",
            descricao_secao: "EDUCAÇÃO",
            divisao: "85",
            descricao_divisao: "EDUCAÇÃO",
            grupo: "9",
            descricao_grupo: "Outras atividades de ensino",
            classe: "9",
            descricao_classe:
              "Atividades de ensino não especificadas anteriormente",
            subclasse: "03",
            descricao_subclasse: "Treinamento em informática",
            codigo_formatado: "8599-6/03",
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.cnae({ descricao: "informatica" });

      expect(result).toHaveLength(1);
      expect(result[0]!.codigo).toBe("8599603");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/codigos_cnae");
      expect(url.toString()).toContain("descricao=informatica");
      expect(init.method).toBe("GET");
    });
  });

  describe("municipios", () => {
    it("sends GET /v2/municipios with query params", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            codigo_municipio: "4106902",
            nome_municipio: "Curitiba",
            sigla_uf: "PR",
            nome_uf: "Paraná",
            nfse_habilitada: true,
            status_nfse: "ativo",
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.municipios({ sigla_uf: "PR" });

      expect(result).toHaveLength(1);
      expect(result[0]!.nome_municipio).toBe("Curitiba");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/municipios");
      expect(url.toString()).toContain("sigla_uf=PR");
      expect(init.method).toBe("GET");
    });
  });

  describe("municipio", () => {
    it("sends GET /v2/municipios/CODIGO", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          codigo_municipio: "4106902",
          nome_municipio: "Curitiba",
          sigla_uf: "PR",
          nome_uf: "Paraná",
          nfse_habilitada: true,
        },
      });
      const service = createService(fetch);

      const result = await service.municipio("4106902");

      expect(result.codigo_municipio).toBe("4106902");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/municipios/4106902");
      expect(init.method).toBe("GET");
    });
  });

  describe("itensListaServico", () => {
    it("sends GET /v2/municipios/CODIGO/itens_lista_servico with params", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            codigo: "1.06",
            descricao: "Assessoria e consultoria em informática.",
            tax_rate: null,
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.itensListaServico("4307807", {
        descricao: "informatica",
      });

      expect(result).toHaveLength(1);
      expect(result[0]!.codigo).toBe("1.06");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(
        "/v2/municipios/4307807/itens_lista_servico",
      );
      expect(url.toString()).toContain("descricao=informatica");
      expect(init.method).toBe("GET");
    });

    it("sends GET without params when none provided", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: [] });
      const service = createService(fetch);

      await service.itensListaServico("4307807");

      const [url] = spy.mock.calls[0];
      expect(url.toString()).toContain(
        "/v2/municipios/4307807/itens_lista_servico",
      );
    });
  });

  describe("codigosTributariosMunicipio", () => {
    it("sends GET /v2/municipios/CODIGO/codigos_tributarios_municipio with params", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            codigo: "8394",
            descricao: "Serviço de transporte",
            tax_rate: null,
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.codigosTributariosMunicipio("4307807", {
        descricao: "transporte",
      });

      expect(result).toHaveLength(1);
      expect(result[0]!.codigo).toBe("8394");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain(
        "/v2/municipios/4307807/codigos_tributarios_municipio",
      );
      expect(url.toString()).toContain("descricao=transporte");
      expect(init.method).toBe("GET");
    });

    it("sends GET without params when none provided", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: [] });
      const service = createService(fetch);

      await service.codigosTributariosMunicipio("4307807");

      const [url] = spy.mock.calls[0];
      expect(url.toString()).toContain(
        "/v2/municipios/4307807/codigos_tributarios_municipio",
      );
    });
  });

  describe("cnpj", () => {
    it("sends GET /v2/cnpjs/CNPJ", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          razao_social: "ACRAS TECNOLOGIA DA INFORMACAO LTDA",
          cnpj: "07504505000132",
          situacao_cadastral: "ativa",
          cnae_principal: "6209100",
          optante_simples_nacional: false,
          optante_mei: false,
          endereco: {
            codigo_municipio: "7535",
            codigo_siafi: "7535",
            codigo_ibge: "4106902",
            nome_municipio: "CURITIBA",
            logradouro: " XV DE NOVEMBRO",
            complemento: "Conj 602",
            numero: "1234",
            bairro: "CENTRO",
            cep: "80060000",
            uf: "PR",
          },
        },
      });
      const service = createService(fetch);

      const result = await service.cnpj("07504505000132");

      expect(result.razao_social).toBe("ACRAS TECNOLOGIA DA INFORMACAO LTDA");
      expect(result.cnpj).toBe("07504505000132");
      expect(result.endereco.uf).toBe("PR");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/cnpjs/07504505000132");
      expect(init.method).toBe("GET");
    });
  });

  describe("blockedEmail", () => {
    it("sends GET /v2/blocked_emails/EMAIL", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          email: "test@example.com",
          block_type: "bounce",
          bounce_type: "transient",
          diagnostic_code: "smtp; 554 4.4.7 Message expired",
          blocked_at: "2020-04-16T12:24:29-03:00",
        },
      });
      const service = createService(fetch);

      const result = await service.blockedEmail("test@example.com");

      expect(result.email).toBe("test@example.com");
      expect(result.block_type).toBe("bounce");
      expect(result.bounce_type).toBe("transient");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/blocked_emails/test@example.com");
      expect(init.method).toBe("GET");
    });
  });

  describe("unblockEmail", () => {
    it("sends DELETE /v2/blocked_emails/EMAIL", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const service = createService(fetch);

      await service.unblockEmail("test@example.com");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/blocked_emails/test@example.com");
      expect(init.method).toBe("DELETE");
    });
  });

  describe("backups", () => {
    it("sends GET /v2/backups/CNPJ.json", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          backups: [
            {
              mes: "201701",
              danfes: "https://example.com/danfes.zip",
              xmls: "https://example.com/xmls.zip",
            },
          ],
        },
      });
      const service = createService(fetch);

      const result = await service.backups("07504505000132");

      expect(result.backups).toHaveLength(1);
      expect(result.backups[0]!.mes).toBe("201701");
      expect(result.backups[0]!.danfes).toBe("https://example.com/danfes.zip");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/backups/07504505000132.json");
      expect(init.method).toBe("GET");
    });
  });
});
