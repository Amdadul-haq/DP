# Step-by-Step: Create Admin User

## 1️⃣ Run Database Migration

**Open your PostgreSQL client** (pgAdmin, DBeaver, or psql) and run this file:
- File: `src/lib/MIGRATION_ADMIN_ROLE.sql`

Just copy ALL the content and paste it into your SQL query window, then execute.

This adds the 'admin' role to your database.

---

## 2️⃣ Generate Password Hash

**Open terminal in your project folder:**

```bash
cd c:\Users\Dell\Desktop\digital-prescription
node scripts/hash-password.js YourSecurePassword123
```

**Copy the output** (it looks like this):
```
Salt and hash: abc123def456:789xyz012abc...
```

Copy the ENTIRE string after "Salt and hash: "

---

## 3️⃣ Create Admin User

**Open your PostgreSQL client again** and run:

```sql
INSERT INTO users (email, password_hash, first_name, last_name, bmdc_reg, role) 
VALUES (
  'milonhaq29@gmail.com',           -- ← Change this
  '2958ac4b33669c1a7c7a4a6cbab546df:7a65bec9d75d6df682bb1c7f0b59c6cc19e01257ba2ada32e17a2066488362650ec10fe1e389e6631ba991dd4c085606b04b87f43e2cc93a64120c3474e12a2dE',           -- ← Paste hash from step 2
  'Admin',                           -- ← Change this
  'User',                            -- ← Change this
  NULL,                              -- Keep as NULL
  'admin'                            -- Keep as 'admin'
);
```

---

## 4️⃣ Verify It Worked

Run this query:

```sql
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE role = 'admin';
```

You should see your admin user.

---

## 5️⃣ Test Login

1. Go to: `http://localhost:3000/login`
2. Login with your admin email and password
3. You should be redirected to: `/dashboard/admin/payment-requests`
4. You should see the admin panel (NOT the doctor dashboard)

---

## ✅ Done!

Your admin system is ready. Now:
- Doctors who submit payments will see "Pending Approval" 
- They CANNOT access dashboard until you approve
- You (admin) can approve/reject their payments
- After approval, they get access to dashboard

---

## 🆘 Problems?

### Issue: "role check constraint is violated"
**Fix:** Run the migration file again (MIGRATION_ADMIN_ROLE.sql)

### Issue: "bmdc_reg cannot be null"
**Fix:** Run the migration file - it makes bmdc_reg nullable

### Issue: Admin login redirects to pricing
**Fix:** Check your user's role in database:
```sql
SELECT email, role FROM users WHERE email = 'your@email.com';
```
Should show `role = 'admin'`, not 'doctor'

### Issue: Cannot find hash-password.js
**Fix:** Make sure you're in the project folder:
```bash
cd c:\Users\Dell\Desktop\digital-prescription
dir scripts
```
You should see `hash-password.js` listed
