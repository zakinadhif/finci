import { ZodError } from 'zod';

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export type ApiZodIssue = ZodError['issues'][number];

export interface ApiSuccessResponse<T = undefined> {
  ok: true;
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  ok: false;
  message: string;
  error: {
    code: ApiErrorCode;
    issues?: ApiZodIssue[];
  };
}

export type ApiResponse<T = undefined> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export function apiSuccess<T = undefined>(options?: {
  data?: T;
  message?: string;
  status?: number;
  headers?: HeadersInit;
}): Response {
  const { data, message, status = 200, headers } = options ?? {};

  return Response.json(
    {
      ok: true,
      ...(message !== undefined ? { message } : {}),
      ...(data !== undefined ? { data } : {}),
    } satisfies ApiSuccessResponse<T>,
    { status, headers },
  );
}

export function apiError(
  message: string,
  options?: {
    code?: ApiErrorCode;
    status?: number;
    issues?: ApiZodIssue[];
    headers?: HeadersInit;
  },
): Response {
  const code = options?.code ?? 'BAD_REQUEST';
  const status = options?.status ?? STATUS_BY_CODE[code];

  return Response.json(
    {
      ok: false,
      message,
      error: {
        code,
        ...(options?.issues ? { issues: options.issues } : {}),
      },
    } satisfies ApiErrorResponse,
    { status, headers: options?.headers },
  );
}

export function withApiHandler(
  routeName: string,
  handler: (request: Request) => Promise<Response>,
) {
  return async (request: Request): Promise<Response> => {
    try {
      return await handler(request);
    } catch (err) {
      if (err instanceof ZodError) {
        return apiError(err.issues[0]?.message ?? 'Validation failed', {
          code: 'VALIDATION_ERROR',
          issues: err.issues,
        });
      }

      if (err instanceof SyntaxError) {
        return apiError('Invalid JSON payload', { code: 'BAD_REQUEST' });
      }

      console.error(`[${routeName}] unhandled error:`, err);
      return apiError('Internal server error', { code: 'INTERNAL_ERROR' });
    }
  };
}
