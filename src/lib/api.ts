import { authManager, makeAuthenticatedRequest } from './auth';

// Read from Vite env in production, fallback to local dev
export const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:8000/api';

// Debug: Log the API URL being used
console.log('=== DEBUG INFO ===');
console.log('import.meta.env:', (import.meta as any)?.env);
console.log('VITE_API_URL env var:', (import.meta as any)?.env?.VITE_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('==================');

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  is_admin: boolean;
  phone_number?: string;
  address?: string;
}

export interface ImageUpload {
  image_id: string;
  image_url: string;
  location: string;
  latitude?: number;
  longitude?: number;
  uploaded_at: string;
  status: 'pending' | 'processing' | 'completed' | 'ml_failed' | 'ml_unavailable';
  processed_image_url?: string;
  analysis_results?: any;
  error_message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`Making API request to: ${url}`);

      // For now, don't add authentication headers since backend uses AllowAny
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Remove Content-Type for FormData requests
      if (options.body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error ${response.status}: ${errorText}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();
      console.log(`API response data:`, data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Health checks
  async checkUserServiceHealth(): Promise<ApiResponse> {
    return this.request('/users/health/');
  }

  async checkImageServiceHealth(): Promise<ApiResponse> {
    return this.request('/images/health/');
  }

  // Authentication
  async login(username: string, password: string): Promise<ApiResponse<{ user: User; tokens: any }>> {
    const response = await this.request('/users/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data) {
      // Store tokens
      authManager.setTokens({
        access: response.data.access,
        refresh: response.data.refresh,
      });
    }

    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    phone_number?: string;
    address?: string;
  }): Promise<ApiResponse<User>> {
    return this.request('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/users/logout/', {
        method: 'POST',
      });
    } finally {
      authManager.logout();
    }
  }

  // User management
  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request('/users/profile/');
  }

  async updateUserProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/users/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Image management
  async uploadImage(
    imageFile: File,
    location: string,
    latitude?: number,
    longitude?: number,
    skip_ml: boolean = false,
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<ImageUpload>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('location', location);
    formData.append('skip_ml', skip_ml.toString());
    if (latitude !== undefined) formData.append('latitude', latitude.toString());
    if (longitude !== undefined) formData.append('longitude', longitude.toString());

    // Use XMLHttpRequest for upload progress if a callback is provided
    if (typeof onProgress === 'function') {
      return new Promise<ApiResponse<ImageUpload>>((resolve) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${this.baseUrl}/images/upload/`, true);
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const percent = Math.round((evt.loaded / evt.total) * 100);
              onProgress(percent);
            }
          };
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  resolve({ success: true, data });
                } catch (e) {
                  resolve({ success: false, error: 'Invalid JSON response' });
                }
              } else {
                resolve({ success: false, error: `HTTP ${xhr.status}: ${xhr.responseText}` });
              }
            }
          };
          xhr.send(formData);
        } catch (e) {
          resolve({ success: false, error: e instanceof Error ? e.message : 'Upload failed' });
        }
      });
    }

    // Fallback to fetch without progress
    return this.request('/images/upload/', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async getUserImages(): Promise<ApiResponse<ImageUpload[]>> {
    return this.request('/images/list/');
  }

  async getImageDetails(imageId: string): Promise<ApiResponse<ImageUpload>> {
    return this.request(`/images/${imageId}/`);
  }

  async deleteImage(imageId: string): Promise<ApiResponse> {
    return this.request(`/images/${imageId}/delete/`, {
      method: 'DELETE',
    });
  }

  async reprocessImage(imageId: string, options: {
    use_roboflow?: boolean;
    confidence_threshold?: number;
    min_detection_size?: number;
    max_detections?: number;
  } = {}): Promise<ApiResponse> {
    return this.request(`/images/${imageId}/reprocess/`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  // Admin functions
  async getSystemHealth(): Promise<ApiResponse> {
    return this.request('/admin/health/');
  }

  async getAnalytics(): Promise<ApiResponse> {
    return this.request('/admin/analytics/');
  }

  async updateMLConfig(config: any): Promise<ApiResponse> {
    return this.request('/admin/ml-config/', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL); 