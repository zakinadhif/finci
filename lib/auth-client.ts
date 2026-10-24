import { createAuthClient } from "better-auth/react";
import { cloudflareClient } from "better-auth-cloudflare/client";

export const authClient = createAuthClient({
  plugins: [cloudflareClient()],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
