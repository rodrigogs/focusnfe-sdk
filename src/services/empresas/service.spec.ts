import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { EmpresasService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new EmpresasService(createTestOptions({ fetch }));
}

describe("EmpresasService", () => {
  describe("create", () => {
    it("sends POST /v2/empresas with company fields", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          id: 123,
          nome: "Nome da empresa Ltda",
          nome_fantasia: "Nome Fantasia",
          cnpj: "10964044000164",
          inscricao_estadual: "1234",
          regime_tributario: "1",
          email: "test@example.com",
          logradouro: "Rua João da Silva",
          numero: "153",
          bairro: "Vila Isabel",
          cep: "80210000",
          municipio: "Curitiba",
          uf: "PR",
        },
      });
      const service = createService(fetch);

      const result = await service.create({
        nome: "Nome da empresa Ltda",
        nome_fantasia: "Nome Fantasia",
        cnpj: "10964044000164",
        inscricao_estadual: 1234,
        regime_tributario: 1,
        email: "test@example.com",
        telefone: "4130333333",
        logradouro: "Rua João da Silva",
        numero: "153",
        bairro: "Vila Isabel",
        cep: "80210000",
        municipio: "Curitiba",
        uf: "PR",
        habilita_nfe: true,
      });

      expect(result.id).toBe(123);
      expect(result.nome).toBe("Nome da empresa Ltda");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/empresas");
      expect(url.toString()).not.toContain("dry_run");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        nome: "Nome da empresa Ltda",
        nome_fantasia: "Nome Fantasia",
        cnpj: "10964044000164",
        inscricao_estadual: 1234,
        regime_tributario: 1,
        email: "test@example.com",
        telefone: "4130333333",
        logradouro: "Rua João da Silva",
        numero: "153",
        bairro: "Vila Isabel",
        cep: "80210000",
        municipio: "Curitiba",
        uf: "PR",
        habilita_nfe: true,
      });
    });

    it("adds dry_run=1 query param when dryRun is true", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: { id: 123, nome: "Test", nome_fantasia: "Test", cnpj: "123" },
      });
      const service = createService(fetch);

      await service.create(
        {
          nome: "Test",
          nome_fantasia: "Test",
          cnpj: "123",
          regime_tributario: 1,
          logradouro: "Rua A",
          numero: "1",
          bairro: "B",
          cep: "80000000",
          municipio: "Curitiba",
          uf: "PR",
        },
        { dryRun: true },
      );

      const [url] = spy.mock.calls[0];
      expect(url.toString()).toContain("dry_run=1");
    });
  });

  describe("list", () => {
    it("sends GET /v2/empresas and returns array of companies", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            id: 123,
            nome: "Empresa A",
            nome_fantasia: "Fantasia A",
            cnpj: "10964044000164",
          },
          {
            id: 456,
            nome: "Empresa B",
            nome_fantasia: "Fantasia B",
            cnpj: "51916585000125",
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.list();

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe(123);
      expect(result[1]!.nome).toBe("Empresa B");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/empresas");
      expect(init.method).toBe("GET");
    });

    it("passes cnpj filter as query param", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [{ id: 1, nome: "A", nome_fantasia: "A", cnpj: "123" }],
      });
      const service = createService(fetch);

      await service.list({ cnpj: "10964044000164" });

      const [url] = spy.mock.calls[0];
      expect(url.toString()).toContain("cnpj=10964044000164");
    });
  });

  describe("get", () => {
    it("sends GET /v2/empresas/{id}", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          id: 123,
          nome: "Nome da empresa Ltda",
          nome_fantasia: "Nome Fantasia",
          cnpj: "10964044000164",
          habilita_nfe: true,
        },
      });
      const service = createService(fetch);

      const result = await service.get(123);

      expect(result.id).toBe(123);
      expect(result.nome).toBe("Nome da empresa Ltda");
      expect(spy.mock.calls[0][0].toString()).toContain("/v2/empresas/123");
      expect(spy.mock.calls[0][1].method).toBe("GET");
    });
  });

  describe("update", () => {
    it("sends PUT /v2/empresas/{id} with partial fields", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          id: 123,
          nome: "Novo Nome Ltda",
          nome_fantasia: "Novo Fantasia",
          cnpj: "10964044000164",
          email: "novo@example.com",
        },
      });
      const service = createService(fetch);

      const result = await service.update(123, {
        nome: "Novo Nome Ltda",
        nome_fantasia: "Novo Fantasia",
        email: "novo@example.com",
      });

      expect(result.nome).toBe("Novo Nome Ltda");
      expect(spy.mock.calls[0][0].toString()).toContain("/v2/empresas/123");
      expect(spy.mock.calls[0][1].method).toBe("PUT");
      expect(JSON.parse(spy.mock.calls[0][1].body as string)).toEqual({
        nome: "Novo Nome Ltda",
        nome_fantasia: "Novo Fantasia",
        email: "novo@example.com",
      });
    });
  });

  describe("remove", () => {
    it("sends DELETE /v2/empresas/{id}", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {},
      });
      const service = createService(fetch);

      await service.remove(123);

      expect(spy.mock.calls[0][0].toString()).toContain("/v2/empresas/123");
      expect(spy.mock.calls[0][1].method).toBe("DELETE");
    });
  });
});
