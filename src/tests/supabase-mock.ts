import { vi } from "vitest";

export type MockResult = { data?: unknown; error?: { message: string; code?: string } | null };

/** Respostas enfileiradas por tabela — cada `.from(table)` consome o próximo item. */
export type TableQueue = Record<string, MockResult[]>;

export type MockSupabaseOptions = {
  user?: { id: string; email?: string } | null;
  authError?: { message: string } | null;
  /** Respostas terminais (single / maybeSingle) por tabela, em ordem de chamada. */
  tableQueue?: TableQueue;
  storage?: {
    upload?: MockResult;
    remove?: MockResult;
    createSignedUrl?: { data?: { signedUrl: string } | null; error?: { message: string } | null };
  };
};

const chainMethods = [
  "select",
  "insert",
  "upsert",
  "update",
  "delete",
  "eq",
  "neq",
  "order",
  "limit",
  "in",
] as const;

/** Builder encadeável compatível com o client Supabase usado nas actions. */
function createQueryChain(terminal: MockResult) {
  const chain: Record<string, unknown> = {};
  const resolved = Promise.resolve(terminal);

  for (const method of chainMethods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  chain.select = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(terminal);
  chain.maybeSingle = vi.fn().mockResolvedValue(terminal);

  // PostgREST builders são thenable — `await supabase.from(...).update(...).eq(...)`
  chain.then = resolved.then.bind(resolved);
  chain.catch = resolved.catch.bind(resolved);
  chain.finally = resolved.finally.bind(resolved);

  return chain;
}

export function createMockSupabase(options: MockSupabaseOptions = {}) {
  const queues: TableQueue = structuredClone(options.tableQueue ?? {});
  const storageUpload = vi.fn().mockResolvedValue(options.storage?.upload ?? { error: null });
  const storageRemove = vi.fn().mockResolvedValue(options.storage?.remove ?? { error: null });
  const createSignedUrl = vi
    .fn()
    .mockResolvedValue(
      options.storage?.createSignedUrl ?? { data: { signedUrl: "https://signed.example/doc" }, error: null },
    );

  const from = vi.fn((table: string) => {
    const queue = queues[table];
    const next = queue?.shift() ?? { data: null, error: null };
    return createQueryChain(next);
  });

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options.user ?? null },
        error: options.authError ?? null,
      }),
    },
    from,
    storage: {
      from: vi.fn(() => ({
        upload: storageUpload,
        remove: storageRemove,
        createSignedUrl,
      })),
    },
  };

  return {
    client,
    from,
    storageUpload,
    storageRemove,
    createSignedUrl,
    /** Insere respostas adicionais na fila de uma tabela durante o teste. */
    enqueue(table: string, ...results: MockResult[]) {
      if (!queues[table]) queues[table] = [];
      queues[table].push(...results);
    },
  };
}

/** Usuário padrão para testes de membership. */
export const TEST_USER = {
  id: "user-11111111-1111-1111-1111-111111111111",
  email: "maria@email.com",
} as const;

/** Admin padrão para testes de admin actions. */
export const TEST_ADMIN = {
  id: "admin-22222222-2222-2222-2222-222222222222",
  email: "admin@sindfono.ce",
} as const;
