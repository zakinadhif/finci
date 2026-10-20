import { env } from "cloudflare:workers";
import { createAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = createAuth(env, (req as any).cf);
  return auth.handler(req);
}

export async function POST(req: Request) {
  const auth = createAuth(env, (req as any).cf);
  return auth.handler(req);
}
