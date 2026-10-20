type ApiErrorBody = {
  error: { code: string; message: string; issues?: unknown[] };
};

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly issues?: unknown[];

  constructor(status: number, code: string, message: string, issues?: unknown[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiClientError(
      res.status,
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? `Request failed (${res.status})`,
      body?.error?.issues
    );
  }

  return (await res.json()) as T;
}

function post<T>(path: string, data: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(data) });
}

export const api = {
  // Add your API methods here, e.g.:
  // hello: () => request<{ message: string }>("/api/hello"),
};
