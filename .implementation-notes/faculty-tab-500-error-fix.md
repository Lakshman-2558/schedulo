# Bug Fix: Faculty Tab 500 Error

## Issue Description
When clicking on the "Faculty" tab in the Schedule Management page (AdminSchedule.jsx), the application was throwing a **500 Internal Server Error**:

```
GET http://localhost:5000/api/admin/faculty? 500 (Internal Server Error)
```

## Root Cause

### The Bug
In `backend/routes/admin.js`, there were **two critical bugs** in the faculty endpoints:

1. **GET `/api/admin/faculty`** (line 377)
2. **GET `/api/admin/faculty/search`** (line 444)

Both endpoints had the same error:

```javascript
// ❌ WRONG - Using the Mongoose Model instead of the results array
const facultyWithWorkload = await Promise.all(
  FacultyUpload.map(async (f) => {  // FacultyUpload is a MODEL, not an array!
    // ...
  })
);
```

### Why This Caused a 500 Error

- `FacultyUpload` is a **Mongoose Model** (a class/constructor), not an array
- Calling `.map()` on a Mongoose Model is invalid
- JavaScript tried to execute `FacultyUpload.map()` which doesn't exist
- This threw a runtime error, causing the server to return a 500 status

### The Correct Variable

The code should have used the `faculty` variable, which contains the **results** from the database query:

```javascript
const faculty = await FacultyUpload.find(filter).select('-password').sort({ name: 1 });
```

## The Fix

Changed both endpoints to use the correct variable:

```javascript
// ✅ CORRECT - Using the results array
const facultyWithWorkload = await Promise.all(
  faculty.map(async (f) => {  // 'faculty' is the array of results
    const allocations = await Allocation.find({
      faculty: f._id,
      status: { $ne: 'cancelled' }
    });
    return {
      ...f.toObject(),
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

## How It Works (After Fix)

### Request Flow
1. **Frontend** (AdminSchedule.jsx line 218):
   ```javascript
   const response = await api.get(`/admin/faculty?${params}`)
   ```

2. **Backend** (admin.js line 363):
   - Receives request with optional query parameters (campus, department, search)
   - Builds filter object based on parameters
   - Queries `FacultyUpload` collection with filters
   - **Stores results in `faculty` variable** ✅

3. **Workload Calculation**:
   - Iterates over each faculty member in the `faculty` array
   - For each faculty, queries their allocations
   - Calculates total duties and total hours
   - Returns enriched faculty data with workload information

4. **Response**:
   ```javascript
   {
     success: true,
     count: 10,
     data: [
       {
         _id: "...",
         name: "John Doe",
         email: "john@example.com",
         employeeId: "EMP001",
         department: "CSE",
         campus: "Main Campus",
         workload: {
           totalDuties: 5,
           totalHours: 15.5
         }
       },
       // ... more faculty
     ]
   }
   ```

## Affected Endpoints

### 1. GET `/api/admin/faculty`
- **Purpose**: Get all faculty with workload information
- **Used by**: AdminSchedule.jsx (Faculty tab)
- **Filters**: campus, department, search
- **Returns**: Array of faculty with workload data

### 2. GET `/api/admin/faculty/search`
- **Purpose**: Search faculty by name, email, or employee ID
- **Used by**: Various admin components for faculty selection
- **Filters**: q (search query), campus, department
- **Returns**: Array of faculty with workload data (max 50 results)

## Testing

After the fix, the Faculty tab should:
1. ✅ Load without errors
2. ✅ Display all faculty members
3. ✅ Show workload information (duties and hours)
4. ✅ Support filtering by campus and department
5. ✅ Support search functionality
6. ✅ Display loading states correctly

## Prevention

To prevent similar bugs in the future:

1. **Use descriptive variable names**:
   - `faculty` (results array) vs `FacultyUpload` (model)
   - Consider naming: `facultyResults`, `facultyList`, etc.

2. **Add type checking**:
   ```javascript
   if (!Array.isArray(faculty)) {
     throw new Error('Faculty must be an array');
   }
   ```

3. **Add error logging**:
   ```javascript
   catch (error) {
     console.error('Error in /api/admin/faculty:', error);
     console.error('Error stack:', error.stack);
     res.status(500).json({
       success: false,
       message: error.message
     });
   }
   ```

4. **Use TypeScript** (optional):
   - Would catch this error at compile time
   - Type annotations make it clear what's a model vs results

## Related Code

### Frontend Component
- **File**: `frontend/src/pages/admin/AdminSchedule.jsx`
- **Line**: 211-225 (fetchFaculty function)
- **Tab**: Faculty tab (activeTab === 1)

### Backend Route
- **File**: `backend/routes/admin.js`
- **Lines**: 360-407 (GET /api/admin/faculty)
- **Lines**: 409-474 (GET /api/admin/faculty/search)

### Models Used
- **FacultyUpload**: `backend/models/FacultyUpload.js` (for allocation purposes)
- **FacultyCredentials**: `backend/models/FacultyCredentials.js` (for login)
- **Allocation**: `backend/models/Allocation.js` (for workload calculation)
