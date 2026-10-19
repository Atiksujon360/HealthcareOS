export type AppErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(message: string, code: AppErrorCode = 'INTERNAL_ERROR', status = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.status < 500) return error.message;
  return 'Something went wrong. Please try again.';
}
