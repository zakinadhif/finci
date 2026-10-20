import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/server/http/errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function toHttpError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status }
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid request", issues: err.issues } },
      { status: 400 }
    );
  }

  console.error("[api] unhandled error:", err);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Something went wrong" } },
    { status: 500 }
  );
}
