# Phase 7: Payment & Cost Management API Documentation

## 📋 Overview

The Payment & Cost Management system provides a comprehensive solution for:
- Dynamic cost calculation with multiple pricing factors
- Cash payment tracking with dual confirmation
- Payment dispute resolution with evidence collection
- Financial analytics and savings calculations
- Fuel price management

**Base URL**: `/api/payments`  
**Authentication**: Required for all endpoints (JWT Bearer token)  
**Content-Type**: `application/json`

---

## 🎯 Endpoints Summary

| Method | Endpoint | Description | Auth | Admin |
|--------|----------|-------------|------|-------|
| POST | `/cost/estimate` | Calculate ride cost estimate | ✅ | ❌ |
| POST | `/payments` | Create payment record | ✅ | ❌ |
| POST | `/payments/{id}/confirm` | Confirm payment (driver/rider) | ✅ | ❌ |
| GET | `/payments` | List user payments | ✅ | ❌ |
| POST | `/disputes` | Create payment dispute | ✅ | ❌ |
| GET | `/history` | Get payment history | ✅ | ❌ |
| GET | `/savings` | Calculate savings | ✅ | ❌ |
| GET | `/fuel-prices` | Get fuel prices | ✅ | ❌ |
| POST | `/admin/fuel-prices` | Update fuel price | ✅ | ✅ |
| GET | `/admin/disputes` | List all disputes | ✅ | ✅ |
| PUT | `/admin/disputes/{id}` | Update dispute | ✅ | ✅ |

---

## 💰 Cost Calculation

### POST `/api/payments/cost/estimate`

Calculate estimated ride cost with detailed breakdown.

#### Algorithm Overview
```
Total Cost = (Fuel Cost + Distance Cost + Time Cost + Vehicle Wear)
            × Demand Multiplier
            × Seasonal Adjustment
            × Weather Adjustment

Where:
- Fuel Cost = (Distance / 100) × Consumption Rate × Fuel Price
- Distance Cost = Distance × 5.0 MAD/km
- Time Cost = Duration × 0.5 MAD/minute
- Vehicle Wear = Distance × 1.5 MAD/km
- Bounded by: MIN (20 MAD) and MAX (1000 MAD)
```

#### Request Body

```json
{
  "start_latitude": 33.5731,
  "start_longitude": -7.5898,
  "end_latitude": 33.5821,
  "end_longitude": -7.6123,
  "departure_time": "2025-11-05T08:00:00",
  "passengers": 3,
  "vehicle_consumption_rate": 6.5
}
```

**Parameters**:
- `start_latitude` (float): Starting latitude (-90 to 90) **Required**
- `start_longitude` (float): Starting longitude (-180 to 180) **Required**
- `end_latitude` (float): Ending latitude (-90 to 90) **Required**
- `end_longitude` (float): Ending longitude (-180 to 180) **Required**
- `departure_time` (datetime): Scheduled departure time **Required**
- `passengers` (int): Number of passengers (1-8, default: 1)
- `vehicle_consumption_rate` (float): Vehicle fuel consumption in L/100km (3.0-15.0, default: 7.0)

#### Response

```json
{
  "estimated_cost": 42.50,
  "cost_per_passenger": 14.17,
  "breakdown": {
    "distance_km": 5.2,
    "duration_minutes": 18,
    "base_fuel_cost": 4.68,
    "distance_cost": 26.00,
    "time_cost": 9.00,
    "vehicle_wear_cost": 7.80,
    "base_total": 47.48,
    "demand_multiplier": 1.0,
    "pricing_tier": "normal",
    "seasonal_adjustment": 1.0,
    "weather_adjustment": 1.0,
    "final_cost": 42.50,
    "algorithm_version": "1.0"
  },
  "taxi_cost_estimate": 41.60,
  "potential_savings": -0.90,
  "savings_percentage": -2.16
}
```

**Status Codes**:
- `200 OK`: Cost calculated successfully
- `400 Bad Request`: Invalid coordinates or parameters
- `401 Unauthorized`: Missing or invalid JWT token

#### Pricing Tiers

| Tier | Multiplier | Conditions |
|------|------------|------------|
| `low_demand` | 0.8× | Late night (before 6 AM, after 11 PM), weekdays |
| `normal` | 1.0× | Regular hours, balanced demand |
| `moderate` | 1.2× | Weekend daytime (10 AM - 10 PM) |
| `high_demand` | 1.5× | Peak hours (7-9 AM, 5-7 PM weekdays) |
| `peak` | 2.0× | Extreme demand (demand/supply ratio > 2.0) |

#### Seasonal Adjustments

| Season | Multiplier | Months |
|--------|------------|--------|
| Summer | 1.2× | June, July, August |
| Ramadan | 1.15× | Approximate month 3 (Hijri calendar) |
| Holidays | 1.1× | January, December |
| Regular | 1.0× | Other months |

---

## 💳 Payment Management

### POST `/api/payments`

Create a payment record for a completed ride.

#### Request Body

```json
{
  "ride_id": 123,
  "amount": 45.00,
  "payment_method": "cash",
  "notes": "Payment received in full, no change needed",
  "receipt_url": "https://cloudinary.com/receipts/abc123.jpg"
}
```

**Parameters**:
- `ride_id` (int): ID of the completed ride **Required**
- `amount` (float): Payment amount in MAD (must be > 0) **Required**
- `payment_method` (enum): Payment method **Required**
  - `cash`: Cash payment
  - `bank_transfer`: Bank transfer
  - `mobile_money`: Mobile money (e.g., Orange Money)
  - `card`: Credit/debit card
- `notes` (string): Additional notes (max 1000 characters)
- `receipt_url` (string): URL of receipt photo

#### Response

```json
{
  "id": 456,
  "ride_id": 123,
  "payer_id": 789,
  "payee_id": 101,
  "payer_name": "Ahmed El-Mansouri",
  "payee_name": "Sara Benali",
  "amount": 45.00,
  "payment_method": "cash",
  "status": "pending",
  "confirmed_by_driver": false,
  "confirmed_by_rider": false,
  "transaction_reference": null,
  "notes": "Payment received in full, no change needed",
  "receipt_url": "https://cloudinary.com/receipts/abc123.jpg",
  "ride_details": {
    "start_location": "Casablanca, Morocco",
    "end_location": "Rabat, Morocco",
    "distance_km": 85.3,
    "departure_time": "2025-11-05T08:00:00"
  },
  "created_at": "2025-11-05T10:30:00",
  "updated_at": "2025-11-05T10:30:00"
}
```

**Status Codes**:
- `201 Created`: Payment record created
- `400 Bad Request`: Invalid ride ID or amount
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Ride not found

---

### POST `/api/payments/{payment_id}/confirm`

Confirm payment received (driver) or made (rider). Both parties must confirm.

#### Path Parameters
- `payment_id` (int): Payment ID **Required**

#### Request Body

```json
{
  "payment_id": 456,
  "confirm": true,
  "notes": "Payment confirmed, amount correct"
}
```

**Parameters**:
- `payment_id` (int): Payment ID to confirm **Required**
- `confirm` (bool): Confirm (true) or reject (false) **Required**
- `notes` (string): Optional confirmation notes

#### Response

```json
{
  "id": 456,
  "status": "confirmed",
  "confirmed_by_driver": true,
  "confirmed_by_rider": true,
  "confirmation_date": "2025-11-05T10:35:00",
  "message": "Payment fully confirmed by both parties"
}
```

**Status Codes**:
- `200 OK`: Confirmation processed
- `400 Bad Request`: Payment already confirmed or disputed
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized (not driver or rider)
- `404 Not Found`: Payment not found

**Workflow**:
1. Driver confirms → `confirmed_by_driver = true`
2. Rider confirms → `confirmed_by_rider = true`
3. Both confirmed → `status = "confirmed"`, payment history updated

---

### GET `/api/payments`

List user payments with advanced filtering and pagination.

#### Query Parameters

```
GET /api/payments?
  ride_id=123&
  status=confirmed&
  payment_method=cash&
  date_from=2025-11-01&
  date_to=2025-11-30&
  min_amount=20.0&
  max_amount=100.0&
  limit=20&
  offset=0
```

**Parameters**:
- `ride_id` (int): Filter by ride ID
- `status` (enum): Filter by payment status
  - `pending`: Awaiting confirmation
  - `confirmed`: Both parties confirmed
  - `disputed`: Under dispute
  - `completed`: Fully processed
  - `refunded`: Refunded
  - `cancelled`: Cancelled
- `payment_method` (enum): Filter by payment method
- `date_from` (date): Start date (YYYY-MM-DD)
- `date_to` (date): End date (YYYY-MM-DD)
- `min_amount` (float): Minimum amount
- `max_amount` (float): Maximum amount
- `limit` (int): Results per page (1-100, default: 20)
- `offset` (int): Pagination offset (default: 0)

#### Response

```json
{
  "payments": [
    {
      "id": 456,
      "ride_id": 123,
      "amount": 45.00,
      "payment_method": "cash",
      "status": "confirmed",
      "created_at": "2025-11-05T10:30:00"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**Status Codes**:
- `200 OK`: Payments retrieved
- `401 Unauthorized`: Not authenticated

---

## 🚨 Dispute Management

### POST `/api/payments/disputes`

Create a payment dispute with evidence.

#### Request Body

```json
{
  "payment_id": 456,
  "dispute_type": "incorrect_amount",
  "description": "Driver charged 60 MAD but we agreed on 45 MAD before the ride. Have screenshot of chat conversation.",
  "evidence_urls": [
    "https://cloudinary.com/evidence/chat_screenshot.jpg",
    "https://cloudinary.com/evidence/gps_route.jpg"
  ],
  "evidence_notes": "Screenshot shows agreement for 45 MAD. GPS route shows actual distance was only 5.2 km, not 8 km as claimed."
}
```

**Parameters**:
- `payment_id` (int): Payment ID to dispute **Required**
- `dispute_type` (enum): Type of dispute **Required**
  - `payment_not_received`: Driver claims payment not received
  - `incorrect_amount`: Amount differs from agreement
  - `service_not_provided`: Ride cancelled but payment requested
  - `ride_cancelled`: Ride cancelled after payment
  - `overcharge`: Charging more than reasonable
  - `other`: Other dispute reason
- `description` (string): Detailed dispute description (20-2000 characters) **Required**
- `evidence_urls` (list): URLs of evidence photos/documents (max 10 items)
- `evidence_notes` (string): Notes explaining evidence

#### Response

```json
{
  "id": 789,
  "payment_id": 456,
  "reporter_id": 789,
  "dispute_type": "incorrect_amount",
  "status": "open",
  "description": "Driver charged 60 MAD but we agreed on 45 MAD...",
  "evidence_urls": [
    "https://cloudinary.com/evidence/chat_screenshot.jpg",
    "https://cloudinary.com/evidence/gps_route.jpg"
  ],
  "created_at": "2025-11-05T11:00:00",
  "updated_at": "2025-11-05T11:00:00"
}
```

**Status Codes**:
- `201 Created`: Dispute created, payment status changed to "disputed"
- `400 Bad Request`: Invalid dispute type or description too short
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Payment not found
- `409 Conflict`: Payment already disputed

---

## 📊 Financial Reports

### GET `/api/payments/history`

Get comprehensive payment history and statistics.

#### Response

```json
{
  "user_id": 789,
  "total_earned": 1250.50,
  "completed_rides_as_driver": 48,
  "total_km_driven": 2845.3,
  "average_earning_per_ride": 26.05,
  "total_spent": 890.00,
  "completed_rides_as_rider": 35,
  "average_cost_per_ride": 25.43,
  "estimated_savings": 420.00,
  "disputes_raised": 2,
  "disputes_won": 1,
  "monthly_stats": {
    "2025-11": {
      "earned": 145.50,
      "spent": 78.00,
      "rides_as_driver": 6,
      "rides_as_rider": 3,
      "km_driven": 342.1
    },
    "2025-10": {
      "earned": 234.00,
      "spent": 120.00,
      "rides_as_driver": 9,
      "rides_as_rider": 5,
      "km_driven": 521.4
    }
  },
  "created_at": "2025-06-01T10:00:00",
  "updated_at": "2025-11-05T12:00:00"
}
```

**Status Codes**:
- `200 OK`: History retrieved
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: No payment history found (user never made/received payments)

---

### GET `/api/payments/savings`

Calculate savings vs taxi and public transport.

#### Query Parameters
- `from_date` (date): Start date for calculation (default: 30 days ago)
- `to_date` (date): End date for calculation (default: today)

#### Response

```json
{
  "period": {
    "from": "2025-10-06",
    "to": "2025-11-05"
  },
  "total_rides": 35,
  "total_coride_cost": 890.00,
  "estimated_taxi_cost": 1890.00,
  "estimated_public_transport_cost": 456.00,
  "total_savings_vs_taxi": 1000.00,
  "total_savings_vs_public_transport": -434.00,
  "savings_percentage_vs_taxi": 52.91,
  "co2_savings_kg": 142.50,
  "co2_savings_trees_equivalent": 6.52
}
```

**Calculation Details**:
- **Taxi Cost**: 8.0 MAD/km
- **Public Transport**: 6.5 MAD/ride (average bus/tram)
- **CO2 Savings**: 0.12 kg/km (vs driving alone)
- **Trees Equivalent**: CO2 saved / 21.77 kg (annual tree absorption)

**Status Codes**:
- `200 OK`: Savings calculated
- `401 Unauthorized`: Not authenticated

---

## ⛽ Fuel Price Management

### GET `/api/payments/fuel-prices`

Get current and historical fuel prices.

#### Query Parameters
- `fuel_type` (string): Filter by fuel type (default: all)
  - `essence`: Gasoline
  - `diesel`: Diesel
  - `gpl`: LPG
- `region` (string): Filter by region (default: "national")
- `limit` (int): Number of results (1-100, default: 10)

#### Response

```json
{
  "current_price": {
    "id": 1,
    "price_per_liter": 13.50,
    "fuel_type": "essence",
    "region": "national",
    "effective_date": "2025-11-01",
    "is_official": true,
    "source": "Moroccan Ministry of Energy"
  },
  "historical_prices": [
    {
      "id": 2,
      "price_per_liter": 13.25,
      "fuel_type": "essence",
      "effective_date": "2025-10-01"
    },
    {
      "id": 3,
      "price_per_liter": 13.00,
      "fuel_type": "essence",
      "effective_date": "2025-09-01"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Fuel prices retrieved
- `401 Unauthorized`: Not authenticated

---

### POST `/api/payments/admin/fuel-prices` 🔒 Admin Only

Update fuel price (requires admin role).

#### Request Body

```json
{
  "price_per_liter": 13.75,
  "fuel_type": "essence",
  "region": "national",
  "effective_date": "2025-11-06",
  "is_official": true,
  "source": "Moroccan Ministry of Energy"
}
```

**Parameters**:
- `price_per_liter` (float): Price in MAD per liter **Required**
- `fuel_type` (string): Fuel type **Required**
- `region` (string): Region (default: "national")
- `effective_date` (date): When price takes effect (default: today)
- `is_official` (bool): Official government price (default: false)
- `source` (string): Price source

#### Response

```json
{
  "id": 4,
  "price_per_liter": 13.75,
  "fuel_type": "essence",
  "region": "national",
  "effective_date": "2025-11-06",
  "is_official": true,
  "source": "Moroccan Ministry of Energy",
  "created_at": "2025-11-05T14:00:00"
}
```

**Status Codes**:
- `201 Created`: Fuel price created
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin user

---

## 🛡️ Admin Endpoints

### GET `/api/payments/admin/disputes` 🔒 Admin Only

List all payment disputes (admin access required).

#### Query Parameters
- `status` (enum): Filter by dispute status
  - `open`: Newly created
  - `under_review`: Being reviewed by admin
  - `resolved`: Resolved with outcome
  - `closed`: Closed without action
  - `escalated`: Escalated to higher authority
- `dispute_type` (enum): Filter by type
- `limit` (int): Results per page (1-100, default: 20)
- `offset` (int): Pagination offset

#### Response

```json
{
  "disputes": [
    {
      "id": 789,
      "payment_id": 456,
      "reporter_id": 789,
      "reporter_name": "Ahmed El-Mansouri",
      "dispute_type": "incorrect_amount",
      "status": "open",
      "description": "Driver charged 60 MAD but we agreed on 45 MAD...",
      "evidence_urls": ["https://cloudinary.com/evidence/chat_screenshot.jpg"],
      "created_at": "2025-11-05T11:00:00"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**Status Codes**:
- `200 OK`: Disputes retrieved
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin user

---

### PUT `/api/payments/admin/disputes/{dispute_id}` 🔒 Admin Only

Update dispute status and resolution (admin access required).

#### Path Parameters
- `dispute_id` (int): Dispute ID **Required**

#### Request Body

```json
{
  "status": "resolved",
  "resolution_notes": "After reviewing evidence, the original agreed amount of 45 MAD is confirmed. Driver will be issued a warning. Refunding 15 MAD to rider.",
  "refund_amount": 15.00
}
```

**Parameters**:
- `status` (enum): New dispute status **Required**
- `resolution_notes` (string): Admin resolution notes
- `refund_amount` (float): Refund amount in MAD (if applicable)

#### Response

```json
{
  "id": 789,
  "status": "resolved",
  "assigned_to": 101,
  "assigned_to_name": "Admin Sara",
  "resolution_notes": "After reviewing evidence...",
  "refund_amount": 15.00,
  "resolved_at": "2025-11-05T15:30:00"
}
```

**Status Codes**:
- `200 OK`: Dispute updated
- `400 Bad Request`: Invalid status transition
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin user
- `404 Not Found`: Dispute not found

---

## 📊 Data Models

### PaymentStatus Enum
- `pending`: Awaiting confirmation from driver/rider
- `confirmed`: Both parties confirmed payment
- `disputed`: Under dispute resolution
- `completed`: Fully processed and verified
- `refunded`: Payment refunded to payer
- `cancelled`: Payment cancelled

### PaymentMethod Enum
- `cash`: Cash payment
- `bank_transfer`: Bank transfer
- `mobile_money`: Mobile money (Orange Money, etc.)
- `card`: Credit/debit card

### DisputeStatus Enum
- `open`: Newly created dispute
- `under_review`: Being reviewed by admin
- `resolved`: Resolved with outcome
- `closed`: Closed without action
- `escalated`: Escalated to higher level

### DisputeType Enum
- `payment_not_received`: Payment not received by driver
- `incorrect_amount`: Amount differs from agreement
- `service_not_provided`: Service not provided as agreed
- `ride_cancelled`: Ride cancelled after payment
- `overcharge`: Unreasonable overcharging
- `other`: Other dispute reasons

### PricingTier Enum
- `low_demand`: 0.8× multiplier (late night)
- `normal`: 1.0× multiplier (regular hours)
- `moderate`: 1.2× multiplier (weekend daytime)
- `high_demand`: 1.5× multiplier (peak hours)
- `peak`: 2.0× multiplier (extreme demand)

---

## 🔐 Authentication

All endpoints require JWT authentication:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Admin endpoints additionally require `role = "admin"` in JWT payload.

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid coordinates provided"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Admin access required"
}
```

### 404 Not Found
```json
{
  "detail": "Payment not found"
}
```

### 409 Conflict
```json
{
  "detail": "Payment already confirmed"
}
```

---

## 🧪 Testing Examples

### cURL Examples

#### Estimate Cost
```bash
curl -X POST "http://localhost:8000/api/payments/cost/estimate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "start_latitude": 33.5731,
    "start_longitude": -7.5898,
    "end_latitude": 33.5821,
    "end_longitude": -7.6123,
    "departure_time": "2025-11-05T08:00:00",
    "passengers": 3
  }'
```

#### Create Payment
```bash
curl -X POST "http://localhost:8000/api/payments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ride_id": 123,
    "amount": 45.00,
    "payment_method": "cash",
    "notes": "Payment received in full"
  }'
```

#### Confirm Payment
```bash
curl -X POST "http://localhost:8000/api/payments/456/confirm" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": 456,
    "confirm": true
  }'
```

---

## 📚 Best Practices

1. **Cost Estimation**: Always call `/cost/estimate` before ride booking to show users expected cost
2. **Payment Creation**: Create payment record immediately after ride completion
3. **Dual Confirmation**: Encourage both driver and rider to confirm within 24 hours
4. **Dispute Evidence**: Upload clear photos/documents for dispute evidence
5. **Fuel Prices**: Update fuel prices weekly (admin) for accurate cost calculations
6. **Savings Display**: Show savings calculator to riders to encourage platform usage

---

## 🚀 Migration Guide

### Database Migration

Execute the SQL migration script:

```bash
psql -U postgres -d coride_morocco -f phase7_phase8_migration.sql
```

Or use pgAdmin:
1. Open Query Tool
2. Load `phase7_phase8_migration.sql`
3. Execute (F5)

### Environment Variables

```env
DEFAULT_FUEL_PRICE=13.50
MIN_RIDE_COST=20.0
MAX_RIDE_COST=1000.0
```

---

**Documentation Version**: 1.0  
**Last Updated**: November 5, 2025  
**API Version**: v1
