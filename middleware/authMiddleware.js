const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const verifyToken = (req, res, next) => {
    try {
        // Get token from headers
        const token = req.headers['authorization']?.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            
            req.user = decoded;
            console.log("Token is verify")
            next();
        });

    } catch (err) {
        console.error('Token verification error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = verifyToken;