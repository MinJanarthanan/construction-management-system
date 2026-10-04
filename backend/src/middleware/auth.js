const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'buildcorp_super_secret_jwt_key_2026_aiml_srm';

    const decoded = jwt.verify(token, secret);
    const user = await User.findByPk(decoded.id || decoded.userId || decoded.User_ID, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(401).json({ error: 'User account not found or token is invalid.' });
    }

    if (user.Status === 'Inactive' || user.Status === 'Suspended') {
      return res.status(403).json({ error: `Account is ${user.Status.toLowerCase()}. Contact system administrator.` });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};

module.exports = {
  authenticateJWT,
  verifyToken: authenticateJWT
};
