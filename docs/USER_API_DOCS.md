# 👤 CoRide Morocco Backend - User Management API Documentation

## 📋 Overview
This document provides complete User Management API documentation for CoRide Morocco Backend Phase 2. All user management endpoints are prefixed with `/api/users/`.

**Base URL**: `https://your-domain.com/api/users/` or `http://localhost:8000/api/users/`

**Authentication**: All endpoints require JWT Bearer token authentication.

---

## 🚀 User Management Endpoints

### 1. 👤 Get User Profile
**Endpoint**: `GET /api/users/profile`

**Description**: Get current user's complete profile information

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
  "bio": "Love carpooling and meeting new people!",
  "profile_photo_url": "/uploads/profile_photos/1_abc123.jpg",
  "rating_average": 4.5,
  "rating_count": 23,
  "created_at": "2025-09-25T10:30:00Z",
  "last_login": "2025-09-28T14:00:00Z",
  "music_preference": "background",
  "conversation_preference": "chatty",
  "smoking_allowed": false,
  "pets_allowed": true,
  "air_conditioning": true,
  "max_detour_minutes": 15
}
```

**Response Schema**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `email` | string | User's email address |
| `phone` | string | Phone number (+212XXXXXXXXX format) |
| `first_name` | string | User's first name |
| `last_name` | string | User's last name |
| `role` | string | User role: "rider", "driver", "admin", "moderator" |
| `is_verified` | boolean | Overall verification status |
| `email_verified` | boolean | Email verification status |
| `phone_verified` | boolean | Phone verification status |
| `preferred_language` | string | Language preference (fr, ar, en) |
| `bio` | string | User biography (max 500 characters) |
| `profile_photo_url` | string | Profile photo URL |
| `rating_average` | number | Average user rating (0-5) |
| `rating_count` | integer | Number of ratings received |
| `created_at` | string | Account creation timestamp |
| `last_login` | string | Last login timestamp |
| `music_preference` | string | Music preference: "quiet", "background", "any" |
| `conversation_preference` | string | Conversation preference: "chatty", "quiet", "any" |
| `smoking_allowed` | boolean | Allows smoking in rides |
| `pets_allowed` | boolean | Allows pets in rides |
| `air_conditioning` | boolean | Air conditioning preference |
| `max_detour_minutes` | integer | Maximum detour time in minutes (0-60) |

---

### 2. ✏️ Update User Profile
**Endpoint**: `PUT /api/users/profile`

**Description**: Update user profile information

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+212617272293",
  "preferred_language": "fr",
  "bio": "Love carpooling and meeting new people!"
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | ❌ | User's first name |
| `last_name` | string | ❌ | User's last name |
| `phone` | string | ❌ | Moroccan phone number (+212XXXXXXXXX or 06XXXXXXXX/07XXXXXXXX) |
| `preferred_language` | string | ❌ | Language preference (fr, ar, en) |
| `bio` | string | ❌ | Biography (max 500 characters) |

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
  "bio": "Love carpooling and meeting new people!",
  "profile_photo_url": "/uploads/profile_photos/1_abc123.jpg",
  "rating_average": 4.5,
  "rating_count": 23,
  "created_at": "2025-09-25T10:30:00Z",
  "last_login": "2025-09-28T14:00:00Z",
  "music_preference": "background",
  "conversation_preference": "chatty",
  "smoking_allowed": false,
  "pets_allowed": true,
  "air_conditioning": true,
  "max_detour_minutes": 15
}
```

**Error Responses**:

**400 Bad Request - Phone Already Taken**:
```json
{
  "message": "Phone number is already registered by another user",
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
      "phone": ["Invalid Moroccan phone number format. Use +212XXXXXXXXX or 06XXXXXXXX/07XXXXXXXX"],
      "bio": ["Bio must be less than 500 characters"]
    },
    "total_errors": 2
  },
  "type": "validation_error"
}
```

---

### 3. 📸 Upload Profile Photo
**Endpoint**: `POST /api/users/profile/photo`

**Description**: Upload user profile photo to Cloudinary with automatic optimization

**Authentication**: Required (Bearer Token)

**Request**: Multipart form data
- **File**: `photo` (image file, max 10MB)

**Content-Type**: `multipart/form-data`

**Success Response (200 OK)**:
```json
{
  "message": "Profile photo uploaded successfully",
  "photo_url": "https://res.cloudinary.com/dj2ynb4rg/image/upload/c_fill,w_400,h_400,f_auto,q_auto/coride/profile_photos/user_123/1727528300_profile.jpg",
  "public_id": "coride/profile_photos/user_123/1727528300_profile"
}
```

**Error Responses**:

**400 Bad Request - Invalid File Type**:
```json
{
  "message": "Only image files are allowed",
  "error_code": "HTTP_400",
  "type": "http_error"
}
```

**400 Bad Request - File Too Large**:
```json
{
  "message": "File size must be less than 10MB",
  "error_code": "HTTP_400",
  "type": "http_error"
}
```

**500 Internal Server Error - Upload Failed**:
```json
{
  "message": "Failed to upload image to Cloudinary",
  "error_code": "HTTP_500",
  "type": "http_error"
}
```

---

## 🎛️ User Preferences Endpoints

### 4. 🎵 Get User Preferences
**Endpoint**: `GET /api/users/preferences`

**Description**: Get user ride preferences and settings

**Authentication**: Required (Bearer Token)

**Success Response (200 OK)**:
```json
{
  "music_preference": "background",
  "conversation_preference": "chatty",
  "smoking_allowed": false,
  "pets_allowed": true,
  "air_conditioning": true,
  "max_detour_minutes": 15
}
```

**Response Schema**:
| Field | Type | Description |
|-------|------|-------------|
| `music_preference` | string | Music preference: "quiet", "background", "any" |
| `conversation_preference` | string | Conversation preference: "chatty", "quiet", "any" |
| `smoking_allowed` | boolean | Allows smoking in rides |
| `pets_allowed` | boolean | Allows pets in rides |
| `air_conditioning` | boolean | Air conditioning preference |
| `max_detour_minutes` | integer | Maximum detour time in minutes (0-60) |

---

### 5. 🎛️ Update User Preferences
**Endpoint**: `PUT /api/users/preferences`

**Description**: Update user ride preferences and settings

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "music_preference": "background",
  "conversation_preference": "chatty",
  "smoking_allowed": false,
  "pets_allowed": true,
  "air_conditioning": true,
  "max_detour_minutes": 15
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `music_preference` | string | ❌ | Music preference: "quiet", "background", "any" |
| `conversation_preference` | string | ❌ | Conversation preference: "chatty", "quiet", "any" |
| `smoking_allowed` | boolean | ❌ | Allows smoking in rides |
| `pets_allowed` | boolean | ❌ | Allows pets in rides |
| `air_conditioning` | boolean | ❌ | Air conditioning preference |
| `max_detour_minutes` | integer | ❌ | Maximum detour time in minutes (0-60) |

**Success Response (200 OK)**:
```json
{
  "music_preference": "background",
  "conversation_preference": "chatty",
  "smoking_allowed": false,
  "pets_allowed": true,
  "air_conditioning": true,
  "max_detour_minutes": 15
}
```

**Error Responses**:

**422 Validation Error**:
```json
{
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field_errors": {
      "music_preference": ["Music preference must be 'quiet', 'background', or 'any'"],
      "max_detour_minutes": ["Max detour must be between 0 and 60 minutes"]
    },
    "total_errors": 2
  },
  "type": "validation_error"
}
```

---

## 📍 User Locations Endpoints

### 6. 📍 Get User Locations
**Endpoint**: `GET /api/users/locations`

**Description**: Get all saved locations for the current user

**Authentication**: Required (Bearer Token)

**Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Home",
    "address": "Rue Mohammed V, Casablanca, Morocco",
    "latitude": 33.5731,
    "longitude": -7.5898,
    "location_type": "home",
    "created_at": "2025-09-25T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Work",
    "address": "Boulevard Zerktouni, Casablanca, Morocco",
    "latitude": 33.5897,
    "longitude": -7.6039,
    "location_type": "work",
    "created_at": "2025-09-26T08:15:00Z"
  }
]
```

**Response Schema**:
Each location object contains:
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Location ID |
| `name` | string | Location name |
| `address` | string | Full address |
| `latitude` | number | Latitude coordinate |
| `longitude` | number | Longitude coordinate |
| `location_type` | string | Type: "home", "work", "university", "other" |
| `created_at` | string | Creation timestamp |

---

### 7. 📍 Create User Location
**Endpoint**: `POST /api/users/locations`

**Description**: Create a new saved location for the current user

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "name": "Home",
  "address": "Rue Mohammed V, Casablanca, Morocco",
  "latitude": 33.5731,
  "longitude": -7.5898,
  "location_type": "home"
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Location name (min 2 characters) |
| `address` | string | ✅ | Full address |
| `latitude` | number | ✅ | Latitude (-90 to 90) |
| `longitude` | number | ✅ | Longitude (-180 to 180) |
| `location_type` | string | ✅ | Type: "home", "work", "university", "other" |

**Success Response (201 Created)**:
```json
{
  "id": 1,
  "name": "Home",
  "address": "Rue Mohammed V, Casablanca, Morocco",
  "latitude": 33.5731,
  "longitude": -7.5898,
  "location_type": "home",
  "created_at": "2025-09-25T10:30:00Z"
}
```

**Error Responses**:

**400 Bad Request - Duplicate Location Type**:
```json
{
  "message": "You already have a home location saved",
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
      "latitude": ["Latitude must be between -90 and 90"],
      "location_type": ["Location type must be 'home', 'work', 'university', or 'other'"]
    },
    "total_errors": 2
  },
  "type": "validation_error"
}
```

---

### 8. 🗑️ Delete User Location
**Endpoint**: `DELETE /api/users/locations/{location_id}`

**Description**: Delete a saved location

**Authentication**: Required (Bearer Token)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | integer | ✅ | Location ID to delete |

**Success Response (200 OK)**:
```json
{
  "message": "Location deleted successfully"
}
```

**Error Responses**:

**404 Not Found**:
```json
{
  "message": "Location not found",
  "error_code": "HTTP_404",
  "type": "http_error"
}
```

---

## 🔍 User Search & Discovery Endpoints

### 9. 🔍 Search Users
**Endpoint**: `GET /api/users/search`

**Description**: Search and discover other users

**Authentication**: Required (Bearer Token)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | ❌ | Search query (name, email) |
| `role` | string | ❌ | Filter by role: "rider", "driver", "admin", "moderator" |
| `min_rating` | number | ❌ | Minimum rating (0-5) |
| `verified_only` | boolean | ❌ | Only verified users (default: false) |
| `limit` | integer | ❌ | Number of results (1-100, default: 20) |
| `offset` | integer | ❌ | Results offset (default: 0) |

**Example Request**:
```
GET /api/users/search?q=john&role=driver&min_rating=4&verified_only=true&limit=10
```

**Success Response (200 OK)**:
```json
[
  {
    "id": 2,
    "first_name": "John",
    "last_name": "Doe",
    "role": "driver",
    "rating_average": 4.5,
    "rating_count": 23,
    "profile_photo_url": "/uploads/profile_photos/2_xyz789.jpg",
    "bio": "Experienced driver, love meeting new people!"
  },
  {
    "id": 3,
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "driver",
    "rating_average": 4.8,
    "rating_count": 45,
    "profile_photo_url": "/uploads/profile_photos/3_abc456.jpg",
    "bio": "Safe driver with 5 years experience"
  }
]
```

**Response Schema**:
Each user object contains:
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `first_name` | string | User's first name |
| `last_name` | string | User's last name |
| `role` | string | User role |
| `rating_average` | number | Average rating |
| `rating_count` | integer | Number of ratings |
| `profile_photo_url` | string | Profile photo URL |
| `bio` | string | User biography |

---

### 10. 👀 Get Public User Profile
**Endpoint**: `GET /api/users/{user_id}/profile`

**Description**: Get public profile of another user

**Authentication**: Required (Bearer Token)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | integer | ✅ | User ID to view |

**Success Response (200 OK)**:
```json
{
  "id": 2,
  "first_name": "John",
  "last_name": "Doe",
  "role": "driver",
  "rating_average": 4.5,
  "rating_count": 23,
  "profile_photo_url": "/uploads/profile_photos/2_xyz789.jpg",
  "bio": "Experienced driver, love meeting new people!"
}
```

**Error Responses**:

**400 Bad Request - Own Profile**:
```json
{
  "message": "Use /profile endpoint to get your own profile",
  "error_code": "HTTP_400",
  "type": "http_error"
}
```

**404 Not Found**:
```json
{
  "message": "User not found",
  "error_code": "HTTP_404",
  "type": "http_error"
}
```

---

## 📊 User Statistics Endpoint

### 11. 📊 Get User Statistics
**Endpoint**: `GET /api/users/stats`

**Description**: Get user statistics and analytics

**Authentication**: Required (Bearer Token)

**Success Response (200 OK)**:
```json
{
  "profile_completion": 85.7,
  "saved_locations": 3,
  "rating_average": 4.5,
  "rating_count": 23,
  "email_verified": true,
  "phone_verified": false,
  "member_since": "2025-09-25",
  "last_login": "2025-09-28T14:00:00Z"
}
```

**Response Schema**:
| Field | Type | Description |
|-------|------|-------------|
| `profile_completion` | number | Profile completion percentage |
| `saved_locations` | integer | Number of saved locations |
| `rating_average` | number | Average user rating |
| `rating_count` | integer | Number of ratings received |
| `email_verified` | boolean | Email verification status |
| `phone_verified` | boolean | Phone verification status |
| `member_since` | string | Account creation date |
| `last_login` | string | Last login timestamp |

---

## 🔧 Authentication Headers

For all endpoints, include the access token in the Authorization header:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## 📊 HTTP Status Codes

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `200` | OK | Successful request |
| `201` | Created | Resource successfully created |
| `400` | Bad Request | Invalid request data or business logic error |
| `401` | Unauthorized | Invalid credentials or missing/invalid token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
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

## 📝 Frontend Integration Examples

### JavaScript/TypeScript

```javascript
// Get user profile
const getUserProfile = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Update user profile
const updateProfile = async (profileData) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  
  return response.json();
};

// Upload profile photo
const uploadProfilePhoto = async (photoFile) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('photo', photoFile);
  
  const response = await fetch('/api/users/profile/photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};

// Search users
const searchUsers = async (query, filters = {}) => {
  const token = localStorage.getItem('access_token');
  const params = new URLSearchParams({
    q: query,
    ...filters
  });
  
  const response = await fetch(`/api/users/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Create saved location
const createLocation = async (locationData) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/api/users/locations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(locationData)
  });
  
  return response.json();
};

// Upload identity document
const uploadIdentityDocument = async (frontImage, backImage = null, documentType) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  
  formData.append('front_image', frontImage);
  if (backImage) {
    formData.append('back_image', backImage);
  }
  
  const response = await fetch(`/api/users/documents/identity?document_type=${documentType}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};

// Upload driver license
const uploadDriverLicense = async (frontImage, backImage, licenseNumber, expiryDate) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  
  formData.append('front_image', frontImage);
  formData.append('back_image', backImage);
  
  const params = new URLSearchParams({
    license_number: licenseNumber,
    expiry_date: expiryDate
  });
  
  const response = await fetch(`/api/users/documents/driver-license?${params}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};

// Get user documents
const getUserDocuments = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/api/users/documents', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Get document status
const getDocumentStatus = async (documentId) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`/api/users/documents/${documentId}/status`, {
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

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const token = await AsyncStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.json();
  },
  
  // Update preferences
  updatePreferences: async (preferences) => {
    const token = await AsyncStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE}/users/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(preferences)
    });
    
    return response.json();
  },
  
  // Get saved locations
  getLocations: async () => {
    const token = await AsyncStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE}/users/locations`, {
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
# Get user profile
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer TOKEN"

# Update user profile
curl -X PUT http://localhost:8000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Love carpooling!"
  }'

# Upload profile photo
curl -X POST http://localhost:8000/api/users/profile/photo \
  -H "Authorization: Bearer TOKEN" \
  -F "photo=@profile.jpg"

# Create saved location
curl -X POST http://localhost:8000/api/users/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Home",
    "address": "Casablanca, Morocco",
    "latitude": 33.5731,
    "longitude": -7.5898,
    "location_type": "home"
  }'

# Search users
curl -X GET "http://localhost:8000/api/users/search?q=john&role=driver&min_rating=4" \
  -H "Authorization: Bearer TOKEN"

# Get user statistics
curl -X GET http://localhost:8000/api/users/stats \
  -H "Authorization: Bearer TOKEN"

# Upload identity document (National ID)
curl -X POST "http://localhost:8000/api/users/documents/identity?document_type=national_id" \
  -H "Authorization: Bearer TOKEN" \
  -F "front_image=@id_front.jpg" \
  -F "back_image=@id_back.jpg"

# Upload driver license
curl -X POST "http://localhost:8000/api/users/documents/driver-license?license_number=D123456789&expiry_date=2025-12-31T23:59:59" \
  -H "Authorization: Bearer TOKEN" \
  -F "front_image=@license_front.jpg" \
  -F "back_image=@license_back.jpg"

# Get all user documents
curl -X GET http://localhost:8000/api/users/documents \
  -H "Authorization: Bearer TOKEN"

# Get specific document status
curl -X GET http://localhost:8000/api/users/documents/1/status \
  -H "Authorization: Bearer TOKEN"
```

---

## 📄 Document Verification Endpoints

### 12. � Upload Identity Document
**Endpoint**: `POST /api/users/documents/identity`

**Description**: Upload identity document for verification with Cloudinary

**Authentication**: Required (Bearer Token)

**Request**: Multipart form data
- **File**: `front_image` (required) - Front side of identity document  
- **File**: `back_image` (optional) - Back side of identity document
- **Query Parameter**: `document_type` (required) - Type of document

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_type` | string | ✅ | Document type: "national_id", "passport", "residence_permit" |

**Content-Type**: `multipart/form-data`

**Success Response (200 OK)**:
```json
{
  "message": "Identity document uploaded successfully",
  "document_id": 1,
  "document_type": "national_id",
  "status": "pending",
  "front_image_url": "https://res.cloudinary.com/dj2ynb4rg/image/upload/v1727528400/coride/documents/user_123/national_id_front_abc123.jpg",
  "back_image_url": "https://res.cloudinary.com/dj2ynb4rg/image/upload/v1727528401/coride/documents/user_123/national_id_back_def456.jpg"
}
```

**Error Responses**:

**400 Bad Request - Document Already Exists**:
```json
{
  "message": "You already have a national_id document that is pending",
  "error_code": "HTTP_400",
  "type": "http_error"
}
```

---

### 13. 🚗 Upload Driver License  
**Endpoint**: `POST /api/users/documents/driver-license`

**Description**: Upload driver license for verification (required for drivers)

**Authentication**: Required (Bearer Token)

**Request**: Multipart form data + Query Parameters
- **File**: `front_image` (required) - Front side of driver license
- **File**: `back_image` (required) - Back side of driver license
- **Query Parameter**: `license_number` (required) - License number
- **Query Parameter**: `expiry_date` (required) - License expiry date

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `license_number` | string | ✅ | Driver license number |
| `expiry_date` | string | ✅ | License expiry date (ISO format: 2025-12-31T23:59:59) |

**Content-Type**: `multipart/form-data`

**Success Response (200 OK)**:
```json
{
  "message": "Driver license uploaded successfully", 
  "license_id": 1,
  "license_number": "D123456789",
  "status": "pending",
  "front_image_url": "https://res.cloudinary.com/dj2ynb4rg/image/upload/v1727528500/coride/licenses/user_123/front_abc123.jpg",
  "back_image_url": "https://res.cloudinary.com/dj2ynb4rg/image/upload/v1727528501/coride/licenses/user_123/back_def456.jpg",
  "expiry_date": "2025-12-31T23:59:59"
}
```

**Error Responses**:

**400 Bad Request - License Already Exists**:
```json
{
  "message": "You already have a driver license that is pending",
  "error_code": "HTTP_400",
  "type": "http_error"
}
```

---

### 14. 📋 Get User Documents
**Endpoint**: `GET /api/users/documents`

**Description**: Get all user documents and verification status

**Authentication**: Required (Bearer Token)

**Success Response (200 OK)**:
```json
{
  "identity_documents": [
    {
      "id": 1,
      "document_type": "national_id",
      "status": "verified",
      "front_image_url": "https://res.cloudinary.com/dj2ynb4rg/image/upload/v1727528400/coride/documents/user_123/national_id_front_abc123.jpg",
      "back_image_url": "https://res.cloudinary.com/dj2ynb4rg/image/upload/v1727528401/coride/documents/user_123/national_id_back_def456.jpg",
      "uploaded_at": "2025-09-28T10:00:00Z",
      "verified_at": "2025-09-28T14:30:00Z"
    }
  ],
  "driver_license": {
    "id": 1,
    "license_number": "D123456789",
    "status": "verified",
    "front_image_url": "https://res.cloudinary.com/dj2ynb4rg/image/upload/v1727528500/coride/licenses/user_123/front_abc123.jpg",
    "back_image_url": "https://res.cloudinary.com/dj2ynb4rg/image/upload/v1727528501/coride/licenses/user_123/back_def456.jpg",
    "expiry_date": "2025-12-31T23:59:59",
    "uploaded_at": "2025-09-28T10:15:00Z",
    "verified_at": "2025-09-28T15:00:00Z"
  },
  "verification_summary": {
    "identity_verified": true,
    "driver_license_verified": true,
    "can_drive": true
  }
}
```

**Response Schema**:

**Identity Documents Array**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Document ID |
| `document_type` | string | Document type: "national_id", "passport", "residence_permit" |
| `status` | string | Status: "pending", "verified", "rejected" |
| `front_image_url` | string | Cloudinary URL for front image |
| `back_image_url` | string | Cloudinary URL for back image (optional) |
| `uploaded_at` | string | Upload timestamp |
| `verified_at` | string | Verification timestamp (null if not verified) |

**Driver License Object**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | License record ID |
| `license_number` | string | Driver license number |
| `status` | string | Status: "pending", "verified", "rejected" |
| `front_image_url` | string | Cloudinary URL for front image |
| `back_image_url` | string | Cloudinary URL for back image |
| `expiry_date` | string | License expiry date |
| `uploaded_at` | string | Upload timestamp |
| `verified_at` | string | Verification timestamp (null if not verified) |

**Verification Summary**:
| Field | Type | Description |
|-------|------|-------------|
| `identity_verified` | boolean | Identity verification status |
| `driver_license_verified` | boolean | Driver license verification status |  
| `can_drive` | boolean | Can user drive (requires valid driver license) |

---

### 15. 🔍 Get Document Status
**Endpoint**: `GET /api/users/documents/{document_id}/status`

**Description**: Get specific document verification status

**Authentication**: Required (Bearer Token)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_id` | integer | ✅ | Document or license ID |

**Success Response (200 OK)**:

**For Identity Document**:
```json
{
  "document_id": 1,
  "document_type": "national_id",
  "status": "verified",
  "uploaded_at": "2025-09-28T10:00:00Z",
  "verified_at": "2025-09-28T14:30:00Z",
  "rejection_reason": null
}
```

**For Driver License**:
```json
{
  "document_id": 1,
  "document_type": "driver_license",
  "license_number": "D123456789",
  "status": "rejected",
  "expiry_date": "2025-12-31T23:59:59",
  "uploaded_at": "2025-09-28T10:15:00Z",
  "verified_at": null,
  "rejection_reason": "License image is too blurry, please upload clearer photos"
}
```

**Response Schema**:
| Field | Type | Description |
|-------|------|-------------|
| `document_id` | integer | Document/license ID |
| `document_type` | string | Document type or "driver_license" |
| `status` | string | Current verification status |
| `uploaded_at` | string | Upload timestamp |
| `verified_at` | string | Verification timestamp (null if not verified) |
| `rejection_reason` | string | Reason for rejection (null if not rejected) |

**Error Responses**:

**404 Not Found**:
```json
{
  "message": "Document not found",
  "error_code": "HTTP_404", 
  "type": "http_error"
}
```

---

## ☁️ Cloudinary Integration

All document and photo uploads are handled via **Cloudinary** for optimal performance and security:

### 🔒 **Security Features**
- **Auto-format**: Images automatically converted to optimal formats (WebP, AVIF)
- **Quality optimization**: Automatic quality adjustment for faster loading
- **Secure URLs**: Direct access URLs with transformation parameters
- **Access control**: User-specific folder structure for privacy

### 🎨 **Image Transformations**
- **Profile photos**: Auto-resize to 400x400, face detection, quality optimization
- **Identity documents**: Auto-enhance, format optimization, secure storage  
- **Driver licenses**: Auto-enhance, format optimization, secure storage

### 📁 **Folder Structure**
```
coride/
├── profile_photos/
│   └── user_{user_id}/
│       └── {timestamp}_{filename}
├── documents/
│   └── user_{user_id}/
│       └── {document_type}_{side}_{timestamp}_{filename}  
└── licenses/
    └── user_{user_id}/
        └── {side}_{timestamp}_{filename}
```

### 🔗 **URL Examples**
```
Profile Photo:
https://res.cloudinary.com/dj2ynb4rg/image/upload/c_fill,w_400,h_400,f_auto,q_auto/coride/profile_photos/user_123/1727528300_profile.jpg

Identity Document:
https://res.cloudinary.com/dj2ynb4rg/image/upload/f_auto,q_auto/coride/documents/user_123/national_id_front_1727528400_id.jpg

Driver License:
https://res.cloudinary.com/dj2ynb4rg/image/upload/f_auto,q_auto/coride/licenses/user_123/front_1727528500_license.jpg
```

---

## �🎯 Key Features Summary

### ✅ **Profile Management**
- Complete user profile CRUD operations
- Profile photo upload with Cloudinary integration  
- Profile completion tracking

### ✅ **Ride Preferences**  
- Music and conversation preferences
- Smoking and pet policies
- Air conditioning and detour settings

### ✅ **Location Management**
- Save favorite locations (home, work, university)
- PostGIS spatial data storage
- Location type validation

### ✅ **User Discovery**
- Advanced user search with filters
- Rating-based filtering
- Role-based discovery

### ✅ **Document Verification** 🆕
- Identity document upload (National ID, Passport, Residence Permit)
- Driver license verification for drivers
- Cloudinary integration for secure document storage
- Document status tracking (pending, verified, rejected)
- Automatic image optimization and enhancement

### ✅ **Analytics & Statistics**
- Profile completion percentage
- User engagement metrics
- Verification status tracking

---

**Last Updated**: September 28, 2025  
**API Version**: 2.0.0  
**Contact**: zouhairfgra@gmail.com