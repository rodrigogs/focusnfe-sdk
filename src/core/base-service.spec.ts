import { describe, expect, it } from "vitest";

import { BaseService } from "./base-service.js";
import { createMockFetch, createTestOptions } from "./test-helpers.js";

class TestService extends BaseService {
  doRequest<T>(config: Parameters<BaseService["_request"]>[0]) {
    return this._request<T>(config);
  }

  doBinary(config: Parameters<BaseService["_requestBinary"]>[0]) {
    return this._requestBinary(config);
  }
}

describe("BaseService", () => {
  it("_request delegates to http request()", async () => {
    const { fetch, spy } = createMockFetch({
      status: 200,
      body: { id: "1" },
    });
    const service = new TestService(createTestOptions({ fetch }));

    const result = await service.doRequest<{ id: string }>({
      method: "GET",
      path: "/v2/test/1",
    });

    expect(result.id).toBe("1");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0]![0]).toContain("/v2/test/1");
  });

  it("_requestBinary delegates to http requestBinary()", async () => {
    const { fetch, spy } = createMockFetch({
      status: 200,
      body: "<xml/>",
      headers: { "content-type": "application/xml" },
    });
    const service = new TestService(createTestOptions({ fetch }));

    const result = await service.doBinary({
      method: "GET",
      path: "/v2/test/1.xml",
    });

    expect(result.contentType).toBe("application/xml");
    expect(spy).toHaveBeenCalledOnce();
  });
});
