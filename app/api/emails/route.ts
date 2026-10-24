import { env } from "cloudflare:workers";
import { z } from "zod";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { ingestRawEmail, listRawEmails } from "@/lib/email-ingest";

const IngestPayloadSchema = z.object({
  rawEml: z.string().min(1, "Raw MIME content (.eml) is required"),
  envelopeFrom: z.string().optional(),
  envelopeTo: z.string().optional(),
});

export const GET = withApiHandler("emails.GET", async () => {
  const emails = await listRawEmails(env.DB, 100);
  return apiSuccess({
    data: { emails },
  });
});

export const POST = withApiHandler("emails.POST", async (request: Request) => {
  const contentType = request.headers.get("content-type") ?? "";

  let rawEml: string;
  let envelopeFrom: string | undefined;
  let envelopeTo: string | undefined;

  if (contentType.includes("application/json")) {
    const body = IngestPayloadSchema.parse(await request.json());
    rawEml = body.rawEml;
    envelopeFrom = body.envelopeFrom;
    envelopeTo = body.envelopeTo;
  } else {
    rawEml = await request.text();
    if (!rawEml.trim()) {
      return apiError("Request body must contain raw MIME (.eml) content", {
        code: "BAD_REQUEST",
      });
    }
  }

  const result = await ingestRawEmail(env.DB, {
    raw: rawEml,
    envelopeFrom,
    envelopeTo,
  });

  return apiSuccess({
    status: result.deduplicated ? 200 : 201,
    message: result.deduplicated
      ? "Duplicate Message-ID detected — skipped inserting duplicate row"
      : "Email captured and stored in D1",
    data: result,
  });
});
