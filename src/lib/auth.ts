// Simplified token decoder for demo tokens
const decodeToken = (token: string) => {
  try {
    // For demo tokens like "access_1_1234567890" or "refresh_1_1234567890"
    if (token.startsWith('access_') || token.startsWith('refresh_')) {
      const parts = token.split('_');
      if (parts.length >= 3) {
        const userId = parts[1];
        const timestamp = parseInt(parts[2]);
        const exp = timestamp + (24 * 60 * 60); // 24 hours from creation
        
        return {
          user_id: userId,
          username: userId === '1' ? 'admin' : 'user',
          role: userId === '1' ? 'admin' : 'user',
          exp: exp,
          iat: timestamp
        };
      }
    }
    
    // Try to decode as real JWT if it's not a demo token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export interface JWTPayload {
  user_id: string;
  username: string;
  role: 'admin' | 'user';
  exp: number;
  iat: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

class AuthManager {
  private static instance: AuthManager;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Token Storage
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    this.scheduleTokenRefresh();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  // Token Validation
  isTokenValid(token: string): boolean {
    try {
      const decoded = decodeToken(token);
      if (!decoded) return false;
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
    try {
      const decoded = decodeToken(token);
      if (!decoded) return true;
      const currentTime = Date.now() / 1000;
      const thresholdSeconds = thresholdMinutes * 60;
      return decoded.exp - currentTime < thresholdSeconds;
    } catch {
      return true;
    }
  }

  getTokenPayload(token: string): JWTPayload | null {
    try {
      return decodeToken(token);
    } catch {
      return null;
    }
  }

  // Automatic Token Refresh
  async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        const checkRefresh = () => {
          if (!this.isRefreshing) {
            resolve(this.getAccessToken());
          } else {
            setTimeout(checkRefresh, 100);
          }
        };
        checkRefresh();
      });
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.isRefreshing = true;

    try {
      const response = await fetch('/api/auth/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens({
          access: data.access,
          refresh: data.refresh || refreshToken,
        });
        this.isRefreshing = false;
        return data.access;
      } else {
        // Refresh token is invalid, clear tokens
        this.clearTokens();
        this.isRefreshing = false;
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      this.isRefreshing = false;
      return null;
    }
  }

  // Schedule automatic refresh
  scheduleTokenRefresh(): void {
    const accessToken = this.getAccessToken();
    if (!accessToken) return;

    const payload = this.getTokenPayload(accessToken);
    if (!payload) return;

    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    const refreshTime = Math.max(timeUntilExpiry - 300, 0); // Refresh 5 minutes before expiry

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    this.refreshTimeout = setTimeout(async () => {
      await this.refreshAccessToken();
    }, refreshTime * 1000);
  }

  // Secure API Request Helper
  async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // For demo, don't add authentication headers since backend uses AllowAny
    const headers = {
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

    return response;
  }

  // Logout
  logout(): void {
    this.clearTokens();
    // Redirect to login page
    window.location.href = '/auth';
  }

  // Get current user info
  getCurrentUser(): any {
    try {
      // Try to get user from localStorage first (for full user data)
      const storedUser = localStorage.getItem('demo_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      
      // Fallback to token payload
      const token = this.getAccessToken();
      if (!token) return null;
      return this.getTokenPayload(token);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token ? this.isTokenValid(token) : false;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}

export const authManager = AuthManager.getInstance();

// Export utility functions
export const getAccessToken = () => authManager.getAccessToken();
export const isAuthenticated = () => authManager.isAuthenticated();
export const isAdmin = () => authManager.isAdmin();
export const logout = () => authManager.logout();
export const makeAuthenticatedRequest = (url: string, options?: RequestInit) =>
  authManager.makeAuthenticatedRequest(url, options); 