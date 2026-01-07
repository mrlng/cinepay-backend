-- Make transaction_id nullable for Midtrans integration
-- We now use order_id for tracking Midtrans transactions
-- transaction_id is only used for legacy mock purchases

ALTER TABLE purchases 
  ALTER COLUMN transaction_id DROP NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN purchases.transaction_id IS 'Legacy transaction ID for mock purchases. For Midtrans, use order_id instead';
COMMENT ON COLUMN purchases.order_id IS 'Midtrans order ID for payment tracking';
