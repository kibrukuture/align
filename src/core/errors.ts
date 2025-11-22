export interface AlignApiErrorResponse {
  message?: string;
  code?: string;
}

export class AlignError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly requestId?: string;
  public readonly body?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    requestId?: string,
    body?: unknown
  ) {
    super(message);
    this.name = "AlignError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.body = body;
  }
}

export class AlignValidationError extends Error {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message);
    this.name = "AlignValidationError";
    this.errors = errors;
  }
}
