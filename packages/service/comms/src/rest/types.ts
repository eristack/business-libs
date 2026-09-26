export type RestRequest = {
  method: string;
  headers: { get(name: string): string | null | undefined };
  body: unknown;
  params: Record<string, string | undefined>;
  query: Record<string, string | string[] | undefined>;
};

export type RestResponse = {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
};
