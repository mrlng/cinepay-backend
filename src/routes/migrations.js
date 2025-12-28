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

// Run favorites migration
router.post('/add-favorites', async (req, res) => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, movie_id)
      );

      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_movie_id ON favorites(movie_id);
    `);

        res.json({
            success: true,
            message: 'Favorites table created successfully'
        });
    } catch (error) {
        console.error('Favorites migration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
