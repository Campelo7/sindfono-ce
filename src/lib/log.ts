/**
 * Logger de servidor com redação automática de dados sensíveis (LGPD).
 *
 * Todo `context` passado é passado por `redactSensitiveData` antes de ser
 * emitido no console: CPF, RG, filiação, nomes de arquivo, tokens etc. são
 * substituídos por `[REDACTED]`. Assim, mesmo em caso de log acidental do
 * payload cru, nenhum dado pessoal identificável vaza para stdout / logs de
 * observabilidade.
 *
 * Regra: nunca use `console.error/info` direto em código server-side novo.
 * Use `serverLog.error / info / warn` daqui.
 */

import { redactSensitiveData } from "@/lib/lgpd";

const emit = (
  level: "error" | "warn" | "info",
  message: string,
  context: Record<string, unknown> | undefined,
) => {
  if (process.env.NODE_ENV === "test") return;

  const safe = context ? redactSensitiveData(context) : undefined;
  const prefix = `[server:${level}]`;

  // eslint-disable-next-line no-console
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  if (safe === undefined) {
    fn(prefix, message);
  } else {
    fn(prefix, message, safe);
  }
};

export const serverLog = {
  error: (message: string, context?: Record<string, unknown>) => emit("error", message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit("warn", message, context),
  info: (message: string, context?: Record<string, unknown>) => emit("info", message, context),
};
