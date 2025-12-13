import { API_CONFIG } from '../config/api';

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retries = 0): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers as any,
    };

    // Add API Key if configured (currently handled server-side, but keeping logic)
    if (API_CONFIG.apiKey) {
      (headers as any)['X-API-Key'] = API_CONFIG.apiKey;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle Retry Logic for 5xx errors
        if (response.status >= 500 && response.status < 600 && retries < API_CONFIG.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (retries + 1)));
          return this.request<T>(endpoint, options, retries + 1);
        }

        // Create enhanced error object
        const errorMessage = `API Error: ${response.status} ${response.statusText}`;
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }

      // Check for 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      // Handle Network Errors (fetch throws on network error) -> Retry
      if (retries < API_CONFIG.retryAttempts) {
        // Retry on network failure
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (retries + 1)));
        return this.request<T>(endpoint, options, retries + 1);
      }

      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new APIClient();
