# CinePay Backend API

RESTful API server for CinePay streaming application.

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **File Upload**: Multer

## Prerequisites

1. **Node.js** v18 or higher
2. **PostgreSQL** 14 or higher
3. **npm** or **yarn**

## Database Setup

### 1. Install PostgreSQL

**Windows** (using Chocolatey):
```bash
choco install postgresql
```

**Or download**: https://www.postgresql.org/download/

### 2. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cinepay_db;

# Connect to database
\c cinepay_db

# Run schema
\i database/schema.sql

# Run seed data
\i database/seed.sql

# Verify
SELECT * FROM users;
SELECT * FROM movies;
```

### 3. Database Credentials

Create `.env` file (see `.env.example`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinepay_db
DB_USER=postgres
DB_PASSWORD=your_password
```

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```

## API Endpoints

### Authentication

```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login & get JWT token
GET    /api/auth/profile         - Get current user (protected)
POST   /api/auth/logout          - Logout
```

### Movies

```
GET    /api/movies               - List all active movies
GET    /api/movies/featured      - Get featured movies
GET    /api/movies/:id           - Get movie detail
GET    /api/movies/search?q=     - Search movies
```

### Purchases

```
POST   /api/purchases            - Create purchase (protected)
GET    /api/purchases            - Get purchase history (protected)
GET    /api/library              - Get user's library (protected)
```

### Admin (Admin Role Required)

```
GET    /api/admin/movies         - List all movies
POST   /api/admin/movies         - Create movie
PUT    /api/admin/movies/:id     - Update movie
DELETE /api/admin/movies/:id     - Delete movie
GET    /api/admin/users          - List users
GET    /api/admin/purchases      - List all purchases
GET    /api/admin/analytics      - Dashboard stats
```

## Testing

```bash
# Using curl
curl http://localhost:3000/api/movies

# Using Postman
Import: postman/CinePay-API.postman_collection.json
```

## Default Credentials

### Admin
- **Email**: `admin@cinepay.com`
- **Password**: `admin123`

### Test Users
- **Email**: `test@cinepay.com` / Password: `password123`
- **Email**: `demo@cinepay.com` / Password: `password123`

## Environment Variables

See `.env.example` for all required environment variables:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinepay_db
DB_USER=postgres
DB_PASSWORD=your_password

CORS_ORIGIN=http://localhost:8080
```

## Project Structure

```
cinepay-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── constants.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   └── Purchase.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── purchaseController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── purchases.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── validators.js
│   └── app.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── uploads/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Development

```bash
# Run with nodemon (auto-reload)
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Deployment

### Option 1: Heroku

```bash
heroku create cinepay-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Option 2: VPS (DigitalOcean/AWS)

```bash
# SSH to server
ssh root@your-server-ip

# Clone repo
git clone your-repo-url
cd cinepay-backend

# Install dependencies
npm install --production

# Setup PM2
npm install -g pm2
pm2 start src/app.js --name cinepay-api
pm2 save
pm2 startup
```

## License

MIT
