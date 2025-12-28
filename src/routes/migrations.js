const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Migration endpoint (temporary - remove after running)
router.post('/migrate-watch-history', async (req, res) => {
    try {
        // Run migration
        await pool.query(`
            ALTER TABLE watch_history 
            ADD COLUMN IF NOT EXISTS progress_seconds INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS total_duration INTEGER,
            ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE
        `);

        // Verify columns exist
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'watch_history'
            ORDER BY ordinal_position
        `);

        res.json({
            success: true,
            message: 'Migration completed successfully!',
            columns: result.rows
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
