# Service Review System Documentation

## Overview
The Service Review System allows pet owners to rate and review services they have booked and received. Service providers can view and analyze their reviews to improve their services.

## Database Schema

### Related Tables
- **`service_review`**: Stores review data (bookid, stars, comment)
- **`booking`**: Links pet owners to services with booking details
- **`service`**: Service information and provider details
- **`serviceprovider`**: Service provider business information
- **`petowner`**: Pet owner information
- **`users`**: User account information

### Key Relationships
```sql
booking (poid) → petowner (id) → users (userid)
booking (svid) → service (serviceid) → serviceprovider (providerid)
service_review (bookid) → booking (bookid)
```

## API Endpoints

### Base URL: `/api/reviews`
All endpoints require authentication (`authMiddleware`) and full verification (`requireFullVerification`).

### 1. Get My Reviews
**Endpoint:** `GET /my-reviews`  
**Access:** Pet owners only  
**Description:** Get all reviews made by the authenticated pet owner

**Response:**
```json
{
  "message": "Your reviews retrieved successfully",
  "reviews": [
    {
      "bookid": 1,
      "stars": 5,
      "comment": "Excellent service!",
      "servedate": "2025-06-15",
      "booking_status": "completed",
      "service_name": "Pet Grooming",
      "service_description": "Professional pet grooming",
      "provider_name": "Happy Paws Grooming",
      "provider_contact_name": "John Smith"
    }
  ]
}
```

### 2. Get Service Reviews
**Endpoint:** `GET /service/:serviceId`  
**Access:** Anyone (service providers restricted to own services)  
**Description:** Get all reviews for a specific service with statistics

**Response:**
```json
{
  "message": "Service reviews retrieved successfully",
  "service": {
    "id": 1,
    "name": "Pet Grooming",
    "provider": "Happy Paws Grooming"
  },
  "statistics": {
    "totalReviews": 5,
    "averageRating": 4.2
  },
  "reviews": [...]
}
```

### 3. Get Provider Reviews
**Endpoint:** `GET /provider/:providerId`  
**Access:** Anyone (providers restricted to own reviews)  
**Description:** Get all reviews for a service provider across all their services

**Response:**
```json
{
  "message": "Provider reviews retrieved successfully",
  "provider": {
    "id": 1,
    "businessName": "Happy Paws Grooming",
    "contactName": "John Smith"
  },
  "statistics": {
    "totalReviews": 12,
    "averageRating": 4.1,
    "serviceBreakdown": [
      {
        "serviceId": 1,
        "serviceName": "Basic Grooming",
        "reviewCount": 8,
        "averageRating": 4.3
      }
    ]
  },
  "reviews": [...]
}
```

### 4. Create Review
**Endpoint:** `POST /booking/:bookingId`  
**Access:** Pet owners only (own bookings only)  
**Description:** Create a review for a completed booking

**Request Body:**
```json
{
  "stars": 5,
  "comment": "Excellent service! Highly recommended."
}
```

**Validation Rules:**
- `stars`: Required, integer between 1-5
- `comment`: Optional, string max 1000 characters
- Booking must be completed
- Booking must belong to authenticated user
- Review must not already exist

**Response:**
```json
{
  "message": "Review created successfully",
  "review": {
    "bookingId": 1,
    "serviceName": "Pet Grooming",
    "stars": 5,
    "comment": "Excellent service!",
    "serviceDate": "2025-06-15"
  }
}
```

### 5. Update Review
**Endpoint:** `PUT /booking/:bookingId`  
**Access:** Pet owners only (own reviews only)  
**Description:** Update an existing review

**Request Body:**
```json
{
  "stars": 4,
  "comment": "Good service, but room for improvement."
}
```

**Validation Rules:**
- At least one field (`stars` or `comment`) must be provided
- `stars`: If provided, integer between 1-5
- `comment`: If provided, string max 1000 characters

### 6. Delete Review
**Endpoint:** `DELETE /booking/:bookingId`  
**Access:** Pet owners only (own reviews only)  
**Description:** Delete a review

**Response:**
```json
{
  "message": "Review deleted successfully",
  "deletedReview": {
    "bookingId": 1,
    "serviceName": "Pet Grooming",
    "stars": 5,
    "comment": "Excellent service!"
  }
}
```

### 7. Get Specific Review
**Endpoint:** `GET /booking/:bookingId`  
**Access:** Pet owners (own reviews), Service providers (reviews for their services)  
**Description:** Get detailed information about a specific review

## Security Features

### Role-Based Access Control
- **Pet Owners**: Can create, update, delete, and view their own reviews
- **Service Providers**: Can view reviews for their own services only
- **Managers**: Full access (inherited from base middleware)

### Data Validation
- Star ratings must be integers between 1-5
- Comments limited to 1000 characters
- Booking ownership verification
- Service provider ownership verification

### Business Logic Constraints
- Reviews can only be created for completed bookings
- Each booking can have only one review
- Users can only review their own bookings
- Providers can only view reviews for their services

## Error Handling

### Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Rating must be an integer between 1 and 5"]
}
```

**403 Forbidden - Access Denied:**
```json
{
  "message": "Access denied. Only pet owners can create reviews."
}
```

**404 Not Found:**
```json
{
  "message": "Booking not found"
}
```

**409 Conflict - Duplicate Review:**
```json
{
  "message": "Review already exists for this booking. Use PUT to update it."
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```

## Usage Examples

### 1. Pet Owner Workflow
1. Complete a service booking
2. Create a review: `POST /api/reviews/booking/123`
3. View own reviews: `GET /api/reviews/my-reviews`
4. Update review if needed: `PUT /api/reviews/booking/123`

### 2. Service Provider Workflow
1. View reviews for specific service: `GET /api/reviews/service/456`
2. View all provider reviews: `GET /api/reviews/provider/789`
3. Analyze statistics to improve services

### 3. Public/Customer Workflow
1. Browse service reviews: `GET /api/reviews/service/456`
2. Check provider reputation: `GET /api/reviews/provider/789`

## Testing

Use the provided test files:
- **`test_reviews_api.rest`**: HTTP client tests for all endpoints
- **`test_reviews_integration.js`**: Integration verification script

## Database Queries Examples

### Get Average Rating for a Service
```sql
SELECT AVG(stars) as avg_rating, COUNT(*) as total_reviews
FROM service_review sr
JOIN booking b ON sr.bookid = b.bookid
WHERE b.svid = ?
```

### Get Recent Reviews for a Provider
```sql
SELECT sr.stars, sr.comment, b.servedate, u.name as reviewer_name
FROM service_review sr
JOIN booking b ON sr.bookid = b.bookid
JOIN service s ON b.svid = s.serviceid
JOIN users u ON b.poid = u.userid
WHERE s.providerid = ?
ORDER BY b.servedate DESC
LIMIT 10
```

## Future Enhancements

1. **Review Moderation**: Add admin approval for reviews
2. **Response System**: Allow providers to respond to reviews
3. **Review Helpfulness**: Add upvote/downvote for reviews
4. **Image Support**: Allow photo attachments with reviews
5. **Review Analytics**: Detailed dashboard for providers
6. **Review Reminders**: Automated emails to request reviews
7. **Aggregate Metrics**: Service category averages and comparisons
