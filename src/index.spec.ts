import { describe, expect, it } from "vitest";

import {
  ConsultasService,
  CteRecebidasService,
  CteService,
  EmpresasService,
  FocusNFeApiError,
  FocusNFeClient,
  FocusNFeConnectionError,
  FocusNFeError,
  MdfeService,
  NfceService,
  NfcomService,
  NfeRecebidasService,
  NfeService,
  NfseNacionalService,
  NfseRecebidasService,
  NfseService,
  WebhooksService,
} from "./index.js";

describe("public API exports", () => {
  it("exports FocusNFeClient", () => {
    expect(FocusNFeClient).toBeDefined();
  });

  it("exports error classes", () => {
    expect(FocusNFeError).toBeDefined();
    expect(FocusNFeApiError).toBeDefined();
    expect(FocusNFeConnectionError).toBeDefined();
  });

  it("exports all service classes", () => {
    expect(NfeService).toBeDefined();
    expect(NfceService).toBeDefined();
    expect(NfseService).toBeDefined();
    expect(NfseNacionalService).toBeDefined();
    expect(CteService).toBeDefined();
    expect(MdfeService).toBeDefined();
    expect(NfcomService).toBeDefined();
    expect(NfeRecebidasService).toBeDefined();
    expect(CteRecebidasService).toBeDefined();
    expect(NfseRecebidasService).toBeDefined();
    expect(EmpresasService).toBeDefined();
    expect(WebhooksService).toBeDefined();
    expect(ConsultasService).toBeDefined();
  });
});
