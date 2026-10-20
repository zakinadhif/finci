import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import type { IncomingRequestCfProperties } from "@cloudflare/workers-types";

export function createAuth(env?: any, cf?: IncomingRequestCfProperties) {
  return betterAuth({
    baseURL: env?.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL,
    secret: env?.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    ...withCloudflare(
      {
        autoDetectIpAddress: !!cf,
        geolocationTracking: false,
        cf: cf || {},
        d1Native: env?.DB,
      },
      {
        emailAndPassword: {
          enabled: true,
        },
        verification: {
          storeInDatabase: true,
        },
      }
    ),
    ...(env ? {} : { database: { provider: "sqlite" } }),
  });
}

export const auth = createAuth();
export type Auth = ReturnType<typeof createAuth>;
