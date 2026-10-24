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

import type { IngestEmailResult, RawEmailRecord } from "@/lib/email-ingest";
import type { ApiSuccessResponse } from "@/lib/api-response";

export const api = {
  emails: {
    list: () =>
      request<ApiSuccessResponse<{ emails: RawEmailRecord[] }>>("/api/emails"),
    ingest: (payload: {
      rawEml: string;
      envelopeFrom?: string;
      envelopeTo?: string;
    }) =>
      post<ApiSuccessResponse<IngestEmailResult>>("/api/emails", payload),
  },
};
