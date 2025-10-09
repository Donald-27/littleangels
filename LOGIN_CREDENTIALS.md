# Login Credentials - Little Angels Transport System

## 🔐 ACTUAL Test User Accounts

These are the **real users** currently in your database. Use these exact emails:

### Admin Accounts
1. **Email:** `kipropdonald27@gmail.com`
   - **Password:** `admin123`
   - **Name:** Donald Kiprop
   - **Access:** Full system access

2. **Email:** `admin@littleangels.ac.ke`
   - **Password:** `admin123`
   - **Name:** Admin User
   - **Access:** Full system access

### Parent Accounts
1. **Email:** `weldonkorir305@gmail.com`
   - **Password:** `parent123`
   - **Name:** Weldon Korir

2. **Email:** `parent1@example.com`
   - **Password:** `parent123`
   - **Name:** Mary Chebet

3. **Email:** `parent@littleangels.ac.ke`
   - **Password:** `parent123`
   - **Name:** Parent User

### Teacher Accounts
1. **Email:** `teacher1@school.com`
   - **Password:** `teacher123`
   - **Name:** Sarah Mutai

2. **Email:** `teacher2@school.com`
   - **Password:** `teacher123`
   - **Name:** David Kiprotich

3. **Email:** `sarah.mutai@littleangels.ac.ke`
   - **Password:** `teacher123`
   - **Name:** Sarah Mutai

4. **Email:** `david.kiprotich@littleangels.ac.ke`
   - **Password:** `teacher123`
   - **Name:** David Kiprotich

### Driver Accounts
1. **Email:** `driver1@school.com`
   - **Password:** `driver123`
   - **Name:** John Mwangi

2. **Email:** `john.mwangi@littleangels.ac.ke`
   - **Password:** `driver123`
   - **Name:** John Mwangi

3. **Email:** `peter.kimani@littleangels.ac.ke`
   - **Password:** `driver123`
   - **Name:** Peter Kimani

4. **Email:** `driver@littleangels.ac.ke`
   - **Password:** `driver123`
   - **Name:** John Driver

### Accounts/Finance
1. **Email:** `accounts@school.com`
   - **Password:** `accounts123`
   - **Name:** Grace Wanjiku

2. **Email:** `grace.wanjiku@littleangels.ac.ke`
   - **Password:** `accounts123`
   - **Name:** Grace Wanjiku

---

## ✅ RECOMMENDED FOR TESTING

**Use these primary accounts:**

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `kipropdonald27@gmail.com` | `admin123` |
| **Parent** | `weldonkorir305@gmail.com` | `parent123` |
| **Teacher** | `teacher1@school.com` | `teacher123` |
| **Driver** | `driver1@school.com` | `driver123` |
| **Accounts** | `accounts@school.com` | `accounts123` |

---

## 🚀 How to Login

1. **Go to:** http://localhost:5000
2. **Click:** "Sign In" button
3. **Enter email:** Use EXACT email from list above (copy/paste recommended)
4. **Enter password:** Use corresponding password (e.g., `admin123`)
5. **Click:** "Login"

---

## ⚠️ Common Login Mistakes

❌ **WRONG:** `admin@littleangels.com` (doesn't exist)  
✅ **CORRECT:** `kipropdonald27@gmail.com`

❌ **WRONG:** `admin@school.com` (doesn't exist)  
✅ **CORRECT:** `kipropdonald27@gmail.com` or `admin@littleangels.ac.ke`

---

## 🔧 Troubleshooting

### If login still fails:

1. **Copy/paste the email exactly** - Don't type it manually
2. **Check for spaces** - Remove any leading/trailing spaces
3. **Verify password** - All test passwords follow `[role]123` pattern
4. **Check browser console** - Press F12, look for errors
5. **Try incognito mode** - Clear any cached data

### Check database status:
```bash
cd littleangels-academy-1
node scripts/verify_seed.js
```

### View all users in database:
```bash
cd littleangels-academy-1
node -e "
import('@supabase/supabase-js').then(({ createClient }) => {
  const sb = createClient('https://zvkfuljxidxtuqrmquso.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk', { auth: { persistSession: false } });
  sb.from('users').select('email, role').then(({data}) => console.log(data));
});
"
```

---

**Last Updated:** October 09, 2025  
**Status:** ✅ Verified working credentials
