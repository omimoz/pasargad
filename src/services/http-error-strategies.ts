import type {
  ApiErrorStrategy,
  BadRequestError,
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  UnhandledError,
  ValidationError,
} from "./http-errors.interface";

export const badRequestErrorStrategy: ApiErrorStrategy = (errorData) => {
  throw { ...errorData } as BadRequestError;
};
export const validationErrorStrategy: ApiErrorStrategy = (errorData) => {
  throw { ...errorData } as ValidationError;
};
export const unauthorizedErrorStrategy: ApiErrorStrategy = (errorData) => {
  throw {
    ...errorData,
    detail: "you don't have permission",
  } as UnauthorizedError;
};
export const notFoundErrorStrategy: ApiErrorStrategy = (errorData) => {
  throw { ...errorData, detail: "service not found" } as NotFoundError;
};
export const unhandledErrorStrategy: ApiErrorStrategy = (errorData) => {
  throw { ...errorData, detail: "server error" } as UnhandledError;
};
export const networkErrorStrategy = () => {
  throw { detail: "network error" } as NetworkError;
};
const errorHandler: Record<number, ApiErrorStrategy> = {
  400: (errorData) =>
    (errorData.errors ? validationErrorStrategy : badRequestErrorStrategy)(
      errorData
    ),
  403: unauthorizedErrorStrategy,
  404: notFoundErrorStrategy,
  500: unhandledErrorStrategy,
};
export default errorHandler;
