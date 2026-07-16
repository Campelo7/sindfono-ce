import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockSupabaseOptions } from "@/tests/supabase-mock";

const hoisted = vi.hoisted(() => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mock: null as any,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => {
    if (!hoisted.mock) throw new Error("Supabase mock não inicializado");
    return hoisted.mock.client;
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createMockSupabase, TEST_ADMIN } from "@/tests/supabase-mock";
import { PAYMENT_ID, REQUEST_ID } from "@/tests/fixtures/membership";
import { confirmPayment } from "@/actions/admin";
import { revalidatePath } from "next/cache";

function resetMock(options?: MockSupabaseOptions) {
  hoisted.mock = createMockSupabase({ user: TEST_ADMIN, ...options });
  return hoisted.mock;
}

describe("confirmPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita quando pagamento não pertence à solicitação", async () => {
    resetMock({
      user: TEST_ADMIN,
      tableQueue: {
        admin_users: [{ data: { id: "admin-row", name: "Admin", role: "admin" } }],
        payments: [{
          data: {
            id: PAYMENT_ID,
            status: "pending",
            membership_request_id: "outro-request",
          },
        }],
      },
    });

    const result = await confirmPayment(PAYMENT_ID, REQUEST_ID);

    expect(result).toEqual({ error: "Pagamento não pertence a esta solicitação." });
  });

  it("rejeita confirmação duplicada", async () => {
    resetMock({
      user: TEST_ADMIN,
      tableQueue: {
        admin_users: [{ data: { id: "admin-row", name: "Admin", role: "admin" } }],
        payments: [{
          data: {
            id: PAYMENT_ID,
            status: "paid",
            membership_request_id: REQUEST_ID,
          },
        }],
      },
    });

    const result = await confirmPayment(PAYMENT_ID, REQUEST_ID);

    expect(result).toEqual({ error: "Este pagamento já está confirmado." });
  });

  it("confirma pagamento e ativa sindicalização", async () => {
    const mock = resetMock({
      user: TEST_ADMIN,
      tableQueue: {
        admin_users: [{ data: { id: "admin-row", name: "Admin", role: "admin" } }],
        payments: [
          {
            data: {
              id: PAYMENT_ID,
              status: "pending",
              membership_request_id: REQUEST_ID,
            },
          },
          { data: null, error: null },
        ],
        membership_requests: [{ data: null, error: null }],
      },
    });

    const result = await confirmPayment(PAYMENT_ID, REQUEST_ID, "PIX");

    expect(result).toEqual({ success: true });
    expect(mock.from).toHaveBeenCalledWith("payments");
    expect(mock.from).toHaveBeenCalledWith("membership_requests");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/solicitacoes");
    expect(revalidatePath).toHaveBeenCalledWith(`/admin/solicitacoes/${REQUEST_ID}`);
  });

  it("lança erro quando caller não é admin", async () => {
    resetMock({
      user: TEST_ADMIN,
      tableQueue: {
        admin_users: [{ data: null }],
      },
    });

    await expect(confirmPayment(PAYMENT_ID, REQUEST_ID)).rejects.toThrow(/não autorizado/i);
  });
});
