import { apiSuccess, withApiHandler } from "@/lib/api-response";

// Example GET route
export const GET = withApiHandler("hello.GET", async () => {
  return apiSuccess({
    data: { message: "Hello from finci API" },
  });
});

