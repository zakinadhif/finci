CREATE TABLE IF NOT EXISTS "raw_email" (
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
);

CREATE INDEX IF NOT EXISTS "idx_raw_email_received_at" ON "raw_email" ("received_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_raw_email_from_address" ON "raw_email" ("from_address");
