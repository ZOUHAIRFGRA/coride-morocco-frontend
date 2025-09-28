# CoRide Morocco - Base API Service

## Overview

The `BaseApiService` is a robust foundation class that provides consistent API handling across all services in the CoRide Morocco app. It includes automatic token management, error handling, request/response formatting, and other common functionality.

## 🏗️ Architecture

```
BaseApiService (Abstract Base)
├── AuthService (Authentication)
├── RidesApiService (Ride management)  
├── UserProfileApiService (User profiles)
└── [Other services...]
```

## ✨ Features

### **🔐 Authentication Management**
- Automatic token injection in requests
- Token refresh on 401 errors
- Flexible token storage interface
- Session management

### **🛡️ Error Handling**
- Consistent error format across all APIs
- Network error detection
- Timeout handling
- FastAPI error parsing

### **⚡ Request Management**
- HTTP method helpers (GET, POST, PUT, DELETE, PATCH)
- Automatic JSON serialization/deserialization
- Request timeout with AbortController
- Custom headers support

### **🔄 Response Processing**
- Unified response format
- Empty response handling
- Content-type detection
- Error message extraction

## 🚀 Quick Start

### **Creating a New Service**

```typescript
import { BaseApiService, defaultApiConfig, ApiResponse } from './BaseApiService';

interface MyDataType {
  id: number;
  name: string;
}

class MyApiService extends BaseApiService {
  constructor() {
    super(defaultApiConfig);
  }

  // GET request
  async getData(): Promise<ApiResponse<MyDataType[]>> {
    return this.get<MyDataType[]>('/my-endpoint');
  }

  // POST request
  async createData(data: Partial<MyDataType>): Promise<ApiResponse<MyDataType>> {
    return this.post<MyDataType>('/my-endpoint', data);
  }

  // Request without authentication
  async publicData(): Promise<ApiResponse<MyDataType[]>> {
    return this.get<MyDataType[]>('/public-endpoint', false);
  }
}

export const myApiService = new MyApiService();
```

### **Using Existing Services**

```typescript
import { authService, ridesApiService, userProfileApiService } from './services';

// Authentication
const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Rides
const rides = await ridesApiService.getMyRides();

// Profile
const profile = await userProfileApiService.getProfile();
```

## 🔧 Configuration

### **Default Configuration**

```typescript
export const defaultApiConfig: ApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
```

### **Custom Configuration**

```typescript
import { BaseApiService } from './BaseApiService';

const customConfig = {
  baseUrl: 'https://api.coride.ma',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0',
  },
};

class MyService extends BaseApiService {
  constructor() {
    super(customConfig);
  }
}
```

### **Runtime Configuration Updates**

```typescript
import { configureServices } from './services';

// Update all services at once
configureServices({
  baseUrl: 'https://api.coride.ma',
  timeout: 15000,
  headers: {
    'X-Environment': 'production',
  },
});

// Update individual service
authService.updateConfig({
  baseUrl: 'https://auth.coride.ma',
  timeout: 20000,
});
```

## 🔒 Token Management

### **Token Storage Interface**

```typescript
interface TokenStorage {
  getAccessToken(): Promise<string | null> | string | null;
  getRefreshToken(): Promise<string | null> | string | null;
  setTokens(accessToken: string, refreshToken: string): Promise<void> | void;
  clearTokens(): Promise<void> | void;
}
```

### **Custom Token Storage**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncTokenStorage implements TokenStorage {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem('access_token');
  }

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem('refresh_token');
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      ['access_token', accessToken],
      ['refresh_token', refreshToken],
    ]);
  }

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  }
}

// Use with service
const authService = new AuthService();
authService.setTokenStorage(new AsyncTokenStorage());
```

## 📝 API Response Format

### **Success Response**
```typescript
{
  success: true,
  data: T // Your data type
}
```

### **Error Response**
```typescript
{
  success: false,
  error: {
    message: string,      // User-friendly error message
    details?: string,     // Technical details
    field?: string,       // Field-specific error
    code?: string,        // Error code
    statusCode?: number   // HTTP status code
  }
}
```

## 🛠️ HTTP Methods

### **GET Request**
```typescript
// With authentication (default)
const response = await this.get<DataType>('/endpoint');

// Without authentication
const response = await this.get<DataType>('/public-endpoint', false);
```

### **POST Request**
```typescript
const response = await this.post<ResponseType>('/endpoint', {
  field1: 'value1',
  field2: 'value2',
});
```

### **PUT Request**
```typescript
const response = await this.put<ResponseType>('/endpoint/123', updateData);
```

### **DELETE Request**
```typescript
const response = await this.delete<ResponseType>('/endpoint/123');
```

### **PATCH Request**
```typescript
const response = await this.patch<ResponseType>('/endpoint/123', partialUpdate);
```

## ⚠️ Error Handling

### **Network Errors**
```typescript
{
  success: false,
  error: {
    message: 'Network error',
    details: 'Unable to connect to server. Please check your internet connection.',
    code: 'NETWORK_ERROR'
  }
}
```

### **Timeout Errors**
```typescript
{
  success: false,
  error: {
    message: 'Request timeout',
    details: 'The request took too long to complete',
    code: 'TIMEOUT'
  }
}
```

### **API Errors**
```typescript
{
  success: false,
  error: {
    message: 'Invalid email or password',
    details: 'Authentication failed',
    statusCode: 401
  }
}
```

## 🔄 Automatic Token Refresh

The base service automatically handles token refresh:

1. **401 Response Detected** → Attempt token refresh
2. **Refresh Success** → Retry original request with new token
3. **Refresh Failure** → Return 401 error to caller

```typescript
// This is handled automatically
const response = await this.get<UserData>('/protected-endpoint');
// If token expired, it will be refreshed and request retried
```

## 🧪 Testing Services

### **Service Health Check**
```typescript
import { checkServicesHealth } from './services';

const health = await checkServicesHealth();
console.log('Services status:', health);
// { auth: true, rides: true, profile: true }
```

### **Mock Service for Testing**
```typescript
class MockApiService extends BaseApiService {
  constructor() {
    super({ baseUrl: 'http://localhost:3000' });
  }

  protected async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Return mock data
    return {
      success: true,
      data: mockData as T,
    };
  }
}
```

## 🔧 Advanced Usage

### **Custom Headers Per Request**
```typescript
const response = await this.request<DataType>('/endpoint', {
  method: 'POST',
  headers: {
    'X-Custom-Header': 'value',
  },
  body: JSON.stringify(data),
});
```

### **File Upload**
```typescript
async uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);

  return this.request<UploadResponse>('/upload', {
    method: 'POST',
    body: formData,
    headers: {}, // Don't set Content-Type for FormData
  });
}
```

### **Query Parameters**
```typescript
async searchData(params: SearchParams): Promise<ApiResponse<DataType[]>> {
  const queryString = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryString.append(key, value.toString());
    }
  });

  return this.get<DataType[]>(`/search?${queryString}`);
}
```

## 🚀 Production Considerations

### **Environment Configuration**
```typescript
// Set up different configs for different environments
const getApiConfig = () => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return {
        baseUrl: 'https://api.coride.ma',
        timeout: 30000,
      };
    case 'staging':
      return {
        baseUrl: 'https://staging-api.coride.ma',
        timeout: 20000,
      };
    default:
      return defaultApiConfig;
  }
};
```

### **Error Logging**
```typescript
// Override error handling for logging
class ProductionApiService extends BaseApiService {
  protected handleError<T>(error: any): ApiResponse<T> {
    // Log error to analytics service
    analytics.logError(error);
    
    return super.handleError(error);
  }
}
```

### **Request Interceptors**
```typescript
// Add request logging or modification
protected async request<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> {
  // Log request for debugging
  console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);
  
  // Add request timestamp
  const requestOptions = {
    ...options,
    headers: {
      ...options.headers,
      'X-Request-Timestamp': new Date().toISOString(),
    },
  };

  return super.request<T>(endpoint, requestOptions, requiresAuth);
}
```

## 🤝 Contributing

When adding new API services:

1. **Extend BaseApiService** for consistency
2. **Define proper TypeScript interfaces** for requests/responses
3. **Handle service-specific errors** appropriately
4. **Add proper JSDoc comments** for methods
5. **Export service instance** for easy importing
6. **Update services index** for central access

---

**Built for scalable, maintainable API architecture** 🚀