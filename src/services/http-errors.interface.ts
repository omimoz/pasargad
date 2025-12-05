interface Problem {
  title: string;
  status: number;
  detail?: string;
  errors: Record<string, string[]>;
}
type BadRequestError = Problem
type UnauthorizedError = Problem
type ValidationError = Problem
type NotFoundError = Problem
type UnhandledError = Problem
type NetworkError = Problem
type ApiError =
  | BadRequestError
  | UnauthorizedError
  | ValidationError
  | NotFoundError
  | UnhandledError
  | NetworkError;
type ApiErrorStrategy = (errorData: ApiError) => void;
export type {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  UnhandledError,
  NetworkError,
  ApiError,
  ApiErrorStrategy,
};
