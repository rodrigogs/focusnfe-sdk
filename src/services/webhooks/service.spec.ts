import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { WebhooksService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new WebhooksService(createTestOptions({ fetch }));
}

describe("WebhooksService", () => {
  describe("create", () => {
    it("sends POST /v2/hooks with required and optional fields", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          id: "Vj5rmkBq",
          url: "http://minha.url/nfe",
          authorization: null,
          authorization_header: null,
          event: "nfe",
          cnpj: "51916585000125",
        },
      });
      const service = createService(fetch);

      const result = await service.create({
        cnpj: "51916585000125",
        event: "nfe",
        url: "http://minha.url/nfe",
      });

      expect(result.id).toBe("Vj5rmkBq");
      expect(result.event).toBe("nfe");
      expect(result.url).toBe("http://minha.url/nfe");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/hooks");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        cnpj: "51916585000125",
        event: "nfe",
        url: "http://minha.url/nfe",
      });
    });

    it("sends POST /v2/hooks with authorization fields", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          id: "abc123",
          url: "http://minha.url/nfe",
          authorization: "secret-token",
          authorization_header: "X-ApiKey",
          event: "nfse",
        },
      });
      const service = createService(fetch);

      const result = await service.create({
        event: "nfse",
        url: "http://minha.url/nfe",
        authorization: "secret-token",
        authorization_header: "X-ApiKey",
      });

      expect(result.authorization).toBe("secret-token");
      expect(result.authorization_header).toBe("X-ApiKey");

      expect(JSON.parse(spy.mock.calls[0][1].body as string)).toEqual({
        event: "nfse",
        url: "http://minha.url/nfe",
        authorization: "secret-token",
        authorization_header: "X-ApiKey",
      });
    });
  });

  describe("list", () => {
    it("sends GET /v2/hooks and returns array of webhooks", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: [
          {
            id: "Vj5rmkBq",
            url: "http://minha.url/nfe",
            authorization: null,
            authorization_header: null,
            event: "nfe",
            cnpj: "51916585000125",
          },
        ],
      });
      const service = createService(fetch);

      const result = await service.list();

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("Vj5rmkBq");
      expect(result[0]!.event).toBe("nfe");

      const [url, init] = spy.mock.calls[0];
      expect(url.toString()).toContain("/v2/hooks");
      expect(init.method).toBe("GET");
    });
  });

  describe("get", () => {
    it("sends GET /v2/hooks/{id}", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          id: "Vj5rmkBq",
          url: "http://minha.url/nfe",
          authorization: null,
          authorization_header: null,
          event: "nfe",
          cnpj: "51916585000125",
        },
      });
      const service = createService(fetch);

      const result = await service.get("Vj5rmkBq");

      expect(result.id).toBe("Vj5rmkBq");
      expect(spy.mock.calls[0][0].toString()).toContain("/v2/hooks/Vj5rmkBq");
      expect(spy.mock.calls[0][1].method).toBe("GET");
    });
  });

  describe("remove", () => {
    it("sends DELETE /v2/hooks/{id} and returns deletion result", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: {
          id: "Vj5rmkBq",
          url: "http://minha.url/nfe",
          authorization: null,
          authorization_header: null,
          event: "nfe",
          cnpj: "51916585000125",
          deleted: true,
        },
      });
      const service = createService(fetch);

      const result = await service.remove("Vj5rmkBq");

      expect(result.deleted).toBe(true);
      expect(result.id).toBe("Vj5rmkBq");
      expect(spy.mock.calls[0][0].toString()).toContain("/v2/hooks/Vj5rmkBq");
      expect(spy.mock.calls[0][1].method).toBe("DELETE");
    });
  });
});
