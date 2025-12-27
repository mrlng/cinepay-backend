const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// ==========================================
// 1. GET ALL MOVIES (Paling Atas)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, 
              COALESCE(title, '') as title, 
              COALESCE(synopsis, '') as synopsis, 
              COALESCE(release_year, 0) as release_year, 
              COALESCE(duration_minutes, 0) as duration_minutes, 
              COALESCE(CAST(rating AS TEXT), '0') as rating, 
              COALESCE(CAST(price AS TEXT), '0') as price, 
              COALESCE(currency, 'IDR') as currency, 
              COALESCE(director, '') as director, 
              COALESCE(movie_cast, ARRAY[]::text[]) as "cast", 
              COALESCE(genres, ARRAY[]::text[]) as genres, 
              COALESCE(thumbnail_url, '') as thumbnail_url, 
              COALESCE(cover_url, '') as cover_url, 
              COALESCE(movie_url, '') as movie_url, 
              COALESCE(trailer_url, '') as trailer_url, 
              COALESCE(is_featured, false) as is_featured, 
              created_at
       FROM movies 
       WHERE is_active = TRUE 
       ORDER BY created_at DESC`
        );
        res.json({ movies: result.rows });
    } catch (error) {
        console.error('Get movies error:', error);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// ==========================================
// 2. GET FEATURED (Harus sebelum /:id)
// ==========================================
router.get('/featured', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, 
              COALESCE(title, '') as title, 
              COALESCE(synopsis, '') as synopsis, 
              COALESCE(release_year, 0) as release_year, 
              COALESCE(duration_minutes, 0) as duration_minutes, 
              COALESCE(CAST(rating AS TEXT), '0') as rating, 
              COALESCE(CAST(price AS TEXT), '0') as price, 
              COALESCE(currency, 'IDR') as currency, 
              COALESCE(director, '') as director, 
              COALESCE("cast", ARRAY[]::text[]) as "cast", 
              COALESCE(genres, ARRAY[]::text[]) as genres, 
              COALESCE(thumbnail_url, '') as thumbnail_url, 
              COALESCE(cover_url, '') as cover_url, 
              COALESCE(movie_url, '') as movie_url, 
              COALESCE(trailer_url, '') as trailer_url, 
              COALESCE(is_featured, false) as is_featured
       FROM movies 
       WHERE is_active = TRUE AND is_featured = TRUE 
       ORDER BY created_at DESC
       LIMIT 4`
        );
        res.json({ movies: result.rows });
    } catch (error) {
        console.error('Get featured movies error:', error);
        res.status(500).json({ error: 'Failed to fetch featured movies' });
    }
});

// ==========================================
// 3. SEARCH MOVIES (VERSI FINAL: DOUBLE SAFETY)
// ==========================================
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        console.log(`[SEARCH] Mencari film dengan kata kunci: "${q}"`);

        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const result = await pool.query(
            `SELECT id, 
              COALESCE(title, '') as title, 
              COALESCE(synopsis, '') as synopsis, 
              COALESCE(release_year, 0) as release_year, 
              COALESCE(duration_minutes, 0) as duration_minutes, 
              COALESCE(rating, 0) as rating, 
              COALESCE(price, 0) as price, 
              COALESCE(currency, 'IDR') as currency, 
              COALESCE(director, '') as director, 
              COALESCE("cast", ARRAY[]::text[]) as "cast", 
              COALESCE(genres, ARRAY[]::text[]) as genres, 
              COALESCE(thumbnail_url, '') as thumbnail_url, 
              COALESCE(cover_url, '') as cover_url, 
              COALESCE(movie_url, '') as movie_url, 
              
              -- Pengaman 1: Di level Database
              COALESCE(trailer_url, '') as trailer_url, 
              
              COALESCE(is_featured, false) as is_featured,
              created_at
       FROM movies 
       WHERE is_active = TRUE 
         AND (title ILIKE $1 OR synopsis ILIKE $1 OR director ILIKE $1)
       ORDER BY rating DESC, title
       LIMIT 20`,
            [`%${q}%`]
        );

        // --- PENGAMAN 2: Di level Javascript ---
        const finalMovies = result.rows.map(movie => ({
            ...movie,
            price: Number(movie.price),
            rating: Number(movie.rating),
            // Jika Database lolos mengirim null, kita tangkap di sini ubah jadi ""
            trailer_url: movie.trailer_url || ""
        }));

        console.log(`[SEARCH] Mengirim ${finalMovies.length} film. Trailer URL aman? ${finalMovies[0]?.trailer_url !== null}`);
        res.json({ movies: finalMovies });
    } catch (error) {
        console.error('[SEARCH ERROR]:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// ==========================================
// 4. GET MOVIE BY ID (Harus Paling Bawah)
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, 
              COALESCE(title, '') as title, 
              COALESCE(synopsis, '') as synopsis, 
              COALESCE(release_year, 0) as release_year, 
              COALESCE(duration_minutes, 0) as duration_minutes, 
              COALESCE(CAST(rating AS TEXT), '0') as rating, 
              COALESCE(CAST(price AS TEXT), '0') as price, 
              COALESCE(currency, 'IDR') as currency, 
              COALESCE(director, '') as director, 
              COALESCE("cast", ARRAY[]::text[]) as "cast", 
              COALESCE(genres, ARRAY[]::text[]) as genres, 
              COALESCE(thumbnail_url, '') as thumbnail_url, 
              COALESCE(cover_url, '') as cover_url, 
              COALESCE(movie_url, '') as movie_url, 
              COALESCE(trailer_url, '') as trailer_url, 
              is_featured
       FROM movies 
       WHERE id = $1 AND is_active = TRUE`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get movie error:', error);
        // Cek apakah errornya karena ID tidak valid (sering terjadi jika urutan salah)
        if (error.code === '22P02') {
            return res.status(400).json({ error: 'Invalid movie ID format' });
        }
        res.status(500).json({ error: 'Failed to fetch movie' });
    }
});

module.exports = router;