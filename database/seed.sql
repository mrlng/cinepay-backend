-- CinePay Database Seed Data
-- Initial data for development and testing

-- ============================================
-- ADMIN USER
-- ============================================
-- Password: admin123 (bcrypt hash)
INSERT INTO users (id, email, full_name, password_hash, role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@cinepay.com', 'Admin CinePay', '$2a$10$rBV2kHJmXH.UPXLfQR6ycOqN/4kZJY5x7RGU5K5YGC.dJZp1jKgQu', 'admin', TRUE);

-- ============================================
-- TEST USERS
-- ============================================
-- Password for all: password123
INSERT INTO users (id, email, full_name, password_hash, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'test@cinepay.com', 'Test User', '$2a$10$rBV2kHJmXH.UPXLfQR6ycOqN/4kZJY5x7RGU5K5YGC.dJZp1jKgQu', 'user'),
('550e8400-e29b-41d4-a716-446655440002', 'demo@cinepay.com', 'Demo User', '$2a$10$rBV2kHJmXH.UPXLfQR6ycOqN/4kZJY5x7RGU5K5YGC.dJZp1jKgQu', 'user');

-- ============================================
-- MOVIES DATA (from existing mock data)
-- ============================================

INSERT INTO movies (id, title, synopsis, release_year, duration_minutes, rating, price, director, cast, genres, thumbnail_url, cover_url, movie_url, is_featured) VALUES

-- Inception
('660e8400-e29b-41d4-a716-446655440001', 
'Inception', 
'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
2010, 148, 8.8, 45000,
'Christopher Nolan',
ARRAY['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
ARRAY['Action', 'Sci-Fi', 'Thriller'],
'https://picsum.photos/seed/inception/300/450',
'https://picsum.photos/seed/inception-cover/1920/1080',
'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
TRUE),

-- The Dark Knight
('660e8400-e29b-41d4-a716-446655440002',
'The Dark Knight',
'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
2008, 152, 9.0, 50000,
'Christopher Nolan',
ARRAY['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
ARRAY['Action', 'Crime', 'Drama'],
'https://picsum.photos/seed/darkknight/300/450',
'https://picsum.photos/seed/darkknight-cover/1920/1080',
'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
TRUE),

-- Interstellar
('660e8400-e29b-41d4-a716-446655440003',
'Interstellar',
'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
2014, 169, 8.6, 48000,
'Christopher Nolan',
ARRAY['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
ARRAY['Adventure', 'Drama', 'Sci-Fi'],
'https://picsum.photos/seed/interstellar/300/450',
'https://picsum.photos/seed/interstellar-cover/1920/1080',
'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
TRUE),

-- The Shawshank Redemption
('660e8400-e29b-41d4-a716-446655440004',
'The Shawshank Redemption',
'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
1994, 142, 9.3, 42000,
'Frank Darabont',
ARRAY['Tim Robbins', 'Morgan Freeman'],
ARRAY['Drama'],
'https://picsum.photos/seed/shawshank/300/450',
'https://picsum.photos/seed/shawshank-cover/1920/1080',
'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
TRUE),

-- Pulp Fiction
('660e8400-e29b-41d4-a716-446655440005',
'Pulp Fiction',
'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
1994, 154, 8.9, 40000,
'Quentin Tarantino',
ARRAY['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
ARRAY['Crime', 'Drama'],
'https://picsum.photos/seed/pulpfiction/300/450',
'https://picsum.photos/seed/pulpfiction-cover/1920/1080',
'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
FALSE),

-- The Matrix
('660e8400-e29b-41d4-a716-446655440006',
'The Matrix',
'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
1999, 136, 8.7, 43000,
'Lana Wachowski, Lilly Wachowski',
ARRAY['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
ARRAY['Action', 'Sci-Fi'],
'https://picsum.photos/seed/matrix/300/450',
'https://picsum.photos/seed/matrix-cover/1920/1080',
'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
FALSE),

-- Parasite
('660e8400-e29b-41d4-a716-446655440007',
'Parasite',
'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
2019, 132, 8.6, 46000,
'Bong Joon Ho',
ARRAY['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
ARRAY['Comedy', 'Drama', 'Thriller'],
'https://picsum.photos/seed/parasite/300/450',
'https://picsum.photos/seed/parasite-cover/1920/1080',
'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
FALSE),

-- The Godfather
('660e8400-e29b-41d4-a716-446655440008',
'The Godfather',
'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
1972, 175, 9.2, 44000,
'Francis Ford Coppola',
ARRAY['Marlon Brando', 'Al Pacino', 'James Caan'],
ARRAY['Crime', 'Drama'],
'https://picsum.photos/seed/godfather/300/450',
'https://picsum.photos/seed/godfather-cover/1920/1080',
'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
FALSE);

-- ============================================
-- SAMPLE PURCHASES (for testing)
-- ============================================

INSERT INTO purchases (user_id, movie_id, purchase_price, currency, transaction_id, payment_method, payment_status, completed_at) VALUES
-- Test user purchases Inception
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 45000, 'IDR', 'TRX_TEST_001', 'gopay', 'COMPLETED', CURRENT_TIMESTAMP),
-- Demo user purchases Dark Knight
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 50000, 'IDR', 'TRX_TEST_002', 'ovo', 'COMPLETED', CURRENT_TIMESTAMP);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count records
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM movies) as total_movies,
    (SELECT COUNT(*) FROM purchases) as total_purchases;

-- Show admin user
SELECT email, full_name, role FROM users WHERE role = 'admin';

-- Show featured movies
SELECT title, price, is_featured FROM movies WHERE is_featured = TRUE;
