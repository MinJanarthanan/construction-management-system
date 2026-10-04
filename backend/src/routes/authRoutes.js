const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, register, getMe } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validator');
const { rateLimitLogin } = require('../middleware/rateLimiter');

// Public login endpoint with rate limiting
router.post(
  '/login',
  rateLimitLogin,
  [
    body('identifier').notEmpty().withMessage('Username or Email is required.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validateRequest,
  login
);

// Admin-only user registration
router.post(
  '/register',
  authenticateJWT,
  authorizeRoles('Admin'),
  [
    body('Username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters.'),
    body('Email').isEmail().withMessage('Valid email is required.'),
    body('Password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('Full_Name').trim().notEmpty().withMessage('Full name is required.'),
    body('Role_ID').isInt({ min: 1 }).withMessage('Valid Role_ID is required.')
  ],
  validateRequest,
  register
);

// Get current user profile
router.get('/me', authenticateJWT, getMe);

module.exports = router;
