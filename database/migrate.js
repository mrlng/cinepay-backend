const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    try {
        console.log('🔄 Running database migration...');

        // Read and execute schema
        console.log('📝 Creating schema...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schema);
        console.log('✅ Schema created successfully');

        // Read and execute seed data
        console.log('🌱 Inserting seed data...');
        const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
        await pool.query(seed);
        console.log('✅ Seed data inserted successfully');

        console.log('🎉 Migration completed successfully!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
}

migrate();
