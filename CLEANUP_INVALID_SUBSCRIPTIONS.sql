-- ============================================
-- Clean Up Invalid Subscriptions
-- ============================================
-- This script removes subscriptions that were created without admin approval
-- (i.e., subscriptions without a corresponding approved payment request)

-- STEP 1: Check which subscriptions will be deleted (DRY RUN)
SELECT 
    s.id as subscription_id,
    s.user_id,
    s.plan_id,
    s.created_at,
    u.email as user_email,
    u.first_name || ' ' || u.last_name as user_name,
    CASE 
        WHEN s.payment_request_id IS NULL THEN 'No payment request linked'
        ELSE 'Has payment request: ' || s.payment_request_id
    END as payment_status
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.payment_request_id IS NULL
   OR s.payment_request_id NOT IN (
       SELECT id FROM payment_requests WHERE status = 'approved'
   );

-- STEP 2: Delete invalid subscriptions (UNCOMMENT TO EXECUTE)
-- WARNING: This will permanently delete subscriptions without admin-approved payment requests
-- Only run this after verifying the SELECT query above shows the correct records

-- DELETE FROM subscriptions
-- WHERE payment_request_id IS NULL
--    OR payment_request_id NOT IN (
--        SELECT id FROM payment_requests WHERE status = 'approved'
--    );

-- STEP 3: Verify cleanup
-- SELECT COUNT(*) as remaining_subscriptions FROM subscriptions;
-- SELECT COUNT(*) as approved_payment_requests FROM payment_requests WHERE status = 'approved';

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Run STEP 1 first to see what will be deleted
-- 2. If the results look correct, uncomment and run STEP 2
-- 3. Run STEP 3 to verify the cleanup was successful
-- 4. After cleanup, users must submit payment and wait for admin approval to get access
