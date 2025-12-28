-- CinePay Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- ============================================
-- MOVIES TABLE
-- ============================================
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    synopsis TEXT,
    release_year INTEGER CHECK (release_year >= 1900 AND release_year <= 2100),
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(10) DEFAULT 'IDR',
    director VARCHAR(255),
    movie_cast TEXT[], -- Array of actor names
    genres TEXT[], -- Array of genre names
    thumbnail_url TEXT,
    cover_url TEXT,
    movie_url TEXT, -- Video file URL
    trailer_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PURCHASES TABLE
-- ============================================
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE RESTRICT,
    purchase_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'IDR',
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    payment_method VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    CONSTRAINT unique_user_movie UNIQUE(user_id, movie_id)
);

-- ============================================
-- WATCH HISTORY TABLE (for analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progress_seconds INTEGER DEFAULT 0,
    total_duration INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Movies indexes
CREATE INDEX idx_movies_active ON movies(is_active);
CREATE INDEX idx_movies_featured ON movies(is_featured);
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_release_year ON movies(release_year);

-- Purchases indexes
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_movie ON purchases(movie_id);
CREATE INDEX idx_purchases_status ON purchases(payment_status);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);

-- Watch history indexes
CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_watch_history_movie ON watch_history(movie_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to movies table
CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to watch_history table
CREATE TRIGGER update_watch_history_updated_at
    BEFORE UPDATE ON watch_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for user library (purchased movies)
CREATE VIEW user_library AS
SELECT 
    p.user_id,
    p.id as purchase_id,
    m.*,
    p.purchase_price,
    p.purchase_date
FROM purchases p
INNER JOIN movies m ON p.movie_id = m.id
WHERE p.payment_status = 'COMPLETED'
  AND m.is_active = TRUE;

-- View for movie statistics
CREATE VIEW movie_stats AS
SELECT 
    m.id,
    m.title,
    COUNT(DISTINCT p.user_id) as total_purchases,
    SUM(p.purchase_price) as total_revenue,
    AVG(wh.watch_duration_seconds) as avg_watch_duration
FROM movies m
LEFT JOIN purchases p ON m.id = p.movie_id AND p.payment_status = 'COMPLETED'
LEFT JOIN watch_history wh ON m.id = wh.movie_id
GROUP BY m.id, m.title;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Application users (customers and admins)';
COMMENT ON TABLE movies IS 'Movie catalog with metadata';
COMMENT ON TABLE purchases IS 'Purchase transactions';
COMMENT ON TABLE watch_history IS 'User viewing history for analytics';

COMMENT ON COLUMN users.role IS 'user or admin';
COMMENT ON COLUMN movies.is_featured IS 'Show in featured section on homepage';
COMMENT ON COLUMN purchases.payment_status IS 'PENDING, COMPLETED, FAILED, or REFUNDED';
