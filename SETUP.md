# CinePay Backend - Setup Guide

## Quick Start

### 1. Install PostgreSQL

**Option A: Using Docker** (Recommended)
```bash
docker run --name cinepay-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14
```

**Option B: Install locally**
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set

### 2. Create Database & Run Schema

```bash
# Using psql (Windows)
psql -U postgres

# In psql prompt:
CREATE DATABASE cinepay_db;
\c cinepay_db
\i C:/Users/ang/.gemini/antigravity/scratch/cinepay-backend/database/schema.sql
\i C:/Users/ang/.gemini/antigravity/scratch/cinepay-backend/database/seed.sql

# Verify
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM movies;
\q
```

### 3. Configure Environment

```bash
cd C:\Users\ang\.gemini\antigravity\scratch\cinepay-backend

# Copy example env file
copy .env.example .env

# Edit .env file - update DB_PASSWORD with your PostgreSQL password
```

### 4. Install Dependencies & Run

```bash
# Install Node.js dependencies
npm install

# Start server
npm run dev
```

Server will run on: http://localhost:3000

### 5. Test API

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"newuser@test.com\",\"full_name\":\"New User\",\"password\":\"password123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@cinepay.com\",\"password\":\"password123\"}"
```

**Get Movies:**
```bash
curl http://localhost:3000/api/movies
```

## Default Credentials

- Admin: `admin@cinepay.com` / `admin123`
- Test User: `test@cinepay.com` / `password123`

## API Endpoints

### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login

### Movies
- GET `/api/movies` - All movies
- GET `/api/movies/featured` - Featured movies  
- GET `/api/movies/:id` - Movie detail
- GET `/api/movies/search?q=query` - Search

### Purchases (requires auth token)
- POST `/api/purchases` - Create purchase
- GET `/api/purchases/library` - User's library
- GET `/api/purchases/check/:movieId` - Check if purchased

## Troubleshooting

**PostgreSQL not starting:**
```bash
# Check if running
docker ps

# Restart container
docker restart cinepay-postgres
```

**Port already in use:**
Change PORT in .env file to different number (e.g., 3001)

**Database connection error:**
Verify DB_PASSWORD in .env matches your PostgreSQL password
