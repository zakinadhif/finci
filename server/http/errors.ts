export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const notFound = (message = "Resource not found") =>
  new ApiError(404, "NOT_FOUND", message);

export const badRequest = (message: string) =>
  new ApiError(400, "BAD_REQUEST", message);
