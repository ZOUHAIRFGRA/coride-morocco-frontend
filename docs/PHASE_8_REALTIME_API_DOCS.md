# Phase 8: Real-time Features & WebSockets API Documentation

## 📋 Overview

The Real-time Features system provides:
- Live GPS location tracking during rides
- Real-time ride progress monitoring (7-stage tracking)
- Emergency panic button with instant alerts
- Multi-channel notifications (push, SMS, email, in-app)
- WebSocket infrastructure for real-time updates
- Location sharing with trusted contacts

**WebSocket URL**: `ws://localhost:8000/api/live/ws/{connection_id}`  
**REST Base URL**: `/api/live`  
**Authentication**: Required for all endpoints (JWT Bearer token)  
**Content-Type**: `application/json`

---

## 🎯 Implementation Status

### ✅ Completed (Database & Schemas)
- Database models for all real-time features
- Pydantic schemas for validation and WebSocket messages
- Spatial indexes for GPS queries
- Multi-channel notification infrastructure

### ⏳ Pending Implementation
- WebSocket service layer (`live_tracking_service.py`)
- WebSocket router endpoints (`live_tracking.py`)
- Push notification service integration
- SMS gateway integration
- Emergency services API integration

---

## 📊 Database Models (Ready)

### LiveLocation Table
Stores GPS tracking data for real-time location updates.

**Columns**:
- `id`: Primary key
- `user_id`: Foreign key to users
- `ride_id`: Foreign key to rides (nullable)
- `location`: GEOMETRY(Point, 4326) - PostGIS spatial data
- `latitude`, `longitude`: Decimal coordinates
- `accuracy_meters`: GPS accuracy
- `altitude_meters`: Elevation
- `speed_kmh`: Current speed
- `heading_degrees`: Direction (0-360)
- `update_type`: Enum (manual, automatic, gps_tracking, check_in)
- `battery_level`: Device battery (0-100%)
- `network_type`: Connection type (wifi, 4g, 5g, etc.)
- `recorded_at`: Timestamp of GPS reading
- `created_at`: Database insert time

**Indexes**:
- GIST spatial index on `location`
- Index on `user_id`, `ride_id`, `recorded_at`

---

### RideTracking Table
Tracks ride progress through 7 stages.

**Columns**:
- `id`: Primary key
- `ride_id`: Foreign key to rides (unique)
- `tracking_status`: Enum (7 stages - see below)
- `current_location`: GEOMETRY(Point, 4326)
- `current_latitude`, `current_longitude`: Current position
- `distance_to_pickup_km`: Distance to pickup point
- `distance_to_destination_km`: Distance to final destination
- `estimated_pickup_time`: ETA for pickup
- `estimated_arrival_time`: ETA for destination
- `pickup_time`: Actual pickup timestamp
- `dropoff_time`: Actual dropoff timestamp
- `delay_minutes`: Delay from schedule
- `delay_reason`: Explanation for delays
- `route_deviated`: Boolean flag for route changes
- `shared_with_users`: JSONB array of user IDs

**Tracking Statuses** (7 stages):
1. `waiting`: Driver waiting at starting location
2. `en_route_pickup`: Driver heading to pickup location
3. `picked_up`: Rider(s) picked up
4. `in_transit`: En route to destination
5. `near_destination`: Within 1 km of destination
6. `arrived`: Arrived at destination
7. `completed`: Ride completed

---

### EmergencyAlert Table
Panic button and emergency alert system.

**Columns**:
- `id`: Primary key
- `user_id`: User who triggered alert
- `ride_id`: Related ride (nullable)
- `emergency_type`: Enum (6 types - see below)
- `status`: Enum (5 statuses)
- `alert_location`: GEOMETRY(Point, 4326)
- `latitude`, `longitude`: Alert coordinates
- `address`: Human-readable address
- `description`: Alert details
- `severity`: Low, medium, high, critical
- `contacts_notified`: JSONB array of notified contacts
- `authorities_notified`: Boolean flag
- `acknowledged_by`: Admin who acknowledged
- `resolved_by`: Admin who resolved
- `acknowledged_at`, `resolved_at`: Timestamps
- `photo_urls`: JSONB array of evidence photos
- `audio_recording_url`: Voice recording

**Emergency Types**:
1. `panic_button`: General panic button press
2. `accident`: Traffic accident
3. `unsafe_situation`: Feeling unsafe
4. `vehicle_breakdown`: Car breakdown
5. `medical_emergency`: Medical issue
6. `other`: Other emergencies

**Emergency Statuses**:
1. `active`: Alert active, awaiting response
2. `acknowledged`: Admin acknowledged
3. `responding`: Help dispatched
4. `resolved`: Situation resolved
5. `false_alarm`: False alarm

---

### RideNotification Table
Multi-channel notification system.

**Columns**:
- `id`: Primary key
- `user_id`: Recipient user
- `ride_id`: Related ride (nullable)
- `notification_type`: Type/category
- `title`: Notification title (max 200 chars)
- `message`: Notification body (max 1000 chars)
- `priority`: Enum (5 levels - see below)
- `channels`: JSONB array (push, sms, email, in_app)
- `delivery_status`: JSONB per-channel delivery status
- `action_url`: Deep link URL
- `is_read`: Boolean flag
- `is_clicked`: Boolean flag
- `read_at`, `clicked_at`: Timestamps
- `expires_at`: Expiration time

**Priority Levels**:
1. `low`: Non-urgent notifications
2. `normal`: Standard notifications
3. `high`: Important notifications
4. `urgent`: Time-sensitive notifications
5. `emergency`: Emergency alerts (bypass DND)

---

### WebSocketConnection Table
Active WebSocket connection tracking.

**Columns**:
- `id`: Primary key
- `connection_id`: Unique connection identifier
- `user_id`: Connected user
- `device_id`, `device_type`: Device identification
- `is_active`: Connection status
- `connected_at`: Connection start time
- `last_heartbeat`: Last heartbeat timestamp
- `subscribed_rides`: JSONB array of subscribed ride IDs
- `subscribed_tribes`: JSONB array of subscribed tribe IDs
- `location_sharing_enabled`: Boolean flag

---

### LiveRideUpdate Table
Broadcast queue for real-time updates.

**Columns**:
- `id`: Primary key
- `ride_id`: Related ride
- `update_type`: Update category
- `update_data`: JSONB update payload
- `target_users`: JSONB array of recipient user IDs
- `broadcast_status`: Delivery status
- `broadcast_attempts`: Retry count
- `created_at`, `broadcast_at`: Timestamps

---

## 🔌 WebSocket Protocol (Pending Implementation)

### Connection Flow

```
1. Client connects: ws://localhost:8000/api/live/ws/{connection_id}
2. Server authenticates JWT token
3. Server sends: {"type": "connect", "data": {"connection_id": "..."}}
4. Client subscribes: {"type": "subscribe", "data": {"ride_ids": [123]}}
5. Server sends updates: {"type": "location_update", "data": {...}}
6. Client sends heartbeat: {"type": "heartbeat"} (every 30s)
7. Client disconnects: {"type": "disconnect"}
```

### Message Types (15 types)

#### Connection Messages
- `connect`: Initial connection established
- `disconnect`: Connection closed
- `heartbeat`: Keep-alive ping/pong
- `subscribe`: Subscribe to ride/tribe updates
- `unsubscribe`: Unsubscribe from updates

#### Location Messages
- `location_update`: GPS location update
- `driver_location`: Driver location broadcast
- `rider_location`: Rider location broadcast

#### Ride Status Messages
- `ride_status_update`: Ride tracking status changed
- `eta_update`: ETA recalculation
- `route_change`: Route deviation detected
- `ride_matched`: New rider joined ride

#### Emergency & Notifications
- `emergency_alert`: Emergency panic button
- `emergency_resolved`: Emergency resolved
- `notification`: General notification

#### System Messages
- `error`: Error occurred
- `success`: Action completed successfully

---

## 📡 WebSocket Message Schemas

### Base Message Structure

All WebSocket messages follow this structure:

```json
{
  "type": "message_type",
  "timestamp": "2025-11-05T10:30:00.123Z",
  "message_id": "uuid-1234-5678",
  "data": {
    // Message-specific data
  }
}
```

---

### Location Update Message

**Client → Server**

```json
{
  "type": "location_update",
  "timestamp": "2025-11-05T10:30:00.123Z",
  "data": {
    "ride_id": 123,
    "latitude": 33.5731,
    "longitude": -7.5898,
    "accuracy_meters": 10.5,
    "speed_kmh": 65.0,
    "heading_degrees": 145.0,
    "update_type": "gps_tracking",
    "battery_level": 78,
    "network_type": "4g"
  }
}
```

**Server → Clients (Broadcast)**

```json
{
  "type": "driver_location",
  "timestamp": "2025-11-05T10:30:00.456Z",
  "message_id": "abc-123",
  "data": {
    "ride_id": 123,
    "driver_id": 456,
    "driver_name": "Ahmed",
    "latitude": 33.5731,
    "longitude": -7.5898,
    "speed_kmh": 65.0,
    "heading_degrees": 145.0,
    "distance_to_pickup_km": 2.3,
    "estimated_arrival_minutes": 4
  }
}
```

---

### Ride Status Update Message

**Server → Clients**

```json
{
  "type": "ride_status_update",
  "timestamp": "2025-11-05T10:35:00.789Z",
  "message_id": "xyz-789",
  "data": {
    "ride_id": 123,
    "previous_status": "en_route_pickup",
    "new_status": "picked_up",
    "current_location": {
      "latitude": 33.5821,
      "longitude": -7.6123
    },
    "message": "Driver has picked up all riders",
    "timestamp": "2025-11-05T10:35:00"
  }
}
```

---

### ETA Update Message

**Server → Clients**

```json
{
  "type": "eta_update",
  "timestamp": "2025-11-05T10:36:00.111Z",
  "message_id": "eta-456",
  "data": {
    "ride_id": 123,
    "estimated_pickup_time": "2025-11-05T10:39:00",
    "estimated_arrival_time": "2025-11-05T11:15:00",
    "distance_to_destination_km": 25.3,
    "delay_minutes": 3,
    "delay_reason": "Heavy traffic on highway"
  }
}
```

---

### Emergency Alert Message

**Client → Server**

```json
{
  "type": "emergency_alert",
  "timestamp": "2025-11-05T10:40:00.000Z",
  "data": {
    "ride_id": 123,
    "emergency_type": "panic_button",
    "latitude": 33.5750,
    "longitude": -7.6050,
    "address": "Route de Rabat, Casablanca",
    "description": "Driver behaving erratically, feel unsafe",
    "emergency_contacts": [
      "+212612345678",
      "+212623456789"
    ],
    "notify_authorities": true
  }
}
```

**Server → Clients (Emergency Contacts + Admin)**

```json
{
  "type": "emergency_alert",
  "timestamp": "2025-11-05T10:40:00.234Z",
  "message_id": "emergency-999",
  "data": {
    "alert_id": 789,
    "user_id": 456,
    "user_name": "Sara Benali",
    "ride_id": 123,
    "emergency_type": "panic_button",
    "severity": "high",
    "location": {
      "latitude": 33.5750,
      "longitude": -7.6050,
      "address": "Route de Rabat, Casablanca"
    },
    "description": "Driver behaving erratically, feel unsafe",
    "contacts_notified": ["+212612345678", "+212623456789"],
    "authorities_notified": true,
    "created_at": "2025-11-05T10:40:00"
  }
}
```

---

### Notification Message

**Server → Client**

```json
{
  "type": "notification",
  "timestamp": "2025-11-05T10:45:00.567Z",
  "message_id": "notif-123",
  "data": {
    "notification_id": 1234,
    "title": "Ride Starting Soon",
    "message": "Your ride to Rabat starts in 15 minutes. Driver Ahmed is on the way.",
    "priority": "high",
    "channels": ["push", "in_app"],
    "action_url": "coride://rides/123",
    "expires_at": "2025-11-05T11:00:00"
  }
}
```

---

### Subscribe/Unsubscribe Message

**Client → Server**

```json
{
  "type": "subscribe",
  "timestamp": "2025-11-05T10:30:00.000Z",
  "data": {
    "ride_ids": [123, 456],
    "tribe_ids": [789],
    "enable_location_sharing": true
  }
}
```

**Server → Client (Confirmation)**

```json
{
  "type": "success",
  "timestamp": "2025-11-05T10:30:00.123Z",
  "message_id": "sub-confirm",
  "data": {
    "message": "Successfully subscribed to 2 rides and 1 tribe",
    "subscribed_rides": [123, 456],
    "subscribed_tribes": [789]
  }
}
```

---

### Error Message

**Server → Client**

```json
{
  "type": "error",
  "timestamp": "2025-11-05T10:50:00.999Z",
  "message_id": "err-123",
  "data": {
    "error_code": "INVALID_RIDE_ID",
    "message": "Ride ID 999 not found or you don't have access",
    "details": {
      "ride_id": 999
    }
  }
}
```

---

## 🚀 REST API Endpoints (Pending Implementation)

### Location Tracking

#### POST `/api/live/location`
Update user location.

**Request Body**:
```json
{
  "ride_id": 123,
  "latitude": 33.5731,
  "longitude": -7.5898,
  "accuracy_meters": 10.5,
  "speed_kmh": 65.0,
  "heading_degrees": 145.0,
  "battery_level": 78
}
```

#### GET `/api/live/rides/{ride_id}/locations`
Get location history for a ride.

**Response**:
```json
{
  "ride_id": 123,
  "locations": [
    {
      "user_id": 456,
      "latitude": 33.5731,
      "longitude": -7.5898,
      "recorded_at": "2025-11-05T10:30:00",
      "speed_kmh": 65.0
    }
  ]
}
```

---

### Ride Tracking

#### POST `/api/live/rides/{ride_id}/tracking/start`
Start ride tracking.

**Request Body**:
```json
{
  "enable_location_sharing": true,
  "share_with_users": [789, 101]
}
```

#### PUT `/api/live/rides/{ride_id}/tracking/status`
Update ride tracking status.

**Request Body**:
```json
{
  "tracking_status": "picked_up",
  "current_latitude": 33.5821,
  "current_longitude": -7.6123,
  "delay_minutes": 0
}
```

#### GET `/api/live/rides/{ride_id}/tracking`
Get current tracking status.

**Response**:
```json
{
  "ride_id": 123,
  "tracking_status": "in_transit",
  "current_location": {
    "latitude": 33.5850,
    "longitude": -7.6200
  },
  "distance_to_destination_km": 20.5,
  "estimated_arrival_time": "2025-11-05T11:15:00",
  "delay_minutes": 3
}
```

---

### Emergency Alerts

#### POST `/api/live/emergency`
Trigger emergency alert (panic button).

**Request Body**:
```json
{
  "ride_id": 123,
  "emergency_type": "panic_button",
  "latitude": 33.5750,
  "longitude": -7.6050,
  "description": "Feel unsafe, need help",
  "emergency_contacts": [
    "+212612345678",
    "+212623456789"
  ],
  "notify_authorities": true
}
```

**Response**:
```json
{
  "alert_id": 789,
  "status": "active",
  "contacts_notified": 2,
  "authorities_notified": true,
  "created_at": "2025-11-05T10:40:00"
}
```

#### GET `/api/live/emergency/{alert_id}`
Get emergency alert details.

#### PUT `/api/live/admin/emergency/{alert_id}` 🔒 Admin Only
Update emergency alert status.

**Request Body**:
```json
{
  "status": "acknowledged",
  "resolution_notes": "Police dispatched, 5 minutes away"
}
```

---

### Notifications

#### GET `/api/live/notifications`
Get user notifications.

**Query Parameters**:
- `priority`: Filter by priority
- `is_read`: Filter by read status
- `limit`, `offset`: Pagination

**Response**:
```json
{
  "notifications": [
    {
      "id": 1234,
      "title": "Ride Starting Soon",
      "message": "Your ride starts in 15 minutes",
      "priority": "high",
      "is_read": false,
      "created_at": "2025-11-05T10:45:00"
    }
  ],
  "total": 1
}
```

#### PUT `/api/live/notifications/{notification_id}/read`
Mark notification as read.

#### DELETE `/api/live/notifications/{notification_id}`
Delete notification.

---

## 🔐 Security Considerations

### Location Privacy
- Location sharing requires explicit user consent
- Users can stop location sharing anytime
- Location history limited to active rides only
- Admin access restricted to emergency situations

### Emergency Alerts
- All emergency alerts logged with timestamps
- GPS location captured automatically
- Emergency contacts notified via multiple channels
- Authority notification requires explicit consent

### WebSocket Authentication
- JWT token required for WebSocket connection
- Token validation on every sensitive action
- Automatic disconnection after token expiry
- Rate limiting on location updates (max 1/second)

---

## 📊 Performance Guidelines

### Location Updates
- **Frequency**: Max 1 update per second during active tracking
- **Accuracy**: Require GPS accuracy < 50 meters
- **Battery**: Warn user if battery < 20% with location tracking on
- **Network**: Adapt update frequency based on network type

### WebSocket Optimization
- Use message batching for bulk updates
- Compress large payloads (>1KB)
- Implement heartbeat every 30 seconds
- Auto-reconnect with exponential backoff

### Database Performance
- Spatial indexes for location queries
- Partition location history by month
- Archive completed ride tracking after 90 days
- Use connection pooling for WebSocket connections

---

## 🧪 Testing Scenarios

### Location Tracking Tests
1. **Accuracy Test**: GPS updates with varying accuracy levels
2. **Offline Test**: Handle location updates during network loss
3. **Battery Test**: Behavior when battery is low
4. **Speed Test**: High-speed location updates (highway driving)

### Emergency Alert Tests
1. **Panic Button**: Immediate alert triggering
2. **Contact Notification**: Multiple channels (SMS + push)
3. **Authority Notification**: Emergency services API call
4. **False Alarm**: User cancels alert within 30 seconds

### WebSocket Tests
1. **Connection Test**: Connect, authenticate, subscribe
2. **Reconnection Test**: Auto-reconnect after network drop
3. **Load Test**: 1000+ concurrent connections
4. **Message Test**: Broadcast to multiple subscribers

---

## 📚 Integration Examples

### JavaScript WebSocket Client

```javascript
const ws = new WebSocket('ws://localhost:8000/api/live/ws/user-123');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'authenticate',
    data: { token: 'JWT_TOKEN_HERE' }
  }));
  
  // Subscribe to ride
  ws.send(JSON.stringify({
    type: 'subscribe',
    data: { ride_ids: [123] }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch(message.type) {
    case 'location_update':
      updateMapMarker(message.data);
      break;
    case 'emergency_alert':
      showEmergencyPopup(message.data);
      break;
    case 'eta_update':
      updateETADisplay(message.data);
      break;
  }
};

// Send location update
function sendLocation(lat, lng) {
  ws.send(JSON.stringify({
    type: 'location_update',
    data: {
      ride_id: 123,
      latitude: lat,
      longitude: lng,
      accuracy_meters: 10,
      speed_kmh: 60,
      heading_degrees: 90
    }
  }));
}

// Panic button
function triggerPanic() {
  ws.send(JSON.stringify({
    type: 'emergency_alert',
    data: {
      ride_id: 123,
      emergency_type: 'panic_button',
      latitude: currentLat,
      longitude: currentLng,
      description: 'Emergency help needed',
      notify_authorities: true
    }
  }));
}
```

---

## 🚀 Next Steps for Implementation

### 1. Create WebSocket Service (`app/services/live_tracking_service.py`)
- `LiveTrackingService` class
- WebSocket connection manager
- Location update handler
- Emergency alert handler
- Notification dispatcher

### 2. Create WebSocket Router (`app/routers/live_tracking.py`)
- WebSocket endpoint: `@router.websocket('/ws/{connection_id}')`
- REST endpoints for location, tracking, emergency, notifications
- Message routing logic
- Broadcast functionality

### 3. External Service Integration
- **Push Notifications**: Firebase Cloud Messaging (FCM) or OneSignal
- **SMS Gateway**: Twilio or local Moroccan SMS provider
- **Email Service**: SendGrid or AWS SES
- **Emergency Services API**: Moroccan emergency services integration

### 4. Testing & Optimization
- Unit tests for service layer
- Integration tests for WebSocket
- Load testing (1000+ connections)
- Security audit

---

## 📖 References

### Related Documentation
- **Phase 7 Payment API**: See `PHASE_7_PAYMENT_API_DOCS.md`
- **Phase 5 Tribes WebSocket**: Refer to tribe chat implementation
- **Database Schema**: See `PHASE_7_8_SUMMARY.md`

### Technologies
- **WebSocket**: FastAPI WebSockets
- **PostGIS**: Spatial queries for location
- **Redis**: Pub/sub for broadcasts
- **JWT**: Authentication
- **Pydantic**: Message validation

---

**Documentation Version**: 1.0  
**Last Updated**: November 5, 2025  
**Implementation Status**: 85% Complete (Models & Schemas Ready, Service & Router Pending)  
**API Version**: v1
