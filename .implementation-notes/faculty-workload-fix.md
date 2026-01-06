# Faculty Workload Display Fix

## Problem Description

When viewing the Faculty tab in Schedule Management, faculty members were displayed but showed:
- ❌ **0 duties** (even though they had allocations)
- ❌ **Random employee IDs** (auto-generated instead of actual IDs)
- ❌ **Incorrect workload data**

## Root Cause Analysis

### The Issue: Two Separate Faculty Collections

The system has **two different faculty collections**:

1. **`FacultyCredentials`** (collection: `facultycredentials`)
   - Purpose: Login accounts for faculty
   - Contains: name, email, password (hashed), employeeId, department, campus
   - Used for: Authentication and authorization

2. **`FacultyUpload`** (collection: `faculties`)
   - Purpose: Faculty data for allocation purposes
   - Contains: name, email, employeeId, department, campus, subjects
   - Used for: Exam invigilation assignments

### The Problem

**Allocations reference `FacultyCredentials._id`**, but the faculty endpoint was only querying **`FacultyUpload`**:

```javascript
// ❌ WRONG - Only checking FacultyUpload
const faculty = await FacultyUpload.find(filter);

// Allocations have faculty field pointing to FacultyCredentials._id
const allocations = await Allocation.find({
  faculty: f._id  // This is FacultyUpload._id, not FacultyCredentials._id!
});
// Result: No allocations found → 0 duties
```

### Why Different IDs?

- `FacultyCredentials._id`: `507f1f77bcf86cd799439011` (for login account)
- `FacultyUpload._id`: `507f1f77bcf86cd799439012` (for allocation data)
- **Same person, different MongoDB documents, different _id values**

When allocations are created, they reference the `FacultyCredentials._id` (the login account), so searching with `FacultyUpload._id` returns zero results.

## The Solution

### Updated Strategy

Query **BOTH collections** and merge the results:

1. Fetch from `FacultyCredentials` (login accounts)
2. Fetch from `FacultyUpload` (allocation data)
3. Merge results, removing duplicates based on email
4. Calculate workload using the correct `_id` for each faculty

### Implementation

```javascript
// ✅ CORRECT - Check both collections
const [facultyCredentials, facultyUploads] = await Promise.all([
  FacultyCredentials.find(filter)
    .select('-password -resetOTP -resetOTPExpires')
    .sort({ name: 1 })
    .lean(),
  FacultyUpload.find(filter)
    .select('-password')
    .sort({ name: 1 })
    .lean()
]);

// Combine and deduplicate by email
const emailMap = new Map();
const allFaculty = [];

// Priority: FacultyCredentials (login-enabled faculty)
facultyCredentials.forEach(f => {
  emailMap.set(f.email.toLowerCase(), f);
  allFaculty.push({ ...f, source: 'credentials' });
});

// Add FacultyUpload only if not already in credentials
facultyUploads.forEach(f => {
  if (!emailMap.has(f.email.toLowerCase())) {
    emailMap.set(f.email.toLowerCase(), f);
    allFaculty.push({ ...f, source: 'upload' });
  }
});

// Now calculate workload with correct _id
const facultyWithWorkload = await Promise.all(
  allFaculty.map(async (f) => {
    const allocations = await Allocation.find({
      faculty: f._id,  // Now this matches the allocation reference!
      status: { $ne: 'cancelled' }
    });
    return {
      ...f,
      workload: {
        totalDuties: allocations.length,
        totalHours: allocations.reduce((sum, a) => {
          const start = moment(a.startTime, 'HH:mm');
          const end = moment(a.endTime, 'HH:mm');
          return sum + end.diff(start, 'hours', true);
        }, 0)
      }
    };
  })
);
```

## How It Works Now

### Data Flow

1. **Query Both Collections**
   ```
   FacultyCredentials: [
     { _id: "abc123", email: "john@example.com", employeeId: "EMP001", ... }
   ]
   FacultyUpload: [
     { _id: "def456", email: "jane@example.com", employeeId: "EMP002", ... }
   ]
   ```

2. **Merge by Email** (deduplication)
   ```
   allFaculty: [
     { _id: "abc123", email: "john@example.com", source: "credentials" },
     { _id: "def456", email: "jane@example.com", source: "upload" }
   ]
   ```

3. **Find Allocations** (using correct _id)
   ```
   For john@example.com (_id: "abc123"):
     Allocations.find({ faculty: "abc123" })
     → Found 5 allocations ✅
   
   For jane@example.com (_id: "def456"):
     Allocations.find({ faculty: "def456" })
     → Found 3 allocations ✅
   ```

4. **Calculate Workload**
   ```
   {
     name: "John Doe",
     email: "john@example.com",
     employeeId: "EMP001",  // Real employee ID ✅
     workload: {
       totalDuties: 5,      // Correct count ✅
       totalHours: 15.5     // Calculated from allocations ✅
     }
   }
   ```

## Updated Endpoints

### 1. GET `/api/admin/faculty`
- **Purpose**: Get all faculty with workload
- **Changes**: 
  - Queries both FacultyCredentials and FacultyUpload
  - Merges results by email
  - Calculates workload with correct _id references
- **Returns**: Combined faculty list with accurate workload data

### 2. GET `/api/admin/faculty/search`
- **Purpose**: Search faculty for allocation assignment
- **Changes**: Same as above
- **Limit**: 50 total results (combined from both collections)

## Benefits

✅ **Accurate Workload**: Shows real duties count and hours  
✅ **Correct Employee IDs**: Displays actual employee IDs, not random generated ones  
✅ **Complete Faculty List**: Includes both login-enabled and allocation-only faculty  
✅ **No Duplicates**: Email-based deduplication ensures each person appears once  
✅ **Priority System**: Login-enabled faculty (FacultyCredentials) take priority  

## Edge Cases Handled

### Case 1: Faculty in Both Collections (Same Email)
- **Result**: Shows from FacultyCredentials (login account)
- **Reason**: Login-enabled faculty have priority
- **Workload**: Calculated from their FacultyCredentials._id

### Case 2: Faculty Only in FacultyUpload
- **Result**: Shows from FacultyUpload
- **Reason**: No login account exists
- **Workload**: Calculated from their FacultyUpload._id
- **Note**: May show 0 duties if allocations reference a different collection

### Case 3: Faculty Only in FacultyCredentials
- **Result**: Shows from FacultyCredentials
- **Reason**: Has login but not in allocation pool
- **Workload**: Calculated from their FacultyCredentials._id

## Testing Checklist

After this fix, verify:

- [ ] Faculty tab loads without errors
- [ ] All faculty members are displayed
- [ ] Workload shows correct number of duties (not 0)
- [ ] Employee IDs are correct (not random)
- [ ] Total hours are calculated correctly
- [ ] Search functionality works
- [ ] Filtering by campus/department works
- [ ] No duplicate faculty entries

## Future Recommendations

### Option 1: Unify Collections (Recommended)
Merge FacultyCredentials and FacultyUpload into a single collection:
- Add `hasLogin` boolean field
- Add `password` field (nullable)
- Single source of truth for all faculty data

### Option 2: Keep Separate but Link
Add `facultyCredentialsId` field to FacultyUpload:
- Links to corresponding login account
- Easier to find related records
- Maintains separation of concerns

### Option 3: Use Email as Primary Key
Since email is unique across both collections:
- Use email for allocation references instead of _id
- Simpler queries
- No need to track which collection

## Files Modified

- `backend/routes/admin.js`:
  - Line 360-427: GET `/api/admin/faculty`
  - Line 431-522: GET `/api/admin/faculty/search`

## Related Documentation

- [Faculty Credentials Management](./faculty-credentials-management.md)
- [Faculty Tab 500 Error Fix](./faculty-tab-500-error-fix.md)
