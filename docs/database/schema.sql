-- PostgreSQL Relational Schema Draft for OrderFlow Admin OS
-- Sprint 0A Foundation Lock

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Merchants Table
CREATE TABLE merchants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tax_id VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Merchant Settings Table
CREATE TABLE merchant_settings (
    id VARCHAR(50) PRIMARY KEY,
    merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    reservation_hold_time_minutes INTEGER DEFAULT 60 NOT NULL,
    payment_account_display TEXT NOT NULL,
    notification_mode VARCHAR(30) DEFAULT 'all' NOT NULL,
    live_sale_mode BOOLEAN DEFAULT FALSE NOT NULL,
    low_stock_threshold INTEGER DEFAULT 10 NOT NULL,
    enabled_channels VARCHAR(50)[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Sales Channels Table
CREATE TABLE sales_channels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'line', 'facebook_messenger', 'facebook_live', etc.
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Customers Table
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    channel_type VARCHAR(30) NOT NULL,
    external_customer_id VARCHAR(100) NOT NULL, -- External ID from LINE/FB
    phone VARCHAR(20),
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_channel_customer UNIQUE (channel_type, external_customer_id)
);

-- 5. Products Table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    available_stock INTEGER DEFAULT 0 NOT NULL CHECK (available_stock >= 0),
    reserved_stock INTEGER DEFAULT 0 NOT NULL CHECK (reserved_stock >= 0),
    sold_stock INTEGER DEFAULT 0 NOT NULL CHECK (sold_stock >= 0),
    description TEXT,
    image_url TEXT,
    has_variants BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Product Variants Table
CREATE TABLE product_variants (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., 'Red / M'
    sku VARCHAR(100) UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    available_stock INTEGER DEFAULT 0 NOT NULL CHECK (available_stock >= 0),
    reserved_stock INTEGER DEFAULT 0 NOT NULL CHECK (reserved_stock >= 0),
    sold_stock INTEGER DEFAULT 0 NOT NULL CHECK (sold_stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Orders Table
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(id),
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
    channel_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'draft', 'confirmed', 'reserved_waiting_payment', etc.
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    paid_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (paid_amount >= 0),
    outstanding_amount NUMERIC(10, 2) NOT NULL CHECK (outstanding_amount >= 0),
    shipping_address TEXT,
    tracking_number VARCHAR(100),
    tracking_image_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Order Items Table
CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    variant_id VARCHAR(50) REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0)
);

-- 9. Payments Table
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_status VARCHAR(30) NOT NULL, -- 'paid', 'duplicate_slip', 'amount_mismatch', etc.
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    transaction_ref VARCHAR(100), -- QR slip transaction reference code
    transaction_time TIMESTAMP WITH TIME ZONE,
    slip_image_url TEXT,
    slip_payload JSONB,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. Stock Movements Table
CREATE TABLE stock_movements (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    variant_id VARCHAR(50) REFERENCES product_variants(id),
    order_id VARCHAR(50) REFERENCES orders(id),
    type VARCHAR(35) NOT NULL, -- 'in', 'out', 'reserve', 'unreserve', 'sale'
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. Order Events Table
CREATE TABLE order_events (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'status_change', 'payment_attempt', etc.
    description TEXT NOT NULL,
    actor VARCHAR(30) NOT NULL, -- 'system', 'admin', 'customer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 12. Merchant Notifications Table
CREATE TABLE merchant_notifications (
    id VARCHAR(50) PRIMARY KEY,
    merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    alert_level VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
    message TEXT NOT NULL,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. Shipping Records Table
CREATE TABLE shipping_records (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    carrier VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    tracking_image_url TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'pending' NOT NULL, -- 'pending', 'in_transit', 'delivered', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. Audit Logs Table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Indexes for optimization
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_merchant ON orders(merchant_id);
CREATE INDEX idx_customers_channel ON customers(channel_type, external_customer_id);
CREATE INDEX idx_payments_ref ON payments(transaction_ref);
CREATE INDEX idx_notifications_unread ON merchant_notifications(merchant_id) WHERE is_read = FALSE;
CREATE INDEX idx_variants_product ON product_variants(product_id);
