import PostalMime from "postal-mime";

export interface RawEmailRecord {
  id: string;
  message_id: string;
  from_address: string;
  from_name: string | null;
  to_address: string;
  subject: string | null;
  email_date: string | null;
  text_body: string | null;
  html_body: string | null;
  raw_headers: string | null;
  raw_eml: string;
  size_bytes: number;
  received_at: string;
}

export type RawEmailSummary = Omit<RawEmailRecord, "raw_eml" | "html_body" | "raw_headers">;

export interface IngestEmailInput {
  /** Raw MIME content as ReadableStream, ArrayBuffer, Uint8Array, or string */
  raw: ReadableStream<Uint8Array> | ArrayBuffer | Uint8Array | string;
  /** Optional envelope sender (e.g. from Cloudflare ForwardableEmailMessage.from) */
  envelopeFrom?: string;
  /** Optional envelope recipient (e.g. from Cloudflare ForwardableEmailMessage.to) */
  envelopeTo?: string;
  /** Optional Message-ID header read directly from envelope headers */
  headerMessageId?: string | null;
}

export interface IngestEmailResult {
  deduplicated: boolean;
  record: RawEmailRecord;
}

async function rawToUint8Array(
  raw: ReadableStream<Uint8Array> | ArrayBuffer | Uint8Array | string
): Promise<Uint8Array> {
  if (typeof raw === "string") {
    return new TextEncoder().encode(raw);
  }
  if (raw instanceof Uint8Array) {
    return raw;
  }
  if (raw instanceof ArrayBuffer) {
    return new Uint8Array(raw);
  }
  const response = new Response(raw);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeMessageId(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function ensureRawEmailTable(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS "raw_email" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "message_id" TEXT NOT NULL UNIQUE,
        "from_address" TEXT NOT NULL,
        "from_name" TEXT,
        "to_address" TEXT NOT NULL,
        "subject" TEXT,
        "email_date" TEXT,
        "text_body" TEXT,
        "html_body" TEXT,
        "raw_headers" TEXT,
        "raw_eml" TEXT NOT NULL,
        "size_bytes" INTEGER NOT NULL DEFAULT 0,
        "received_at" TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    .run();
}

/**
 * Parses a raw MIME email with postal-mime and stores it in D1.
 * Deduplicates on the Message-ID header (with a SHA-256 fallback if Message-ID is absent).
 */
export async function ingestRawEmail(
  db: D1Database,
  input: IngestEmailInput
): Promise<IngestEmailResult> {
  await ensureRawEmailTable(db);

  const rawBytes = await rawToUint8Array(input.raw);
  const rawEmlText = new TextDecoder("utf-8", { fatal: false }).decode(rawBytes);

  const parsed = await PostalMime.parse(rawBytes);

  // Extract Message-ID from parsed MIME, header fallback, or deterministic SHA-256 hash
  const headerMsgIdFromParsed = parsed.headers?.find(
    (h) => h.key.toLowerCase() === "message-id"
  )?.value;

  const messageId =
    normalizeMessageId(parsed.messageId) ??
    normalizeMessageId(input.headerMessageId) ??
    normalizeMessageId(headerMsgIdFromParsed) ??
    `sha256:${await sha256Hex(rawBytes)}`;

  const fromAddress =
    parsed.from?.address || input.envelopeFrom || "";
  const fromName = parsed.from?.name || null;

  const toAddress =
    parsed.to?.map((t) => t.address).filter(Boolean).join(", ") ||
    input.envelopeTo ||
    "";

  const subject = parsed.subject ?? null;
  const emailDate = parsed.date ?? null;
  const textBody = parsed.text ?? null;
  const htmlBody = parsed.html ?? null;
  const rawHeaders = parsed.headers ? JSON.stringify(parsed.headers) : null;
  const sizeBytes = rawBytes.byteLength;
  const id = crypto.randomUUID();
  const receivedAt = new Date().toISOString();

  // Dedupe on message_id via ON CONFLICT DO NOTHING
  const insertResult = await db
    .prepare(
      `INSERT INTO "raw_email" (
        "id",
        "message_id",
        "from_address",
        "from_name",
        "to_address",
        "subject",
        "email_date",
        "text_body",
        "html_body",
        "raw_headers",
        "raw_eml",
        "size_bytes",
        "received_at"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT("message_id") DO NOTHING`
    )
    .bind(
      id,
      messageId,
      fromAddress,
      fromName,
      toAddress,
      subject,
      emailDate,
      textBody,
      htmlBody,
      rawHeaders,
      rawEmlText,
      sizeBytes,
      receivedAt
    )
    .run();

  const changes = insertResult.meta?.changes ?? 0;
  const deduplicated = changes === 0;

  const existing = await db
    .prepare(`SELECT * FROM "raw_email" WHERE "message_id" = ? LIMIT 1`)
    .bind(messageId)
    .first<RawEmailRecord>();

  if (!existing) {
    throw new Error("Failed to read back ingested email from D1");
  }

  return {
    deduplicated,
    record: existing,
  };
}

export async function listRawEmails(
  db: D1Database,
  limit = 50
): Promise<RawEmailRecord[]> {
  await ensureRawEmailTable(db);
  const { results } = await db
    .prepare(
      `SELECT * FROM "raw_email" ORDER BY "received_at" DESC LIMIT ?`
    )
    .bind(limit)
    .all<RawEmailRecord>();
  return results ?? [];
}
