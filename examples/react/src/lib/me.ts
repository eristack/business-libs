export type MeResponse = {
  subject: string;
  claims?: Record<string, unknown>;
};

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  const response = await fetch("/me", {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(
      body?.error?.message ?? `GET /me failed (${response.status})`,
    );
  }

  return (await response.json()) as MeResponse;
}
