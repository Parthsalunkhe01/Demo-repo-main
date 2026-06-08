const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // ✅ FIX: store both
        req.userId = decoded.id;
        req.role = decoded.role;

        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ message: 'Require Admin Role' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };
