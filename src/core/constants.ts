import type { FocusNFeEnvironment } from "./types.js";

export const FOCUSNFE_BASE_URLS: Record<FocusNFeEnvironment, string> = {
  HOMOLOGACAO: "https://homologacao.focusnfe.com.br",
  PRODUCTION: "https://api.focusnfe.com.br",
};

export const FOCUSNFE_DEFAULT_TIMEOUT = 30_000;

export const FOCUSNFE_DEFAULT_ENVIRONMENT: FocusNFeEnvironment = "PRODUCTION";
