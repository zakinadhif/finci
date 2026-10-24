import handler from "vinext/server/fetch-handler";
import { ingestRawEmail } from "@/lib/email-ingest";

export default {
  fetch: handler.fetch,

  async email(
    message: ForwardableEmailMessage,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    const headerMessageId =
      message.headers.get("message-id") ?? message.headers.get("Message-ID");

    const result = await ingestRawEmail(env.DB, {
      raw: message.raw,
      envelopeFrom: message.from,
      envelopeTo: message.to,
      headerMessageId,
    });

    console.log(
      `[email-worker] ${result.deduplicated ? "Deduplicated" : "Captured"} email`,
      {
        id: result.record.id,
        messageId: result.record.message_id,
        from: result.record.from_address,
        subject: result.record.subject,
      }
    );
  },
};
