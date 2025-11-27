# 🔐 Login Instructions - Troubleshooting

## ✅ Both Servers Are Running!

- **Backend:** http://localhost:5001 ✓
- **Frontend:** http://localhost:5173 ✓
- **Database:** MongoDB connected ✓

---

## 📝 How to Login

### Step 1: Open Browser
```
http://localhost:5173
```

### Step 2: Clear Browser Cache (If Issue Persists)
Press `Ctrl + Shift + Delete` or:
- Chrome: Clear browsing data → Check "Cached images and files"
- Or simply: Hard Refresh with `Ctrl + Shift + R`

### Step 3: Login Credentials
```
Email: student@test.com
Password: Student123!
```

### Step 4: After Login
- You should automatically redirect to `/exams`
- You'll see 3 available exams

---

## 🔧 If Login Page Keeps Refreshing

### Solution 1: Clear LocalStorage
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type this and press Enter:
```javascript
localStorage.clear()
location.reload()
```

### Solution 2: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try logging in
4. Look for `/api/auth/login` request
5. Check if Status is **200** (success)
6. If **CORS error** or **Failed**, backend might not be running

### Solution 3: Verify Backend is Running
Open new tab: http://localhost:5001/health

Should show:
```json
{"status":"OK","timestamp":"..."}
```

If not working, restart backend:
```bash
cd "e:\Online Examination System\server"
npm run dev
```

---

## 🎯 Expected Behavior After Login

1. Click "Login" button
2. Page briefly shows "Logging in..."
3. **Redirects to /exams page** (you should see exam list)
4. If you see 3 exams, **SUCCESS!** ✅

---

## 🐛 Common Issues & Fixes

### Issue: "Network Error" or "CORS Error"
**Fix:** Backend not running
```bash
cd "e:\Online Examination System\server"
npm run dev
```

### Issue: "Invalid email or password"
**Fix:** Database might not be seeded
```bash
cd "e:\Online Examination System\server"
npm run seed
```

### Issue: Page keeps refreshing
**Fix:** Clear browser cache and localStorage
```javascript
// In browser console (F12)
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Issue: Can't see exams after login
**Fix:** Check if you're logged in
```javascript
// In browser console
console.log(localStorage.getItem('user'))
console.log(localStorage.getItem('accessToken'))
```
Should show user data and token.

---

## 🧪 Test the System

### Open Browser Console (F12)
After attempting login, check for errors:
- Red errors? → Something failed
- No errors? → Login should work

### Check What Happens:
1. Type email & password
2. Click "Login"
3. Watch the console
4. Should redirect to `/exams`

---

## ✅ Verification Steps

### 1. Backend Health
```bash
curl http://localhost:5001/health
```
**Expected:** `{"status":"OK",...}`

### 2. Login API
```bash
curl -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"Student123!\"}"
```
**Expected:** JSON with user and tokens

### 3. Frontend Access
Open: http://localhost:5173
**Expected:** See login page

---

## 🚀 Quick Restart (If Nothing Works)

### Terminal 1 - Backend:
```bash
cd "e:\Online Examination System\server"
npm run dev
```
Wait for: "Server running on port 5001"

### Terminal 2 - Frontend:
```bash
cd "e:\Online Examination System\client"
npm run dev
```
Wait for: "Local: http://localhost:5173"

### Then:
1. Clear browser cache (`Ctrl + Shift + R`)
2. Go to http://localhost:5173
3. Login with student@test.com / Student123!

---

## 💡 Pro Tips

1. **Keep DevTools open** (F12) to see what's happening
2. **Check Console tab** for JavaScript errors
3. **Check Network tab** to see API requests
4. **LocalStorage** stores your login - check it in DevTools → Application → Local Storage

---

## 📞 Still Having Issues?

### Check These:
- [ ] Backend running? (`npm run dev` in server folder)
- [ ] Frontend running? (`npm run dev` in client folder)
- [ ] MongoDB running? (Check port 27017)
- [ ] Browser cache cleared?
- [ ] Using correct credentials? (student@test.com / Student123!)

### Debug in Console:
```javascript
// Check if axios is configured correctly
console.log(import.meta.env.VITE_API_URL)
// Should show: http://localhost:5001/api

// After login attempt, check:
console.log(localStorage.getItem('user'))
console.log(localStorage.getItem('accessToken'))
```

---

**If everything is running but still not working, take a screenshot of:**
1. Browser console errors
2. Network tab showing the login request
3. Any error messages on screen

This will help debug further! 🔍
