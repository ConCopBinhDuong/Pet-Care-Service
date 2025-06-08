# Schedule Validation Implementation

## 📋 Overview

The schedule validation middleware has been successfully implemented to provide comprehensive input validation for the schedule management system. This validation ensures data integrity for pet schedules that link diets and activities to specific times and dates.

## 🎯 Validation Functions Implemented

### 1. `validateScheduleCreation`

Validates data for creating new pet schedules with the following rules:

**Required Logic:**
- ✅ Must provide either `dietid` OR `activityid` (mutually exclusive)
- ✅ Cannot provide both diet and activity IDs simultaneously

**Field Validation:**
- **`dietid`** (optional): Must be a positive number if provided
- **`activityid`** (optional): Must be a positive number if provided  
- **`startdate`** (optional): Must be in YYYY-MM-DD format if provided
- **`repeat_option`** (optional): Must be one of the predefined values
- **`hour`** (optional): Must be between 0-23 if provided
- **`minute`** (optional): Must be between 0-59 if provided

**Valid Repeat Options:**
- `never` (default)
- `hourly`
- `daily` 
- `weekly`
- `biweekly`
- `monthly`
- `every 3 months`
- `every 6 months`
- `yearly`

### 2. `validateScheduleUpdate`

Validates data for updating existing schedules:

**Update Logic:**
- ✅ At least one field must be provided for update
- ✅ Only validates provided fields (partial updates supported)

**Field Validation:**
- **`startdate`** (optional): YYYY-MM-DD format validation
- **`repeat_option`** (optional): Must be from valid options list
- **`hour`** (optional): 0-23 range validation
- **`minute`** (optional): 0-59 range validation

## 🔗 Database Schema Integration

The validation aligns with the SQLite database schema:

```sql
CREATE TABLE petschedule (
    petscheduleid INTEGER PRIMARY KEY AUTOINCREMENT,
    startdate DATE,
    repeat_option TEXT DEFAULT 'never',
    hour INTEGER,
    minute INTEGER,
    dietid INTEGER,
    activityid INTEGER,
    FOREIGN KEY(dietid) REFERENCES diet(dietid),
    FOREIGN KEY(activityid) REFERENCES activity(activityid)
);
```

## 🛠 Implementation Details

### Route Integration

**Schedule Routes Updated:**
```javascript
// POST /api/schedules - Create new schedule
router.post('/', validateScheduleCreation, (req, res) => { ... });

// PUT /api/schedules/:scheduleId - Update schedule  
router.put('/:scheduleId', validateScheduleUpdate, (req, res) => { ... });
```

**Import Statement Added:**
```javascript
import { validateScheduleCreation, validateScheduleUpdate } from '../middleware/validationMiddleware.js'
```

### Error Response Format

```json
{
    "success": false,
    "error": "Validation failed",
    "details": [
        "Must provide either diet ID or activity ID, but not both",
        "Hour must be a number between 0 and 23"
    ]
}
```

## 🧪 Testing

### Test Coverage

A comprehensive test suite (`test_schedule_validation.mjs`) covers:

1. **Missing Required Fields** - Validates exclusive diet/activity requirement
2. **Conflicting Fields** - Rejects both diet and activity IDs
3. **Invalid Hour Values** - Tests 0-23 range enforcement
4. **Invalid Minute Values** - Tests 0-59 range enforcement  
5. **Invalid Repeat Options** - Tests enum validation
6. **Invalid Date Formats** - Tests YYYY-MM-DD format requirement
7. **Empty Updates** - Ensures at least one field for updates
8. **Valid Requests** - Confirms proper validation passes

### Running Tests

```bash
# Make test executable and run
chmod +x test_schedule_validation.mjs
node test_schedule_validation.mjs
```

## 📊 Business Logic

### Schedule Creation Logic

1. **Mutual Exclusivity**: Each schedule must be for either a diet OR an activity, never both
2. **Time Validation**: Hours and minutes must be valid 24-hour format values
3. **Date Flexibility**: Start dates are optional and can be in the past (for existing schedules)
4. **Repeat Patterns**: Supports comprehensive repeat options from hourly to yearly

### Schedule Update Logic

1. **Partial Updates**: Only provided fields are validated and updated
2. **Time Consistency**: Maintains same validation rules as creation
3. **Required Updates**: Prevents empty update requests

## 🔒 Security Considerations

- **Input Sanitization**: All string inputs are validated for type and format
- **Range Validation**: Numeric inputs are bounded to prevent invalid time values  
- **Format Enforcement**: Date strings must match exact YYYY-MM-DD pattern
- **Enum Validation**: Repeat options are restricted to predefined safe values

## 🎉 Completion Status

- ✅ **Schedule Validation Functions**: Implemented and tested
- ✅ **Route Integration**: Added to schedule.js POST and PUT endpoints
- ✅ **Import Statements**: Updated with proper validation imports
- ✅ **Error Handling**: Comprehensive validation error responses
- ✅ **Test Suite**: Complete validation testing coverage
- ✅ **Documentation**: Implementation details and usage guide

The schedule validation system is now complete and provides robust input validation for all schedule management operations in the Pet Care Service Backend.
