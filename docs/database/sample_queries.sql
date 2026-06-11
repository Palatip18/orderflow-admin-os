-- Business Analyst Reporting Queries for OrderFlow Admin OS
-- Sprint 0A Foundation Lock

-- 1. Daily Sales Summary (Excluding cancelled or expired reserves)
SELECT 
    CURRENT_DATE AS report_date,
    COUNT(id) AS total_orders_count,
    COALESCE(SUM(total_amount), 0.00) AS total_sales_volume,
    COALESCE(SUM(paid_amount), 0.00) AS total_collected_revenue,
    COALESCE(SUM(outstanding_amount), 0.00) AS total_outstanding_receivables
FROM orders
WHERE status NOT IN ('cancelled', 'expired')
  AND created_at >= CURRENT_DATE;

-- 2. Orders Waiting Payment Reservation Queue
SELECT 
    id AS order_id,
    customer_id,
    channel_type,
    total_amount,
    expires_at,
    (expires_at - CURRENT_TIMESTAMP) AS time_remaining
FROM orders
WHERE status = 'reserved_waiting_payment'
ORDER BY expires_at ASC;

-- 3. Paid Orders Waiting Address Details Capture
SELECT 
    o.id AS order_id,
    c.name AS customer_name,
    o.channel_type,
    o.total_amount,
    o.paid_amount,
    o.created_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'paid_waiting_address'
ORDER BY o.created_at DESC;

-- 4. Ready-to-Ship Fulfilment Queue
SELECT 
    o.id AS order_id,
    c.name AS customer_name,
    o.shipping_address,
    o.total_amount,
    o.updated_at AS confirmed_paid_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'ready_to_ship'
ORDER BY o.updated_at ASC;

-- 5. Open Issue Cases Needing Manual Admin Intervention
SELECT 
    o.id AS order_id,
    c.name AS customer_name,
    o.status AS order_status,
    o.total_amount,
    o.paid_amount,
    o.outstanding_amount,
    (SELECT description FROM order_events WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_event_note
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'issue'
ORDER BY o.created_at DESC;

-- 6. Low Stock Inventory Warnings (Products and Variants)
-- Union query showing products without variants and individual product variants that fell below the settings threshold (e.g. 10)
SELECT 
    p.sku AS code,
    p.name AS product_name,
    'Product' AS type,
    p.available_stock
FROM products p
WHERE p.has_variants = FALSE AND p.available_stock <= 10
UNION ALL
SELECT 
    v.sku AS code,
    CONCAT(p.name, ' (', v.name, ')') AS product_name,
    'Variant' AS type,
    v.available_stock
FROM product_variants v
JOIN products p ON v.product_id = p.id
WHERE v.available_stock <= 10
ORDER BY available_stock ASC;

-- 7. Potential Duplicate Payment Slip Verification (Fraud Check)
SELECT 
    transaction_ref,
    COUNT(id) AS occurrences,
    ARRAY_AGG(order_id) AS linked_orders,
    SUM(amount) AS total_ref_amount
FROM payments
WHERE transaction_ref IS NOT NULL
GROUP BY transaction_ref
HAVING COUNT(id) > 1;

-- 8. Channel Order Summary (Sales Breakdown by Feed Channel)
SELECT 
    channel_type,
    COUNT(id) AS order_count,
    COALESCE(SUM(total_amount), 0.00) AS total_sales,
    COALESCE(SUM(paid_amount), 0.00) AS total_collected
FROM orders
WHERE status NOT IN ('cancelled', 'expired')
GROUP BY channel_type
ORDER BY total_sales DESC;
