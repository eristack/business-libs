export type IdempotencyClientFetchOptions = {
  header?: string;
  createKey?: () => string;
  fetch?: typeof fetch;
};

/**
 * Adds a stable Idempotency-Key header per submit intent (generate once, reuse on retry).
 */
export function createIdempotencyClientFetch(options: IdempotencyClientFetchOptions = {}) {
  const header = options.header ?? "Idempotency-Key";
  const fetchImpl = options.fetch ?? fetch;
  const createKey = options.createKey ?? (() => crypto.randomUUID());

  return async function idempotentFetch(
    input: string | URL,
    init?: RequestInit & { idempotencyKey?: string },
  ): Promise<Response> {
    const key = init?.idempotencyKey ?? createKey();
    const headers = new Headers(init?.headers);
    if (!headers.has(header)) headers.set(header, key);
    const { idempotencyKey: _drop, ...rest } = init ?? {};
    return fetchImpl(input, { ...rest, headers });
  };
}
