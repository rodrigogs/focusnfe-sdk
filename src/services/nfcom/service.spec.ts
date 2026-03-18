import { describe, expect, it } from "vitest";

import { createMockFetch, createTestOptions } from "../../core/test-helpers.js";
import { NfcomService } from "./service.js";

function createService(fetch: typeof globalThis.fetch) {
  return new NfcomService(createTestOptions({ fetch }));
}

describe("NfcomService", () => {
  describe("create", () => {
    it("sends POST /v2/nfcom with ref query param and body", async () => {
      const body = {
        cnpj_emitente: "53681445000141",
        ref: "teste_nfcom",
        status: "processando_autorizacao",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.create("teste_nfcom", {
        cnpj_emitente: "53681445000141",
      });

      expect(result.status).toBe("processando_autorizacao");
      expect(result.ref).toBe("teste_nfcom");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfcom");
      expect(url.toString()).toContain("ref=teste_nfcom");
      expect(init.method).toBe("POST");

      const parsed = JSON.parse(init.body as string);
      expect(parsed.cnpj_emitente).toBe("53681445000141");
    });
  });

  describe("get", () => {
    it("sends GET /v2/nfcom/{ref}", async () => {
      const body = {
        cnpj_emitente: "53681445000141",
        ref: "teste_nfcom",
        status: "autorizado",
        status_sefaz: "100",
        mensagem_sefaz: "Autorizado o uso da NFCom",
        chave: "NFCom41250353681445000141620010000000061006102424",
        numero: "6",
        serie: "1",
        caminho_xml:
          "https://focusnfe.s3.sa-east-1.amazonaws.com/arquivos/nfcom.xml",
        caminho_danfecom:
          "https://focusnfe.s3.sa-east-1.amazonaws.com/arquivos/danfecom.pdf",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.get("teste_nfcom");

      expect(result.status).toBe("autorizado");
      expect(result.chave).toBe(
        "NFCom41250353681445000141620010000000061006102424",
      );
      expect(result.numero).toBe("6");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfcom/teste_nfcom");
      expect(init.method).toBe("GET");
    });
  });

  describe("cancel", () => {
    it("sends DELETE /v2/nfcom/{ref} with justificativa body", async () => {
      const body = {
        status: "cancelado",
        status_sefaz: "135",
        mensagem_sefaz: "Evento registrado e vinculado a NFCom",
        caminho_xml:
          "https://focusnfe.s3.sa-east-1.amazonaws.com/arquivos/nfcom-can.xml",
      };
      const { fetch, spy } = createMockFetch({ status: 200, body });
      const service = createService(fetch);

      const result = await service.cancel("teste_nfcom", {
        justificativa:
          "Cancelamento por erro nos dados da nota fiscal de comunicacao",
      });

      expect(result.status).toBe("cancelado");
      expect(result.status_sefaz).toBe("135");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfcom/teste_nfcom");
      expect(init.method).toBe("DELETE");

      const parsed = JSON.parse(init.body as string);
      expect(parsed.justificativa).toBe(
        "Cancelamento por erro nos dados da nota fiscal de comunicacao",
      );
    });
  });

  describe("resendWebhook", () => {
    it("sends POST /v2/nfcom/{ref}/hook", async () => {
      const { fetch, spy } = createMockFetch({ status: 200, body: {} });
      const service = createService(fetch);

      await service.resendWebhook("teste_nfcom");

      const [url, init] = spy.mock.calls[0]!;
      expect(url.toString()).toContain("/v2/nfcom/teste_nfcom/hook");
      expect(init.method).toBe("POST");
    });
  });
});
