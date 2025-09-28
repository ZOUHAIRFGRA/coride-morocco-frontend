# 🔐 CoRide Morocco Backend - Authentication API Documentation

## 📋 Overview
This document provides complete authentication API documentation for CoRide Morocco Backend. All authentication endpoints are prefixed with `/api/auth/`.

**Base URL**: `https://trusted-frank-mudfish.ngrok-free.app/api/auth/` or `http://localhost:8000/api/auth/`

---

## 🚀 Authentication Endpoints

### 1. 👤 User Registration
**Endpoint**: `POST /api/auth/register`

**Description**: Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "first_name": "John",
  "last_name": "Doe", 
  "phone": "+212617272293",
  "preferred_language": "fr",
  "role": "rider"
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string (email) | ✅ | Valid email address |
| `password` | string | ✅ | Strong password (see requirements below) |
| `first_name` | string | ✅ | User's first name |
| `last_name` | string | ✅ | User's last name |
| `phone` | string | ❌ | Moroccan phone number (+212XXXXXXXXX or 06XXXXXXXX/07XXXXXXXX) |
| `preferred_language` | string | ❌ | Language preference (default: "fr") |
| `role` | string | ❌ | User role: "rider", "driver", "admin", "moderator" (default: "rider") |

**Password Requirements**:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)  
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*(),.?\":{}|<>[]+=_-~/`;\\)

**Success Response (201 Created)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "+212617272293",
  "first_name": "John",
  "last_name": "Doe",
  "role": "rider",
  "is_verified": true,
  "email_verified": false,
  "phone_verified": false,
  "preferred_language": "fr",
  "rating_average": null,
  "rating_count": 0
}
```

**Error Responses**:

**400 Bad Request - Email Already Exists**:
```json
{
  "message": "Email already registered",
  "error_code": "HTTP_400",
  "type": "http_error"
}
```

**400 Bad Request - Phone Already Exists**:
```json
{
  "message": "Phone number already registered", 
  "error_code": "HTTP_400",
  "type": "http_error"
}
```

**422 Validation Error**:
```json
{
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field_errors": {
      "email": ["Invalid email address format"],
      "password": ["Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>[]+=_-~/`;\\)"],
      "phone": ["Invalid Moroccan phone number format. Use +212XXXXXXXXX or 06XXXXXXXX/07XXXXXXXX"]
    },
    "total_errors": 3
  },
  "type": "validation_error"
}
```

---

### 2. 🔑 User Login
**Endpoint**: `POST /api/auth/login`

**Description**: Authenticate user and receive access tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string (email) | ✅ | User's email address |
| `password` | string | ✅ | User's password |

**Success Response (200 OK)**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

**Response Schema**:
| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | JWT access token for API authentication |
| `refresh_token` | string | JWT refresh token for token renewal |
| `token_type` | string | Token type (always "bearer") |
| `expires_in` | integer | Access token expiration time in seconds |

**Error Responses**:

**401 Unauthorized - Invalid Credentials**:
```json
{
  "message": "Invalid email or password",
  "error_code": "HTTP_401", 
  "type": "http_error"
}
```

**401 Unauthorized - Account Deactivated**:
```json
{
  "message": "Account is deactivated",
  "error_code": "HTTP_401",
  "type": "http_error"
}
```

---

### 3. 🔄 Refresh Token
**Endpoint**: `POST /api/auth/refresh`

**Description**: Get new access token using refresh token

**Request Body**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Success Response (200 OK)**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

**Error Responses**:

**401 Unauthorized - Invalid Token**:
```json
{
  "message": "Invalid or expired token",
  "error_code": "HTTP_401",
  "type": "http_error"
}
```

---

### 4. 👤 Get Current User
**Endpoint**: `GET /api/auth/me`

**Description**: Get current authenticated user information

**Authentication**: Required (Bearer Token)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "+212617272293",
  "first_name": "John",
  "last_name": "Doe",
  "role": "rider",
  "is_verified": true,
  "email_verified": false,
  "phone_verified": false,
  "preferred_language": "fr",
  "rating_average": 4.5,
  "rating_count": 23
}
```

**Error Responses**:

**401 Unauthorized - Missing Token**:
```json
{
  "message": "Authorization header is missing",
  "error_code": "MISSING_AUTH_HEADER",
  "details": {
    "header_format": "Authorization: Bearer <token>"
  }
}
```

**401 Unauthorized - Invalid Token**:
```json
{
  "message": "Invalid or expired token",
  "error_code": "INVALID_TOKEN",
  "details": {
    "action": "Please login again to get a new token"
  }
}
```

---

### 5. 🔐 Change Password
**Endpoint**: `PUT /api/auth/change-password`

**Description**: Change user's password

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewStrongPass456@"
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `current_password` | string | ✅ | User's current password |
| `new_password` | string | ✅ | New password (must meet strength requirements) |

**Success Response (200 OK)**:
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses**:

**400 Bad Request - Invalid Current Password**:
```json
{
  "message": "Invalid current password",
  "error_code": "HTTP_400",
  "type": "http_error"
}
```

**422 Validation Error - Weak New Password**:
```json
{
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field_errors": {
      "new_password": ["Password must contain at least one uppercase letter"]
    },
    "total_errors": 1
  },
  "type": "validation_error"
}
```

---

### 6. ✉️ Verify Email
**Endpoint**: `POST /api/auth/verify-email?verification_code=ABC123`

**Description**: Verify user's email address with verification code

**Authentication**: Required (Bearer Token)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `verification_code` | string | ✅ | 6-digit verification code sent to email |

**Success Response (200 OK)**:
```json
{
  "message": "Email verified successfully"
}
```

**Error Responses**:

**400 Bad Request - Invalid Code**:
```json
{
  "message": "Invalid or expired verification code",
  "error_code": "HTTP_400",
  "type": "http_error"
}
```

---

### 7. 📧 Resend Email Verification
**Endpoint**: `POST /api/auth/resend-verification`

**Description**: Resend email verification code

**Authentication**: Required (Bearer Token)

**Success Response (200 OK)**:
```json
{
  "message": "Verification code sent"
}
```

**Error Responses**:

**400 Bad Request - Already Verified**:
```json
{
  "message": "Email already verified",
  "error_code": "HTTP_400", 
  "type": "http_error"
}
```

---

### 8. 🚪 Logout
**Endpoint**: `POST /api/auth/logout`

**Description**: Logout user (client should discard tokens)

**Authentication**: Required (Bearer Token)

**Success Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

---

## 🔧 Authentication Headers

For protected endpoints, include the access token in the Authorization header:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## 📊 HTTP Status Codes

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `200` | OK | Successful request |
| `201` | Created | User successfully registered |
| `400` | Bad Request | Invalid request data or business logic error |
| `401` | Unauthorized | Invalid credentials or missing/invalid token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists (duplicate email/phone) |
| `422` | Unprocessable Entity | Validation errors in request body |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Database or external service unavailable |

---

## 🚨 Common Error Response Format

All errors follow this consistent structure:

```json
{
  "message": "Human-readable error description",
  "error_code": "MACHINE_READABLE_ERROR_CODE",
  "details": {
    "additional": "contextual information"
  },
  "type": "error_category"
}
```

**Error Types**:
- `validation_error` - Input validation failures
- `http_error` - HTTP protocol errors
- `api_error` - Business logic errors
- `internal_error` - Server errors

---

## 🔐 Security Notes

### Rate Limiting
Authentication endpoints are rate-limited to prevent abuse:
- **Limit**: 60 requests per minute per IP
- **Headers**: Response includes rate limit information
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window

### Token Security
- **Access Token**: Expires in 24 hours
- **Refresh Token**: Expires in 30 days
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Storage**: Store tokens securely (avoid localStorage for sensitive apps)

### Phone Number Validation
Moroccan phone numbers only:
- **International**: `+212617272293`, `+212712345678`
- **Local**: `0617272293`, `0712345678`
- **Pattern**: Must start with 6 or 7 (mobile numbers)

---

## 📝 Frontend Integration Examples

### JavaScript/TypeScript

```javascript
// Registration
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};

// Login  
const loginUser = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store tokens securely
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
  }
  
  return data;
};

// Authenticated requests
const getCurrentUser = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### React Native/Expo

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://your-domain.com/api';

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    return response.json();
  },
  
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
    }
    
    return data;
  },
  
  getCurrentUser: async () => {
    const token = await AsyncStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.json();
  }
};
```

---

## 🧪 Testing with cURL

```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "phone": "0617272293"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "TestPass123!"
  }'

# Get current user (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

**Last Updated**: September 28, 2025  
**API Version**: 1.0.0  
**Contact**: zouhairfgra@gmail.com