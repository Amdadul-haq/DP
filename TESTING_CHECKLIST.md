# 🧪 Admin System Testing Checklist

## ✅ Before Testing

- [ ] Database migration completed (`MIGRATION_ADMIN_ROLE.sql`)
- [ ] Admin user created in database
- [ ] Verified admin role in database: `SELECT email, role FROM users WHERE role='admin';`
- [ ] Development server running: `npm run dev`

---

## 1️⃣ Admin Login Test

### Steps:
1. Open browser: `http://localhost:3000/login`
2. Enter admin credentials
3. Click "Sign in"

### Expected Result:
✅ Redirected to: `/admin/payment-requests`
✅ See admin panel with sidebar
✅ Sidebar shows: Dashboard, Payment Requests, Users, Settings
✅ No doctor navigation items
✅ Page title shows "Admin Panel"

### If It Fails:
❌ Check browser console (F12 → Console tab)
❌ Verify database role: `SELECT role FROM users WHERE email='your@email.com'`
❌ Clear localStorage and try again

---

## 2️⃣ Admin Navigation Test

### Visit These URLs:
- [ ] `/admin` - Should show dashboard with stats
- [ ] `/admin/payment-requests` - Should show payment management
- [ ] `/admin/users` - Should show users placeholder
- [ ] `/admin/settings` - Should show settings placeholder

### Expected Result:
✅ All pages load successfully
✅ Sidebar highlights active page
✅ No errors in console
✅ Can navigate between pages using sidebar

---

## 3️⃣ Admin Panel Features Test

### Test Dashboard (`/admin`):
- [ ] Stats cards visible
- [ ] Shows payment request counts
- [ ] Shows pending payments count
- [ ] Quick action links work

### Test Payment Requests (`/admin/payment-requests`):
- [ ] Can see all payment requests
- [ ] Can filter by status (All, Pending, Approved, Rejected)
- [ ] Approve button works
- [ ] Reject button works
- [ ] Refresh button works

---

## 4️⃣ Security Tests

### Test 1: Doctor Cannot Access Admin Panel
1. Login as a doctor (not admin)
2. Try to visit `/admin/payment-requests`

**Expected:** ✅ Redirected to `/login` with error message

### Test 2: Admin Cannot Access Doctor Dashboard
1. Login as admin
2. Try to visit `/dashboard`

**Expected:** ✅ Stays in admin area, doesn't see doctor features

### Test 3: Unauthenticated User
1. Logout
2. Try to visit `/admin`

**Expected:** ✅ Redirected to `/login`

---

## 5️⃣ Payment Approval Workflow Test

### Full Workflow:
1. **As Doctor:** Register → Submit payment
2. **As Admin:** Login → Go to Payment Requests
3. **As Admin:** See pending payment
4. **As Admin:** Approve payment
5. **As Doctor:** Logout and login again
6. **As Doctor:** Should now access dashboard

### Expected Results:
- [ ] Doctor sees "Pending Approval" after payment submission
- [ ] Doctor CANNOT access dashboard before approval
- [ ] Admin sees payment in "Pending" tab
- [ ] Admin can approve with optional note
- [ ] After approval, subscription created in database
- [ ] Doctor can now login and access `/dashboard`
- [ ] Telegram notification sent (if configured)

---

## 6️⃣ Mobile Responsiveness Test

### Test on Mobile View:
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device

### Check:
- [ ] Mobile menu button appears
- [ ] Sidebar opens from left
- [ ] All pages readable on mobile
- [ ] Tables scroll horizontally
- [ ] Buttons are touchable

---

## 🐛 Troubleshooting

### Issue: Admin login redirects to pricing page
**Cause:** User role is 'doctor', not 'admin'

**Fix:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### Issue: "Unauthorized - Admin access required"
**Cause:** Backend can't verify admin role

**Check:**
1. Database role is 'admin'
2. Token is valid in localStorage
3. Backend API `/api/admin/check-access` returns 200

### Issue: Admin panel shows blank page
**Cause:** JavaScript error

**Fix:**
1. Check browser console for errors
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart dev server: `npm run dev`

### Issue: Can't see payment requests
**Cause:** No payment submissions yet

**Test:**
1. Register a new doctor account
2. Submit a payment request
3. Login as admin
4. Should now see the request

---

## ✅ Success Criteria

Your admin system is working correctly if:

1. ✅ Admin can login and see admin panel
2. ✅ Admin panel has sidebar with navigation
3. ✅ Payment requests page shows all submissions
4. ✅ Admin can approve/reject payments
5. ✅ Doctors cannot access admin panel
6. ✅ Admins cannot access doctor dashboard
7. ✅ After approval, doctor gets dashboard access
8. ✅ Mobile version works properly
9. ✅ No console errors
10. ✅ Telegram notifications work (if configured)

---

## 📊 Test Results Template

Copy and fill this after testing:

```
Date: [Today's date]
Tester: [Your name]

✅ Admin Login: [PASS/FAIL]
✅ Admin Navigation: [PASS/FAIL]
✅ Dashboard Stats: [PASS/FAIL]
✅ Payment Approval: [PASS/FAIL]
✅ Security (Doctor Access): [PASS/FAIL]
✅ Security (Unauthorized): [PASS/FAIL]
✅ Mobile View: [PASS/FAIL]
✅ Full Workflow: [PASS/FAIL]

Notes:
[Any issues or observations]

Overall Status: [READY FOR PRODUCTION / NEEDS FIXES]
```

---

**Ready to test? Start with Test #1 above!** 🚀
