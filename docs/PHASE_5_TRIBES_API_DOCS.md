# Phase 5: Trajectory Tribes - API Documentation

## 📚 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Tribe Management](#tribe-management)
  - [Membership Management](#membership-management)
  - [Messaging](#messaging)
  - [WebSocket Communication](#websocket-communication)
- [Data Models](#data-models)
- [WebSocket Message Format](#websocket-message-format)
- [User Flows](#user-flows)
- [Error Handling](#error-handling)

---

## 🎯 Overview

The Trajectory Tribes feature allows CoRide users to create and join location-based communities centered around common routes (e.g., "Home to Mohammed V University"). These tribes facilitate:

- Real-time communication between members
- Route-specific information sharing
- Community building around frequent carpooling routes
- Traffic updates and local insights

**Base URL**: `/api/tribes`

**Version**: 1.0.0

**Release Date**: November 2, 2025

---

## ✨ Features

### Core Features
- ✅ **Tribe Creation & Management**: Create tribes based on specific routes
- ✅ **Public & Private Tribes**: Control tribe visibility and access
- ✅ **Role-Based Permissions**: Admin, Moderator, and Member roles
- ✅ **Real-Time Messaging**: WebSocket-powered instant messaging
- ✅ **Member Management**: Add, remove, and manage members
- ✅ **Announcements**: Admin/Moderator-only important announcements
- ✅ **Proximity Search**: Find tribes near your current location or route
- ✅ **Join Requests**: Approval workflow for private tribes

### Advanced Features
- ✅ **Typing Indicators**: See when members are typing
- ✅ **Online Status**: Real-time member online/offline status
- ✅ **Message History**: Paginated message retrieval with infinite scroll
- ✅ **Search & Discovery**: Find tribes by name, route, or location
- ✅ **Member Activity Tracking**: Track message counts and activity

---

## 🔐 Authentication

All tribe endpoints require JWT authentication except for public tribe discovery.

**Header Required**:
```
Authorization: Bearer <access_token>
```

**WebSocket Authentication**:
```
ws://api/tribes/{tribe_id}/ws?token=<access_token>
```

---

## 📡 Endpoints

### Tribe Management

#### 1. Create Tribe
```http
POST /api/tribes/
```

Create a new trajectory tribe.

**Request Body**:
```json
{
  "name": "Agdal to Mohammed V University",
  "description": "Daily commuters between Agdal and Mohammed V University campus",
  "route_start_name": "Agdal, Rabat",
  "route_end_name": "Mohammed V University, Rabat",
  "route_start_latitude": 33.9911,
  "route_start_longitude": -6.8401,
  "route_end_latitude": 33.9984,
  "route_end_longitude": -6.8492,
  "is_public": true,
  "max_members": 500,
  "requires_approval": false
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "name": "Agdal to Mohammed V University",
  "description": "Daily commuters between Agdal and Mohammed V University campus",
  "route_start_name": "Agdal, Rabat",
  "route_end_name": "Mohammed V University, Rabat",
  "route_start_coordinates": {
    "latitude": 33.9911,
    "longitude": -6.8401
  },
  "route_end_coordinates": {
    "latitude": 33.9984,
    "longitude": -6.8492
  },
  "is_public": true,
  "max_members": 500,
  "requires_approval": false,
  "member_count": 1,
  "message_count": 0,
  "user_role": "admin",
  "user_is_member": true,
  "created_at": "2025-11-02T16:00:00Z",
  "updated_at": null
}
```

---

#### 2. Search Tribes
```http
GET /api/tribes/?query=university&near_latitude=33.9911&near_longitude=-6.8401&max_distance_km=10
```

Search and discover tribes with various filters.

**Query Parameters**:
| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| query | string | Search in name/description/locations | No |
| near_latitude | float | Latitude for proximity search | No |
| near_longitude | float | Longitude for proximity search | No |
| max_distance_km | float | Maximum distance in km (default: 10) | No |
| only_public | boolean | Show only public tribes (default: true) | No |
| has_space | boolean | Show only tribes with space (default: false) | No |
| page | integer | Page number (default: 1) | No |
| page_size | integer | Items per page (default: 20, max: 100) | No |

**Response** (200 OK):
```json
{
  "tribes": [
    {
      "id": 1,
      "name": "Agdal to Mohammed V University",
      "description": "Daily commuters...",
      "route_start_name": "Agdal, Rabat",
      "route_end_name": "Mohammed V University, Rabat",
      "route_start_coordinates": {
        "latitude": 33.9911,
        "longitude": -6.8401
      },
      "route_end_coordinates": {
        "latitude": 33.9984,
        "longitude": -6.8492
      },
      "is_public": true,
      "max_members": 500,
      "requires_approval": false,
      "member_count": 45,
      "message_count": 1250,
      "user_role": null,
      "user_is_member": false,
      "created_at": "2025-11-02T16:00:00Z",
      "updated_at": null
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

---

#### 3. Get Tribe Details
```http
GET /api/tribes/{tribe_id}
```

Get detailed information about a specific tribe.

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Agdal to Mohammed V University",
  "description": "Daily commuters between Agdal and Mohammed V University campus",
  "route_start_name": "Agdal, Rabat",
  "route_end_name": "Mohammed V University, Rabat",
  "route_start_coordinates": {
    "latitude": 33.9911,
    "longitude": -6.8401
  },
  "route_end_coordinates": {
    "latitude": 33.9984,
    "longitude": -6.8492
  },
  "is_public": true,
  "max_members": 500,
  "requires_approval": false,
  "member_count": 45,
  "message_count": 1250,
  "user_role": "member",
  "user_is_member": true,
  "created_at": "2025-11-02T16:00:00Z",
  "updated_at": null
}
```

---

#### 4. Update Tribe
```http
PATCH /api/tribes/{tribe_id}
```

Update tribe information (Admin only).

**Request Body** (all fields optional):
```json
{
  "name": "Updated Tribe Name",
  "description": "Updated description",
  "is_public": false,
  "max_members": 300,
  "requires_approval": true
}
```

**Response** (200 OK): Same as Get Tribe Details

---

#### 5. Delete Tribe
```http
DELETE /api/tribes/{tribe_id}
```

Delete a tribe (Admin only).

**Response** (204 No Content)

---

### Membership Management

#### 6. Join Tribe
```http
POST /api/tribes/{tribe_id}/join
```

Join a tribe or submit a join request.

**Request Body** (optional):
```json
{
  "message": "I commute this route daily and would love to join!"
}
```

**Response** (200 OK):
```json
{
  "status": "joined",
  "message": "Successfully joined tribe"
}
```

Or for tribes requiring approval:
```json
{
  "status": "pending",
  "message": "Join request submitted"
}
```

---

#### 7. Leave Tribe
```http
POST /api/tribes/{tribe_id}/leave
```

Leave a tribe.

**Response** (204 No Content)

---

#### 8. Get Tribe Members
```http
GET /api/tribes/{tribe_id}/members?page=1&page_size=50
```

Get list of tribe members (members only).

**Response** (200 OK):
```json
{
  "members": [
    {
      "user_id": 1,
      "first_name": "Ahmed",
      "last_name": "Ben Ali",
      "profile_photo_url": "https://...",
      "role": "admin",
      "joined_at": "2025-11-01T10:00:00Z",
      "message_count": 45,
      "last_active_at": "2025-11-02T15:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "page_size": 50,
  "total_pages": 1,
  "online_count": 12
}
```

---

#### 9. Update Member Role
```http
PATCH /api/tribes/{tribe_id}/members/{user_id}/role
```

Update a member's role (Admin only).

**Request Body**:
```json
{
  "role": "moderator"
}
```

**Response** (200 OK):
```json
{
  "message": "Member role updated successfully"
}
```

---

#### 10. Remove Member
```http
DELETE /api/tribes/{tribe_id}/members/{user_id}
```

Remove a member from tribe (Admin/Moderator only).

**Response** (204 No Content)

---

### Messaging

#### 11. Send Message
```http
POST /api/tribes/{tribe_id}/messages
```

Send a message to the tribe.

**Request Body**:
```json
{
  "content": "Anyone heading to university tomorrow at 8 AM?",
  "message_type": "text",
  "is_announcement": false
}
```

**Message Types**:
- `text`: Regular text message
- `image`: Image message (with file_url)
- `file`: File attachment
- `announcement`: Important announcement (admin/moderator only)
- `system`: System-generated message

**Response** (201 Created):
```json
{
  "id": 1,
  "tribe_id": 1,
  "user_id": 1,
  "user_first_name": "Ahmed",
  "user_last_name": "Ben Ali",
  "user_profile_photo": "https://...",
  "message_type": "text",
  "content": "Anyone heading to university tomorrow at 8 AM?",
  "file_url": null,
  "file_name": null,
  "file_size": null,
  "is_announcement": false,
  "is_pinned": false,
  "is_edited": false,
  "edited_at": null,
  "created_at": "2025-11-02T16:00:00Z"
}
```

---

#### 12. Get Messages
```http
GET /api/tribes/{tribe_id}/messages?page=1&page_size=50
```

Get tribe messages with pagination.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number |
| page_size | integer | Items per page (max: 100) |
| before_id | integer | Get messages before this ID (for infinite scroll) |

**Response** (200 OK):
```json
{
  "messages": [
    {
      "id": 1,
      "tribe_id": 1,
      "user_id": 1,
      "user_first_name": "Ahmed",
      "user_last_name": "Ben Ali",
      "user_profile_photo": "https://...",
      "message_type": "text",
      "content": "Anyone heading to university tomorrow at 8 AM?",
      "file_url": null,
      "file_name": null,
      "file_size": null,
      "is_announcement": false,
      "is_pinned": false,
      "is_edited": false,
      "edited_at": null,
      "created_at": "2025-11-02T16:00:00Z"
    }
  ],
  "total": 1250,
  "page": 1,
  "page_size": 50,
  "has_more": true
}
```

---

#### 13. Get My Tribes
```http
GET /api/tribes/my/tribes?page=1&page_size=20
```

Get tribes the current user is a member of.

**Response** (200 OK): Same format as Search Tribes

---

### WebSocket Communication

#### 14. Connect to Tribe WebSocket
```
ws://localhost:8000/api/tribes/{tribe_id}/ws?token=<access_token>
```

Real-time communication channel for tribe messages and events.

**Connection Requirements**:
- Valid JWT access token as query parameter
- Must be a tribe member

**Incoming Message Types**:
- `connection_established`: Connection confirmation
- `new_message`: New message in tribe
- `member_joined`: New member joined
- `member_left`: Member left tribe
- `member_role_changed`: Member role updated
- `announcement`: New announcement
- `typing_indicator`: Member typing status

**Outgoing Message Types**:
- `typing`: Send typing indicator

**Example - Send Typing Indicator**:
```json
{
  "type": "typing",
  "is_typing": true
}
```

---

## 📊 Data Models

### Tribe
```typescript
{
  id: number
  name: string
  description: string | null
  route_start_name: string
  route_end_name: string
  route_start_coordinates: {
    latitude: number
    longitude: number
  }
  route_end_coordinates: {
    latitude: number
    longitude: number
  }
  is_public: boolean
  max_members: number
  requires_approval: boolean
  member_count: number
  message_count: number
  user_role: "member" | "moderator" | "admin" | null
  user_is_member: boolean
  created_at: string (ISO 8601)
  updated_at: string | null (ISO 8601)
}
```

### TribeMember
```typescript
{
  user_id: number
  first_name: string
  last_name: string
  profile_photo_url: string | null
  role: "member" | "moderator" | "admin"
  joined_at: string (ISO 8601)
  message_count: number
  last_active_at: string | null (ISO 8601)
}
```

### TribeMessage
```typescript
{
  id: number
  tribe_id: number
  user_id: number
  user_first_name: string
  user_last_name: string
  user_profile_photo: string | null
  message_type: "text" | "image" | "file" | "announcement" | "system"
  content: string
  file_url: string | null
  file_name: string | null
  file_size: number | null
  is_announcement: boolean
  is_pinned: boolean
  is_edited: boolean
  edited_at: string | null (ISO 8601)
  created_at: string (ISO 8601)
}
```

---

## 📨 WebSocket Message Format

### Connection Established
```json
{
  "type": "connection_established",
  "tribe_id": 1,
  "message": "Connected to tribe",
  "timestamp": 1698940800.123
}
```

### New Message
```json
{
  "type": "new_message",
  "tribe_id": 1,
  "message": {
    "id": 1,
    "user_id": 1,
    "user_first_name": "Ahmed",
    "user_last_name": "Ben Ali",
    "content": "Hello everyone!",
    "message_type": "text",
    "created_at": "2025-11-02T16:00:00Z"
  },
  "timestamp": 1698940800.123
}
```

### Member Joined
```json
{
  "type": "member_joined",
  "tribe_id": 1,
  "member": {
    "user_id": 2,
    "first_name": "Fatima",
    "last_name": "El Amrani",
    "profile_photo_url": "https://...",
    "role": "member",
    "joined_at": "2025-11-02T16:00:00Z"
  },
  "timestamp": 1698940800.123
}
```

### Typing Indicator
```json
{
  "type": "typing_indicator",
  "tribe_id": 1,
  "user_id": 1,
  "user_name": "Ahmed Ben Ali",
  "is_typing": true,
  "timestamp": 1698940800.123
}
```

---

## 🔄 User Flows

### Flow 1: Create and Join a Tribe
1. User creates tribe via `POST /api/tribes/`
2. User becomes admin automatically
3. Other users discover tribe via `GET /api/tribes/`
4. Users join via `POST /api/tribes/{id}/join`
5. For public tribes: instant join
6. For private tribes: join request created

### Flow 2: Real-Time Communication
1. User joins tribe
2. User connects to WebSocket: `ws://api/tribes/{id}/ws?token=...`
3. User sends message via `POST /api/tribes/{id}/messages`
4. All connected members receive message via WebSocket
5. Message history accessible via `GET /api/tribes/{id}/messages`

### Flow 3: Member Management
1. Admin reviews members via `GET /api/tribes/{id}/members`
2. Admin promotes member to moderator: `PATCH /api/tribes/{id}/members/{user_id}/role`
3. Moderator can remove disruptive members: `DELETE /api/tribes/{id}/members/{user_id}`
4. All members notified via WebSocket

---

## ⚠️ Error Handling

### Common Error Responses

**401 Unauthorized**:
```json
{
  "message": "Authentication failed",
  "error_code": "AUTH_ERROR",
  "details": {},
  "type": "api_error"
}
```

**403 Forbidden**:
```json
{
  "message": "Only admins can perform this action",
  "error_code": "AUTHORIZATION_ERROR",
  "details": {},
  "type": "api_error"
}
```

**404 Not Found**:
```json
{
  "message": "Tribe not found with identifier: 999",
  "error_code": "RESOURCE_NOT_FOUND",
  "details": {
    "resource": "Tribe",
    "identifier": "999"
  },
  "type": "api_error"
}
```

**409 Conflict**:
```json
{
  "message": "You are already a member of this tribe",
  "error_code": "RESOURCE_CONFLICT",
  "details": {},
  "type": "api_error"
}
```

**422 Validation Error**:
```json
{
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field_errors": {
      "name": ["Field 'name' must be at least 3 characters long"]
    },
    "total_errors": 1
  },
  "type": "validation_error"
}
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format with UTC timezone
- Coordinates use WGS84 (EPSG:4326) coordinate system
- Maximum file size for uploads: 10MB
- WebSocket connection timeout: 300 seconds (5 minutes)
- Message rate limit: 10 messages per minute per user
- Tribe name must be unique (case-insensitive)
- Maximum tribe description length: 1000 characters
- Maximum message content length: 5000 characters

---

**Last Updated**: November 2, 2025  
**API Version**: 1.0.0  
**Contact**: zouhairfgra@gmail.com
