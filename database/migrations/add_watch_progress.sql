-- Migration: Add watch progress columns to watch_history table
-- Run this on Railway database

ALTER TABLE watch_history 
  ADD COLUMN IF NOT EXISTS progress_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_duration INTEGER,
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
