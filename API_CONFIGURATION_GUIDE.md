# API Configuration Guide

## 🔄 Switching Between Local and Deployed Backend

The frontend can now easily switch between your local backend and deployed backend.

### Quick Toggle

**File:** `frontend/src/utils/api.js`

```javascript
const USE_LOCAL_BACKEND = true  // ← Change this line
```

- **`true`** = Use local backend (http://localhost:5000)
- **`false`** = Use deployed backend (https://invigo-qehc.onrender.com/api)

---

## 📋 Configuration Options

### Option 1: Toggle in Code (Recommended for Development)

**File:** `frontend/src/utils/api.js`

```javascript
const USE_LOCAL_BACKEND = true  // Local development
// OR
const USE_LOCAL_BACKEND = false // Use deployed backend
```

**When to use:**
- ✅ Quick switching during development
- ✅ Testing against deployed backend
- ✅ No need to restart server (Hot Module Reload)

---

### Option 2: Environment Variable (Recommended for Production)

**File:** `frontend/.env` (create this file)

```env
VITE_API_URL=https://invigo-qehc.onrender.com/api
```

**When to use:**
- ✅ Production builds
- ✅ Different environments (staging, production)
- ✅ CI/CD pipelines

**Note:** Environment variables require server restart to take effect.

---

## 🎯 How It Works

### Priority Order:
1. **Environment Variable** (`VITE_API_URL`) - Highest priority
2. **Toggle Setting** (`USE_LOCAL_BACKEND`)
3. **Default** - Falls back to local

### URL Resolution:

```
VITE_API_URL exists?
  ├─ Yes → Use VITE_API_URL
  └─ No → Check USE_LOCAL_BACKEND
      ├─ true → Use '/api' (Vite proxy → http://localhost:5000)
      └─ false → Use 'https://invigo-qehc.onrender.com/api'
```

---

## 🚀 Usage Scenarios

### Scenario 1: Local Development (Default)
```javascript
const USE_LOCAL_BACKEND = true
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API calls go through Vite proxy

### Scenario 2: Test Against Deployed Backend
```javascript
const USE_LOCAL_BACKEND = false
```
- Frontend: http://localhost:3000
- Backend: https://invigo-qehc.onrender.com
- Useful for testing deployed backend changes

### Scenario 3: Production Build
```bash
# .env.production
VITE_API_URL=https://invigo-qehc.onrender.com/api
```
- Uses environment variable
- Ignores toggle setting

---

## 🔍 Debugging

### Check Current Configuration

Open browser console (F12) and look for:
```
🔗 API URL: /api
📍 Using: Local Backend
```
OR
```
🔗 API URL: https://invigo-qehc.onrender.com/api
📍 Using: Deployed Backend
```

### Common Issues

**Issue:** Changes not reflecting
- **Solution:** Clear browser cache (Ctrl+Shift+R)

**Issue:** CORS errors with deployed backend
- **Solution:** Ensure deployed backend has CORS configured for your frontend URL

**Issue:** 404 errors
- **Solution:** Check if backend is running (local) or deployed backend is accessible

---

## 📝 Quick Reference

| Setting | Frontend | Backend | Use Case |
|---------|----------|---------|----------|
| `USE_LOCAL_BACKEND = true` | localhost:3000 | localhost:5000 | Local development |
| `USE_LOCAL_BACKEND = false` | localhost:3000 | Deployed URL | Test deployed backend |
| `VITE_API_URL` set | Any | Custom URL | Production/Staging |

---

## 🎓 Best Practices

1. **Development:** Use `USE_LOCAL_BACKEND = true`
2. **Testing Deployed:** Use `USE_LOCAL_BACKEND = false`
3. **Production:** Use environment variable `VITE_API_URL`
4. **Team:** Document which setting to use in README
5. **Git:** Add `.env` to `.gitignore`, commit `.env.example`

---

## 🔧 Current Setup

- **Local Backend:** http://localhost:5000
- **Deployed Backend:** https://invigo-qehc.onrender.com/api
- **Vite Proxy:** Configured in `vite.config.js`
- **Default:** Local backend (`USE_LOCAL_BACKEND = true`)

---

**You can now easily switch between local and deployed backend!** 🎉
