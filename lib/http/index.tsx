import { APP_CONFIG, CONSTANTS } from "@/config";
import { HTTP_CONFIG } from "@/config/api";
import { isDebugEnabled } from "@/config/env";
import { UserCredential } from "@/types/auth";
import axios, {
  type AxiosInstance,
  AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import qs from "qs";
import type { ApiError, ApiResponse, HttpError } from "./types";

class HttpClient {
  private readonly instance: AxiosInstance;

  constructor(baseURL = HTTP_CONFIG.API_BASE_URL) {
    const normalizedBaseURL = baseURL.endsWith("/")
      ? baseURL.slice(0, -1)
      : baseURL;
    const versionedBaseURL = `${normalizedBaseURL}/v1`;
    this.instance = axios.create({
      baseURL: versionedBaseURL,
      timeout: HTTP_CONFIG.TIMEOUT,
      withCredentials: HTTP_CONFIG.WITH_CREDENTIALS,
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: "repeat" }),
    });

    this.setupInterceptors();
  }

  private isOriginalResponse(data: ApiResponse): boolean {
    if (data === null || data === undefined) {
      return true;
    }
    if (CONSTANTS.MAGIC_VALUE.ERROR in data) {
      return false;
    }
    return (
      CONSTANTS.MAGIC_VALUE.ACCESS_TOKEN in data ||
      !(CONSTANTS.MAGIC_VALUE.DATA in data)
    );
  }

  private isFileAttachment(response: AxiosResponse): boolean {
    const contentDisposition = response.headers?.["content-disposition"];
    return !!contentDisposition && contentDisposition.includes("attachment");
  }

  private isStreamingResponse(response: AxiosResponse): boolean {
    const contentType = response.headers?.["content-type"];
    const transferEncoding = response.headers?.["transfer-encoding"];

    return (
      contentType?.includes("application/octet-stream") ||
      response.data instanceof ReadableStream
    );
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        if (isDebugEnabled()) {
          console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }
        // Add authentication token
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token.access_token}`;
        }

        return config;
      },
      (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        const { data } = response;
        if (
          this.isFileAttachment(response) ||
          this.isStreamingResponse(response)
        ) {
          return response;
        } else if (this.isOriginalResponse(data)) {
          return data;
        }

        const errResp = data as ApiError;
        const errorData = errResp.error;

        switch (errorData.code) {
          case HTTP_CONFIG.STATUS_CODES.UNAUTHORIZED:
            // Unauthorized, clear token and redirect to login page
            this.handleUnauthorized();
            break;
          case HTTP_CONFIG.STATUS_CODES.TOKEN_EXPIRED:
          // Refresh token
          default:
            const errorMsg =
              errorData?.message || `Request failed (${errorData.code})`;
            return Promise.reject(new Error(errorMsg));
        }

        return response;
      },
      (error) => {
        console.error("❌ Response Error:", error);
        // Handle network errors
        if (!error.response || error.response.status === 500) {
          const networkErrorMsg =
            "Network connection failed, please check your network settings";
          const networkError = new Error(networkErrorMsg) as HttpError;
          return Promise.reject(networkError);
        }

        const { status, data } = error.response;
        if (status === HTTP_CONFIG.STATUS_CODES.UNAUTHORIZED) {
          this.handleUnauthorized();
        }
        const defaultError = new Error(
          data?.msg || `Request failed (${status})`
        ) as HttpError;
        defaultError.code = status;
        return Promise.reject(defaultError);
      }
    );
  }

  public getToken(): UserCredential | null {
    // Get token from localStorage
    try {
      const authStorage = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH);
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.error("Failed to get token from localStorage:", error);
    }
    return null;
  }

  private handleUnauthorized() {
    // Clear authentication information
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH);

    // Redirect to login page
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href = "/";
      }
    }
  }

  // GET request
  async get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.get(url, { params, ...config });
  }

  // POST request
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.post(url, data, config);
  }

  // PUT request
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.put(url, data, config);
  }

  // DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, { ...config });
  }

  // File upload
  async upload<T = any>(
    url: string,
    file: File,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    return this.instance.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Batch upload
  async uploadMultiple<T = any>(
    url: string,
    files: File[],
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    return this.instance.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Download file
  async download(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: "blob",
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Cancel request
  createCancelToken() {
    return axios.CancelToken.source();
  }
}

// Create default instance
const httpClient = new HttpClient();

export default httpClient;

export const fetcher = (url: string, params?: any) =>
  httpClient.get(url, params).then((res) => res);
