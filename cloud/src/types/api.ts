export interface ApiSuccess<T> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Nicht gefunden') {
    super(404, 'NOT_FOUND', message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Zugriff verweigert') {
    super(403, 'FORBIDDEN', message)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Konflikt') {
    super(409, 'CONFLICT', message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Nicht autorisiert') {
    super(401, 'UNAUTHORIZED', message)
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validierungsfehler', public details?: unknown) {
    super(400, 'VALIDATION_ERROR', message)
  }
}
