/**
 * Serviço de notificações. Substitui o antigo `server/email.ts`.
 *
 * Princípio de minimização (§9.10, §10): a notificação à secretaria carrega
 * APENAS nome, contato (e-mail/telefone) e o ID da inscrição — o suficiente para
 * abrir o painel. CPF, RG, filiação e documentos JAMAIS trafegam por aqui.
 *
 * Múltiplos canais via interface `NotificationChannel` (hoje: log + e-mail mock).
 * Em produção, implemente um canal SMTP/serviço real respeitando a mesma interface.
 */

import { PAYMENT_INFO } from "@/lib/utils";

export type SecretaryNotification = {
  to: string;
  subject: string;
  body: string;
};

/** Dados mínimos e não-sensíveis para notificar a secretaria. */
export type ApplicationNotificationInput = {
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: Date;
};

const SECRETARY_EMAIL = process.env.SECRETARY_EMAIL ?? PAYMENT_INFO.email;

/** Monta o corpo da notificação — sem nenhum dado pessoal sensível. */
export const buildSecretaryNotification = (
  input: ApplicationNotificationInput,
): SecretaryNotification => ({
  to: SECRETARY_EMAIL,
  subject: "Nova solicitação de sindicalização — Sindfono CE",
  body: [
    "Uma nova inscrição foi recebida no site do Sindfono CE.",
    "",
    `Protocolo: ${input.applicationId}`,
    `Nome: ${input.fullName}`,
    `E-mail de contato: ${input.email}`,
    `Telefone de contato: ${input.phone}`,
    `Data: ${input.createdAt.toLocaleString("pt-BR")}`,
    "Status: PENDING_REVIEW",
    "",
    "Acesse o painel administrativo para revisar os dados e documentos completos.",
    "Por segurança (LGPD), dados sensíveis não são enviados por e-mail.",
  ].join("\n"),
});

/** Contrato de canal de envio. */
export interface NotificationChannel {
  readonly name: string;
  send(notification: SecretaryNotification): Promise<void>;
}

/** Canal de log estruturado (sem corpo sensível — já garantido pelo builder). */
export class LogNotificationChannel implements NotificationChannel {
  readonly name = "log";
  async send(notification: SecretaryNotification): Promise<void> {
    if (process.env.NODE_ENV !== "test") {
      console.info("[notification] queued", {
        channel: this.name,
        to: notification.to,
        subject: notification.subject,
      });
    }
  }
}

/** Canal de e-mail simulado. Troque por SMTP/serviço real em produção. */
export class MockEmailNotificationChannel implements NotificationChannel {
  readonly name = "email-mock";
  async send(notification: SecretaryNotification): Promise<void> {
    if (process.env.NODE_ENV !== "test") {
      console.info("[notification] (mock email) would send", {
        channel: this.name,
        to: notification.to,
        subject: notification.subject,
      });
    }
  }
}

const defaultChannels: readonly NotificationChannel[] = [
  new LogNotificationChannel(),
  new MockEmailNotificationChannel(),
];

/**
 * Notifica a secretaria por todos os canais configurados. Falhas de canal são
 * isoladas: um canal quebrado não impede os demais nem derruba a inscrição.
 */
export const notifySecretary = async (
  input: ApplicationNotificationInput,
  channels: readonly NotificationChannel[] = defaultChannels,
): Promise<void> => {
  const notification = buildSecretaryNotification(input);
  await Promise.allSettled(channels.map((channel) => channel.send(notification)));
};
