# Faculty Login Troubleshooting Guide

## ✅ Backend Verification - PASSED

The backend login system is working correctly:
- ✅ FacultyCredentials model is properly configured
- ✅ User lookup by Employee ID works
- ✅ Password hashing and comparison works
- ✅ Test faculty user created successfully

**Test Faculty Credentials:**
- Employee ID: `FAC001`
- Password: `password123`
- Email: `faculty@test.com`

## 🔧 Steps to Fix Login Issue

### Step 1: Restart Backend Server (REQUIRED)
The model changes require a server restart:

```bash
# In the backend terminal:
1. Press Ctrl+C to stop the server
2. Run: npm run dev
```

### Step 2: Test Login via API
After restarting, test the login endpoint directly:

```bash
# Using curl or Postman:
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "employeeId": "FAC001",
  "password": "password123"
}
```

Expected response:
```json
{
  "success": true,
  "token": "...",
  "data": {
    "id": "...",
    "name": "Test Faculty",
    "email": "faculty@test.com",
    "role": "faculty",
    "employeeId": "FAC001",
    ...
  }
}
```

### Step 3: Check Frontend Login
1. Open the frontend: http://localhost:5173 (or your frontend port)
2. Click on "Faculty" tab
3. Enter:
   - Employee ID: `FAC001`
   - Password: `password123`
4. Click "Sign In"

### Step 4: Check Browser Console
If login fails:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Go to Network tab
5. Try logging in again
6. Check the `/api/auth/login` request
7. Look at the response

## 🐛 Common Issues & Solutions

### Issue 1: "Employee ID not found"
**Cause:** Faculty not in FacultyCredentials collection
**Solution:** Run the create test faculty script:
```bash
cd d:\MSD\MSD\backend
node scripts/createTestFaculty.js
```

### Issue 2: "Invalid credentials - Incorrect password"
**Cause:** Wrong password or password not hashed correctly
**Solution:** 
- Make sure you're using: `password123`
- Recreate the user with the script above

### Issue 3: Server not responding
**Cause:** Server not restarted after model changes
**Solution:** 
1. Stop backend server (Ctrl+C)
2. Restart: `npm run dev`

### Issue 4: CORS errors in browser
**Cause:** Frontend can't connect to backend
**Solution:** 
- Check backend is running on correct port
- Check frontend API URL in `frontend/src/utils/api.js`

## 📝 Verification Checklist

- [ ] Backend server restarted
- [ ] Test faculty created (FAC001)
- [ ] API endpoint responds (test with curl/Postman)
- [ ] Frontend can reach backend
- [ ] Browser console shows no errors
- [ ] Network tab shows successful request

## 🔍 Debug Scripts

### Check all users in database:
```bash
node scripts/checkAllUsers.js
```

### Test login functionality:
```bash
node scripts/testLogin.js
```

### Create test faculty:
```bash
node scripts/createTestFaculty.js
```

## 📞 Next Steps

1. **Restart the backend server** (most important!)
2. Try logging in with the test credentials
3. If still not working, check the browser console and network tab
4. Share any error messages you see

---

**Note:** The backend login system is verified and working. The issue is likely just that the server needs to be restarted to load the new model changes.
