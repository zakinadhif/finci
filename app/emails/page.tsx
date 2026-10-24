"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { RawEmailRecord } from "@/lib/email-ingest";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BankIcon,
  Mail01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Loading03Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

function buildSampleEWalletEml(messageId: string): string {
  const domain =
    typeof window !== "undefined" && window.location.hostname
      ? window.location.hostname
      : "localhost";
  const now = new Date().toUTCString();
  return [
    `From: "GoPay Receipts" <no-reply@gopay.co.id>`,
    `To: ingest@${domain}`,
    `Subject: Payment Successful - Kopi Kenangan Rp 38.500`,
    `Message-ID: ${messageId}`,
    `Date: ${now}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="finci-boundary-001"`,
    ``,
    `--finci-boundary-001`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    `Hi there,`,
    `Your GoPay payment of Rp 38.500 to Kopi Kenangan (Grand Indonesia) was successful.`,
    `Transaction ID: GP-20261024-99481`,
    `Date: ${now}`,
    `Payment Method: GoPay Balance`,
    `Total Paid: Rp 38.500`,
    ``,
    `--finci-boundary-001`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    `<!DOCTYPE html>`,
    `<html>`,
    `<body style="font-family: sans-serif; color: #111827; padding: 16px;">`,
    `  <h2 style="color: #059669; margin-bottom: 4px;">Payment Successful</h2>`,
    `  <p style="margin-top: 0; color: #6b7280;">Merchant: <strong>Kopi Kenangan (Grand Indonesia)</strong></p>`,
    `  <table style="border-collapse: collapse; width: 100%; max-width: 420px; margin-top: 12px;">`,
    `    <tr><td style="padding: 6px 0; color: #6b7280;">Transaction ID</td><td style="padding: 6px 0; font-weight: 600;">GP-20261024-99481</td></tr>`,
    `    <tr><td style="padding: 6px 0; color: #6b7280;">Payment Method</td><td style="padding: 6px 0;">GoPay Balance</td></tr>`,
    `    <tr><td style="padding: 6px 0; color: #6b7280;">Total Paid</td><td style="padding: 6px 0; font-weight: 700; font-size: 18px;">Rp 38.500</td></tr>`,
    `  </table>`,
    `</body>`,
    `</html>`,
    ``,
    `--finci-boundary-001--`,
  ].join("\r\n");
}

type InspectorTab = "text" | "html" | "preview" | "headers" | "raw";

export default function EmailsCapturePage() {
  const [emails, setEmails] = React.useState<RawEmailRecord[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<InspectorTab>("text");
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [rawInput, setRawInput] = React.useState(() =>
    buildSampleEWalletEml(`<sample-ewallet-001@gopay.co.id>`)
  );
  const [statusBanner, setStatusBanner] = React.useState<{
    type: "captured" | "deduplicated" | "error";
    text: string;
  } | null>(null);

  const fetchEmails = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.emails.list();
      const list = res.data?.emails ?? [];
      setEmails(list);
      setSelectedId((prev) => prev ?? list[0]?.id ?? null);
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load emails",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchEmails();
  }, [fetchEmails]);

  const selectedEmail = React.useMemo(
    () => emails.find((e) => e.id === selectedId) ?? emails[0] ?? null,
    [emails, selectedId]
  );

  async function handleIngest(emlToSubmit: string) {
    setSubmitting(true);
    setStatusBanner(null);
    try {
      const res = await api.emails.ingest({ rawEml: emlToSubmit });
      const result = res.data;
      if (result) {
        setStatusBanner({
          type: result.deduplicated ? "deduplicated" : "captured",
          text: result.deduplicated
            ? `Deduplicated! Message-ID ${result.record.message_id} already exists in D1 (no duplicate row created).`
            : `Captured new email (${result.record.message_id}) into D1 table raw_email.`,
        });
        await fetchEmails();
        setSelectedId(result.record.id);
      }
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to ingest email",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleGenerateFreshSample() {
    const randomId = `<ewallet-${Date.now().toString(36)}@gopay.co.id>`;
    const nextSample = buildSampleEWalletEml(randomId);
    setRawInput(nextSample);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRawInput(text);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <HugeiconsIcon icon={BankIcon} className="size-5" />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight">
                Finci
              </span>
            </Link>
            <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-xs">
              Step 1a • Raw Email Capture
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
        {/* Status Banner */}
        {statusBanner && (
          <div
            className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
              statusBanner.type === "captured"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : statusBanner.type === "deduplicated"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            <HugeiconsIcon
              icon={
                statusBanner.type === "error"
                  ? AlertCircleIcon
                  : CheckmarkCircle02Icon
              }
              className="size-4 shrink-0"
            />
            <span>{statusBanner.text}</span>
          </div>
        )}

        {/* Simulator / Paste Raw .eml Card */}
        <Card className="rounded-3xl border-border/80">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HugeiconsIcon icon={Mail01Icon} className="size-5 text-primary" />
                  <span>Ingest Raw Email (.eml / MIME)</span>
                </CardTitle>
                <CardDescription>
                  Parses MIME via <code>postal-mime</code>, stores raw email + extracted text/HTML in D1 (<code>raw_email</code>), and deduplicates on <code>Message-ID</code>.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
                  Upload .eml File
                  <input
                    type="file"
                    accept=".eml,message/rfc822,text/plain"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateFreshSample}
                >
                  New Sample Message-ID
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={submitting || !rawInput.trim()}
                  onClick={() => void handleIngest(rawInput)}
                >
                  {submitting ? (
                    <>
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        className="size-4 animate-spin mr-1.5"
                      />
                      <span>Ingesting...</span>
                    </>
                  ) : (
                    <>
                      <span>Capture Email into D1</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              rows={7}
              spellCheck={false}
              className="w-full rounded-2xl border border-border bg-muted/30 p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Paste raw MIME (.eml) content here (e.g. from Gmail -> Show Original)..."
            />
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Click <em>Capture Email into D1</em> twice with the same <code>Message-ID</code> to verify that duplicate forwards or retries are automatically ignored.
            </p>
          </CardContent>
        </Card>

        {/* Captured Emails Table & Inspector */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Table of captured rows */}
          <Card className="rounded-3xl border-border/80 lg:col-span-5 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    D1 Table: <code>raw_email</code>
                  </CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading rows..."
                      : `${emails.length} captured email${emails.length === 1 ? "" : "s"}`}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchEmails()}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[540px]">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No emails captured yet. Click{" "}
                  <strong>Capture Email into D1</strong> above or forward an
                  email to your Worker!
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {emails.map((item) => {
                    const isSelected = selectedEmail?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-muted/50 ${
                          isSelected ? "bg-primary/5 border-l-4 border-l-primary" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-sm line-clamp-1">
                            {item.subject || "(No Subject)"}
                          </span>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {item.size_bytes} B
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground truncate">
                          From:{" "}
                          <span className="text-foreground/80">
                            {item.from_name
                              ? `${item.from_name} <${item.from_address}>`
                              : item.from_address}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          <code className="truncate max-w-[220px] bg-muted px-1.5 py-0.5 rounded">
                            {item.message_id}
                          </code>
                          <span className="shrink-0">
                            {new Date(item.received_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Selected Email Inspector */}
          <Card className="rounded-3xl border-border/80 lg:col-span-7 flex flex-col">
            <CardHeader className="pb-3">
              {selectedEmail ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      {selectedEmail.subject || "(No Subject)"}
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      ID: {selectedEmail.id.slice(0, 8)}…
                    </Badge>
                  </div>
                  <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <div>
                      <strong>From:</strong>{" "}
                      {selectedEmail.from_name
                        ? `${selectedEmail.from_name} <${selectedEmail.from_address}>`
                        : selectedEmail.from_address}
                    </div>
                    <div>
                      <strong>To:</strong> {selectedEmail.to_address}
                    </div>
                    <div className="sm:col-span-2">
                      <strong>Message-ID (Dedupe Key):</strong>{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5">
                        {selectedEmail.message_id}
                      </code>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <CardTitle className="text-base">Email Inspector</CardTitle>
                  <CardDescription>
                    Select a row from <code>raw_email</code> to inspect its
                    extracted text, HTML, headers, and raw MIME source.
                  </CardDescription>
                </div>
              )}
            </CardHeader>
            <Separator />
            {selectedEmail && (
              <>
                <div className="flex flex-wrap gap-1.5 border-b border-border/60 px-4 py-2 bg-muted/20">
                  {(
                    [
                      { key: "text", label: "Extracted Text" },
                      { key: "preview", label: "HTML Preview" },
                      { key: "html", label: "Extracted HTML" },
                      { key: "headers", label: "MIME Headers" },
                      { key: "raw", label: "Raw .eml" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`rounded-xl px-3 py-1 text-xs font-medium transition-colors ${
                        activeTab === tab.key
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <CardContent className="p-4 flex-1">
                  {activeTab === "text" && (
                    <pre className="max-h-[420px] overflow-auto rounded-2xl border border-border bg-muted/30 p-4 font-mono text-xs whitespace-pre-wrap">
                      {selectedEmail.text_body || "(No plain text part extracted)"}
                    </pre>
                  )}
                  {activeTab === "html" && (
                    <pre className="max-h-[420px] overflow-auto rounded-2xl border border-border bg-muted/30 p-4 font-mono text-xs whitespace-pre-wrap">
                      {selectedEmail.html_body || "(No HTML part extracted)"}
                    </pre>
                  )}
                  {activeTab === "preview" && (
                    <div className="overflow-hidden rounded-2xl border border-border bg-white">
                      {selectedEmail.html_body ? (
                        <iframe
                          title="Email HTML Preview"
                          sandbox=""
                          srcDoc={selectedEmail.html_body}
                          className="h-[420px] w-full border-0"
                        />
                      ) : (
                        <div className="p-6 text-xs text-muted-foreground">
                          (No HTML body to preview)
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "headers" && (
                    <pre className="max-h-[420px] overflow-auto rounded-2xl border border-border bg-muted/30 p-4 font-mono text-xs whitespace-pre-wrap">
                      {selectedEmail.raw_headers
                        ? JSON.stringify(
                            JSON.parse(selectedEmail.raw_headers),
                            null,
                            2
                          )
                        : "(No headers stored)"}
                    </pre>
                  )}
                  {activeTab === "raw" && (
                    <pre className="max-h-[420px] overflow-auto rounded-2xl border border-border bg-muted/30 p-4 font-mono text-xs whitespace-pre-wrap">
                      {selectedEmail.raw_eml}
                    </pre>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
