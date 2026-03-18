import { describe, expect, it } from "vitest";

import { FOCUSNFE_BASE_URLS } from "./constants.js";
import { createMockFetch, createTestOptions } from "./test-helpers.js";

describe("createMockFetch", () => {
  it("returns a Response with given status and JSON body", async () => {
    const { fetch } = createMockFetch({ status: 201, body: { ref: "abc" } });
    const res = await fetch("https://example.com", {});
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ref: "abc" });
  });

  it("defaults to 200 with empty body", async () => {
    const { fetch } = createMockFetch();
    const res = await fetch("https://example.com", {});
    expect(res.status).toBe(200);
  });

  it("returns null body when body is undefined and defaults status to 200", async () => {
    const { fetch } = createMockFetch({ body: undefined });
    const res = await fetch("https://example.com", {});
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("queues multiple responses in order", async () => {
    const { fetch } = createMockFetch(
      { status: 200, body: { n: 1 } },
      { status: 404, body: { codigo: "nao_encontrado" } },
    );
    const r1 = await fetch("https://example.com", {});
    const r2 = await fetch("https://example.com", {});
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(404);
  });
});

describe("createTestOptions", () => {
  it("returns NormalizedOptions with sandbox defaults", () => {
    const opts = createTestOptions();
    expect(opts.token).toBe("test_token_123");
    expect(opts.baseUrl).toBe(FOCUSNFE_BASE_URLS.HOMOLOGACAO);
    expect(opts.timeout).toBe(30_000);
    expect(typeof opts.fetch).toBe("function");
  });

  it("accepts overrides", () => {
    const opts = createTestOptions({ token: "custom", timeout: 5000 });
    expect(opts.token).toBe("custom");
    expect(opts.timeout).toBe(5000);
  });
});
