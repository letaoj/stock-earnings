import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add API key
    this.client.interceptors.request.use(
      (config) => {
        if (API_CONFIG.apiKey) {
          config.headers['X-API-Key'] = API_CONFIG.apiKey;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { _retry?: number };

        if (!config) {
          return Promise.reject(error);
        }

        // Retry logic for network errors or 5xx errors
        if (
          (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
          (config._retry || 0) < API_CONFIG.retryAttempts
        ) {
          config._retry = (config._retry || 0) + 1;

          // Wait before retrying
          await new Promise(resolve =>
            setTimeout(resolve, API_CONFIG.retryDelay * config._retry!)
          );

          return this.client.request(config);
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = new APIClient();
