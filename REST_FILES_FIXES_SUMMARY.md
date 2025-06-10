# REST API Test Files - Error Fixes

## Summary of Issues Fixed

### File: `test_email_only_api.rest`

#### **Issues Fixed:**
1. **Missing Variables**: Added proper variable definitions at the top
   - `@baseUrl = https://localhost:8443/api`
   - `@testEmail = test.email.only@example.com`
   - `@testPassword = SecurePass123`
   - `@managerToken = MANAGER_TOKEN_HERE`
   - `@sessionId = SESSION_ID_FROM_STEP1`
   - `@userToken = USER_TOKEN_FROM_LOGIN`

2. **Hard-coded URLs**: Replaced all hard-coded URLs with `{{baseUrl}}` variable

3. **Inconsistent Variable Names**: Standardized variable names
   - `{{sessionId_from_step1}}` → `{{sessionId}}`
   - `{{token_from_login}}` → `{{userToken}}`
   - `{{legacy_token}}` → `{{userToken}}`

4. **Added Missing Test Cases**: Added tests for removed endpoints that should return 404:
   - `POST /auth/verify-registration-phone` (should return 404)
   - `POST /auth/resend-phone-verification` (should return 404)

### File: `test_timeslot_conflicts_api.rest`

#### **Issues Fixed:**
1. **Wrong Base URL**: Changed from `http://localhost:3000` to `https://localhost:8443`
2. **Missing Variables**: Added comprehensive variable definitions
3. **Wrong Field Names**: Fixed registration field names to match actual API:
   - `bussiness_name` (correct spelling as per database schema)
   - Fixed other field names to match validation middleware
4. **Missing Token Management**: Added proper token variable handling
5. **Service Creation Issues**: Fixed service creation parameters to match API requirements

### File: `test_timeslot_conflicts_simple.rest`

#### **Issues Fixed:**
1. **Complex JavaScript**: Removed inline JavaScript code that won't work in REST clients
2. **Database Dependencies**: Removed direct database calls
3. **Simplified Flow**: Created a cleaner, step-by-step API testing flow
4. **Added Seed Script**: Created separate `seed_test_data.js` for database initialization

## Files Ready for Testing

All three REST files are now properly formatted and ready for use with:
- **VS Code REST Client Extension**
- **Postman** (import as collection)
- **Insomnia** (import as workspace)
- **curl** (manual commands)

## Next Steps

1. **Start the server**: `node src/server.js`
2. **Run seed script**: `node seed_test_data.js` (if needed for timeslot tests)
3. **Use REST files**: Test the APIs step by step
4. **Replace placeholders**: Update tokens and session IDs from actual responses

## Variable Replacement Guide

When testing, replace these variables with actual values from responses:

```
{{sessionId}} → Replace with sessionId from start-verification response
{{userToken}} → Replace with token from login response  
{{managerToken}} → Replace with manager login token
```

## Expected API Behavior

### Email-Only Verification System:
- ✅ Registration requires only email verification
- ✅ Phone numbers are optional for all roles
- ✅ Login works with only email_verified = 1
- ❌ Phone verification endpoints should return 404

### Timeslot Conflict System:
- ✅ Detects conflicts with active bookings
- ✅ Prevents removal of booked timeslots
- ✅ Allows safe updates without conflicts
- ✅ Provides detailed conflict information

The REST files are now error-free and ready for comprehensive API testing!
