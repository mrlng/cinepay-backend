-- Add order_id column and updated_at to purchases table for Midtrans integration

ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS order_id VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create index for faster order lookups
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON purchases(order_id);

-- Update existing records to have updated_at
UPDATE purchases SET updated_at = purchase_date WHERE updated_at IS NULL;
