import axios, {
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type AxiosResponse,
  AxiosError,
} from "axios";
import type { ApiError } from "./http-errors.interface";
import errorHandler, { networkErrorStrategy } from "./http-error-strategies";


const baseUrl = import.meta.env.VITE_BASE_URL;
const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const statusCode = error.response.status;
      if (statusCode >= 400) {
        const errorData: ApiError = error.response.data as ApiError;
        return errorHandler[statusCode](errorData);
      } else {
        networkErrorStrategy();
      }
    }
  }
);
async function fetcher<T>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const response: AxiosResponse<T> = await api(url, options);
  return response.data as T;
}
async function readData<T>(
  url: string,
  headers?: AxiosRequestHeaders
): Promise<T> {
  const options: AxiosRequestConfig = {
    headers: headers,
    method: "GET",
  };
  return await fetcher<T>(url, options);
}
async function createData<TModel, TResult>(
  url: string,
  data: TModel,
  headers?: AxiosRequestHeaders
): Promise<TResult> {
  const options: AxiosRequestConfig = {
    headers: headers,
    method: "POST",
    data: JSON.stringify(data),
  };
  return await fetcher<TResult>(url, options);
}
async function updateData<TModel, TResult>(
  url: string,
  data: TModel,
  headers?: AxiosRequestHeaders
): Promise<TResult> {
  const options: AxiosRequestConfig = {
    headers: headers,
    method: "PUT",
    data: JSON.stringify(data),
  };
  return await fetcher<TResult>(url, options);
}
async function deleteData(
  url: string,
  headers?: AxiosRequestHeaders
): Promise<void> {
  const options: AxiosRequestConfig = {
    headers: headers,
    method: "DELETE",
  };
  return await fetcher<void>(url, options);
}
export { readData, createData, updateData, deleteData };
