# Timeslot Conflict Handling Implementation

## Overview

This document describes the implementation of timeslot conflict detection and resolution for the Pet Care Service backend. The system now prevents service providers from removing timeslots that have active bookings, ensuring data integrity and customer satisfaction.

## Problem Statement

**Before Implementation:**
- Service providers could remove timeslots without checking for existing bookings
- Database foreign key constraint `ON DELETE RESTRICT` would cause silent failures or server errors
- No clear feedback to providers about conflicts
- Risk of data inconsistency and customer booking cancellations

**After Implementation:**
- Comprehensive conflict detection before any timeslot modifications
- Clear error messages with detailed conflict information
- Suggestions for conflict resolution
- Safe timeslot updates that preserve existing bookings

## Database Constraints

The system relies on this critical foreign key constraint:

```sql
FOREIGN KEY(svid, slot) REFERENCES timeslot(serviceid, slot) 
  ON UPDATE CASCADE ON DELETE RESTRICT
```

This constraint ensures that:
- Bookings are always linked to valid timeslots
- Timeslots cannot be deleted if they have active bookings
- Data integrity is maintained at the database level

## Implementation Details

### 1. Enhanced Validation Middleware

**File**: `src/middleware/validationMiddleware.js`

Added `validateTimeslotConflicts` middleware that:
- Checks for future active bookings on timeslots being removed
- Returns detailed conflict information
- Provides suggestions for resolution
- Runs before the main update logic

```javascript
export const validateTimeslotConflicts = (req, res, next) => {
    // Conflict detection logic
    // Returns 409 Conflict if issues found
    // Calls next() if safe to proceed
}
```

### 2. Updated Service Update Logic

**File**: `src/routes/services.js`

Enhanced the approved service update endpoint (`PUT /api/services/:id/update-approved`) with:

#### Smart Timeslot Management
- Analyzes existing vs. proposed timeslots
- Identifies slots to add vs. slots to remove
- Only removes slots that have no active bookings
- Adds new slots without conflicts

#### Conflict Detection
- Checks each slot being removed for active bookings
- Queries booking status (excludes 'cancelled' and 'completed')
- Includes customer information in conflict reports

#### Detailed Error Responses
```javascript
{
    "success": false,
    "error": "Timeslot conflict detected",
    "message": "Cannot remove timeslots that have active bookings",
    "conflicts": [
        {
            "timeslot": "10:00",
            "activeBookings": 2,
            "bookingDetails": [
                {
                    "bookingId": 123,
                    "serviceDate": "2025-06-15",
                    "status": "confirmed",
                    "petOwner": {
                        "name": "John Doe",
                        "email": "john@example.com"
                    }
                }
            ]
        }
    ],
    "suggestions": [
        "Keep the existing timeslots that have bookings",
        "Contact customers to reschedule their bookings",
        "Wait until bookings are completed or cancelled",
        "Add new timeslots without removing existing ones"
    ]
}
```

## API Endpoints Modified

### PUT /api/services/:id/update-approved

**Enhanced with conflict handling:**

**Request:**
```json
{
    "description": "Updated service description",
    "timeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"]
}
```

**Success Response (200):**
```json
{
    "message": "Approved service updated successfully",
    "service": {
        "serviceid": 1,
        "name": "Pet Grooming",
        "description": "Updated service description",
        "timeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"]
    },
    "updatedFields": {
        "description": true,
        "timeSlots": true
    }
}
```

**Conflict Response (409):**
```json
{
    "success": false,
    "error": "Timeslot conflict detected",
    "conflicts": [...],
    "suggestions": [...]
}
```

## Testing Strategy

### 1. Automated Testing

**File**: `test_timeslot_conflicts.js`
- Tests conflict detection logic
- Verifies database constraints
- Shows statistics and conflict examples

### 2. API Testing

**File**: `test_timeslot_conflicts.rest`
- Tests complete API workflow
- Demonstrates conflict scenarios
- Verifies resolution strategies

### 3. Test Scenarios

1. **Conflict Detection**: Try to remove timeslot with active booking
2. **Safe Updates**: Add new timeslots without removing existing ones
3. **Partial Updates**: Update description only (no timeslot changes)
4. **Resolution**: Remove timeslots after bookings are cancelled/completed

## Conflict Resolution Strategies

### For Service Providers

1. **Keep Conflicting Slots**: Modify timeslot list to keep slots with bookings
2. **Add New Slots**: Add additional timeslots without removing existing ones
3. **Wait for Completion**: Wait until bookings are completed or cancelled
4. **Customer Communication**: Contact customers to reschedule (manual process)

### For System Administrators

1. **Booking Management**: Help cancel/reschedule problematic bookings
2. **Service Migration**: Move bookings to alternative timeslots
3. **Customer Support**: Handle customer complaints about schedule changes

## Error Handling

### Database Level
- Foreign key constraints prevent orphaned bookings
- Transaction rollback on constraint violations
- Detailed SQLite error messages

### Application Level
- Pre-validation before database operations
- Graceful error responses with actionable information
- Comprehensive logging for debugging

### User Experience
- Clear conflict descriptions
- Actionable suggestions
- No data loss or corruption

## Performance Considerations

### Query Optimization
- Uses prepared statements for repeated queries
- Indexes on foreign key columns for fast lookups
- Minimal queries (only check slots being removed)

### Transaction Management
- Atomic operations with transaction boundaries
- Rollback on any failure
- Consistent database state guaranteed

## Security Implications

### Authorization
- Only service providers can update their own services
- Booking information only shown for conflicts (limited scope)
- Email addresses included only for conflict resolution

### Data Protection
- No sensitive customer data exposed
- Audit trail maintained in database
- Conflict information logged for support

## Future Enhancements

### Potential Improvements

1. **Automated Rescheduling**: Suggest alternative timeslots for affected customers
2. **Batch Operations**: Handle multiple service updates efficiently  
3. **Notification System**: Automatically notify customers of schedule changes
4. **Conflict Analytics**: Track and analyze common conflict patterns
5. **Calendar Integration**: Visual conflict representation

### API Extensions

1. **Conflict Preview**: `GET /api/services/:id/timeslot-conflicts` endpoint
2. **Bulk Updates**: Support for multiple service updates
3. **Booking Migration**: API to move bookings between timeslots
4. **Schedule Optimization**: Suggest optimal timeslot configurations

## Monitoring and Maintenance

### Metrics to Track
- Conflict frequency by service/provider
- Resolution success rates
- Customer satisfaction impact
- Performance of conflict detection queries

### Regular Maintenance
- Review and optimize conflict detection queries
- Update conflict resolution suggestions based on user feedback
- Monitor database constraint violation logs
- Analyze customer support tickets related to scheduling

---

## Summary

The timeslot conflict handling implementation provides:

✅ **Data Integrity**: Database constraints prevent orphaned bookings  
✅ **User Experience**: Clear error messages and actionable suggestions  
✅ **Business Logic**: Smart conflict detection and resolution strategies  
✅ **System Reliability**: Graceful error handling and transaction safety  
✅ **Performance**: Optimized queries and minimal database impact  
✅ **Security**: Proper authorization and data protection  

This implementation ensures that service providers can safely manage their availability while protecting existing customer bookings and maintaining system reliability.
