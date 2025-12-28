#!/bin/bash
# Run this script using: railway run bash migrate-watch-history.sh

psql $DATABASE_URL << EOF
ALTER TABLE watch_history 
  ADD COLUMN IF NOT EXISTS progress_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_duration INTEGER,
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

SELECT 'Migration completed successfully!' as status;
EOF
