const jwt = require('jsonwebtoken');

const generateToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET || 'default_secret_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_in_production');
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };
