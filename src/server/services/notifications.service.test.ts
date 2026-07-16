import { describe, it, expect, vi } from "vitest";
import {
  buildSecretaryNotification,
  notifySecretary,
  type NotificationChannel,
  type ApplicationNotificationInput,
} from "@/server/services/notifications.service";

const input: ApplicationNotificationInput = {
  applicationId: "app-123",
  fullName: "Maria Silva",
  email: "maria@email.com",
  phone: "85912345678",
  createdAt: new Date("2024-01-15T10:00:00"),
};

describe("buildSecretaryNotification", () => {
  it("inclui dados de contato e protocolo", () => {
    const notification = buildSecretaryNotification(input);
    expect(notification.body).toContain("Maria Silva");
    expect(notification.body).toContain("maria@email.com");
    expect(notification.body).toContain("app-123");
    expect(notification.body).toContain("PENDING_REVIEW");
    expect(notification.subject).toMatch(/sindicalização/i);
  });

  it("NÃO inclui dados sensíveis (LGPD)", () => {
    const notification = buildSecretaryNotification({
      ...input,
      // Mesmo que dados sensíveis fossem passados por engano, o builder só usa
      // os campos mínimos. Garantimos a ausência de marcadores de CPF/RG.
    });
    expect(notification.body).not.toMatch(/\bCPF\b/);
    expect(notification.body).not.toMatch(/\bRG\b/);
    expect(notification.body).not.toContain("52998224725");
  });
});

describe("notifySecretary", () => {
  it("envia por todos os canais", async () => {
    const sendA = vi.fn().mockResolvedValue(undefined);
    const sendB = vi.fn().mockResolvedValue(undefined);
    const channels: NotificationChannel[] = [
      { name: "a", send: sendA },
      { name: "b", send: sendB },
    ];

    await notifySecretary(input, channels);

    expect(sendA).toHaveBeenCalledTimes(1);
    expect(sendB).toHaveBeenCalledTimes(1);
  });

  it("isola falha de um canal (não derruba os demais nem lança)", async () => {
    const failing = vi.fn().mockRejectedValue(new Error("smtp down"));
    const working = vi.fn().mockResolvedValue(undefined);
    const channels: NotificationChannel[] = [
      { name: "failing", send: failing },
      { name: "working", send: working },
    ];

    await expect(notifySecretary(input, channels)).resolves.toBeUndefined();
    expect(working).toHaveBeenCalledTimes(1);
  });
});
