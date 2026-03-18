import { vi } from "vitest";

import { FOCUSNFE_BASE_URLS, FOCUSNFE_DEFAULT_TIMEOUT } from "./constants.js";
import type { NormalizedOptions } from "./types.js";

interface MockResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
}

export function createMockFetch(...responses: MockResponse[]) {
  const queue = [...responses];

  const mockFetch = vi.fn(async () => {
    const resp = queue.shift() ?? { status: 200, body: {} };
    return new Response(
      resp.body !== undefined ? JSON.stringify(resp.body) : null,
      {
        status: resp.status ?? 200,
        headers: { "content-type": "application/json", ...resp.headers },
      },
    );
  }) as unknown as typeof globalThis.fetch;

  return {
    fetch: mockFetch,
    spy: mockFetch as unknown as ReturnType<typeof vi.fn>,
  };
}

export function createTestOptions(
  overrides?: Partial<NormalizedOptions>,
): NormalizedOptions {
  const { fetch: mockFetch } = createMockFetch({ status: 200, body: {} });
  return {
    token: "test_token_123",
    baseUrl: FOCUSNFE_BASE_URLS.HOMOLOGACAO,
    timeout: FOCUSNFE_DEFAULT_TIMEOUT,
    fetch: mockFetch,
    userAgent: "",
    ...overrides,
  };
}
