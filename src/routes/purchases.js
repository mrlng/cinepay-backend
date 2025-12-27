const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All purchase routes require authentication
router.use(authMiddleware);

// Create purchase
router.post('/', async (req, res) => {
    try {
        const { movie_id, price, payment_method } = req.body;
        const userId = req.user.userId;

        // Validate
        if (!movie_id || !price || !payment_method) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if already purchased
        const existing = await pool.query(
            'SELECT id FROM purchases WHERE user_id = $1 AND movie_id = $2',
            [userId, movie_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Movie already purchased' });
        }

        // Create purchase
        const transactionId = `TRX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const result = await pool.query(
            `INSERT INTO purchases (user_id, movie_id, purchase_price, currency, transaction_id, payment_method, payment_status, completed_at)
       VALUES ($1, $2, $3, 'IDR', $4, $5, 'COMPLETED', CURRENT_TIMESTAMP)
       RETURNING id, user_id, movie_id, purchase_price, currency, transaction_id, payment_method, payment_status, purchase_date, completed_at`,
            [userId, movie_id, price, transactionId, payment_method]
        );

        res.status(201).json({
            message: 'Purchase successful',
            purchase: result.rows[0]
        });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ error: 'Purchase failed' });
    }
});

// Get user's purchased movies (library)
router.get('/library', async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT m.*, p.purchase_price, p.purchase_date, p.transaction_id, p.payment_method
       FROM purchases p
       INNER JOIN movies m ON p.movie_id = m.id
       WHERE p.user_id = $1 
         AND p.payment_status = 'COMPLETED'
         AND m.is_active = TRUE
       ORDER BY p.purchase_date DESC`,
            [userId]
        );

        res.json({ movies: result.rows });
    } catch (error) {
        console.error('Get library error:', error);
        res.status(500).json({ error: 'Failed to fetch library' });
    }
});

// Check if movie is purchased
router.get('/check/:movieId', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { movieId } = req.params;

        const result = await pool.query(
            'SELECT id FROM purchases WHERE user_id = $1 AND movie_id = $2 AND payment_status = $3',
            [userId, movieId, 'COMPLETED']
        );

        res.json({ purchased: result.rows.length > 0 });
    } catch (error) {
        console.error('Check purchase error:', error);
        res.status(500).json({ error: 'Check failed' });
    }
});

module.exports = router;
