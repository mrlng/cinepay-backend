const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const midtrans = require('../services/midtrans');

const router = express.Router();

// Webhook endpoint (NO auth - Midtrans calls this)
router.post('/webhook', async (req, res) => {
    try {
        const notification = req.body;
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        console.log('📬 Midtrans webhook received:', {
            orderId,
            transactionStatus,
            fraudStatus
        });

        // Map to our payment status
        const paymentStatus = midtrans.mapPaymentStatus(transactionStatus, fraudStatus);

        // Update purchase status in database
        const result = await pool.query(
            `UPDATE purchases 
             SET payment_status = $1, updated_at = NOW() 
             WHERE order_id = $2
             RETURNING id, user_id, movie_id, payment_status`,
            [paymentStatus, orderId]
        );

        if (result.rows.length === 0) {
            console.warn('⚠️  Order not found:', orderId);
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log('✅ Payment status updated:', result.rows[0]);

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// All other routes require authentication
router.use(authMiddleware);


// Initiate payment (NEW - Midtrans integration)
router.post('/initiate', async (req, res) => {
    try {
        const { movie_id } = req.body;
        const userId = req.user.userId;

        // Validate
        if (!movie_id) {
            return res.status(400).json({ error: 'Movie ID is required' });
        }

        // Get movie details
        const movieResult = await pool.query(
            'SELECT id, title, price FROM movies WHERE id = $1 AND is_active = TRUE',
            [movie_id]
        );

        if (movieResult.rows.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        const movie = movieResult.rows[0];

        // Check if already purchased
        const existingPurchase = await pool.query(
            'SELECT id FROM purchases WHERE user_id = $1 AND movie_id = $2 AND payment_status = $3',
            [userId, movie_id, 'COMPLETED']
        );

        if (existingPurchase.rows.length > 0) {
            return res.status(400).json({ error: 'Movie already purchased' });
        }

        // Get user details
        const userResult = await pool.query(
            'SELECT id, name, email FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Generate unique order ID
        const orderId = `CMP-${Date.now()}-${userId.substring(0, 8)}`;

        // Create Midtrans transaction
        const transaction = await midtrans.createTransaction(
            orderId,
            movie.price,
            {
                first_name: user.name,
                email: user.email,
                phone: user.phone || '08123456789' // Default if no phone
            },
            [{
                id: movie.id,
                price: movie.price,
                quantity: 1,
                name: movie.title
            }]
        );

        // Save pending purchase to database
        await pool.query(
            `INSERT INTO purchases 
             (user_id, movie_id, purchase_price, currency, order_id, payment_method, payment_status, purchase_date)
             VALUES ($1, $2, $3, 'IDR', $4, 'MIDTRANS', 'PENDING', NOW())`,
            [userId, movie_id, movie.price, orderId]
        );

        console.log('💳 Payment initiated:', {
            orderId,
            userId,
            movieId: movie_id,
            amount: movie.price
        });

        res.status(200).json({
            order_id: orderId,
            snap_token: transaction.token,
            redirect_url: transaction.redirectUrl,
            amount: movie.price
        });

    } catch (error) {
        console.error('❌ Payment initiation error:', error);
        res.status(500).json({
            error: 'Failed to initiate payment',
            message: error.message
        });
    }
});

// Old mock purchase endpoint (DEPRECATED - keep for backward compatibility)
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

// Check payment status by order ID
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            'SELECT payment_status, order_id, purchase_price FROM purchases WHERE order_id = $1 AND user_id = $2',
            [orderId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            order_id: result.rows[0].order_id,
            status: result.rows[0].payment_status,
            amount: result.rows[0].purchase_price
        });
    } catch (error) {
        console.error('Check status error:', error);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

// ============================================
// WATCH HISTORY ENDPOINTS
// ============================================

// Save/Create watch history (first time watching or resume)
router.post('/watch-history', async (req, res) => {
    try {
        const { movie_id, progress_seconds, total_duration } = req.body;
        const userId = req.user.userId;

        // Validate
        if (!movie_id) {
            return res.status(400).json({ error: 'Missing movie_id' });
        }

        // Check if user owns this movie
        const purchase = await pool.query(
            'SELECT id FROM purchases WHERE user_id = $1 AND movie_id = $2 AND payment_status = $3',
            [userId, movie_id, 'COMPLETED']
        );

        if (purchase.rows.length === 0) {
            return res.status(403).json({ error: 'Movie not purchased' });
        }

        // Upsert watch history
        const result = await pool.query(
            `INSERT INTO watch_history (user_id, movie_id, progress_seconds, total_duration, watched_at, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id, movie_id) 
             DO UPDATE SET 
                progress_seconds = EXCLUDED.progress_seconds,
                total_duration = EXCLUDED.total_duration,
                watched_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, movie_id, progress_seconds || 0, total_duration]
        );

        res.status(201).json({
            message: 'Watch history saved',
            history: result.rows[0]
        });
    } catch (error) {
        console.error('Save watch history error:', error);
        res.status(500).json({ error: 'Failed to save watch history' });
    }
});

// Get watch progress for a specific movie
router.get('/watch-history/:movieId', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { movieId } = req.params;

        const result = await pool.query(
            `SELECT 
                progress_seconds,
                total_duration,
                completed,
                watched_at,
                CASE 
                    WHEN total_duration > 0 THEN ROUND((progress_seconds::DECIMAL / total_duration) * 100, 2)
                    ELSE 0
                END as progress_percentage
             FROM watch_history
             WHERE user_id = $1 AND movie_id = $2`,
            [userId, movieId]
        );

        if (result.rows.length === 0) {
            return res.json({
                has_progress: false,
                progress_seconds: 0,
                progress_percentage: 0
            });
        }

        res.json({
            has_progress: true,
            ...result.rows[0]
        });
    } catch (error) {
        console.error('Get watch history error:', error);
        res.status(500).json({ error: 'Failed to fetch watch history' });
    }
});

// Update watch progress (for auto-save during playback)
router.put('/watch-history/:movieId', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { movieId } = req.params;
        const { progress_seconds, total_duration, completed } = req.body;

        // Check if watch history exists
        const existing = await pool.query(
            'SELECT id FROM watch_history WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId]
        );

        if (existing.rows.length === 0) {
            // Create new entry if doesn't exist
            const result = await pool.query(
                `INSERT INTO watch_history (user_id, movie_id, progress_seconds, total_duration, completed)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [userId, movieId, progress_seconds || 0, total_duration, completed || false]
            );
            return res.json({
                message: 'Watch history created',
                history: result.rows[0]
            });
        }

        // Update existing entry
        const result = await pool.query(
            `UPDATE watch_history 
             SET progress_seconds = $1,
                 total_duration = $2,
                 completed = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $4 AND movie_id = $5
             RETURNING *`,
            [progress_seconds, total_duration, completed || false, userId, movieId]
        );

        res.json({
            message: 'Watch history updated',
            history: result.rows[0]
        });
    } catch (error) {
        console.error('Update watch history error:', error);
        res.status(500).json({ error: 'Failed to update watch history' });
    }
});

module.exports = router;
