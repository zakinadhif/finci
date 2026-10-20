import { jsonOk, toHttpError } from "@/server/http/response";
// import { exampleSchema } from "@/server/schemas/example.schema";

// Example GET route
export async function GET() {
  try {
    return jsonOk({ message: "Hello from finci API" });
  } catch (err) {
    return toHttpError(err);
  }
}

// Example POST route
// export async function POST(req: Request) {
//   try {
//     const body = await req.json().catch(() => null);
//     const input = exampleSchema.parse(body ?? {});
//     return jsonOk(input, 201);
//   } catch (err) {
//     return toHttpError(err);
//   }
// }
