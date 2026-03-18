import { describe, expect, it } from "vitest";

import { FocusNFeClient } from "./client.js";
import { FOCUSNFE_BASE_URLS } from "./core/constants.js";
import { createMockFetch } from "./core/test-helpers.js";
import { ConsultasService } from "./services/consultas/index.js";
import { CteService } from "./services/cte/index.js";
import { CteRecebidasService } from "./services/cte-recebidas/index.js";
import { EmpresasService } from "./services/empresas/index.js";
import { MdfeService } from "./services/mdfe/index.js";
import { NfceService } from "./services/nfce/index.js";
import { NfcomService } from "./services/nfcom/index.js";
import { NfeService } from "./services/nfe/index.js";
import { NfeRecebidasService } from "./services/nfe-recebidas/index.js";
import { NfseService } from "./services/nfse/index.js";
import { NfseNacionalService } from "./services/nfse-nacional/index.js";
import { NfseRecebidasService } from "./services/nfse-recebidas/index.js";
import { WebhooksService } from "./services/webhooks/index.js";

function createClient(fetchOverride?: typeof globalThis.fetch) {
  const { fetch } = createMockFetch({ status: 200, body: {} });
  return new FocusNFeClient({
    token: "test_token",
    environment: "HOMOLOGACAO",
    fetch: fetchOverride ?? fetch,
  });
}

describe("FocusNFeClient", () => {
  describe("constructor", () => {
    it("uses HOMOLOGACAO base URL when specified", () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const client = new FocusNFeClient({
        token: "tok",
        environment: "HOMOLOGACAO",
        fetch,
      });

      client.request({ method: "GET", path: "/v2/nfe/x" });
      expect(spy.mock.calls[0]![0]).toContain(FOCUSNFE_BASE_URLS.HOMOLOGACAO);
    });

    it("defaults to PRODUCTION environment", () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const client = new FocusNFeClient({ token: "tok", fetch });

      client.request({ method: "GET", path: "/v2/nfe/x" });
      expect(spy.mock.calls[0]![0]).toContain(FOCUSNFE_BASE_URLS.PRODUCTION);
    });

    it("defaults to globalThis.fetch when not provided", () => {
      const client = new FocusNFeClient({ token: "tok" });
      // Should not throw - it uses globalThis.fetch
      expect(client).toBeInstanceOf(FocusNFeClient);
    });

    it("throws when token is empty", () => {
      expect(() => new FocusNFeClient({ token: "" })).toThrow(
        "FocusNFe API token is required",
      );
    });

    it("accepts custom baseUrl override", () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const client = new FocusNFeClient({
        token: "tok",
        baseUrl: "https://custom.api.com",
        fetch,
      });

      client.request({ method: "GET", path: "/v2/nfe/x" });
      expect(spy.mock.calls[0]![0]).toContain("https://custom.api.com");
    });
  });

  describe("service getters", () => {
    it("returns correct service instances", () => {
      const client = createClient();

      expect(client.nfe).toBeInstanceOf(NfeService);
      expect(client.nfce).toBeInstanceOf(NfceService);
      expect(client.nfse).toBeInstanceOf(NfseService);
      expect(client.nfseNacional).toBeInstanceOf(NfseNacionalService);
      expect(client.cte).toBeInstanceOf(CteService);
      expect(client.mdfe).toBeInstanceOf(MdfeService);
      expect(client.nfcom).toBeInstanceOf(NfcomService);
      expect(client.nfeRecebidas).toBeInstanceOf(NfeRecebidasService);
      expect(client.cteRecebidas).toBeInstanceOf(CteRecebidasService);
      expect(client.nfseRecebidas).toBeInstanceOf(NfseRecebidasService);
      expect(client.empresas).toBeInstanceOf(EmpresasService);
      expect(client.webhooks).toBeInstanceOf(WebhooksService);
      expect(client.consultas).toBeInstanceOf(ConsultasService);
    });

    it("returns same instance on repeated access (lazy initialization)", () => {
      const client = createClient();

      expect(client.nfe).toBe(client.nfe);
      expect(client.nfce).toBe(client.nfce);
      expect(client.nfse).toBe(client.nfse);
      expect(client.nfseNacional).toBe(client.nfseNacional);
      expect(client.cte).toBe(client.cte);
      expect(client.mdfe).toBe(client.mdfe);
      expect(client.nfcom).toBe(client.nfcom);
      expect(client.nfeRecebidas).toBe(client.nfeRecebidas);
      expect(client.cteRecebidas).toBe(client.cteRecebidas);
      expect(client.nfseRecebidas).toBe(client.nfseRecebidas);
      expect(client.empresas).toBe(client.empresas);
      expect(client.webhooks).toBe(client.webhooks);
      expect(client.consultas).toBe(client.consultas);
    });
  });

  describe("escape hatches", () => {
    it("request() delegates to http request", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: { ok: true },
      });
      const client = new FocusNFeClient({
        token: "tok",
        environment: "HOMOLOGACAO",
        fetch,
      });

      const result = await client.request<{ ok: boolean }>({
        method: "GET",
        path: "/v2/custom",
      });

      expect(result.ok).toBe(true);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("requestBinary() delegates to http requestBinary", async () => {
      const { fetch, spy } = createMockFetch({
        status: 200,
        body: "<xml/>",
        headers: { "content-type": "application/xml" },
      });
      const client = new FocusNFeClient({
        token: "tok",
        environment: "HOMOLOGACAO",
        fetch,
      });

      const result = await client.requestBinary({
        method: "GET",
        path: "/v2/custom.xml",
      });

      expect(result.contentType).toBe("application/xml");
      expect(spy).toHaveBeenCalledOnce();
    });
  });
});
