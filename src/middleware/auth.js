const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log('🔐 Auth Middleware - Headers:', {
        authorization: authHeader,
        allHeaders: req.headers
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ No token provided or invalid format');
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    console.log('🎫 Token extracted:', token.substring(0, 20) + '...');
    
    const decoded = verifyToken(token);

    if (!decoded) {
        console.log('❌ Token verification failed');
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log('✅ Token verified, user:', decoded);
    req.user = decoded;
    next();
};

module.exports = authMiddleware;
