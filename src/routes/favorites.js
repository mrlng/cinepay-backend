const express = require('express');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get user's favorites
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        m.id,
        COALESCE(m.title, '') as title,
        COALESCE(m.synopsis, '') as synopsis,
        COALESCE(m.release_year, 0) as release_year,
        COALESCE(m.duration_minutes, 0) as duration_minutes,
        COALESCE(CAST(m.rating AS TEXT), '0') as rating,
        COALESCE(CAST(m.price AS TEXT), '0') as price,
        COALESCE(m.currency, 'IDR') as currency,
        COALESCE(m.director, '') as director,
        COALESCE(m.movie_cast, ARRAY[]::text[]) as "cast",
        COALESCE(m.genres, ARRAY[]::text[]) as genres,
        COALESCE(m.thumbnail_url, '') as thumbnail_url,
        COALESCE(m.cover_url, '') as cover_url,
        COALESCE(m.is_featured, false) as is_featured
      FROM favorites f
      JOIN movies m ON f.movie_id = m.id
      WHERE f.user_id = $1 AND m.is_active = TRUE
      ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            favorites: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Failed to get favorites' });
    }
});

// Check if movie is favorited
router.get('/check/:movieId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { movieId } = req.params;

        const result = await pool.query(
            'SELECT id FROM favorites WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId]
        );

        res.json({
            is_favorited: result.rows.length > 0
        });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ error: 'Failed to check favorite status' });
    }
});

// Add to favorites
router.post('/:movieId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { movieId } = req.params;

        // Check if movie exists
        const movieCheck = await pool.query(
            'SELECT id FROM movies WHERE id = $1',
            [movieId]
        );

        if (movieCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        // Add to favorites (UNIQUE constraint handles duplicates)
        const result = await pool.query(
            `INSERT INTO favorites (user_id, movie_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, movie_id) DO NOTHING
       RETURNING id, created_at`,
            [userId, movieId]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({
                message: 'Already in favorites',
                already_favorited: true
            });
        }

        res.status(201).json({
            message: 'Added to favorites',
            favorite_id: result.rows[0].id,
            created_at: result.rows[0].created_at
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
});

// Remove from favorites
router.delete('/:movieId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { movieId } = req.params;

        const result = await pool.query(
            'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2 RETURNING id',
            [userId, movieId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json({
            message: 'Removed from favorites',
            favorite_id: result.rows[0].id
        });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Failed to remove from favorites' });
    }
});

module.exports = router;
